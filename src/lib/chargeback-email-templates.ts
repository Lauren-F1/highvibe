
interface ChargebackEmailProps {
  providerName: string;
  bookingId: string;
  amount: number;
  currency: string;
  evidenceDeadline: string;
}

export function buildChargebackNotificationEmail({ providerName, bookingId, amount, currency, evidenceDeadline }: ChargebackEmailProps): { subject: string; html: string; text: string } {
    const subject = `Dispute Filed for Booking #${bookingId}`;
    const html = `
        <div>
            <p>Hi ${providerName},</p>
            <p>A chargeback has been filed by a customer for booking <strong>#${bookingId}</strong> for the amount of <strong>${amount} ${currency}</strong>.</p>
            <p>To contest this dispute, you must provide evidence by <strong>${evidenceDeadline}</strong>.</p>
            <p>Please log in to your HighVibe dashboard to upload relevant documents, such as your signed contract, refund policy, and communication logs.</p>
            <br/>
            <p>The HighVibe Team</p>
        </div>
    `;
    const text = `Hi ${providerName},\n\nA chargeback has been filed for booking #${bookingId} for ${amount} ${currency}. You must provide evidence by ${evidenceDeadline}. Please log in to your dashboard to upload evidence.\n\nThe HighVibe Team`;
    
    return { subject, html, text };
}
