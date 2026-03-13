import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { verifyAuthToken } from '@/lib/stripe-auth';

/**
 * POST /api/scout/outreach
 *
 * Sends a CAN-SPAM compliant outreach email to a scouted vendor on behalf of HighVibe Retreats.
 * Does NOT reveal the guide's identity — only says "a retreat leader" is looking for services.
 * Requires authentication — guideUserId must match the authenticated user.
 *
 * Body: {
 *   vendorEmail: string,
 *   vendorName: string,
 *   vendorCategory: string,
 *   location: string,
 *   retreatId?: string,
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const uid = await verifyAuthToken(request);

    const body = await request.json();
    const { vendorEmail, vendorName, vendorCategory, location, retreatId } = body;

    if (!vendorEmail || !vendorName || !vendorCategory || !location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Build CAN-SPAM compliant email
    const signupUrl = `https://highviberetreats.com/join/vendor?ref=scout&source=${encodeURIComponent(vendorEmail)}`;
    const unsubscribeUrl = `https://highviberetreats.com/api/scout/unsubscribe?email=${encodeURIComponent(vendorEmail)}`;

    const subject = `A retreat leader is looking for ${vendorCategory} services in ${location}`;

    const html = `
<!DOCTYPE html>
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
          <p style="color:#333;font-size:16px;line-height:1.6;">Hi ${vendorName},</p>

          <p style="color:#333;font-size:16px;line-height:1.6;">We're reaching out from <strong>HighVibe Retreats</strong>. A retreat leader on our platform is planning a retreat in <strong>${location}</strong> and is looking for <strong>${vendorCategory}</strong> services. Based on your business profile, we think you could be a great fit.</p>

          <p style="color:#333;font-size:16px;line-height:1.6;">We wanted to take a moment to introduce ourselves and explain why we're reaching out.</p>

          <h3 style="color:#1a1a1a;margin-top:28px;margin-bottom:12px;">Who we are</h3>
          <p style="color:#333;font-size:16px;line-height:1.6;">HighVibe Retreats is a curated marketplace for wellness retreats. We connect retreat leaders — yoga teachers, wellness coaches, meditation guides — with the local service providers and venues they need to bring their retreats to life. Think of us as the bridge between the retreat leader who has the vision and the local professionals who have the expertise.</p>

          <h3 style="color:#1a1a1a;margin-top:28px;margin-bottom:12px;">How it works</h3>
          <p style="color:#333;font-size:16px;line-height:1.6;">When a retreat leader is planning an experience in a specific area, they tell us what they need — catering, photography, sound healing, transportation, and so on. We then search for highly-rated local providers and make introductions through the platform. From there, you and the retreat leader can connect directly, discuss details, and decide if it's a good fit.</p>

          <h3 style="color:#1a1a1a;margin-top:28px;margin-bottom:12px;">Why we're reaching out to you</h3>
          <p style="color:#333;font-size:16px;line-height:1.6;">Right now, a retreat leader is planning a retreat in <strong>${location}</strong> and needs <strong>${vendorCategory}</strong> services. We came across your business and thought you'd be a great match. We'd love to introduce you to them through the platform so you can learn more about the opportunity and decide if it's something you'd like to take on.</p>

          <h3 style="color:#1a1a1a;margin-top:28px;margin-bottom:12px;">There's zero risk</h3>
          <p style="color:#333;font-size:16px;line-height:1.6;">Joining the platform is completely free — no monthly fees, no commitments, no pressure. You can create a profile, see what the opportunity looks like, and decide for yourself. If it's not the right fit, that's perfectly fine. And if it is, we handle the contracts and payment protection so you can focus on what you do best. Down the road, if you find the platform valuable, there's an option to become a member for additional features — but there's absolutely no obligation to do so.</p>

          <p style="color:#333;font-size:16px;line-height:1.6;">If you're curious, we'd love for you to take a look at the site and see if it's something that interests you. We can match you with the retreat leader who could use your services while they're in your area.</p>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
            <tr><td align="center">
              <a href="${signupUrl}" style="display:inline-block;padding:14px 32px;background:#66d320;color:#ffffff;text-decoration:none;border-radius:8px;font-size:16px;font-weight:bold;">Check Out HighVibe Retreats</a>
            </td></tr>
          </table>

          <p style="color:#666;font-size:14px;">No pressure at all — if this isn't the right time, we completely understand. We wish you the best with your business either way.</p>

          <p style="color:#333;font-size:16px;line-height:1.6;margin-top:24px;">Warm regards,<br><strong>The HighVibe Retreats Team</strong></p>
        </td></tr>
        <tr><td style="padding:24px 40px;text-align:center;background:#f5f0eb;font-size:12px;color:#666;">
          <p style="margin:0;">HighVibe Retreats &mdash; Curated experiences for those who choose living well.</p>
          <p style="margin:8px 0 0;">This is a one-time partnership inquiry. You are receiving this because your business is publicly listed for ${vendorCategory} services in ${location}.</p>
          <p style="margin:8px 0 0;"><a href="${unsubscribeUrl}" style="color:#999;">Unsubscribe from future emails</a></p>
          <p style="margin:8px 0 0;">HighVibe Retreats &middot; Los Angeles, CA</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const text = `Hi ${vendorName},

We're reaching out from HighVibe Retreats. A retreat leader on our platform is planning a retreat in ${location} and is looking for ${vendorCategory} services. Based on your business profile, we think you could be a great fit.

We wanted to take a moment to introduce ourselves and explain why we're reaching out.

WHO WE ARE
HighVibe Retreats is a curated marketplace for wellness retreats. We connect retreat leaders — yoga teachers, wellness coaches, meditation guides — with the local service providers and venues they need to bring their retreats to life. Think of us as the bridge between the retreat leader who has the vision and the local professionals who have the expertise.

HOW IT WORKS
When a retreat leader is planning an experience in a specific area, they tell us what they need — catering, photography, sound healing, transportation, and so on. We then search for highly-rated local providers and make introductions through the platform. From there, you and the retreat leader can connect directly, discuss details, and decide if it's a good fit.

WHY WE'RE REACHING OUT TO YOU
Right now, a retreat leader is planning a retreat in ${location} and needs ${vendorCategory} services. We came across your business and thought you'd be a great match. We'd love to introduce you to them through the platform so you can learn more about the opportunity and decide if it's something you'd like to take on.

THERE'S ZERO RISK
Joining the platform is completely free — no monthly fees, no commitments, no pressure. You can create a profile, see what the opportunity looks like, and decide for yourself. If it's not the right fit, that's perfectly fine. And if it is, we handle the contracts and payment protection so you can focus on what you do best. Down the road, if you find the platform valuable, there's an option to become a member for additional features — but there's absolutely no obligation to do so.

If you're curious, take a look: ${signupUrl}

No pressure at all — if this isn't the right time, we completely understand. We wish you the best with your business either way.

Warm regards,
The HighVibe Retreats Team

---
This is a one-time partnership inquiry from HighVibe Retreats.
To unsubscribe: ${unsubscribeUrl}
HighVibe Retreats · Los Angeles, CA`;

    // Send email
    await sendEmail({ to: vendorEmail, subject, html, text });

    // Log outreach to Firestore
    try {
      const { db } = await getFirebaseAdmin();
      await db.collection('scout_outreach').add({
        vendorEmail,
        vendorName,
        vendorCategory,
        location,
        guideUserId: uid,
        retreatId: retreatId || null,
        status: 'sent',
        sentAt: new Date(),
        openedAt: null,
        signedUpAt: null,
      });
    } catch (firestoreError) {
      // Don't fail the request if Firestore logging fails
      console.error('Failed to log outreach to Firestore:', firestoreError);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Missing authorization header') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Outreach email error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send outreach email' },
      { status: 500 }
    );
  }
}
