import "server-only";
import type admin from 'firebase-admin';

// This is a lazy-loaded, cached instance of the Firestore DB.
// Using this pattern avoids bundling the entire Firebase Admin SDK
// into client-side code, which would cause a build failure.
let firestoreDb: admin.firestore.Firestore;

async function getFirestoreDb(): Promise<admin.firestore.Firestore> {
  if (!firestoreDb) {
    const admin_sdk = await import('firebase-admin');
    const { getApps } = await import('firebase-admin/app');

    if (!getApps().length) {
      admin_sdk.initializeApp();
    }
    firestoreDb = admin_sdk.firestore();
  }
  return firestoreDb;
}

export { getFirestoreDb };
