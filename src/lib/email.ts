interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  // Dynamically import Resend to ensure it's only loaded on the server at runtime.
  const { Resend } = await import('resend');

  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM;

  if (!resendApiKey || resendApiKey.includes('REPLACE')) {
    const errorMsg = 'Resend API key is not configured. Please set RESEND_API_KEY as a secret.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  if (!fromEmail) {
    const errorMsg = 'From email is not configured. Please set EMAIL_FROM in your environment.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  const resend = new Resend(resendApiKey);

  // The calling function (/api/waitlist/route.ts) has a try/catch block,
  // so we let the promise handle success/rejection there.
  await resend.emails.send({
    from: fromEmail,
    to,
    subject,
    html,
    text,
  });
}
