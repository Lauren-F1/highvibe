import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL_ALLOWLIST || 'info@highviberetreats.com';

export async function POST(request: Request) {
  try {
    const { name, email, role, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const subject = `New Contact Form Submission from ${name}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px;">
        <h2 style="margin-bottom: 16px;">New Contact Form Submission</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Name:</td><td style="padding: 8px 0;">${name}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Email:</td><td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Role:</td><td style="padding: 8px 0;">${role || 'Not specified'}</td></tr>
        </table>
        <div style="margin-top: 16px; padding: 16px; background: #f5f5f5; border-radius: 8px;">
          <p style="font-weight: bold; margin: 0 0 8px 0;">Message:</p>
          <p style="margin: 0; white-space: pre-wrap;">${message}</p>
        </div>
        <p style="margin-top: 16px; font-size: 12px; color: #888;">Reply directly to this email to respond to ${name}.</p>
      </div>
    `;
    const text = `New Contact Form Submission\n\nName: ${name}\nEmail: ${email}\nRole: ${role || 'Not specified'}\n\nMessage:\n${message}`;

    // Send to admin — use the submitter's email as reply-to isn't supported by sendEmail,
    // so just include it prominently in the body
    await sendEmail({
      to: ADMIN_EMAIL.split(',')[0].trim(),
      subject,
      html,
      text,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[CONTACT] Email send failed:', error);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}
