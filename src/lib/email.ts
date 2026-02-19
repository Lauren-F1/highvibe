import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.EMAIL_FROM;

let resend: Resend | null = null;
if (resendApiKey && resendApiKey !== 're_YOUR_REAL_RESEND_KEY_HERE' && resendApiKey !== 'REPLACE_ME') {
  resend = new Resend(resendApiKey);
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  if (!resend) {
    throw new Error('Resend is not configured. Please check your RESEND_API_KEY environment variable.');
  }

  if (!fromEmail) {
    throw new Error('EMAIL_FROM environment variable is not set.');
  }

  return resend.emails.send({
    from: fromEmail,
    to,
    subject,
    html,
    text,
  });
}

    