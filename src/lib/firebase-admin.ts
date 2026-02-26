
import "server-only";
import * as admin from 'firebase-admin';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

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
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
      console.log(`[ADMIN_INIT] Initializing Firebase Admin SDK for project: ${projectId || 'default'}`);
      
      try {
        initializeApp({
            projectId: projectId,
        });
        console.log('[ADMIN_INIT] Firebase Admin initialized successfully.');
      } catch (initError: any) {
        console.error('[ADMIN_INIT] Firebase Admin failed to initialize:', initError.message);
        throw initError;
      }
    }
    firestoreDb = getFirestore();
    fieldValue = admin.firestore.FieldValue;
  }
  return { db: firestoreDb, FieldValue: fieldValue };
}
