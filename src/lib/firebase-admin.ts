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

/**
 * Derives the Project ID from environment variables based on precedence.
 */
export function getResolvedProjectId() {
  const keys = ['FIREBASE_PROJECT_ID', 'GCLOUD_PROJECT', 'GOOGLE_CLOUD_PROJECT', 'NEXT_PUBLIC_FIREBASE_PROJECT_ID'];
  for (const key of keys) {
    if (process.env[key]) {
      return { projectId: process.env[key] as string, keyUsed: key };
    }
  }
  return { projectId: undefined, keyUsed: 'none' };
}

export async function getFirebaseAdmin(): Promise<FirebaseAdminInstances> {
  if (!firestoreDb || !fieldValue) {
    if (!getApps().length) {
      const { projectId, keyUsed } = getResolvedProjectId();
      const isGcp = !!process.env.GCLOUD_PROJECT || !!process.env.GOOGLE_CLOUD_PROJECT;
      
      console.log(`[ADMIN_INIT] Initializing. projectId=${projectId} (source=${keyUsed}), isGcp=${isGcp}`);
      
      try {
        // Initialize using Application Default Credentials (ADC)
        // This is the correct way for App Hosting / Cloud Run
        initializeApp({
            projectId: projectId,
        });
        console.log('[ADMIN_INIT] Firebase Admin initialized successfully using ADC.');
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
