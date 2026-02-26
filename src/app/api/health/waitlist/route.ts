import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * @fileOverview Health check endpoint for the waitlist flow.
 * Validates Firestore connectivity via Admin SDK and Resend configuration.
 */

export async function GET() {
  const requestId = Math.random().toString(36).substring(7).toUpperCase();
  
  let resolvedProjectId = 'unknown';
  let envKeyUsed = 'none';
  
  try {
    // Use the central utility to see what the server thinks the project ID is
    const { getResolvedProjectId } = await import('@/lib/firebase-admin');
    const { projectId, keyUsed } = getResolvedProjectId();
    resolvedProjectId = projectId || 'unknown';
    envKeyUsed = keyUsed;
  } catch (e) {
    // Ignore error in resolution step, let the Firestore check report it
  }

  console.log(`[${requestId}] HEALTH_WAITLIST_START requestId=${requestId} projectId=${resolvedProjectId} keyUsed=${envKeyUsed}`);

  const results = {
    ok: true,
    requestId,
    projectId: resolvedProjectId,
    env: {
      FIREBASE_PROJECT_ID_present: !!process.env.FIREBASE_PROJECT_ID,
      RESEND_API_KEY_present: !!process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes('REPLACE'),
      EMAIL_FROM_present: !!process.env.EMAIL_FROM,
      LAUNCH_MODE: process.env.LAUNCH_MODE || null,
    },
    firestore: { ok: false, detail: '' as string | undefined },
    resend: { ok: false, detail: '' as string | undefined },
  };

  // 1. Firestore Check (Using ONLY Admin SDK + ADC)
  try {
    const { getFirebaseAdmin } = await import('@/lib/firebase-admin');
    const { db } = await getFirebaseAdmin();
    
    // Simple read check against a non-existent or existing doc.
    // Connectivity is verified if the promise resolves/rejects cleanly vs timing out or auth-failing.
    await db.collection('meta').doc('healthcheck').get();
    results.firestore.ok = true;
    delete results.firestore.detail;
  } catch (error: any) {
    results.ok = false;
    results.firestore.ok = false;
    
    // Sanitize error message to remove low-level gRPC/metadata phrases
    const rawMsg = error.message || '';
    if (rawMsg.includes('plugin') || rawMsg.includes('token') || rawMsg.includes('metadata') || rawMsg.includes('500')) {
      results.firestore.detail = "Authentication failure or Project ID mismatch. Ensure Firebase App Hosting has the 'Cloud Datastore User' role and FIREBASE_PROJECT_ID is correct.";
    } else {
      results.firestore.detail = rawMsg;
    }
    
    console.error(`[${requestId}] HEALTH_FIRESTORE_FAIL:`, results.firestore.detail);
  }

  // 2. Resend Check (Non-sending validation)
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey || resendKey.includes('REPLACE')) {
    results.ok = false;
    results.resend.ok = false;
    results.resend.detail = 'API key missing or placeholder used';
  } else {
    try {
      const resend = new Resend(resendKey);
      // Validate by listing domains (a common read-only operation)
      const domainList = await resend.domains.list();
      
      if (domainList.error) {
        throw new Error(domainList.error.message);
      }
      
      results.resend.ok = true;
      delete results.resend.detail;
    } catch (error: any) {
      results.ok = false;
      results.resend.ok = false;
      results.resend.detail = error.message || 'Resend connectivity failed';
      console.error(`[${requestId}] HEALTH_RESEND_FAIL:`, results.resend.detail);
    }
  }

  console.log(`[${requestId}] HEALTH_WAITLIST_RESULT requestId=${requestId} firestoreOk=${results.firestore.ok} resendOk=${results.resend.ok}`);

  return NextResponse.json(results, { status: results.ok ? 200 : 500 });
}
