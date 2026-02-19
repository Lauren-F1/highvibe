import type admin from 'firebase-admin';

// This is a lazy-loaded, cached instance of the Firestore DB.
// Using this pattern avoids bundling the entire Firebase Admin SDK
// into client-side code, which would cause a build failure.
let firestoreDb: admin.firestore.Firestore;

function getFirestoreDb(): admin.firestore.Firestore {
  if (!firestoreDb) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const admin_sdk = require('firebase-admin');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getApps } = require('firebase-admin/app');

    if (!getApps().length) {
      admin_sdk.initializeApp();
    }
    firestoreDb = admin_sdk.firestore();
  }
  return firestoreDb;
}

export { getFirestoreDb };
