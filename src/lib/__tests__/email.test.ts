import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockSend = vi.fn();

vi.mock('resend', () => {
  return {
    Resend: class {
      emails = { send: mockSend };
    },
  };
});

import { sendEmail } from '@/lib/email';

describe('sendEmail', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('throws when RESEND_API_KEY is missing', async () => {
    delete process.env.RESEND_API_KEY;
    await expect(
      sendEmail({ to: 'test@test.com', subject: 'Test', html: '<p>Hi</p>', text: 'Hi' })
    ).rejects.toThrow('Resend API key is not configured');
  });

  it('throws when RESEND_API_KEY contains REPLACE placeholder', async () => {
    process.env.RESEND_API_KEY = 'REPLACE_ME';
    await expect(
      sendEmail({ to: 'test@test.com', subject: 'Test', html: '<p>Hi</p>', text: 'Hi' })
    ).rejects.toThrow('Resend API key is not configured');
  });

  it('throws when EMAIL_FROM is missing', async () => {
    process.env.RESEND_API_KEY = 're_valid_key';
    delete process.env.EMAIL_FROM;
    await expect(
      sendEmail({ to: 'test@test.com', subject: 'Test', html: '<p>Hi</p>', text: 'Hi' })
    ).rejects.toThrow('From email is not configured');
  });

  it('sends email successfully when properly configured', async () => {
    process.env.RESEND_API_KEY = 're_valid_key';
    process.env.EMAIL_FROM = 'noreply@highviberetreats.com';

    mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null });

    const result = await sendEmail({
      to: 'user@test.com',
      subject: 'Welcome',
      html: '<p>Welcome!</p>',
      text: 'Welcome!',
    });

    expect(result).toEqual({ id: 'email-123' });
  });

  it('throws when Resend API returns an error', async () => {
    process.env.RESEND_API_KEY = 're_valid_key';
    process.env.EMAIL_FROM = 'noreply@highviberetreats.com';

    mockSend.mockResolvedValue({
      data: null,
      error: { message: 'Invalid recipient', name: 'validation_error' },
    });

    await expect(
      sendEmail({ to: 'bad', subject: 'Test', html: '<p>Hi</p>', text: 'Hi' })
    ).rejects.toThrow('Invalid recipient');
  });
});
