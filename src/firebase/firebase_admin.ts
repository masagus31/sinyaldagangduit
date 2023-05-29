import * as admin from 'firebase-admin';
require('dotenv').config();

export const firebaseConfigServer = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n')
};

export async function initFirebase() {
  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(firebaseConfigServer) });
  }

  return true;
}
