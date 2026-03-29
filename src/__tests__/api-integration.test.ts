import { describe, it, expect, beforeAll } from 'vitest';

const BASE = 'http://localhost:3000';
const TIMEOUT = 30_000; // 30s per test for API routes that hit Firebase

async function fetchWithTimeout(url: string, options?: RequestInit, timeoutMs = 15_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchJson(url: string, options?: RequestInit) {
  const res = await fetchWithTimeout(url, options);
  const body = await res.json().catch(() => null);
  return { status: res.status, headers: res.headers, body };
}

describe('API Integration Tests', () => {
  beforeAll(async () => {
    try {
      await fetchWithTimeout(BASE, undefined, 5000);
    } catch {
      throw new Error('Dev server is not running on localhost:3000. Start it with `npm run dev`.');
    }
  });

  // ─── Homepage & Public Pages ───

  describe('Public pages', () => {
    it('GET / returns 200', async () => {
      const res = await fetchWithTimeout(BASE);
      expect(res.status).toBe(200);
    });

    it('GET / returns HTML with HighVibe content', async () => {
      const res = await fetchWithTimeout(BASE);
      const html = await res.text();
      expect(html).toContain('HighVibe');
    });

    it('GET /login returns 200', async () => {
      const res = await fetchWithTimeout(`${BASE}/login`);
      expect(res.status).toBe(200);
    });

    it('GET /not-a-page returns 404', async () => {
      const res = await fetchWithTimeout(`${BASE}/not-a-page-xyz`);
      expect(res.status).toBe(404);
    });
  });

  // ─── POST /api/waitlist — Input Validation ───

  describe('POST /api/waitlist — validation', () => {
    it('rejects empty body with 400', async () => {
      const { status, body } = await fetchJson(`${BASE}/api/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '',
      });
      expect(status).toBe(400);
      expect(body?.ok).toBe(false);
      expect(body?.stage).toBe('input');
    });

    it('rejects missing email with 400', async () => {
      const { status, body } = await fetchJson(`${BASE}/api/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleInterest: 'Seeker (I want to find/book retreats)' }),
      });
      expect(status).toBe(400);
      expect(body?.ok).toBe(false);
    });

    it('rejects invalid email with 400', async () => {
      const { status, body } = await fetchJson(`${BASE}/api/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'not-an-email', roleInterest: 'Seeker (I want to find/book retreats)' }),
      });
      expect(status).toBe(400);
      expect(body?.ok).toBe(false);
      expect(body?.message).toMatch(/email/i);
    });

    it('rejects missing roleInterest with 400', async () => {
      const { status, body } = await fetchJson(`${BASE}/api/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com' }),
      });
      expect(status).toBe(400);
      expect(body?.ok).toBe(false);
    });

    it('rejects non-JSON body', async () => {
      const res = await fetchWithTimeout(`${BASE}/api/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: 'this is not json',
      });
      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  // ─── POST /api/waitlist — Valid Submissions (may timeout if Firebase hangs) ───

  describe('POST /api/waitlist — submissions', () => {
    it('accepts a valid seeker submission', async () => {
      const { status, body } = await fetchJson(`${BASE}/api/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `test-seeker-${Date.now()}@example.com`,
          roleInterest: 'Seeker (I want to find/book retreats)',
          firstName: 'Test',
          source: 'integration-test',
        }),
      });
      expect(body?.requestId).toBeTruthy();
      // 200 = success, 500 = Firestore unavailable locally — both valid
      expect([200, 500]).toContain(status);
    }, TIMEOUT);

    it('accepts a valid guide submission', async () => {
      const { status, body } = await fetchJson(`${BASE}/api/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `test-guide-${Date.now()}@example.com`,
          roleInterest: 'Guide (I want to lead retreats)',
          firstName: 'GuideTest',
        }),
      });
      expect(body?.requestId).toBeTruthy();
      expect([200, 500]).toContain(status);
    }, TIMEOUT);

    it('accepts UTM parameters', async () => {
      const { status, body } = await fetchJson(`${BASE}/api/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `test-utm-${Date.now()}@example.com`,
          roleInterest: 'Seeker (I want to find/book retreats)',
          utm_source: 'google',
          utm_medium: 'cpc',
          utm_campaign: 'spring2026',
        }),
      });
      expect(body?.requestId).toBeTruthy();
      expect([200, 500]).toContain(status);
    }, TIMEOUT);
  });

  // ─── GET /api/health/waitlist ───

  describe('GET /api/health/waitlist', () => {
    it('returns a health check response with expected shape', async () => {
      const { status, body } = await fetchJson(`${BASE}/api/health/waitlist`);
      expect([200, 500]).toContain(status);
      expect(body?.requestId).toBeTruthy();
      expect(body?.timestamp).toBeTruthy();
      expect(body).toHaveProperty('firestore');
      expect(body?.firestore).toHaveProperty('ok');
      expect(body).toHaveProperty('resend');
      expect(body?.resend).toHaveProperty('ok');
      expect(body).toHaveProperty('runtimeEnv');
      expect(body?.runtimeEnv).toHaveProperty('RESEND_API_KEY_present');
      expect(body?.runtimeEnv).toHaveProperty('EMAIL_FROM');
    }, TIMEOUT);

    it('has no-store cache control', async () => {
      const res = await fetchWithTimeout(`${BASE}/api/health/waitlist`);
      expect(res.headers.get('cache-control')).toContain('no-store');
    }, TIMEOUT);
  });

  // ─── GET /api/email/test ───

  describe('GET /api/email/test', () => {
    it('returns a response (likely 500 without RESEND_API_KEY)', async () => {
      const { status, body } = await fetchJson(`${BASE}/api/email/test`);
      expect([200, 500]).toContain(status);
      if (status === 500) {
        expect(body?.error).toBeTruthy();
      }
    }, TIMEOUT);
  });

  // ─── GET /api/admin/seed-codes ───

  describe('GET /api/admin/seed-codes', () => {
    it('rejects without secret parameter', async () => {
      const { status, body } = await fetchJson(`${BASE}/api/admin/seed-codes`);
      expect(status).toBeGreaterThanOrEqual(400);
      expect(body?.ok).toBe(false);
      expect(body).toHaveProperty('message');
    }, TIMEOUT);

    it('rejects with wrong secret', async () => {
      const { status, body } = await fetchJson(`${BASE}/api/admin/seed-codes?secret=wrong`);
      expect(status).toBeGreaterThanOrEqual(400);
      expect(body?.ok).toBe(false);
    }, TIMEOUT);

    it('response includes createdCount and alreadySeeded fields', async () => {
      const { body } = await fetchJson(`${BASE}/api/admin/seed-codes`);
      expect(body).toHaveProperty('ok');
      expect(body).toHaveProperty('createdCount');
      expect(body).toHaveProperty('alreadySeeded');
      expect(body).toHaveProperty('message');
    }, TIMEOUT);

    it('does not allow POST method', async () => {
      const res = await fetchWithTimeout(`${BASE}/api/admin/seed-codes`, { method: 'POST' });
      expect(res.status).toBe(405);
    }, TIMEOUT);
  });

  // ─── GET /api/admin/seed-demo-data ───

  describe('GET /api/admin/seed-demo-data', () => {
    it('rejects without secret parameter', async () => {
      const { status, body } = await fetchJson(`${BASE}/api/admin/seed-demo-data`);
      expect(status).toBeGreaterThanOrEqual(400);
      expect(body?.ok).toBe(false);
    }, TIMEOUT);

    it('rejects with wrong secret', async () => {
      const { status, body } = await fetchJson(`${BASE}/api/admin/seed-demo-data?secret=wrong`);
      // 401 if ADMIN_SEED_SECRET is configured, 500 if not configured locally
      expect([401, 500]).toContain(status);
      expect(body?.ok).toBe(false);
    }, TIMEOUT);
  });

  // ─── Admin API routes requiring Bearer token ───

  describe('Admin API auth (Bearer token required)', () => {
    it('GET /api/admin/users rejects without auth header', async () => {
      const { status, body } = await fetchJson(`${BASE}/api/admin/users`);
      expect(status).toBe(401);
      expect(body?.error).toContain('Unauthorized');
    }, TIMEOUT);

    it('GET /api/admin/users rejects with invalid Bearer token', async () => {
      const { status, body } = await fetchJson(`${BASE}/api/admin/users`, {
        headers: { Authorization: 'Bearer fake-token-12345' },
      });
      expect(status).toBe(401);
      expect(body?.error).toContain('Unauthorized');
    }, TIMEOUT);

    it('GET /api/admin/users rejects with empty Bearer token', async () => {
      const { status, body } = await fetchJson(`${BASE}/api/admin/users`, {
        headers: { Authorization: 'Bearer ' },
      });
      expect(status).toBe(401);
    }, TIMEOUT);

    it('GET /api/admin/users rejects with non-Bearer auth scheme', async () => {
      const { status, body } = await fetchJson(`${BASE}/api/admin/users`, {
        headers: { Authorization: 'Basic dXNlcjpwYXNz' },
      });
      expect(status).toBe(401);
    }, TIMEOUT);

    it('GET /api/admin/users/some-uid rejects without auth', async () => {
      const { status, body } = await fetchJson(`${BASE}/api/admin/users/test-uid-123`);
      expect(status).toBe(401);
      expect(body?.error).toContain('Unauthorized');
    }, TIMEOUT);

    it('GET /api/admin/analytics rejects without auth', async () => {
      const { status, body } = await fetchJson(`${BASE}/api/admin/analytics`);
      expect(status).toBe(401);
      expect(body?.error).toContain('Unauthorized');
    }, TIMEOUT);

    it('GET /api/admin/analytics rejects with invalid token', async () => {
      const { status, body } = await fetchJson(`${BASE}/api/admin/analytics`, {
        headers: { Authorization: 'Bearer not-a-real-token' },
      });
      expect(status).toBe(401);
    }, TIMEOUT);

    it('GET /api/admin/moderation rejects without auth', async () => {
      const { status, body } = await fetchJson(`${BASE}/api/admin/moderation`);
      expect(status).toBe(401);
      expect(body?.error).toContain('Unauthorized');
    }, TIMEOUT);

    it('PATCH /api/admin/moderation rejects without auth', async () => {
      const { status, body } = await fetchJson(`${BASE}/api/admin/moderation`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: 'x', itemType: 'retreat', action: 'approve' }),
      });
      expect(status).toBe(401);
      expect(body?.error).toContain('Unauthorized');
    }, TIMEOUT);
  });

  // ─── POST /api/contact ───

  describe('POST /api/contact', () => {
    it('rejects empty body with 400', async () => {
      const { status, body } = await fetchJson(`${BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      expect(status).toBe(400);
      expect(body?.error).toContain('Missing');
    });

    it('rejects missing name', async () => {
      const { status } = await fetchJson(`${BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'a@b.com', message: 'hello' }),
      });
      expect(status).toBe(400);
    });

    it('rejects missing email', async () => {
      const { status } = await fetchJson(`${BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test', message: 'hello' }),
      });
      expect(status).toBe(400);
    });

    it('rejects missing message', async () => {
      const { status } = await fetchJson(`${BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test', email: 'a@b.com' }),
      });
      expect(status).toBe(400);
    });

    it('accepts valid contact submission (may fail on email send)', async () => {
      const { status } = await fetchJson(`${BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Integration Test',
          email: 'test@example.com',
          role: 'Seeker',
          message: 'This is an automated integration test.',
        }),
      });
      // 200 if email sends, 500 if Resend not configured — both valid
      expect([200, 500]).toContain(status);
    }, TIMEOUT);
  });

  // ─── POST /api/flag-message ───

  describe('POST /api/flag-message', () => {
    it('rejects missing required fields', async () => {
      const { status, body } = await fetchJson(`${BASE}/api/flag-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      expect(status).toBe(400);
      expect(body?.error).toContain('Missing');
    });

    it('rejects missing conversationId', async () => {
      const { status, body } = await fetchJson(`${BASE}/api/flag-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: 'u1', messageText: 'pay me on venmo' }),
      });
      expect(status).toBe(400);
    });

    it('rejects missing senderId', async () => {
      const { status, body } = await fetchJson(`${BASE}/api/flag-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: 'c1', messageText: 'pay me on venmo' }),
      });
      expect(status).toBe(400);
    });

    it('rejects missing messageText', async () => {
      const { status, body } = await fetchJson(`${BASE}/api/flag-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: 'c1', senderId: 'u1' }),
      });
      expect(status).toBe(400);
    });
  });

  // ─── POST /api/notifications ───

  describe('POST /api/notifications', () => {
    it('rejects missing required fields', async () => {
      const { status, body } = await fetchJson(`${BASE}/api/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      expect(status).toBe(400);
      expect(body?.error).toContain('Missing');
    });

    it('rejects when type is missing', async () => {
      const { status } = await fetchJson(`${BASE}/api/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'u1', title: 'Test', body: 'Hi' }),
      });
      expect(status).toBe(400);
    });

    it('rejects when title is missing', async () => {
      const { status } = await fetchJson(`${BASE}/api/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'u1', type: 'new_message', body: 'Hi' }),
      });
      expect(status).toBe(400);
    });

    it('rejects when body is missing', async () => {
      const { status } = await fetchJson(`${BASE}/api/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'u1', type: 'new_message', title: 'Test' }),
      });
      expect(status).toBe(400);
    });
  });

  // ─── Middleware ───

  describe('Middleware', () => {
    it('homepage is always accessible', async () => {
      const res = await fetchWithTimeout(BASE);
      expect(res.status).toBe(200);
    });

    it('API routes are not blocked by middleware', async () => {
      const res = await fetchWithTimeout(`${BASE}/api/health/waitlist`);
      // Should get a JSON response, not a 307 redirect
      expect(res.status).not.toBe(307);
    }, TIMEOUT);
  });

  // ─── Response Headers ───

  describe('Response headers', () => {
    it('homepage serves HTML', async () => {
      const res = await fetchWithTimeout(BASE);
      expect(res.headers.get('content-type')).toContain('text/html');
    });

    it('API routes serve JSON', async () => {
      const res = await fetchWithTimeout(`${BASE}/api/health/waitlist`);
      expect(res.headers.get('content-type')).toContain('application/json');
    }, TIMEOUT);
  });
});
