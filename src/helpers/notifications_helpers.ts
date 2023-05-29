import * as admin from 'firebase-admin';
import { chunkArray } from './chunk_array';

interface INotification {
  title: string;
  body: string;
  tokens: string[] | string;
}

export async function sendNotificationsToUsers({ title, body }: { title: string; body: string }) {
  const db = admin.firestore();
  let tokens: string[] = [];
  try {
    const users = await db.collection('users').get();

    for (const user of users.docs) {
      const _tokens = user.data().devTokens;
      if (_tokens instanceof Array) tokens = [...tokens, ..._tokens];
    }

    await sendNotification({ title, body, tokens });
  } catch (error: any) {}
}

export async function sendNotification({ title, body, tokens }: INotification) {
  if (!tokens) throw new Error('Tokens must not be less than 1');

  let devTokens = [];
  if (typeof tokens === 'string') devTokens.push(tokens);
  if (tokens instanceof Array) devTokens.push(...tokens);

  devTokens = devTokens.filter((to) => typeof to === 'string');
  devTokens = devTokens.filter((token) => token != '');

  const chunkedTokens = chunkArray(devTokens, 500);

  try {
    for (const chunk of chunkedTokens) {
      const messages = chunk.map((token) => {
        return {
          token,
          notification: { title, body }
        };
      });

      const r = await admin.messaging().sendAll(messages);

      if (r.failureCount > 0) {
        const failedTokens: any = [];
        r.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(messages[idx].token);
          }
        });
        console.log('List of tokens: ' + chunk.length);
        console.log('List of tokens that caused failures: ' + failedTokens.length);
      }
    }
  } catch (error: any) {
    console.log('Error: ', error);
  }
}
