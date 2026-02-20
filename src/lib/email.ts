import MailerLite from '@mailerlite/mailerlite-nodejs';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  const mailerliteApiKey = process.env.MAILERLITE_API_KEY;
  const fromEmailString = process.env.EMAIL_FROM;

  if (!mailerliteApiKey || mailerliteApiKey.includes('REPLACE')) {
    const errorMsg = 'MailerLite API key is not configured. Please set MAILERLITE_API_KEY as a secret.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  if (!fromEmailString) {
    const errorMsg = 'From email is not configured. Please set EMAIL_FROM in your environment.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  const match = fromEmailString.match(/(.*) <(.*)>/);
  if (!match) {
    throw new Error('Invalid EMAIL_FROM format. Expected "Name <email@example.com>".');
  }
  const fromName = match[1].trim();
  const fromEmail = match[2].trim();

  const mailerlite = new MailerLite({ api_key: mailerliteApiKey });

  const params = {
    to: [
        {
            email: to,
        }
    ],
    from: {
      email: fromEmail,
      name: fromName,
    },
    subject: subject,
    html: html,
    text: text,
  };

  // Use the underlying client to send transactional email
  await mailerlite.client.post('/email', params);
}
