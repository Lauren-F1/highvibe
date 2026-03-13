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

export function buildProviderOpportunityEmail(params: {
  recipientName: string;
  destination: string;
  retreatTypes: string;
  groupSize: number;
  matchScore: number;
  manifestationId: string;
}) {
  const html = wrapEmail(`
    <h2 style="margin:0 0 16px;color:#1a1a1a;font-size:22px;">New Retreat Opportunity!</h2>
    <p style="color:#333;font-size:16px;line-height:1.6;">Hi ${params.recipientName},</p>
    <p style="color:#333;font-size:16px;line-height:1.6;">A seeker is looking for a <strong>${params.retreatTypes}</strong> experience in <strong>${params.destination}</strong> and you're a <strong>${params.matchScore}% match</strong>.</p>
    <div style="background:#f5f0eb;padding:16px;border-radius:6px;margin:16px 0;">
      <p style="color:#333;font-size:14px;margin:0 0 8px;"><strong>Destination:</strong> ${params.destination}</p>
      <p style="color:#333;font-size:14px;margin:0 0 8px;"><strong>Retreat Type:</strong> ${params.retreatTypes}</p>
      ${params.groupSize > 0 ? `<p style="color:#333;font-size:14px;margin:0;"><strong>Group Size:</strong> ${params.groupSize}</p>` : ''}
    </div>
    <p style="color:#333;font-size:16px;line-height:1.6;">Submit a proposal to connect with this seeker and bring their dream retreat to life.</p>
    ${ctaButton('View & Respond', `${BASE_URL}/seeker/manifestations/${params.manifestationId}`)}
    <p style="color:#999;font-size:14px;">You can manage your notification preferences in your account settings.</p>
  `);
  const text = `New retreat opportunity! A seeker is looking for ${params.retreatTypes} in ${params.destination}. You're a ${params.matchScore}% match. View at ${BASE_URL}/seeker/manifestations/${params.manifestationId}`;
  return { html, text };
}

export function buildNewProposalEmail(params: {
  recipientName: string;
  providerName: string;
  providerRole: string;
  destination: string;
  proposedPrice: number;
  manifestationId: string;
}) {
  const html = wrapEmail(`
    <h2 style="margin:0 0 16px;color:#1a1a1a;font-size:22px;">New Proposal Received!</h2>
    <p style="color:#333;font-size:16px;line-height:1.6;">Hi ${params.recipientName},</p>
    <p style="color:#333;font-size:16px;line-height:1.6;"><strong>${params.providerName}</strong> (${params.providerRole}) submitted a proposal for your ${params.destination} retreat.</p>
    <div style="background:#f5f0eb;padding:16px;border-radius:6px;margin:16px 0;">
      <p style="color:#333;font-size:14px;margin:0;"><strong>Proposed Price:</strong> $${params.proposedPrice.toLocaleString()}</p>
    </div>
    ${ctaButton('Review Proposal', `${BASE_URL}/seeker/manifestations/${params.manifestationId}`)}
  `);
  const text = `${params.providerName} submitted a proposal for your ${params.destination} retreat. Price: $${params.proposedPrice}. View at ${BASE_URL}/seeker/manifestations/${params.manifestationId}`;
  return { html, text };
}

export function buildRetreatAvailableEmail(params: {
  recipientName: string;
  retreatTitle: string;
  destination: string;
  price: number;
  spotsRemaining?: number;
  retreatId: string;
}) {
  const spotsLine = params.spotsRemaining != null
    ? `<p style="color:#333;font-size:14px;margin:0;"><strong>Spots Remaining:</strong> ${params.spotsRemaining}</p>`
    : '';
  const html = wrapEmail(`
    <h2 style="margin:0 0 16px;color:#1a1a1a;font-size:22px;">A Retreat Match Has Been Found</h2>
    <p style="color:#333;font-size:16px;line-height:1.6;">Hi ${params.recipientName},</p>
    <p style="color:#333;font-size:16px;line-height:1.6;">A retreat matching your preferences is now available:</p>
    <div style="background:#f5f0eb;padding:16px;border-radius:6px;margin:16px 0;">
      <p style="color:#333;font-size:14px;margin:0 0 8px;"><strong>${params.retreatTitle}</strong></p>
      ${params.destination ? `<p style="color:#333;font-size:14px;margin:0 0 8px;"><strong>Destination:</strong> ${params.destination}</p>` : ''}
      <p style="color:#333;font-size:14px;margin:0 0 8px;"><strong>Price:</strong> $${params.price.toLocaleString()} per person</p>
      ${spotsLine}
    </div>
    ${ctaButton('View Retreat', `${BASE_URL}/retreats/${params.retreatId}`)}
    <p style="color:#999;font-size:14px;">You can manage your notification preferences in your account settings.</p>
  `);
  const text = `A retreat match has been found: ${params.retreatTitle} in ${params.destination}. $${params.price}/person. View at ${BASE_URL}/retreats/${params.retreatId}`;
  return { html, text };
}

export function buildRetreatFullyBookedEmail(params: {
  recipientName: string;
  retreatTitle: string;
  waitlistCount: number;
}) {
  const html = wrapEmail(`
    <h2 style="margin:0 0 16px;color:#1a1a1a;font-size:22px;">Your Retreat Is Fully Booked!</h2>
    <p style="color:#333;font-size:16px;line-height:1.6;">Hi ${params.recipientName},</p>
    <p style="color:#333;font-size:16px;line-height:1.6;"><strong>${params.retreatTitle}</strong> has reached full capacity.</p>
    ${params.waitlistCount > 0 ? `<div style="background:#f5f0eb;padding:16px;border-radius:6px;margin:16px 0;">
      <p style="color:#333;font-size:14px;margin:0;">${params.waitlistCount} seeker${params.waitlistCount === 1 ? '' : 's'} ${params.waitlistCount === 1 ? 'is' : 'are'} on the waitlist — consider creating another session.</p>
    </div>` : ''}
    ${ctaButton('View Dashboard', `${BASE_URL}/guide`)}
  `);
  const text = `Your retreat "${params.retreatTitle}" is fully booked! ${params.waitlistCount > 0 ? `${params.waitlistCount} seekers on waitlist.` : ''} View at ${BASE_URL}/guide`;
  return { html, text };
}

export function buildWaitlistSpotOpenEmail(params: {
  recipientName: string;
  retreatTitle: string;
  retreatId: string;
}) {
  const html = wrapEmail(`
    <h2 style="margin:0 0 16px;color:#1a1a1a;font-size:22px;">A Spot Just Opened Up!</h2>
    <p style="color:#333;font-size:16px;line-height:1.6;">Hi ${params.recipientName},</p>
    <p style="color:#333;font-size:16px;line-height:1.6;">A spot has opened up for <strong>${params.retreatTitle}</strong>.</p>
    ${ctaButton('Book Now', `${BASE_URL}/retreats/${params.retreatId}`)}
    <p style="color:#999;font-size:14px;">Spots are first-come, first-served.</p>
  `);
  const text = `A spot opened up for "${params.retreatTitle}". Book now at ${BASE_URL}/retreats/${params.retreatId}`;
  return { html, text };
}
