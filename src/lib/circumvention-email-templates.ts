
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://highviberetreats.com';

interface CircumventionWarningProps {
  userName: string;
  conversationId: string;
  messageSnippet: string;
}

/**
 * Warning email sent to the user who triggered a circumvention flag.
 */
export function buildCircumventionWarningEmail({ userName, conversationId, messageSnippet }: CircumventionWarningProps): { subject: string; html: string; text: string } {
  const subject = 'Important Reminder: HighVibe Payment Policy';
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <p>Hi ${userName},</p>
      <p>We noticed activity in one of your conversations that may relate to arranging payment outside of the HighVibe platform.</p>
      <p style="background: #FFF3CD; border-left: 4px solid #FFC107; padding: 12px 16px; border-radius: 4px;">
        <strong>Reminder:</strong> All bookings made through HighVibe must be processed through the platform's payment system. This protects both Seekers and Providers with our cancellation policy, dispute resolution, and fraud protection.
      </p>
      <p>Off-platform payment arrangements violate our <a href="${BASE_URL}/terms" style="color: #c45d3e;">Terms of Service</a> and <a href="${BASE_URL}/provider-agreement" style="color: #c45d3e;">Provider Agreement</a>, and may result in:</p>
      <ul>
        <li>Account suspension or termination</li>
        <li>Withholding of pending payouts</li>
        <li>Recovery of applicable platform fees</li>
      </ul>
      <p>If you believe this was flagged in error, or if you have questions about our payment process, please reply to this email.</p>
      <br/>
      <p>The HighVibe Team</p>
    </div>
  `;
  const text = `Hi ${userName},\n\nWe noticed activity in one of your conversations that may relate to arranging payment outside of the HighVibe platform.\n\nReminder: All bookings made through HighVibe must be processed through the platform's payment system.\n\nOff-platform payment arrangements violate our Terms of Service and Provider Agreement, and may result in account suspension, withholding of payouts, or recovery of platform fees.\n\nIf you believe this was flagged in error, please reply to this email.\n\nThe HighVibe Team`;

  return { subject, html, text };
}

interface CircumventionAdminAlertProps {
  flaggedUserName: string;
  flaggedUserId: string;
  otherUserName: string;
  otherUserId: string;
  conversationId: string;
  messageSnippet: string;
  riskScore: number;
  reasons: string[];
}

/**
 * Alert email sent to admin when circumvention is detected.
 */
export function buildCircumventionAdminAlertEmail({ flaggedUserName, flaggedUserId, otherUserName, otherUserId, conversationId, messageSnippet, riskScore, reasons }: CircumventionAdminAlertProps): { subject: string; html: string; text: string } {
  const subject = `[FLAG] Potential Circumvention: ${flaggedUserName}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #DC2626;">Commission Circumvention Flag</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Flagged User</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${flaggedUserName} (${flaggedUserId})</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Other Party</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${otherUserName} (${otherUserId})</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Conversation</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${conversationId}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Risk Score</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${riskScore}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Reasons</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${reasons.join(', ')}</td></tr>
      </table>
      <p style="margin-top: 16px;"><strong>Message excerpt:</strong></p>
      <blockquote style="background: #F3F4F6; padding: 12px 16px; border-left: 4px solid #DC2626; border-radius: 4px; margin: 8px 0;">
        "${messageSnippet.substring(0, 300)}${messageSnippet.length > 300 ? '...' : ''}"
      </blockquote>
      <p>Review this conversation in the <a href="${BASE_URL}/admin/flagged-conversations" style="color: #c45d3e;">Admin Dashboard</a>.</p>
    </div>
  `;
  const text = `CIRCUMVENTION FLAG\n\nFlagged User: ${flaggedUserName} (${flaggedUserId})\nOther Party: ${otherUserName} (${otherUserId})\nConversation: ${conversationId}\nRisk Score: ${riskScore}\nReasons: ${reasons.join(', ')}\n\nMessage: "${messageSnippet.substring(0, 300)}"\n\nReview at ${BASE_URL}/admin/flagged-conversations`;

  return { subject, html, text };
}
