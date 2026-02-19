type RoleBucket = "seeker" | "guide" | "host" | "vendor" | "partner";

interface BuildEmailProps {
    firstName?: string;
    roleInterest?: string;
    roleBucket: RoleBucket;
    founderCode: string | null;
    hasCode: boolean;
}

interface EmailContent {
    subject: string;
    html: string;
    text: string;
}

const buildProviderWithCodeEmail = (roleInterest: string, founderCode: string): EmailContent => {
    const subject = "You’re on the list — your Access Pass code is inside";
    const html = `
        <div>
            <p>You’re officially on the list as a ${roleInterest}.</p>
            <p>Here’s your Founding Members Access Pass code: <strong>${founderCode}</strong></p>
            <p>Activate after launch to get 60 days on us.</p>
            <br/>
            <p><strong>Access Pass terms:</strong></p>
            <ul>
                <li>Single-use and non-transferable</li>
                <li>Code must be activated within 60 days of launch</li>
                <li>Once activated, 60 days on us begins immediately</li>
                <li>We reserve the right to revoke codes in cases of abuse or misrepresentation</li>
            </ul>
            <br/>
            <p>Thank you for being early — we’re genuinely excited to build this with you. You’re exactly who we built HighVibe for.</p>
        </div>
    `;
    const text = `You’re officially on the list as a ${roleInterest}. Here’s your Founding Members Access Pass code: ${founderCode}. Activate after launch to get 60 days on us. Terms apply. Thank you for being early — we’re genuinely excited to build this with you.`;
    return { subject, html, text };
}

const buildProviderNoCodeEmail = (): EmailContent => {
    const subject = "You’re on the list — early access confirmed";
    const bodyContent = "We’ve had a big wave of early interest, and Founding Members Access Passes for this early release have been fully claimed. You’re still confirmed for early access, and we’ll email you as soon as we launch. Thank you for being early — we’re genuinely excited to build this with you. You’re exactly who we built HighVibe for.";
    const html = `<p>${bodyContent}</p>`;
    const text = bodyContent;
    return { subject, html, text };
}

const buildSeekerEmail = (): EmailContent => {
    const subject = "You’re on the list — HighVibe is opening soon";
    const html = `
        <div>
            <p>You’re on the list.</p>
            <p>Good news: there’s no fee to seek and explore. We’ll notify you as soon as HighVibe launches.</p>
            <p>Return after launch for a chance to Manifest up to $500 toward a future retreat (terms apply).</p>
            <br/>
            <p>Thank you for being early — we’re genuinely excited to build this with you.</p>
        </div>
    `;
    const text = "You’re on the list. Good news: there’s no fee to seek and explore. We’ll notify you as soon as HighVibe launches. Return after launch for a chance to Manifest up to $500 toward a future retreat (terms apply). Thank you for being early — we’re genuinely excited to build this with you.";
    return { subject, html, text };
}

const buildPartnerEmail = (): EmailContent => {
    const subject = "You’re on the list — early access confirmed";
    const html = `
        <div>
            <p>You’re on the list as a Partner / Collaborator.</p>
            <p>We’ll reach out with invites as we open early access.</p>
            <br/>
            <p>Thank you for being early — we’re genuinely excited to build this with you. You’re exactly who we built HighVibe for.</p>
        </div>
    `;
    const text = "You’re on the list as a Partner / Collaborator. We’ll reach out with invites as we open early access. Thank you for being early — we’re genuinely excited to build this with you. You’re exactly who we built HighVibe for.";
    return { subject, html, text };
}


export function buildWaitlistEmail({ roleInterest, roleBucket, founderCode, hasCode }: BuildEmailProps): EmailContent {
    const isProvider = ['guide', 'host', 'vendor'].includes(roleBucket);

    if (isProvider) {
        if (hasCode && founderCode) {
            return buildProviderWithCodeEmail(roleInterest || roleBucket, founderCode);
        } else {
            return buildProviderNoCodeEmail();
        }
    } else if (roleBucket === 'seeker') {
        return buildSeekerEmail();
    } else { // 'partner' or default
        return buildPartnerEmail();
    }
}

    