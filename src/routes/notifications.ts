import express, { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import { sendNotificationsToUsers } from '../helpers/notifications_helpers';

const db = admin.firestore();
const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, body } = req.body;
    if (!title || !body) throw new Error('Title and body must be provided');
    await sendNotificationsToUsers({ title: title, body: body });

    res.status(200).json({ message: 'Notification sent' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
