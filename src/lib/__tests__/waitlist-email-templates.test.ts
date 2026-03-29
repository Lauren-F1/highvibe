import { describe, it, expect } from 'vitest';
import {
  buildWaitlistEmail,
  buildVerificationEmail,
  buildInviteWaveEmail,
} from '@/lib/waitlist-email-templates';

describe('buildWaitlistEmail', () => {
  describe('seeker role', () => {
    it('returns seeker-specific content', () => {
      const email = buildWaitlistEmail({ roleBucket: 'seeker', founderCode: null });
      expect(email.subject).toContain('waitlist');
      expect(email.html).toContain('no fees');
      expect(email.text).toContain('no fees');
    });

    it('does not include founder code for seekers', () => {
      const email = buildWaitlistEmail({ roleBucket: 'seeker', founderCode: null });
      expect(email.html).not.toContain('Access Pass');
    });
  });

  describe('provider with founder code', () => {
    it('includes the founder code for guide', () => {
      const email = buildWaitlistEmail({
        roleBucket: 'guide',
        roleInterest: 'Guide — I lead retreats',
        founderCode: 'HV-GUIDE-abc123',
      });
      expect(email.html).toContain('HV-GUIDE-abc123');
      expect(email.text).toContain('HV-GUIDE-abc123');
      expect(email.html).toContain('100');
      expect(email.html).toContain('60 days');
    });

    it('shows quota of 50 for vendors', () => {
      const email = buildWaitlistEmail({
        roleBucket: 'vendor',
        founderCode: 'HV-VENDOR-xyz789',
      });
      expect(email.html).toContain('50');
    });

    it('shows quota of 100 for hosts', () => {
      const email = buildWaitlistEmail({
        roleBucket: 'host',
        founderCode: 'HV-HOST-def456',
      });
      expect(email.html).toContain('100');
    });
  });

  describe('provider without founder code', () => {
    it('shows "fully claimed" message', () => {
      const email = buildWaitlistEmail({ roleBucket: 'guide', founderCode: null });
      expect(email.html).toContain('fully claimed');
      expect(email.text).toContain('fully claimed');
    });

    it('still confirms early access', () => {
      const email = buildWaitlistEmail({ roleBucket: 'host', founderCode: null });
      expect(email.html).toContain('early access');
    });
  });

  describe('common elements', () => {
    it('includes "what happens next" section', () => {
      const email = buildWaitlistEmail({ roleBucket: 'seeker', founderCode: null });
      expect(email.html).toContain('What happens next');
      expect(email.text).toContain('What happens next');
    });

    it('includes how-it-works link', () => {
      const email = buildWaitlistEmail({ roleBucket: 'guide', founderCode: 'HV-G-123' });
      expect(email.html).toContain('/how-it-works');
    });

    it('all templates return subject, html, and text', () => {
      for (const roleBucket of ['seeker', 'guide', 'host', 'vendor'] as const) {
        const email = buildWaitlistEmail({ roleBucket, founderCode: null });
        expect(email.subject).toBeTruthy();
        expect(email.html).toBeTruthy();
        expect(email.text).toBeTruthy();
      }
    });
  });
});

describe('buildVerificationEmail', () => {
  it('includes the verification link', () => {
    const email = buildVerificationEmail('user@test.com', 'token123');
    expect(email.html).toContain('token123');
    expect(email.text).toContain('token123');
    expect(email.subject).toContain('Verify');
  });
});

describe('buildInviteWaveEmail', () => {
  it('includes the join link', () => {
    const email = buildInviteWaveEmail('user@test.com');
    expect(email.html).toContain('/join');
    expect(email.subject).toContain('invited');
  });

  it('includes an unsubscribe link with encoded email', () => {
    const email = buildInviteWaveEmail('user+special@test.com');
    expect(email.html).toContain('unsubscribe');
    expect(email.html).toContain(encodeURIComponent('user+special@test.com'));
  });
});
