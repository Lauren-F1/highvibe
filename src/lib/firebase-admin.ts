import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

if (!getApps().length) {
  admin.initializeApp();
}

const firestoreDb = admin.firestore();

export { firestoreDb };
