import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { verifyAuthToken } from '@/lib/stripe-auth';

/**
 * POST /api/scout/host-outreach
 *
 * Sends a CAN-SPAM compliant outreach email to a scouted property (boutique hotel,
 * resort, villa, etc.) on behalf of HighVibe Retreats.
 *
 * The value proposition is different from vendor outreach:
 * - Recurring group bookings (not one-off services)
 * - Fill off-season and midweek availability
 * - Hands-off operation (guide handles programming)
 * - Premium clientele (wellness seekers willing to pay)
 *
 * Body: {
 *   hostEmail: string,
 *   hostName: string,
 *   accommodationType: string,
 *   location: string,
 *   retreatId?: string,
 *   groupSize?: number,
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const uid = await verifyAuthToken(request);

    const body = await request.json();
    const { hostEmail, hostName, accommodationType, location, retreatId, groupSize } = body;

    if (!hostEmail || !hostName || !accommodationType || !location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if already contacted (prevent duplicate outreach)
    const { db } = await getFirebaseAdmin();
    const existingSnap = await db.collection('scout_outreach')
      .where('vendorEmail', '==', hostEmail.toLowerCase())
      .where('status', 'in', ['sent', 'followed_up', 'signed_up'])
      .limit(1)
      .get();

    if (!existingSnap.empty) {
      return NextResponse.json(
        { error: 'This property has already been contacted.' },
        { status: 409 }
      );
    }

    const signupUrl = `https://highviberetreats.com/join/host?ref=scout&source=${encodeURIComponent(hostEmail)}`;
    const unsubscribeUrl = `https://highviberetreats.com/api/scout/unsubscribe?email=${encodeURIComponent(hostEmail)}`;

    const groupSizeNote = groupSize
      ? `This particular retreat would bring approximately <strong>${groupSize} guests</strong> for a multi-night stay.`
      : `Retreat leaders typically book blocks of rooms for multi-night group stays.`;

    const subject = `Partnership opportunity: Wellness retreats at ${hostName}`;

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
          <p style="color:#333;font-size:16px;line-height:1.6;">Hi ${hostName},</p>

          <p style="color:#333;font-size:16px;line-height:1.6;">We're reaching out from <strong>HighVibe Retreats</strong>. A retreat leader on our platform is planning a wellness retreat in <strong>${location}</strong> and is looking for a <strong>${accommodationType.toLowerCase()}</strong> to host their group. We came across <strong>${hostName}</strong> and think it could be a beautiful fit.</p>

          <p style="color:#333;font-size:16px;line-height:1.6;">We wanted to take a moment to introduce ourselves and share a bit about what we do.</p>

          <h3 style="color:#1a1a1a;margin-top:28px;margin-bottom:12px;">Who we are</h3>
          <p style="color:#333;font-size:16px;line-height:1.6;">HighVibe Retreats is a curated marketplace for wellness retreats. We connect retreat leaders — yoga teachers, wellness coaches, meditation guides — with exceptional properties where they can host their experiences. The retreat leader brings the programming, the participants, and the vision. The property provides the space, the atmosphere, and the hospitality. We bring them together.</p>

          <h3 style="color:#1a1a1a;margin-top:28px;margin-bottom:12px;">How it works for properties</h3>
          <p style="color:#333;font-size:16px;line-height:1.6;">When a retreat leader is planning an experience, they tell us about the kind of property they're looking for — location, style, capacity, and dates. We search for properties that fit and make an introduction through the platform. From there, you and the retreat leader can connect, discuss availability and rates, and decide together if it's the right fit. You stay in complete control of your pricing, your calendar, and your property.</p>

          <h3 style="color:#1a1a1a;margin-top:28px;margin-bottom:12px;">Why we're reaching out to you</h3>
          <p style="color:#333;font-size:16px;line-height:1.6;">A retreat leader on our platform is actively looking for a ${accommodationType.toLowerCase()} in <strong>${location}</strong> to host their upcoming retreat. ${groupSizeNote} We'd love to introduce you to them through the platform so you can learn more about the opportunity and see if it works with your schedule.</p>

          <h3 style="color:#1a1a1a;margin-top:28px;margin-bottom:12px;">There's zero risk</h3>
          <p style="color:#333;font-size:16px;line-height:1.6;">Listing your property on HighVibe is completely free — no monthly fees, no exclusivity agreements, no commitments. You set your own nightly rates and only make your property available when it works for you. The retreat leader handles all programming, activities, and guest coordination. Your role is simply doing what you already do best — providing a beautiful space and great hospitality. If you find the platform valuable over time, there's an option to become a member for additional features — but there's no obligation whatsoever.</p>

          <p style="color:#333;font-size:16px;line-height:1.6;">Many properties find that retreat bookings become a welcome source of recurring revenue — retreat leaders who have a great experience often come back 2-4 times per year. But there's absolutely no pressure. We'd just love for you to take a look and see if it's something that interests you.</p>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
            <tr><td align="center">
              <a href="${signupUrl}" style="display:inline-block;padding:14px 32px;background:#66d320;color:#ffffff;text-decoration:none;border-radius:8px;font-size:16px;font-weight:bold;">Check Out HighVibe Retreats</a>
            </td></tr>
          </table>

          <p style="color:#666;font-size:14px;">No pressure at all — if this isn't the right time, we completely understand. We wish you continued success with ${hostName}.</p>

          <p style="color:#333;font-size:16px;line-height:1.6;margin-top:24px;">Warm regards,<br><strong>The HighVibe Retreats Team</strong></p>
        </td></tr>
        <tr><td style="padding:24px 40px;text-align:center;background:#f5f0eb;font-size:12px;color:#666;">
          <p style="margin:0;">HighVibe Retreats &mdash; Curated experiences for those who choose living well.</p>
          <p style="margin:8px 0 0;">This is a one-time partnership inquiry. You are receiving this because ${hostName} is publicly listed as a ${accommodationType.toLowerCase()} in ${location}.</p>
          <p style="margin:8px 0 0;"><a href="${unsubscribeUrl}" style="color:#999;">Unsubscribe from future emails</a></p>
          <p style="margin:8px 0 0;">HighVibe Retreats &middot; Los Angeles, CA</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const text = `Hi ${hostName},

We're reaching out from HighVibe Retreats. A retreat leader on our platform is planning a wellness retreat in ${location} and is looking for a ${accommodationType.toLowerCase()} to host their group. We came across ${hostName} and think it could be a beautiful fit.

We wanted to take a moment to introduce ourselves and share a bit about what we do.

WHO WE ARE
HighVibe Retreats is a curated marketplace for wellness retreats. We connect retreat leaders — yoga teachers, wellness coaches, meditation guides — with exceptional properties where they can host their experiences. The retreat leader brings the programming, the participants, and the vision. The property provides the space, the atmosphere, and the hospitality. We bring them together.

HOW IT WORKS FOR PROPERTIES
When a retreat leader is planning an experience, they tell us about the kind of property they're looking for — location, style, capacity, and dates. We search for properties that fit and make an introduction through the platform. From there, you and the retreat leader can connect, discuss availability and rates, and decide together if it's the right fit. You stay in complete control of your pricing, your calendar, and your property.

WHY WE'RE REACHING OUT TO YOU
A retreat leader on our platform is actively looking for a ${accommodationType.toLowerCase()} in ${location} to host their upcoming retreat. ${groupSize ? `This particular retreat would bring approximately ${groupSize} guests for a multi-night stay.` : 'Retreat leaders typically book blocks of rooms for multi-night group stays.'} We'd love to introduce you to them through the platform so you can learn more about the opportunity and see if it works with your schedule.

THERE'S ZERO RISK
Listing your property on HighVibe is completely free — no monthly fees, no exclusivity agreements, no commitments. You set your own nightly rates and only make your property available when it works for you. The retreat leader handles all programming, activities, and guest coordination. Your role is simply doing what you already do best — providing a beautiful space and great hospitality. If you find the platform valuable over time, there's an option to become a member for additional features — but there's no obligation whatsoever.

Many properties find that retreat bookings become a welcome source of recurring revenue — retreat leaders who have a great experience often come back 2-4 times per year. But there's absolutely no pressure. We'd just love for you to take a look and see if it's something that interests you.

Check it out: ${signupUrl}

No pressure at all — if this isn't the right time, we completely understand. We wish you continued success with ${hostName}.

Warm regards,
The HighVibe Retreats Team

---
This is a one-time partnership inquiry from HighVibe Retreats.
To unsubscribe: ${unsubscribeUrl}
HighVibe Retreats · Los Angeles, CA`;

    // Send email
    await sendEmail({ to: hostEmail, subject, html, text });

    // Log outreach to Firestore (reuses scout_outreach collection with outreachType field)
    try {
      await db.collection('scout_outreach').add({
        vendorEmail: hostEmail.toLowerCase(),
        vendorName: hostName,
        vendorCategory: accommodationType,
        location,
        guideUserId: uid,
        retreatId: retreatId || null,
        outreachType: 'host',
        groupSize: groupSize || null,
        status: 'sent',
        sentAt: new Date(),
        openedAt: null,
        signedUpAt: null,
      });
    } catch (firestoreError) {
      console.error('Failed to log host outreach to Firestore:', firestoreError);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Missing authorization header') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Host outreach email error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send host outreach email' },
      { status: 500 }
    );
  }
}
