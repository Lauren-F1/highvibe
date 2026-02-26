import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * @fileOverview Health check endpoint for the waitlist flow.
 * Validates Firestore connectivity and Resend configuration.
 */

export async function GET() {
  const requestId = Math.random().toString(36).substring(7).toUpperCase();
  console.log(`[${requestId}] HEALTH_WAITLIST_START`);

  const results = {
    ok: true,
    requestId,
    projectId: 'unknown',
    env: {
      FIREBASE_PROJECT_ID_present: !!process.env.FIREBASE_PROJECT_ID,
      RESEND_API_KEY_present: !!process.env.RESEND_API_KEY,
      EMAIL_FROM_present: !!process.env.EMAIL_FROM,
      LAUNCH_MODE: process.env.LAUNCH_MODE || null,
    },
    firestore: { ok: false, detail: '' as string | undefined },
    resend: { ok: false, detail: '' as string | undefined },
  };

  // 1. Check Firestore
  try {
    const { getFirebaseAdmin, getResolvedProjectId } = await import('@/lib/firebase-admin');
    const { projectId } = getResolvedProjectId();
    results.projectId = projectId || 'none';

    const { db } = await getFirebaseAdmin();
    // A simple read check against a non-existent or existing doc. 
    // Connectivity is verified if the promise resolves/rejects cleanly vs timing out or auth-failing.
    await db.collection('meta').doc('healthcheck').get();
    results.firestore.ok = true;
    delete results.firestore.detail;
  } catch (error: any) {
    results.ok = false;
    results.firestore.ok = false;
    results.firestore.detail = error.message || 'Unknown Firestore error';
    console.error(`[${requestId}] HEALTH_FIRESTORE_FAIL:`, results.firestore.detail);
  }

  // 2. Check Resend
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

  console.log(`[${requestId}] HEALTH_WAITLIST_RESULT: ok=${results.ok}, fs=${results.firestore.ok}, resend=${results.resend.ok}`);

  return NextResponse.json(results, { status: results.ok ? 200 : 500 });
}
