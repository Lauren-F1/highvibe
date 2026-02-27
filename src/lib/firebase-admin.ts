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
 * Hardcoded fallback for studio-634317332-6568b is used to bypass metadata server errors.
 */
export function getResolvedProjectId() {
  const keys = ['FIREBASE_PROJECT_ID', 'GCLOUD_PROJECT', 'GOOGLE_CLOUD_PROJECT', 'NEXT_PUBLIC_FIREBASE_PROJECT_ID'];
  for (const key of keys) {
    if (process.env[key]) {
      return { projectId: process.env[key] as string, keyUsed: key };
    }
  }
  // This is the primary fix for the "Getting metadata from plugin failed" / "2 UNKNOWN" error.
  return { projectId: 'studio-634317332-6568b', keyUsed: 'hardcoded-primary' };
}

export async function getFirebaseAdmin(): Promise<FirebaseAdminInstances> {
  if (!firestoreDb || !fieldValue) {
    if (!getApps().length) {
      const { projectId, keyUsed } = getResolvedProjectId();
      
      try {
        // Initialize using the resolved Project ID. 
        // Providing the projectId explicitly prevents the SDK from trying to 
        // reach the metadata server, which often fails in App Hosting compute.
        initializeApp({
            projectId: projectId,
        });
        console.log(`[ADMIN_INIT] Firebase Admin initialized successfully. projectId=${projectId} (source=${keyUsed})`);
      } catch (initError: any) {
        console.error('[ADMIN_INIT] Firebase Admin failed to initialize:', initError.message);
        throw initError;
      }
    }
    
    // Ensure we are getting the firestore instance for the default app
    firestoreDb = getFirestore();
    fieldValue = admin.firestore.FieldValue;
  }
  return { db: firestoreDb, FieldValue: fieldValue };
}
