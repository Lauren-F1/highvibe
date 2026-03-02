/**
 * HTML email templates for notification types.
 * Uses inline styles matching HighVibe brand (beige, Georgia font, poppy CTA).
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://highviberetreats.com';

function wrapEmail(content: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f5f0eb;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
        <tr><td style="padding:32px 40px;text-align:center;background:#1a1a1a;">
          <h1 style="margin:0;color:#f5f0eb;font-size:24px;letter-spacing:0.15em;">HIGHVIBE RETREATS</h1>
        </td></tr>
        <tr><td style="padding:40px;">
          ${content}
        </td></tr>
        <tr><td style="padding:24px 40px;text-align:center;background:#f5f0eb;font-size:12px;color:#666;">
          <p style="margin:0;">HighVibe Retreats &mdash; Curated experiences for those who choose living well.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function ctaButton(text: string, url: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr><td align="center">
      <a href="${url}" style="display:inline-block;padding:14px 32px;background:#e85d3a;color:#ffffff;text-decoration:none;border-radius:6px;font-size:16px;font-weight:bold;">${text}</a>
    </td></tr>
  </table>`;
}

export function buildNewConnectionEmail(params: {
  recipientName: string;
  senderName: string;
}) {
  const html = wrapEmail(`
    <h2 style="margin:0 0 16px;color:#1a1a1a;font-size:22px;">New Connection Request</h2>
    <p style="color:#333;font-size:16px;line-height:1.6;">Hi ${params.recipientName},</p>
    <p style="color:#333;font-size:16px;line-height:1.6;"><strong>${params.senderName}</strong> wants to connect with you on HighVibe Retreats.</p>
    ${ctaButton('View Message', `${BASE_URL}/inbox`)}
    <p style="color:#999;font-size:14px;">You can manage your notification preferences in your account settings.</p>
  `);
  const text = `New connection request from ${params.senderName}. View at ${BASE_URL}/inbox`;
  return { html, text };
}

export function buildNewMessageEmail(params: {
  recipientName: string;
  senderName: string;
  messageSnippet: string;
}) {
  const html = wrapEmail(`
    <h2 style="margin:0 0 16px;color:#1a1a1a;font-size:22px;">New Message</h2>
    <p style="color:#333;font-size:16px;line-height:1.6;">Hi ${params.recipientName},</p>
    <p style="color:#333;font-size:16px;line-height:1.6;"><strong>${params.senderName}</strong> sent you a message:</p>
    <div style="background:#f5f0eb;padding:16px;border-radius:6px;margin:16px 0;">
      <p style="color:#333;font-size:14px;margin:0;font-style:italic;">"${params.messageSnippet}"</p>
    </div>
    ${ctaButton('Reply Now', `${BASE_URL}/inbox`)}
  `);
  const text = `New message from ${params.senderName}: "${params.messageSnippet}". Reply at ${BASE_URL}/inbox`;
  return { html, text };
}

export function buildBookingConfirmationEmail(params: {
  recipientName: string;
  retreatTitle: string;
  amount: number;
}) {
  const html = wrapEmail(`
    <h2 style="margin:0 0 16px;color:#1a1a1a;font-size:22px;">Booking Confirmed!</h2>
    <p style="color:#333;font-size:16px;line-height:1.6;">Hi ${params.recipientName},</p>
    <p style="color:#333;font-size:16px;line-height:1.6;">Your booking for <strong>${params.retreatTitle}</strong> has been confirmed.</p>
    <div style="background:#f5f0eb;padding:16px;border-radius:6px;margin:16px 0;">
      <p style="color:#333;font-size:16px;margin:0;"><strong>Total: $${params.amount.toLocaleString()}</strong></p>
    </div>
    ${ctaButton('View Booking', `${BASE_URL}/seeker/manifestations`)}
  `);
  const text = `Booking confirmed for ${params.retreatTitle}. Total: $${params.amount}`;
  return { html, text };
}

export function buildManifestationMatchEmail(params: {
  recipientName: string;
  matchDescription: string;
}) {
  const html = wrapEmail(`
    <h2 style="margin:0 0 16px;color:#1a1a1a;font-size:22px;">Match Found!</h2>
    <p style="color:#333;font-size:16px;line-height:1.6;">Hi ${params.recipientName},</p>
    <p style="color:#333;font-size:16px;line-height:1.6;">We found a retreat matching your manifestation:</p>
    <div style="background:#f5f0eb;padding:16px;border-radius:6px;margin:16px 0;">
      <p style="color:#333;font-size:14px;margin:0;">${params.matchDescription}</p>
    </div>
    ${ctaButton('View Matches', `${BASE_URL}/seeker/manifestations`)}
  `);
  const text = `Match found for your manifestation: ${params.matchDescription}. View at ${BASE_URL}/seeker/manifestations`;
  return { html, text };
}
