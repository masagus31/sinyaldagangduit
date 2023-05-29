import * as admin from 'firebase-admin';
import Stripe from 'stripe';

import { convertToDate } from '../utils/format_time';
import { getStripeCustomerId } from './stripe_helper';
const db = admin.firestore();

const stripeTestkey = process.env.STRIPE_TEST_KEY as string;
const stripeLivekey = process.env.STRIPE_LIVE_KEY as string;

interface CustomerId {
  userId: string;
  email: string;
  isStripeKeyLive: boolean;
}

export async function getFirestoreUser(userId: string, email: string) {
  let user = await db.collection('users').doc(userId).get();
  if (user.exists) return user.data();

  if (!user.exists) {
    await db.collection('users').doc(userId).set({
      appBuildNumber: 0,
      appVersion: '',
      devTokens: [],
      email: email,
      isActive: true,
      isNotificationsEnabled: true,
      name: '',
      profileImageUrl: '',
      timestampLastLogin: null,
      timestampLastLoginDevice: null,
      userId: userId,

      subIsLifetime: false,
      subHasSubsciption: false,
      subSubscriptionEndDate: null,

      stripeLiveCustomerId: null,
      stripeTestCustomerId: null,

      subStripeEnd: null,
      subStripeLivemode: false,
      subStripePlan: '',
      subStripePlanAmt: 0,
      subStripePlanId: '',
      subStripeStart: null,
      subStripeStatus: '',

      subRevenueCatIsActive: false,
      subRevenueCatWillRenew: false,
      subRevenueCatPeriodType: '',
      subRevenueCatProductIdentifier: '',
      subRevenueCatIsSandbox: false,
      subRevenueCatOriginalPurchaseDate: null,
      subRevenueCatLatestPurchaseDate: null,
      subRevenueCatUnsubscribeDetectedAt: null,
      subRevenueCatBillingIssueDetectedAt: null
    });
  }

  user = await db.collection('users').doc(userId).get();
  return user.data();
}

export async function getFirestoreUserWithSubsciption({ userId, email, isStripeKeyLive }: CustomerId) {
  try {
    const stripe = new Stripe(isStripeKeyLive ? stripeLivekey : stripeTestkey, { apiVersion: '2022-08-01' });
    const customerId = await getStripeCustomerId({ userId, email, isStripeKeyLive });
    if (!customerId) return null;

    let user = await getFirestoreUser(userId, email);
    if (!user) return null;

    const subscriptions = await stripe.subscriptions.list({ customer: customerId });
    if (subscriptions.data.length > 0) {
      const subscription = subscriptions.data[0];
      const subStripeEnd = convertToDate(subscription.current_period_end);
      const subStripeLivemode = subscription.livemode;
      const subStripePlan = subscription.items.data[0].plan.interval;
      const subStripePlanAmt = (subscription.items.data[0].plan.amount ?? 0) / 100;
      const subStripePlanId = subscription.items.data[0].plan.id;
      const subStripeStart = convertToDate(subscription.current_period_start);
      const subStripeStatus = subscription.status;

      await db.collection('users').doc(userId).update({
        subStripeEnd: subStripeEnd,
        subStripeLivemode: subStripeLivemode,
        subStripePlan: subStripePlan,
        subStripePlanAmt: subStripePlanAmt,
        subStripePlanId: subStripePlanId,
        subStripeStart: subStripeStart,
        subStripeStatus: subStripeStatus
      });

      user = await getFirestoreUser(userId, email);
      if (!user) return null;
    }

    return user;
  } catch (error: any) {
    return null;
  }
}
