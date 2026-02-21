import { Resend } from 'resend';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

// This function will fetch the secret directly from Secret Manager as a fallback
async function getResendApiKey(): Promise<string | undefined> {
  // First, try the environment variable (the standard App Hosting way)
  if (process.env.RESEND_API_KEY) {
    return process.env.RESEND_API_KEY;
  }

  // If not found, and we're in a GCP environment, try fetching from Secret Manager directly.
  // This is a fallback and can help diagnose permission issues.
  const projectId = process.env.GCLOUD_PROJECT;
  if (projectId) {
    try {
      const client = new SecretManagerServiceClient();
      const name = `projects/${projectId}/secrets/RESEND_API_KEY/versions/latest`;
      
      console.log(`Attempting to fetch secret from: ${name}`);

      const [version] = await client.accessSecretVersion({ name });
      const payload = version.payload?.data?.toString();
      
      if (payload) {
        console.log("Successfully fetched secret from Secret Manager.");
        return payload;
      }
      console.warn("Secret payload was empty.");

    } catch (error: any) {
      console.error("Error fetching secret directly from Secret Manager:", error.message);
      // This will likely be a permissions error if the service account is not configured correctly.
      // e.g., "7 PERMISSION_DENIED: Permission 'secretmanager.versions.access' denied"
    }
  }

  // Hardcoded fallback - FOR TEMPORARY DEBUGGING ONLY.
  console.warn('!!! USING HARDCODED API KEY AS A FALLBACK. REMOVE BEFORE GOING TO PRODUCTION. !!!');
  return 're_dzBpzfUo_DdhghSXSkKPUrZttwcNPjQUw';
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  const resendApiKey = await getResendApiKey();
  const fromEmailString = process.env.EMAIL_FROM;

  if (!resendApiKey || resendApiKey.includes('REPLACE')) {
    const errorMsg = 'Resend API key is not configured or could not be fetched. Please set RESEND_API_KEY as a secret in your App Hosting backend.';
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
    // Create an error that looks like the ones from other libraries
    // to keep the consumer code consistent.
    const apiError = new Error(error.message);
    (apiError as any).statusCode = (error as any).statusCode || error.name;
    throw apiError;
  }

  return data;
}
