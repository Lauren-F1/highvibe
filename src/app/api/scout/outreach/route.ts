import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * POST /api/scout/outreach
 *
 * Sends a CAN-SPAM compliant outreach email to a scouted vendor on behalf of HighVibe Retreats.
 * Does NOT reveal the guide's identity — only says "a retreat leader" is looking for services.
 *
 * Logs the outreach to Firestore for tracking.
 *
 * Body: {
 *   vendorEmail: string,
 *   vendorName: string,
 *   vendorCategory: string,
 *   location: string,
 *   guideUserId: string,
 *   retreatId?: string,
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vendorEmail, vendorName, vendorCategory, location, guideUserId, retreatId } = body;

    if (!vendorEmail || !vendorName || !vendorCategory || !location || !guideUserId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Build CAN-SPAM compliant email
    const subject = `A retreat leader is looking for ${vendorCategory} services in ${location}`;

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Georgia, 'Times New Roman', serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #faf8f5;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="font-size: 24px; font-weight: normal; color: #1a1a1a; margin: 0;">HighVibe Retreats</h1>
  </div>

  <p>Hi ${vendorName},</p>

  <p>We're reaching out from <strong>HighVibe Retreats</strong>, a marketplace that connects retreat leaders with local service providers like you.</p>

  <p>A retreat leader on our platform is planning a retreat in <strong>${location}</strong> and is looking for <strong>${vendorCategory}</strong> services. Based on your business profile, we think you could be a great fit.</p>

  <h3 style="color: #1a1a1a; margin-top: 24px;">Why partner through HighVibe?</h3>
  <ul style="line-height: 1.8;">
    <li><strong>Payment protection</strong> — You're guaranteed payment when you deliver your service. If the retreat leader cancels late, you're still covered.</li>
    <li><strong>No upfront cost</strong> — Our free tier has zero monthly fees. You only pay a small platform fee when you actually book a job.</li>
    <li><strong>Build your reputation</strong> — Earn verified reviews from retreat leaders. High ratings lead to more referrals from our platform automatically.</li>
    <li><strong>Contracts handled</strong> — We provide service agreements between you and the retreat leader, so expectations are clear and documented.</li>
    <li><strong>Ongoing discovery</strong> — Once you're on the platform, other retreat leaders searching your area can find and book you too.</li>
  </ul>

  <div style="text-align: center; margin: 32px 0;">
    <a href="https://highviberetreats.com/join/vendor?ref=scout&source=${encodeURIComponent(vendorEmail)}" style="display: inline-block; padding: 14px 32px; background-color: #e05a33; color: white; text-decoration: none; border-radius: 8px; font-size: 16px;">Join HighVibe — It's Free to Start</a>
  </div>

  <p style="color: #666;">If this isn't a fit right now, no worries at all. We wish you the best with your business.</p>

  <hr style="border: none; border-top: 1px solid #ddd; margin: 32px 0;">

  <!-- CAN-SPAM Required Elements -->
  <div style="font-size: 12px; color: #999; text-align: center;">
    <p><strong>HighVibe Retreats</strong><br>
    This is a one-time partnership inquiry. You are receiving this because your business is publicly listed for ${vendorCategory} services in ${location}.</p>
    <p>If you do not wish to receive further emails from HighVibe Retreats, <a href="https://highviberetreats.com/api/scout/unsubscribe?email=${encodeURIComponent(vendorEmail)}" style="color: #999;">click here to unsubscribe</a>.</p>
    <p>HighVibe Retreats · Los Angeles, CA</p>
  </div>
</body>
</html>`;

    const text = `Hi ${vendorName},

We're reaching out from HighVibe Retreats, a marketplace that connects retreat leaders with local service providers like you.

A retreat leader on our platform is planning a retreat in ${location} and is looking for ${vendorCategory} services. Based on your business profile, we think you could be a great fit.

Why partner through HighVibe?
- Payment protection — You're guaranteed payment when you deliver your service.
- No upfront cost — Our free tier has zero monthly fees. You only pay a small platform fee when you book a job.
- Build your reputation — Earn verified reviews from retreat leaders.
- Contracts handled — We provide service agreements so expectations are clear.
- Ongoing discovery — Other retreat leaders searching your area can find you too.

Join HighVibe (it's free to start): https://highviberetreats.com/join/vendor?ref=scout&source=${encodeURIComponent(vendorEmail)}

If this isn't a fit right now, no worries at all.

---
This is a one-time partnership inquiry from HighVibe Retreats.
To unsubscribe: https://highviberetreats.com/api/scout/unsubscribe?email=${encodeURIComponent(vendorEmail)}
HighVibe Retreats · Los Angeles, CA`;

    // Send email
    await sendEmail({ to: vendorEmail, subject, html, text });

    // Log outreach to Firestore
    try {
      const admin = getFirebaseAdmin();
      const db = getFirestore(admin);
      await db.collection('scout_outreach').add({
        vendorEmail,
        vendorName,
        vendorCategory,
        location,
        guideUserId,
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
    console.error('Outreach email error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send outreach email' },
      { status: 500 }
    );
  }
}
