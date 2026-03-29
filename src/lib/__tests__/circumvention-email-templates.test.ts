import { describe, it, expect } from 'vitest';
import {
  buildCircumventionWarningEmail,
  buildCircumventionAdminAlertEmail,
} from '@/lib/circumvention-email-templates';

describe('buildCircumventionWarningEmail', () => {
  const props = {
    userName: 'Jane Doe',
    conversationId: 'conv-123',
    messageSnippet: 'Let me pay you directly via Venmo',
  };

  it('returns subject, html, and text', () => {
    const email = buildCircumventionWarningEmail(props);
    expect(email.subject).toBeTruthy();
    expect(email.html).toBeTruthy();
    expect(email.text).toBeTruthy();
  });

  it('addresses the user by name', () => {
    const email = buildCircumventionWarningEmail(props);
    expect(email.html).toContain('Jane Doe');
    expect(email.text).toContain('Jane Doe');
  });

  it('includes terms of service link', () => {
    const email = buildCircumventionWarningEmail(props);
    expect(email.html).toContain('/terms');
  });

  it('lists consequences', () => {
    const email = buildCircumventionWarningEmail(props);
    expect(email.html).toContain('suspension');
    expect(email.html).toContain('payouts');
    expect(email.html).toContain('platform fees');
  });

  it('uses the green accent color', () => {
    const email = buildCircumventionWarningEmail(props);
    expect(email.html).toContain('#66d320');
  });
});

describe('buildCircumventionAdminAlertEmail', () => {
  const props = {
    flaggedUserName: 'Jane Doe',
    flaggedUserId: 'user-123',
    otherUserName: 'John Smith',
    otherUserId: 'user-456',
    conversationId: 'conv-789',
    messageSnippet: 'Pay me $500 via Venmo instead',
    riskScore: 0.92,
    reasons: ['Direct payment mention', 'External platform reference'],
  };

  it('includes flagged user info in subject', () => {
    const email = buildCircumventionAdminAlertEmail(props);
    expect(email.subject).toContain('Jane Doe');
    expect(email.subject).toContain('[FLAG]');
  });

  it('includes all user details', () => {
    const email = buildCircumventionAdminAlertEmail(props);
    expect(email.html).toContain('user-123');
    expect(email.html).toContain('John Smith');
    expect(email.html).toContain('user-456');
    expect(email.html).toContain('conv-789');
  });

  it('includes risk score and reasons', () => {
    const email = buildCircumventionAdminAlertEmail(props);
    expect(email.html).toContain('0.92');
    expect(email.html).toContain('Direct payment mention');
    expect(email.html).toContain('External platform reference');
  });

  it('truncates long message snippets to 300 chars', () => {
    const longMessage = 'a'.repeat(500);
    const email = buildCircumventionAdminAlertEmail({ ...props, messageSnippet: longMessage });
    expect(email.html).toContain('...');
    expect(email.text).not.toContain('a'.repeat(301));
  });

  it('does not add ellipsis for short snippets', () => {
    const email = buildCircumventionAdminAlertEmail(props);
    expect(email.html).not.toContain('...');
  });

  it('includes admin dashboard link', () => {
    const email = buildCircumventionAdminAlertEmail(props);
    expect(email.html).toContain('/admin/flagged-conversations');
  });

  it('text version includes all key info', () => {
    const email = buildCircumventionAdminAlertEmail(props);
    expect(email.text).toContain('Jane Doe');
    expect(email.text).toContain('user-123');
    expect(email.text).toContain('0.92');
  });
});
