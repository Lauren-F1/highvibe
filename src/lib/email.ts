import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.EMAIL_FROM;

let resend: Resend | null = null;
if (resendApiKey && resendApiKey !== 're_YOUR_REAL_RESEND_KEY_HERE' && resendApiKey !== 'REPLACE_ME') {
  resend = new Resend(resendApiKey);
}

export async function sendWaitlistConfirmation(to: string, firstName?: string) {
  if (!resend) {
    throw new Error('Resend is not configured. Please check your RESEND_API_KEY environment variable.');
  }

  if (!fromEmail) {
    throw new Error('EMAIL_FROM environment variable is not set.');
  }

  const subject = 'You’re on the HighVibe Retreats list';
  const body = `
    <div>
      <p>Hi ${firstName || 'there'},</p>
      <p>Thanks for joining the waitlist for HighVibe Retreats. You're all set.</p>
      <p>We'll send you an email as soon as we open the doors for early access.</p>
      <p>As a reminder, the first 250 verified sign-ups get 60 days of membership fees waived as a founder perk.</p>
      <br/>
      <p>The HighVibe Team</p>
    </div>
  `;

  return resend.emails.send({
    from: fromEmail,
    to,
    subject,
    html: body,
  });
}
