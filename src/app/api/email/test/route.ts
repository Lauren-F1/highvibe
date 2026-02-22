import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    const emailFrom = process.env.EMAIL_FROM;
    const testEmailTo = process.env.TEST_EMAIL_TO || 'info@highviberetreats.com';

    if (!resendApiKey) {
      console.error('RESEND_API_KEY is not set.');
      throw new Error('Server configuration error: Email API key is missing.');
    }

    if (!emailFrom) {
      console.error('EMAIL_FROM is not set.');
      throw new Error('Server configuration error: "From" email is not set.');
    }

    const resend = new Resend(resendApiKey);

    const { data, error } = await resend.emails.send({
      from: emailFrom,
      to: [testEmailTo],
      subject: 'HighVibe — Resend test from Firebase',
      html: '<p>This is a test email to confirm that the Firebase App Hosting to Resend email pipeline is working correctly. If you received this, everything is configured properly.</p>',
    });

    if (error) {
      console.error('Resend API Error:', error);
      throw new Error(error.message);
    }

    return NextResponse.json(data);

  } catch (error: any) {
    // Ensure the API key is not leaked in the error message
    const safeErrorMessage = (process.env.RESEND_API_KEY) ? error.message.replace(process.env.RESEND_API_KEY, '[REDACTED]') : error.message;
    console.error('Test Email Error:', safeErrorMessage);
    return NextResponse.json({ error: safeErrorMessage }, { status: 500 });
  }
}
