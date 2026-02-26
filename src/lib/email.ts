import { Resend } from 'resend';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmailString = process.env.EMAIL_FROM;

  if (!resendApiKey || resendApiKey.includes('REPLACE')) {
    const errorMsg = 'Resend API key is not configured. Please set RESEND_API_KEY as a secret and grant access with `firebase apphosting:secrets:grantaccess`.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  if (!fromEmailString) {
    const errorMsg = 'From email is not configured. Please set EMAIL_FROM in your environment.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  const resend = new Resend(resendApiKey);

  const { data, error } = await resend.emails.send({
    from: fromEmailString,
    to: [to],
    subject: subject,
    html: html,
    text: text,
  });

  if (error) {
    console.error('Resend API Error:', error);
    const apiError = new Error(error.message);
    (apiError as any).statusCode = (error as any).statusCode || error.name;
    throw apiError;
  }

  return data;
}
