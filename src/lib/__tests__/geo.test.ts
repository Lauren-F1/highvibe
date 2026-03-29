import { describe, it, expect } from 'vitest';
import { getDistanceInMiles } from '@/lib/geo';

describe('getDistanceInMiles', () => {
  it('returns 0 for the same point', () => {
    expect(getDistanceInMiles(40.7128, -74.006, 40.7128, -74.006)).toBe(0);
  });

  it('calculates NYC to LA distance (~2,451 miles)', () => {
    const distance = getDistanceInMiles(40.7128, -74.006, 34.0522, -118.2437);
    expect(distance).toBeGreaterThan(2400);
    expect(distance).toBeLessThan(2500);
  });

  it('calculates London to Paris distance (~213 miles)', () => {
    const distance = getDistanceInMiles(51.5074, -0.1278, 48.8566, 2.3522);
    expect(distance).toBeGreaterThan(200);
    expect(distance).toBeLessThan(230);
  });

  it('is symmetric (A→B == B→A)', () => {
    const ab = getDistanceInMiles(40.7128, -74.006, 34.0522, -118.2437);
    const ba = getDistanceInMiles(34.0522, -118.2437, 40.7128, -74.006);
    expect(ab).toBeCloseTo(ba, 10);
  });

  it('handles points across the date line', () => {
    // Tokyo to Honolulu
    const distance = getDistanceInMiles(35.6762, 139.6503, 21.3069, -157.8583);
    expect(distance).toBeGreaterThan(3800);
    expect(distance).toBeLessThan(3900);
  });

  it('handles equatorial points', () => {
    // Two points on the equator, 1 degree apart (~69 miles)
    const distance = getDistanceInMiles(0, 0, 0, 1);
    expect(distance).toBeGreaterThan(68);
    expect(distance).toBeLessThan(70);
  });
});
