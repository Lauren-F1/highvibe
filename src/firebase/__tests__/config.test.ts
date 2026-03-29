import { describe, it, expect } from 'vitest';
import { firebaseConfig, isFirebaseEnabled } from '@/firebase/config';

describe('Firebase config', () => {
  it('exports a firebaseConfig object', () => {
    expect(firebaseConfig).toBeDefined();
    expect(typeof firebaseConfig).toBe('object');
  });

  it('has required Firebase config fields', () => {
    expect(firebaseConfig.projectId).toBeTruthy();
    expect(firebaseConfig.appId).toBeTruthy();
    expect(firebaseConfig.apiKey).toBeTruthy();
    expect(firebaseConfig.authDomain).toBeTruthy();
  });

  it('isFirebaseEnabled is true when apiKey exists', () => {
    // Since the hardcoded config has an apiKey, this should be true
    expect(isFirebaseEnabled).toBe(true);
  });
});
