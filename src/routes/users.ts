import express, { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import { getFirestoreUserWithSubsciption } from '../helpers/user_helper.ts';

const router = express.Router();

router.get('/userId/:userId', validateJsonWebToken, getStripeKeyMode, async (req: Request, res: Response) => {
  const userId = req.body.userId;
  const email = req.body.email;
  const isStripeKeyLive = req.body.isStripeKeyLive;

  try {
    let user = await getFirestoreUserWithSubsciption({ userId: userId, email, isStripeKeyLive });
    if (!user) return res.status(400).json({ error: 'User not found' });

    user.timestampCreated = user.timestampCreated?.toDate();
    user.timestampUpdated = user.timestampUpdated?.toDate();
    user.subStripeEnd = user.subStripeEnd?.toDate();
    user.subStripeStart = user.subStripeStart?.toDate();
    user.subRevenueCatOriginalPurchaseDate = user.subRevenueCatOriginalPurchaseDate?.toDate();
    user.subRevenueCatLatestPurchaseDate = user.subRevenueCatLatestPurchaseDate?.toDate();
    user.subRevenueCatExpirationDate = user.subRevenueCatExpirationDate?.toDate();
    user.subRevenueCatUnsubscribeDetectedAt = user.subRevenueCatUnsubscribeDetectedAt?.toDate();
    user.subRevenueCatBillingIssueDetectedAt = user.subRevenueCatBillingIssueDetectedAt?.toDate();

    res.json({ user: user });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.patch('/userId/:userId/delete-account', validateJsonWebToken, async (req: Request, res: Response) => {
  const userId = req.body.userId;
  const email = req.body.email;

  try {
    const user = await admin.auth().getUser(userId);
    if (!user) return res.status(400).json({ error: 'User not found' });

    await admin.auth().deleteUser(userId);
    await admin.firestore().collection('users').doc(userId).delete();

    res.json({ message: 'User deleted' });
  } catch (error: any) {
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
