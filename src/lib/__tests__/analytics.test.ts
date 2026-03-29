import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('analytics', () => {
  const originalEnv = { ...process.env };
  let mockGtag: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockGtag = vi.fn();
    (window as any).gtag = mockGtag;
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    delete (window as any).gtag;
  });

  it('pageview does nothing when GA_TRACKING_ID is not set', async () => {
    delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    const { pageview } = await import('@/lib/analytics');
    pageview('/test');
    expect(mockGtag).not.toHaveBeenCalled();
  });

  it('event does nothing when GA_TRACKING_ID is not set', async () => {
    delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    const { event } = await import('@/lib/analytics');
    event('click', { category: 'test' });
    expect(mockGtag).not.toHaveBeenCalled();
  });

  it('pageview does nothing when gtag function is missing', async () => {
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TEST123';
    delete (window as any).gtag;
    const { pageview } = await import('@/lib/analytics');
    pageview('/test');
    // No error thrown = success
  });
});
