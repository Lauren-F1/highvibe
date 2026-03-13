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

    const groupSizeLine = groupSize
      ? `<li><strong>Group size</strong> — Typical retreats bring ${groupSize}+ guests for multi-night stays, often booking your entire property or a dedicated wing.</li>`
      : `<li><strong>Group bookings</strong> — Retreat leaders book blocks of rooms for multi-night stays, often reserving your entire property or a dedicated wing.</li>`;

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

          <p style="color:#333;font-size:16px;line-height:1.6;">We're reaching out from <strong>HighVibe Retreats</strong>, a curated marketplace connecting wellness retreat leaders with exceptional properties like yours.</p>

          <p style="color:#333;font-size:16px;line-height:1.6;">A retreat leader on our platform is planning a retreat in <strong>${location}</strong> and is looking for a <strong>${accommodationType.toLowerCase()}</strong> to host their group. We think <strong>${hostName}</strong> could be the perfect fit.</p>

          <h3 style="color:#1a1a1a;margin-top:28px;margin-bottom:12px;">Why host retreats through HighVibe?</h3>
          <ul style="line-height:2;color:#333;font-size:15px;padding-left:20px;">
            ${groupSizeLine}
            <li><strong>Fill off-season gaps</strong> — Retreats often run during quieter periods (midweek, shoulder season), turning empty rooms into guaranteed revenue.</li>
            <li><strong>Hands-off operation</strong> — The retreat leader handles all programming, activities, and guest coordination. You provide the space and hospitality you're already known for.</li>
            <li><strong>Premium clientele</strong> — Wellness seekers are high-intent travelers willing to invest in meaningful experiences. They tend to be respectful, health-conscious guests.</li>
            <li><strong>Recurring revenue</strong> — Successful retreats come back. Many retreat leaders run the same program 2-4 times per year and prefer to return to properties they love.</li>
            <li><strong>No upfront cost</strong> — Listing your property is free. You set your own nightly rates and availability. We only charge a small platform fee when a booking is confirmed.</li>
          </ul>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
            <tr><td align="center">
              <a href="${signupUrl}" style="display:inline-block;padding:14px 32px;background:#66d320;color:#ffffff;text-decoration:none;border-radius:8px;font-size:16px;font-weight:bold;">List Your Property — It's Free</a>
            </td></tr>
          </table>

          <p style="color:#666;font-size:14px;">If this isn't a fit right now, no worries at all. We wish you continued success with ${hostName}.</p>
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

We're reaching out from HighVibe Retreats, a curated marketplace connecting wellness retreat leaders with exceptional properties like yours.

A retreat leader on our platform is planning a retreat in ${location} and is looking for a ${accommodationType.toLowerCase()} to host their group. We think ${hostName} could be the perfect fit.

Why host retreats through HighVibe?

- Group bookings: Retreat leaders book blocks of rooms for multi-night stays.
- Fill off-season gaps: Retreats often run during quieter periods, turning empty rooms into revenue.
- Hands-off operation: The retreat leader handles all programming. You provide the space.
- Premium clientele: Wellness seekers are high-intent travelers willing to invest.
- Recurring revenue: Successful retreats come back 2-4 times per year.
- No upfront cost: Listing is free. You set your own rates. Small platform fee on confirmed bookings.

List your property (it's free): ${signupUrl}

If this isn't a fit right now, no worries at all.

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
