import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/scout/unsubscribe?email=<email>
 *
 * Marks a scouted vendor's outreach records as unsubscribed.
 * No auth required — this is a one-click CAN-SPAM unsubscribe link.
 */
export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email');

  if (!email) {
    return new NextResponse(renderPage('Missing email parameter.', false), {
      headers: { 'Content-Type': 'text/html' },
      status: 400,
    });
  }

  try {
    const { db } = await getFirebaseAdmin();

    // Mark all outreach records for this email as unsubscribed
    const outreachSnap = await db.collection('scout_outreach')
      .where('vendorEmail', '==', email.toLowerCase())
      .limit(20)
      .get();

    if (!outreachSnap.empty) {
      const batch = db.batch();
      for (const doc of outreachSnap.docs) {
        batch.update(doc.ref, {
          status: 'unsubscribed',
          unsubscribedAt: new Date(),
        });
      }
      await batch.commit();
    }

    return new NextResponse(renderPage('You have been unsubscribed from HighVibe Retreats outreach emails. You will not receive any further emails from us.', true), {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('[UNSUBSCRIBE] Error:', error);
    return new NextResponse(renderPage('Something went wrong. Please try again or contact support@highviberetreats.com.', false), {
      headers: { 'Content-Type': 'text/html' },
      status: 500,
    });
  }
}

function renderPage(message: string, success: boolean): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Unsubscribe — HighVibe Retreats</title></head>
<body style="font-family: Georgia, serif; max-width: 500px; margin: 80px auto; padding: 20px; text-align: center; color: #1a1a1a;">
  <h1 style="font-size: 24px; font-weight: normal;">HighVibe Retreats</h1>
  <p style="margin-top: 32px; color: ${success ? '#333' : '#c00'};">${message}</p>
</body>
</html>`;
}
