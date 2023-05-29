import express, { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';
import { getStripeCustomerId } from '../helpers/stripe_helper';
import { getFirestoreUserWithSubsciption } from '../helpers/user_helper.ts';
import { stripeLivekey, stripeTestkey } from '../utils_constants/app_constants';

const firestore = admin.firestore();

const router = express.Router();

router.get('/products', validateJsonWebToken, getStripeKeyMode, async (req: Request, res: Response) => {
  const userId = req.body.userId;
  const email = req.body.email;
  const isStripeKeyLive = req.body.isStripeKeyLive;

  try {
    const customerId = await getStripeCustomerId({ userId, email, isStripeKeyLive });
    if (!customerId) return res.status(400).json({ error: 'Invalid customerId' });
    const stripe = new Stripe(isStripeKeyLive ? stripeLivekey : stripeTestkey, { apiVersion: '2022-08-01' });
    const products = await stripe.products.list({});
    return res.json({ products: products });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/create-customer-portal-session', validateJsonWebToken, getStripeKeyMode, async (req: Request, res: Response) => {
  const userId = req.body.userId;
  const email = req.body.email;
  const isStripeKeyLive = req.body.isStripeKeyLive;
  const returnUrl = req.body.returnUrl;
  if (returnUrl == null) return res.status(400).json({ error: 'Missing returnUrl' });

  try {
    const customerId = await getStripeCustomerId({ userId: userId, email, isStripeKeyLive });
    if (!customerId) return res.status(400).json({ error: 'Invalid customerId' });

    const stripe = new Stripe(isStripeKeyLive ? stripeLivekey : stripeTestkey, { apiVersion: '2022-08-01' });
    const session = await stripe.billingPortal.sessions.create({ customer: customerId, return_url: returnUrl });
    return res.json({ url: session.url });
  } catch (error: any) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
});

router.post('/create-subscription', validateJsonWebToken, getStripeKeyMode, async (req: Request, res: Response) => {
  const userId = req.body.userId;
  const email = req.body.email;
  const isStripeKeyLive = req.body.isStripeKeyLive;

  const productId = req.body.productId;
  const successUrl = req.body.successUrl;
  const cancelUrl = req.body.cancelUrl;
  if (productId == null || successUrl == null || cancelUrl == null) {
    return res.status(400).json({ error: 'Missing productId, successUrl, cancelUrl' });
  }

  try {
    const customerId = await getStripeCustomerId({ userId: userId, email, isStripeKeyLive });
    if (customerId == null) return res.status(400).json({ error: 'CustomerId not found' });

    const stripe = new Stripe(isStripeKeyLive ? stripeLivekey : stripeTestkey, { apiVersion: '2022-08-01' });
    const subscriptions = await stripe.subscriptions.list({ customer: customerId });
    if (subscriptions.data.length > 0) {
      const subscription = subscriptions.data[0];
      const active = subscription.status === 'active';
      if (active) return res.status(400).json({ message: 'Subscription already active' });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      success_url: successUrl,
      cancel_url: cancelUrl,
      mode: 'subscription',
      line_items: [{ price: productId, quantity: 1 }]
    });

    return res.json({ url: session.url });
  } catch (error: any) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
});

router.post('/validate-subscription', validateJsonWebToken, getStripeKeyMode, async (req: Request, res: Response) => {
  const userId = req.body.userId;
  const email = req.body.email;
  const isStripeKeyLive = req.body.isStripeKeyLive;

  try {
    const user = await getFirestoreUserWithSubsciption({ userId: userId, email, isStripeKeyLive });
    if (!user) return res.status(400).json({ error: 'User not found' });
    if (user.subStripeStatus !== 'active') return res.json({ error: 'No active subscription' });
    return res.json({ message: 'Subscription active', user });
  } catch (error: any) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
});

// middleware validate jsonWebToken
async function validateJsonWebToken(req: Request, res: Response, next: Function) {
  const jsonWebToken = (req.query.jsonWebToken as string) || (req.body.jsonWebToken as string);
  if (!jsonWebToken) return res.status(400).json({ error: 'Missing jsonWebToken' });

  const decodedToken = await admin.auth().verifyIdToken(jsonWebToken);
  if (!decodedToken) return res.status(400).json({ error: 'Invalid jsonWebToken' });

  req.body.userId = decodedToken.user_id;
  req.body.email = decodedToken.email;
  next();
}

// middleware getStripeKeyMode
function getStripeKeyMode(req: Request, res: Response, next: Function) {
  let isStripeKeyLive = (req.query.isStripeKeyLive as any) || (req.body.isStripeKeyLive as any);
  if (isStripeKeyLive == null) return res.status(400).json({ error: 'Missing isStripeKeyLive' });
  if (isStripeKeyLive === 'false') isStripeKeyLive = false;
  if (isStripeKeyLive === 'true') isStripeKeyLive = true;
  req.body.isStripeKeyLive = isStripeKeyLive;
  next();
}

module.exports = router;
