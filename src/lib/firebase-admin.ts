
import "server-only";
import * as admin from 'firebase-admin';
import { getApps, initializeApp } from 'firebase-admin/app';

// This is a lazy-loaded, cached instance of the Firestore DB.
let firestoreDb: admin.firestore.Firestore;
let fieldValue: typeof admin.firestore.FieldValue;

interface FirebaseAdminInstances {
  db: admin.firestore.Firestore;
  FieldValue: typeof admin.firestore.FieldValue;
}

export async function getFirebaseAdmin(): Promise<FirebaseAdminInstances> {
  if (!firestoreDb || !fieldValue) {
    if (!getApps().length) {
      initializeApp();
    }
    firestoreDb = admin.firestore();
    fieldValue = admin.firestore.FieldValue;
  }
  return { db: firestoreDb, FieldValue: fieldValue };
}
