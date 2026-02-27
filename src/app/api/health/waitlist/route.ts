import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * @fileOverview Health check endpoint for the waitlist flow.
 * Validates Firestore connectivity via Admin SDK and Resend configuration.
 * ROLLOUT_TRIGGER: 2025-02-25T23:30:00Z
 */

export async function GET() {
  const requestId = Math.random().toString(36).substring(7).toUpperCase();
  
  let resolvedProjectId = 'unknown';
  let envKeyUsed = 'none';
  
  try {
    const { getResolvedProjectId } = await import('@/lib/firebase-admin');
    const { projectId, keyUsed } = getResolvedProjectId();
    resolvedProjectId = projectId || 'unknown';
    envKeyUsed = keyUsed;
  } catch (e) {
    // Ignore error in resolution step
  }

  const results: any = {
    ok: true,
    requestId,
    projectId: resolvedProjectId,
    envKeyUsed,
    runtimeEnvKeysPresent: {
      FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
      GCLOUD_PROJECT: !!process.env.GCLOUD_PROJECT,
      GOOGLE_CLOUD_PROJECT: !!process.env.GOOGLE_CLOUD_PROJECT,
      RESEND_API_KEY_present: !!process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes('REPLACE'),
      EMAIL_FROM: !!process.env.EMAIL_FROM,
      LAUNCH_MODE: !!process.env.LAUNCH_MODE,
    },
    firestore: { ok: false, detail: '' as string | undefined },
    resend: { ok: false, detail: '' as string | undefined },
  };

  // 1. Firestore Check (Using Admin SDK ONLY)
  try {
    const { getFirebaseAdmin } = await import('@/lib/firebase-admin');
    const { db } = await getFirebaseAdmin();
    
    // Simple connectivity check - read a dummy path
    await db.collection('meta').doc('healthcheck').get();
    results.firestore.ok = true;
    delete results.firestore.detail;
  } catch (error: any) {
    results.ok = false;
    results.firestore.ok = false;
    
    const rawMsg = error.message || '';
    if (rawMsg.includes('plugin') || rawMsg.includes('token') || rawMsg.includes('metadata') || rawMsg.includes('500') || rawMsg.includes('2 UNKNOWN')) {
      results.firestore.detail = "Authentication failure or Project ID resolution error. Ensure App Hosting service account has 'Cloud Datastore User' role.";
    } else {
      results.firestore.detail = rawMsg;
    }
  }

  // 2. Resend Check (Non-sending validation)
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey || resendKey.includes('REPLACE')) {
    results.resend.ok = false;
    results.resend.detail = 'API key missing or placeholder used';
  } else {
    try {
      const resend = new Resend(resendKey);
      // Validating key existence by attempting to list domains (read-only)
      await resend.domains.list();
      results.resend.ok = true;
      delete results.resend.detail;
    } catch (error: any) {
      results.resend.ok = false;
      results.resend.detail = error.message || 'Resend connectivity failed';
    }
  }

  // LOG THE RESULT FOR CLOUD LOGGING INSPECTION
  console.log(`HEALTH_WAITLIST_JSON ${JSON.stringify(results)}`);

  return NextResponse.json(results, { 
    status: results.ok ? 200 : 500,
    headers: {
      'Cache-Control': 'no-store, max-age=0'
    }
  });
}
