import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// We need to test the middleware function directly
// Since it reads process.env at call time, we can control behavior

describe('middleware', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  async function importMiddleware() {
    return import('@/middleware');
  }

  function createRequest(path: string, options?: { adminBypass?: boolean }) {
    const url = new URL(path, 'http://localhost:3000');
    const req = new NextRequest(url);
    if (options?.adminBypass) {
      // NextRequest cookies are read-only in constructor, so we need to set via headers
      const cookieHeader = 'isAdminBypass=true';
      return new NextRequest(url, {
        headers: { cookie: cookieHeader },
      });
    }
    return req;
  }

  describe('when LAUNCH_MODE is off', () => {
    it('allows all routes through', async () => {
      process.env.LAUNCH_MODE = 'false';
      const { middleware } = await importMiddleware();
      const response = middleware(createRequest('/seeker/dashboard'));
      // NextResponse.next() does not set a redirect
      expect(response.status).not.toBe(307);
    });

    it('allows root through', async () => {
      process.env.LAUNCH_MODE = 'false';
      const { middleware } = await importMiddleware();
      const response = middleware(createRequest('/'));
      expect(response.status).not.toBe(307);
    });
  });

  describe('when LAUNCH_MODE is on', () => {
    it('allows the homepage', async () => {
      process.env.LAUNCH_MODE = 'true';
      const { middleware } = await importMiddleware();
      const response = middleware(createRequest('/'));
      expect(response.status).not.toBe(307);
      expect(response.headers.get('x-launch-mode')).toBe('on');
    });

    it('allows /terms', async () => {
      process.env.LAUNCH_MODE = 'true';
      const { middleware } = await importMiddleware();
      const response = middleware(createRequest('/terms'));
      expect(response.status).not.toBe(307);
    });

    it('allows /privacy', async () => {
      process.env.LAUNCH_MODE = 'true';
      const { middleware } = await importMiddleware();
      const response = middleware(createRequest('/privacy'));
      expect(response.status).not.toBe(307);
    });

    it('allows /login', async () => {
      process.env.LAUNCH_MODE = 'true';
      const { middleware } = await importMiddleware();
      const response = middleware(createRequest('/login'));
      expect(response.status).not.toBe(307);
    });

    it('allows /how-it-works', async () => {
      process.env.LAUNCH_MODE = 'true';
      const { middleware } = await importMiddleware();
      const response = middleware(createRequest('/how-it-works'));
      expect(response.status).not.toBe(307);
    });

    it('blocks /seeker/dashboard', async () => {
      process.env.LAUNCH_MODE = 'true';
      const { middleware } = await importMiddleware();
      const response = middleware(createRequest('/seeker/dashboard'));
      expect(response.status).toBe(307);
    });

    it('blocks /guide', async () => {
      process.env.LAUNCH_MODE = 'true';
      const { middleware } = await importMiddleware();
      const response = middleware(createRequest('/guide'));
      expect(response.status).toBe(307);
    });

    it('blocks /admin/waitlist', async () => {
      process.env.LAUNCH_MODE = 'true';
      const { middleware } = await importMiddleware();
      const response = middleware(createRequest('/admin/waitlist'));
      expect(response.status).toBe(307);
    });

    it('sets x-launch-mode header on all responses', async () => {
      process.env.LAUNCH_MODE = 'true';
      const { middleware } = await importMiddleware();
      const allowed = middleware(createRequest('/'));
      const blocked = middleware(createRequest('/seeker'));
      expect(allowed.headers.get('x-launch-mode')).toBe('on');
      expect(blocked.headers.get('x-launch-mode')).toBe('on');
    });

    it('allows admin bypass via cookie', async () => {
      process.env.LAUNCH_MODE = 'true';
      const { middleware } = await importMiddleware();
      const response = middleware(createRequest('/seeker/dashboard', { adminBypass: true }));
      expect(response.status).not.toBe(307);
      expect(response.headers.get('x-launch-mode')).toBe('on');
    });
  });
});
