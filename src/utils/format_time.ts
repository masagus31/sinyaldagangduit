import * as admin from 'firebase-admin';

export function convertToFirestoreTimestamp(date: Date | string | number | null) {
  if (date == null) return null;

  if (typeof date === 'string') date = new Date(date);
  if (typeof date === 'number') date = new Date(date * 1000);
  return admin.firestore.Timestamp.fromDate(date);
}

export function convertToDate(date: Date | string | number | null) {
  if (date == null) return null;

  if (typeof date === 'string') date = new Date(date);
  if (typeof date === 'number') date = new Date(date * 1000);
  return date;
}
