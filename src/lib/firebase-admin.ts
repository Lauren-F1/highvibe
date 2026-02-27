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
 * Includes a hardcoded fallback for studio-634317332-6568b to fix ADC lookup failures.
 */
export function getResolvedProjectId() {
  const keys = ['FIREBASE_PROJECT_ID', 'GCLOUD_PROJECT', 'GOOGLE_CLOUD_PROJECT', 'NEXT_PUBLIC_FIREBASE_PROJECT_ID'];
  for (const key of keys) {
    if (process.env[key]) {
      return { projectId: process.env[key] as string, keyUsed: key };
    }
  }
  // Hardcoded fallback for this specific project to resolve ADC lookup failures in App Hosting.
  // This is the primary fix for the "Getting metadata from plugin failed" / "2 UNKNOWN" error.
  return { projectId: 'studio-634317332-6568b', keyUsed: 'hardcoded-fallback' };
}

export async function getFirebaseAdmin(): Promise<FirebaseAdminInstances> {
  if (!firestoreDb || !fieldValue) {
    if (!getApps().length) {
      const { projectId, keyUsed } = getResolvedProjectId();
      
      try {
        // Initialize using Application Default Credentials (ADC)
        // Providing the projectId explicitly is the recommended fix for the "Getting metadata from plugin failed" error.
        initializeApp({
            projectId: projectId,
        });
        console.log(`[ADMIN_INIT] Firebase Admin initialized. projectId=${projectId} (source=${keyUsed})`);
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
