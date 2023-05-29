import * as admin from 'firebase-admin';
import Stripe from 'stripe';
import { getFirestoreUser } from './user_helper.ts';
const db = admin.firestore();

const stripeTestkey = process.env.STRIPE_TEST_KEY as string;
const stripeLivekey = process.env.STRIPE_LIVE_KEY as string;

interface CustomerId {
  userId: string;
  email: string;
  isStripeKeyLive: boolean;
}

export async function getStripeCustomerId({ userId, email, isStripeKeyLive }: CustomerId) {
  try {
    const stripe = new Stripe(isStripeKeyLive ? stripeLivekey : stripeTestkey, { apiVersion: '2022-08-01' });

    const user = await getFirestoreUser(userId, email);
    if (!user) return null;

    const customer = await stripe.customers.list({ email });
    if (customer.data.length > 0) return customer.data[0].id;

    const newCustomer = await stripe.customers.create({ email });
    if (isStripeKeyLive) await db.collection('users').doc(userId).update({ stripeCustomerIdLive: newCustomer.id });
    if (!isStripeKeyLive) await db.collection('users').doc(userId).update({ stripeCustomerIdTest: newCustomer.id });

    return newCustomer.id;
  } catch (error: any) {
    console.log('getStripeCustomerId', error);
    return null;
  }
}

export async function getCustomerSubscriptions({ userId, email, isStripeKeyLive }: CustomerId) {
  try {
    const stripe = new Stripe(isStripeKeyLive ? stripeLivekey : stripeTestkey, { apiVersion: '2022-08-01' });
    const customerId = await getStripeCustomerId({ userId, email, isStripeKeyLive });
    if (!customerId) return null;

    const subscriptions = await stripe.subscriptions.list({ customer: customerId });
    return subscriptions;
  } catch (error: any) {
    return null;
  }
}
