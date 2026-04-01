'use server';

/**
 * @fileOverview AI-powered contact form submission.
 *
 * When a scouted business has no public email, this flow:
 * 1. Fetches the contact page HTML
 * 2. Uses Gemini to identify form fields and the form action URL
 * 3. Submits the form via HTTP POST with a partnership inquiry message
 *
 * Falls back gracefully — returns { submitted: false } if the form
 * can't be identified or submitted (JS-heavy SPAs, CAPTCHAs, etc.)
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ContactFormInputSchema = z.object({
  websiteUrl: z.string().describe('The business website URL'),
  businessName: z.string().describe('The business name'),
  businessCategory: z.string().describe('What the business does (e.g., "Catering", "Boutique Hotel")'),
  location: z.string().describe('Location being scouted'),
  outreachType: z.enum(['vendor', 'host']).describe('Whether this is a vendor or host outreach'),
});
export type ContactFormInput = z.infer<typeof ContactFormInputSchema>;

const ContactFormOutputSchema = z.object({
  submitted: z.boolean().describe('Whether the form was successfully submitted'),
  method: z.enum(['form', 'none']).describe('How contact was made'),
  contactPageUrl: z.string().optional().describe('The URL of the contact page found'),
  reason: z.string().optional().describe('Why submission failed, if it did'),
});
export type ContactFormOutput = z.infer<typeof ContactFormOutputSchema>;

// AI prompt to analyze HTML and extract form details
const analyzeFormPrompt = ai.definePrompt({
  name: 'analyzeContactFormPrompt',
  input: {
    schema: z.object({
      html: z.string().describe('The HTML content of the contact page'),
      pageUrl: z.string().describe('The URL of the page'),
    }),
  },
  output: {
    schema: z.object({
      hasForm: z.boolean().describe('Whether a contact/inquiry form was found'),
      formAction: z.string().optional().describe('The form action URL (absolute)'),
      formMethod: z.enum(['GET', 'POST']).optional().describe('The form method'),
      fields: z.array(z.object({
        name: z.string().describe('The input name attribute'),
        type: z.string().describe('The input type (text, email, textarea, hidden, select, etc.)'),
        label: z.string().optional().describe('The label or placeholder for this field'),
        required: z.boolean().describe('Whether the field appears required'),
        value: z.string().optional().describe('Pre-filled value for hidden fields'),
      })).optional().describe('Form fields found'),
      reason: z.string().optional().describe('If no form found, explain why'),
    }),
  },
  prompt: `You are analyzing an HTML page to find a contact or inquiry form.

Page URL: {{pageUrl}}

Look for a <form> element that is a contact form, inquiry form, or "get in touch" form. Ignore newsletter signup forms, search forms, and login forms.

For each form field, extract:
- name: the "name" attribute of the input/textarea/select
- type: text, email, tel, textarea, hidden, select, etc.
- label: from <label>, placeholder, or aria-label
- required: whether it has required attribute or appears mandatory
- value: for hidden fields, include the pre-filled value

For the form action:
- If the action is a relative URL, make it absolute using the page URL
- If no action attribute, use the page URL itself

HTML to analyze (truncated to key parts):
{{html}}`,
});

async function fetchPageHtml(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'HighVibeRetreats/1.0 (partnership-inquiry)' },
    });
    clearTimeout(timeout);
    if (!response.ok) return null;
    const html = await response.text();
    // Trim to a reasonable size for AI analysis — keep head + body, strip scripts/styles
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .substring(0, 30000); // Keep under token limits
  } catch {
    return null;
  }
}

function buildMessage(input: ContactFormInput): { name: string; email: string; subject: string; message: string } {
  const isHost = input.outreachType === 'host';

  return {
    name: 'Lauren Florek',
    email: 'info@highviberetreats.com',
    subject: isHost
      ? `Partnership inquiry: Hosting wellness retreats at ${input.businessName}`
      : `Partnership inquiry: ${input.businessCategory} services for wellness retreats`,
    message: isHost
      ? `Hi ${input.businessName},\n\nI'm reaching out from HighVibe Retreats, a curated marketplace that connects retreat leaders with exceptional properties.\n\nA retreat leader on our platform is planning a wellness retreat in ${input.location} and is looking for a venue to host their group. We came across ${input.businessName} and thought it could be a wonderful fit.\n\nWe'd love to learn more about your property and discuss how we might work together. Listing on HighVibe is completely free — no monthly fees or commitments.\n\nWould you be open to a quick conversation?\n\nWarm regards,\nLauren Florek\nHighVibe Retreats\nhttps://highviberetreats.com`
      : `Hi ${input.businessName},\n\nI'm reaching out from HighVibe Retreats, a curated marketplace for wellness retreats.\n\nA retreat leader on our platform is planning a retreat in ${input.location} and is looking for ${input.businessCategory} services. Based on your business, we think you could be a great fit.\n\nWe'd love to introduce you to the opportunity. Joining HighVibe is completely free — no monthly fees or commitments.\n\nWould you be interested in learning more?\n\nWarm regards,\nLauren Florek\nHighVibe Retreats\nhttps://highviberetreats.com`,
  };
}

function mapMessageToFormFields(
  fields: Array<{ name: string; type: string; label?: string; required: boolean; value?: string }>,
  message: { name: string; email: string; subject: string; message: string }
): Record<string, string> {
  const formData: Record<string, string> = {};

  for (const field of fields) {
    // Preserve hidden field values
    if (field.type === 'hidden' && field.value) {
      formData[field.name] = field.value;
      continue;
    }

    const nameAndLabel = `${field.name} ${field.label || ''}`.toLowerCase();

    if (nameAndLabel.includes('email') || nameAndLabel.includes('e-mail')) {
      formData[field.name] = message.email;
    } else if (nameAndLabel.includes('name') && !nameAndLabel.includes('company') && !nameAndLabel.includes('business')) {
      formData[field.name] = message.name;
    } else if (nameAndLabel.includes('company') || nameAndLabel.includes('business') || nameAndLabel.includes('organization')) {
      formData[field.name] = 'HighVibe Retreats';
    } else if (nameAndLabel.includes('subject') || nameAndLabel.includes('topic') || nameAndLabel.includes('reason')) {
      formData[field.name] = message.subject;
    } else if (nameAndLabel.includes('phone') || nameAndLabel.includes('tel')) {
      // Leave phone blank — it's usually optional
    } else if (field.type === 'textarea' || nameAndLabel.includes('message') || nameAndLabel.includes('comment') || nameAndLabel.includes('inquiry') || nameAndLabel.includes('details')) {
      formData[field.name] = message.message;
    } else if (nameAndLabel.includes('website') || nameAndLabel.includes('url')) {
      formData[field.name] = 'https://highviberetreats.com';
    }
  }

  return formData;
}

export async function submitContactForm(input: ContactFormInput): Promise<ContactFormOutput> {
  const baseUrl = input.websiteUrl.replace(/\/$/, '');
  const contactPages = [
    `${baseUrl}/contact`,
    `${baseUrl}/contact-us`,
    `${baseUrl}/get-in-touch`,
    `${baseUrl}/inquire`,
    `${baseUrl}/inquiry`,
    baseUrl,
  ];

  for (const pageUrl of contactPages) {
    const html = await fetchPageHtml(pageUrl);
    if (!html) continue;

    // Check if page has a form
    if (!/<form/i.test(html)) continue;

    try {
      const { output: analysis } = await analyzeFormPrompt({ html, pageUrl });

      if (!analysis?.hasForm || !analysis.fields || analysis.fields.length === 0) {
        continue;
      }

      const formAction = analysis.formAction || pageUrl;
      const formMethod = analysis.formMethod || 'POST';

      // Build form data
      const message = buildMessage(input);
      const formData = mapMessageToFormFields(analysis.fields, message);

      // Check we have at least a message field filled
      const hasMessage = Object.values(formData).some(v => v.length > 50);
      if (!hasMessage) continue;

      // Submit the form
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        const body = new URLSearchParams(formData).toString();
        const response = await fetch(formAction, {
          method: formMethod,
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'HighVibeRetreats/1.0 (partnership-inquiry)',
            'Referer': pageUrl,
          },
          body,
          redirect: 'follow',
        });
        clearTimeout(timeout);

        // Most contact forms return 200 or redirect on success
        if (response.ok || response.status === 302 || response.status === 301) {
          return {
            submitted: true,
            method: 'form',
            contactPageUrl: pageUrl,
          };
        }
      } catch {
        // Form submission failed — try next page
        continue;
      }
    } catch {
      // AI analysis failed — try next page
      continue;
    }
  }

  return {
    submitted: false,
    method: 'none',
    reason: 'Could not find or submit a contact form on any page',
  };
}
