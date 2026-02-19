import "server-only";
import type admin from 'firebase-admin';

// This is a lazy-loaded, cached instance of the Firestore DB.
let firestoreDb: admin.firestore.Firestore;
let fieldValue: typeof admin.firestore.FieldValue;

interface FirebaseAdminInstances {
  db: admin.firestore.Firestore;
  FieldValue: typeof admin.firestore.FieldValue;
}

export async function getFirebaseAdmin(): Promise<FirebaseAdminInstances> {
  if (!firestoreDb || !fieldValue) {
    const admin_sdk = await import('firebase-admin');
    const { getApps } = await import('firebase-admin/app');

    if (!getApps().length) {
      admin_sdk.initializeApp();
    }
    firestoreDb = admin_sdk.firestore();
    fieldValue = admin_sdk.firestore.FieldValue;
  }
  return { db: firestoreDb, FieldValue: fieldValue };
}
