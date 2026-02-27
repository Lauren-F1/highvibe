
import "server-only";
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';

/**
 * Initializes the Firebase Admin SDK.
 * 
 * CRITICAL FIX: We explicitly pass the projectId 'studio-634317332-6568b'.
 * This prevents the SDK from trying to reach the Google Cloud metadata server,
 * which frequently fails in App Hosting and causes the "2 UNKNOWN" database error.
 */
export async function getFirebaseAdmin() {
  const projectId = 'studio-634317332-6568b';
  
  if (!getApps().length) {
    try {
      initializeApp({
        projectId: projectId,
      });
      console.log(`[ADMIN_INIT] Success for project: ${projectId}`);
    } catch (error: any) {
      console.error('[ADMIN_INIT] Failed:', error.message);
      throw error;
    }
  }
  
  return {
    db: getFirestore(),
    FieldValue: admin.firestore.FieldValue,
  };
}
