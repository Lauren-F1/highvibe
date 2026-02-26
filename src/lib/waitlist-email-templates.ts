import { NEXT_STEPS } from '@/lib/waitlist-constants';

type RoleBucket = "seeker" | "guide" | "host" | "vendor";

interface BuildEmailProps {
    firstName?: string;
    roleInterest?: string;
    roleBucket: RoleBucket;
    founderCode: string | null;
}

interface EmailContent {
    subject: string;
    html: string;
    text: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://highviberetreats.com';

const nextStepsHtml = `
    <p style="font-weight:600; margin-top:24px;">What happens next</p>
    <ul>
        ${NEXT_STEPS.map(s => `<li>${s}</li>`).join('\n        ')}
    </ul>
`;

const nextStepsText = `\nWhat happens next:\n${NEXT_STEPS.map(s => `- ${s}`).join('\n')}`;

const howItWorksLink = `<p style="margin-top:24px;"><a href="${BASE_URL}/how-it-works" style="color:#c45d3e; font-weight:600;">Preview how HighVibe works &rarr;</a></p>`;
const howItWorksLinkText = `\nPreview how HighVibe works: ${BASE_URL}/how-it-works`;

const closingHtml = `<p style="margin-top:24px;">Thank you for being early — we're genuinely excited to build this with you.</p>`;
const closingText = `\nThank you for being early — we're genuinely excited to build this with you.`;

const buildProviderWithCodeEmail = (roleInterest: string, roleBucket: RoleBucket, founderCode: string): EmailContent => {
    const roleName = roleBucket.charAt(0).toUpperCase() + roleBucket.slice(1);
    const quota = roleBucket === 'vendor' ? 50 : 100;

    const subject = "You're on the HighVibe Retreats waitlist.";
    const html = `
        <div>
            <p>You're on the HighVibe Retreats waitlist.</p>
            <p>As one of the first ${quota} ${roleName}s, you've earned 60 days of membership free.</p>
            <p>Here's your Founding Members Access Pass code: <strong>${founderCode}</strong></p>
            <p>Activate after launch to get 60 days on us.</p>
            <br/>
            <p><strong>Access Pass terms:</strong></p>
            <ul>
                <li>Single-use and non-transferable</li>
                <li>Code must be activated within 60 days of launch</li>
                <li>Once activated, 60 days on us begins immediately</li>
                <li>We reserve the right to revoke codes in cases of abuse or misrepresentation</li>
            </ul>
            ${nextStepsHtml}
            ${howItWorksLink}
            ${closingHtml}
        </div>
    `;
    const text = `You're on the HighVibe Retreats waitlist.\n\nAs one of the first ${quota} ${roleName}s, you've earned 60 days of membership free.\n\nHere's your Founding Members Access Pass code: ${founderCode}\nActivate after launch to get 60 days on us.\n\nAccess Pass terms:\n- Single-use and non-transferable\n- Code must be activated within 60 days of launch\n- Once activated, 60 days on us begins immediately\n- We reserve the right to revoke codes in cases of abuse or misrepresentation${nextStepsText}${howItWorksLinkText}${closingText}`;
    return { subject, html, text };
}

const buildProviderNoCodeEmail = (): EmailContent => {
    const subject = "You're on the HighVibe Retreats waitlist.";
    const html = `
        <div>
            <p>You're on the HighVibe Retreats waitlist.</p>
            <p>We've had an overwhelming response and our founder perks for free membership have been fully claimed.</p>
            <p>You're still confirmed for early access, and we'll email you as soon as we launch.</p>
            ${nextStepsHtml}
            ${howItWorksLink}
            ${closingHtml}
        </div>
    `;
    const text = `You're on the HighVibe Retreats waitlist.\n\nWe've had an overwhelming response and our founder perks for free membership have been fully claimed.\n\nYou're still confirmed for early access, and we'll email you as soon as we launch.${nextStepsText}${howItWorksLinkText}${closingText}`;
    return { subject, html, text };
}

const buildSeekerEmail = (): EmailContent => {
    const subject = "You're on the HighVibe Retreats waitlist.";
    const html = `
        <div>
            <p>You're on the HighVibe Retreats waitlist.</p>
            <p>Great news — there are no fees to use the platform.</p>
            <p>We'll notify you as soon as HighVibe launches so you can start discovering retreats aligned with what you're looking for.</p>
            ${nextStepsHtml}
            ${howItWorksLink}
            ${closingHtml}
        </div>
    `;
    const text = `You're on the HighVibe Retreats waitlist.\n\nGreat news — there are no fees to use the platform.\n\nWe'll notify you as soon as HighVibe launches so you can start discovering retreats aligned with what you're looking for.${nextStepsText}${howItWorksLinkText}${closingText}`;
    return { subject, html, text };
}

export function buildWaitlistEmail({ roleInterest, roleBucket, founderCode }: BuildEmailProps): EmailContent {
    const isProvider = ['guide', 'host', 'vendor'].includes(roleBucket);

    if (isProvider) {
        if (founderCode) {
            return buildProviderWithCodeEmail(roleInterest || roleBucket, roleBucket, founderCode);
        } else {
            return buildProviderNoCodeEmail();
        }
    } else { // 'seeker'
        return buildSeekerEmail();
    }
}

// Stub for a future email verification flow
export function buildVerificationEmail(email: string, token: string): EmailContent {
    const verificationLink = `${BASE_URL}/api/verify-email?token=${token}`;
    const subject = "Verify your email for HighVibe Retreats";
    const html = `
        <div>
            <p>Please click the link below to verify your email address:</p>
            <a href="${verificationLink}">${verificationLink}</a>
        </div>
    `;
    const text = `Please verify your email by visiting this link: ${verificationLink}`;
    return { subject, html, text };
}

// Stub for a future invite wave email
export function buildInviteWaveEmail(email: string): EmailContent {
    const unsubscribeLink = `${BASE_URL}/preferences?email=${encodeURIComponent(email)}`;
    const subject = "You're invited to join HighVibe Retreats!";
    const html = `
        <div>
            <p>The wait is over! You're invited to join the HighVibe Retreats platform.</p>
            <a href="${BASE_URL}/join">Create Your Account Now</a>
            <br/><br/>
            <p style="font-size: 12px; color: #888;">
                To unsubscribe from future marketing emails, <a href="${unsubscribeLink}">click here</a>.
            </p>
        </div>
    `;
    const text = `The wait is over! You're invited to join the HighVibe Retreats platform. Create your account here: ${BASE_URL}/join`;
    return { subject, html, text };
}
