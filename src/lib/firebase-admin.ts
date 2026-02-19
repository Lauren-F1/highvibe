import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

function getFirestoreDb() {
  if (!getApps().length) {
    admin.initializeApp();
  }
  return admin.firestore();
}

export { getFirestoreDb };
