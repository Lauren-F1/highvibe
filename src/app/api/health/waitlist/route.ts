import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * @fileOverview Comprehensive health check for the waitlist environment.
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
    // Resolution step failed
  }

  const results: any = {
    ok: true,
    requestId,
    timestamp: new Date().toISOString(),
    projectId: resolvedProjectId,
    envKeyUsed,
    runtimeEnv: {
      FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
      GCLOUD_PROJECT: !!process.env.GCLOUD_PROJECT,
      RESEND_API_KEY_present: !!process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes('REPLACE'),
      EMAIL_FROM: !!process.env.EMAIL_FROM,
      LAUNCH_MODE: process.env.LAUNCH_MODE,
    },
    firestore: { ok: false, detail: '' as string | undefined },
    resend: { ok: false, detail: '' as string | undefined },
  };

  // 1. Firestore Check
  try {
    const { getFirebaseAdmin } = await import('@/lib/firebase-admin');
    const { db } = await getFirebaseAdmin();
    
    // Quick probe
    await db.collection('meta').doc('healthcheck').get();
    results.firestore.ok = true;
    delete results.firestore.detail;
  } catch (error: any) {
    results.ok = false;
    results.firestore.ok = false;
    results.firestore.detail = error.message;
  }

  // 2. Resend Check
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey || resendKey.includes('REPLACE')) {
    results.resend.ok = false;
    results.resend.detail = 'Secret RESEND_API_KEY is missing or invalid placeholder.';
  } else {
    try {
      const resend = new Resend(resendKey);
      await resend.domains.list();
      results.resend.ok = true;
      delete results.resend.detail;
    } catch (error: any) {
      results.resend.ok = false;
      results.resend.detail = error.message;
    }
  }

  return NextResponse.json(results, { 
    status: results.ok ? 200 : 500,
    headers: { 'Cache-Control': 'no-store' }
  });
}
