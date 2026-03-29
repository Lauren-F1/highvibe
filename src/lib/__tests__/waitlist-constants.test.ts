import { describe, it, expect } from 'vitest';
import {
  formValueToRoleBucket,
  roleLabelToBucket,
  SUCCESS_MESSAGE,
  DUPLICATE_MESSAGE,
  NEXT_STEPS,
  FOUNDER_PERK_BY_ROLE,
} from '@/lib/waitlist-constants';

describe('formValueToRoleBucket', () => {
  it('maps "Seeker" prefix to seeker', () => {
    expect(formValueToRoleBucket('Seeker — I want to find a retreat')).toBe('seeker');
  });

  it('maps "Guide" prefix to guide', () => {
    expect(formValueToRoleBucket('Guide — I lead retreats')).toBe('guide');
  });

  it('maps "Host" prefix to host', () => {
    expect(formValueToRoleBucket('Host — I have a venue')).toBe('host');
  });

  it('maps "Vendor" prefix to vendor', () => {
    expect(formValueToRoleBucket('Vendor — I offer services')).toBe('vendor');
  });

  it('defaults to seeker for unknown values', () => {
    expect(formValueToRoleBucket('Unknown role')).toBe('seeker');
    expect(formValueToRoleBucket('')).toBe('seeker');
  });
});

describe('roleLabelToBucket', () => {
  it('maps "guide" to guide', () => {
    expect(roleLabelToBucket('guide')).toBe('guide');
  });

  it('maps "Guide" (uppercase) to guide', () => {
    expect(roleLabelToBucket('Guide')).toBe('guide');
  });

  it('maps "host" to host', () => {
    expect(roleLabelToBucket('host')).toBe('host');
  });

  it('maps "vendor" to vendor', () => {
    expect(roleLabelToBucket('vendor')).toBe('vendor');
  });

  it('defaults to seeker for unknown values', () => {
    expect(roleLabelToBucket('admin')).toBe('seeker');
    expect(roleLabelToBucket('seeker')).toBe('seeker');
    expect(roleLabelToBucket('')).toBe('seeker');
  });
});

describe('waitlist constants', () => {
  it('has non-empty success message', () => {
    expect(SUCCESS_MESSAGE).toBeTruthy();
  });

  it('has non-empty duplicate message', () => {
    expect(DUPLICATE_MESSAGE).toBeTruthy();
  });

  it('has at least one next step', () => {
    expect(NEXT_STEPS.length).toBeGreaterThan(0);
  });

  it('has founder perks for all roles', () => {
    expect(FOUNDER_PERK_BY_ROLE.guide).toBeTruthy();
    expect(FOUNDER_PERK_BY_ROLE.host).toBeTruthy();
    expect(FOUNDER_PERK_BY_ROLE.vendor).toBeTruthy();
    expect(FOUNDER_PERK_BY_ROLE.seeker).toBeTruthy();
  });
});
