import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { sendEmail } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://highviberetreats.com';

/**
 * POST /api/scout/follow-up
 *
 * Sends follow-up emails to scouted vendors who haven't responded after 5 days.
 * Protected by CRON_SECRET. Should be called by a daily cron job.
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { db, FieldValue } = await getFirebaseAdmin();

  try {
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

    const eligibleSnap = await db.collection('scout_outreach')
      .where('status', '==', 'sent')
      .where('sentAt', '<=', fiveDaysAgo)
      .limit(50)
      .get();

    if (eligibleSnap.empty) {
      return NextResponse.json({ message: 'No follow-ups to send', processed: 0 });
    }

    let sent = 0;
    let failed = 0;

    for (const doc of eligibleSnap.docs) {
      const data = doc.data();
      try {
        const signupUrl = `${BASE_URL}/join/vendor?ref=scout&source=${encodeURIComponent(data.vendorEmail)}`;

        const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f5f0eb;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
        <tr><td style="padding:32px 40px;text-align:center;background:#1a1a1a;">
          <h1 style="margin:0;color:#f5f0eb;font-size:24px;letter-spacing:0.15em;">HIGHVIBE RETREATS</h1>
        </td></tr>
        <tr><td style="padding:40px;">
          <h2 style="margin:0 0 16px;color:#1a1a1a;font-size:22px;">Following Up</h2>
          <p style="color:#333;font-size:16px;line-height:1.6;">Hi ${data.vendorName},</p>
          <p style="color:#333;font-size:16px;line-height:1.6;">A retreat leader recently reached out about <strong>${data.vendorCategory}</strong> services in <strong>${data.location}</strong>. We wanted to make sure you saw their request.</p>
          <p style="color:#333;font-size:16px;line-height:1.6;">Joining HighVibe is free — no monthly fees, no commitments. You only pay a small platform fee when you get booked.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
            <tr><td align="center">
              <a href="${signupUrl}" style="display:inline-block;padding:14px 32px;background:#66d320;color:#ffffff;text-decoration:none;border-radius:6px;font-size:16px;font-weight:bold;">Join HighVibe Free</a>
            </td></tr>
          </table>
          <p style="color:#999;font-size:12px;">If you're not interested, simply ignore this email. You won't receive further messages.</p>
        </td></tr>
        <tr><td style="padding:24px 40px;text-align:center;background:#f5f0eb;font-size:12px;color:#666;">
          <p style="margin:0;">HighVibe Retreats &mdash; Curated experiences for those who choose living well.</p>
          <p style="margin:8px 0 0;"><a href="${BASE_URL}/api/scout/unsubscribe?email=${encodeURIComponent(data.vendorEmail)}" style="color:#999;">Unsubscribe</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

        await sendEmail({
          to: data.vendorEmail,
          subject: `Following up: ${data.vendorCategory} opportunity in ${data.location}`,
          html,
          text: `Hi ${data.vendorName}, a retreat leader is still looking for ${data.vendorCategory} services in ${data.location}. Join free at ${signupUrl}`,
        });

        await doc.ref.update({
          status: 'followed_up',
          followUpSentAt: FieldValue.serverTimestamp(),
        });
        sent++;
      } catch (err) {
        console.error(`[SCOUT_FOLLOWUP] Failed for ${data.vendorEmail}:`, err);
        failed++;
      }
    }

    console.log(`[SCOUT_FOLLOWUP] Sent ${sent} follow-ups, ${failed} failed`);
    return NextResponse.json({ message: `Sent ${sent} follow-ups`, sent, failed });
  } catch (error) {
    console.error('[SCOUT_FOLLOWUP] Error:', error);
    return NextResponse.json({ error: 'Failed to process follow-ups' }, { status: 500 });
  }
}
