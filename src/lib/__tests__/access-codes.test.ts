import { describe, it, expect, vi, beforeEach } from 'vitest';
import { claimFounderCode } from '@/lib/access-codes';

// Build mock Firestore
function createMockFirestore(options: { empty?: boolean; docId?: string } = {}) {
  const mockUpdate = vi.fn();
  const mockGet = vi.fn().mockResolvedValue({
    empty: options.empty ?? false,
    docs: options.empty
      ? []
      : [
          {
            id: options.docId ?? 'HV-GUIDE-abc123',
            ref: { id: options.docId ?? 'HV-GUIDE-abc123' },
          },
        ],
  });

  const mockTransaction = {
    get: mockGet,
    update: mockUpdate,
  };

  const mockRunTransaction = vi.fn().mockImplementation(async (fn) => {
    return fn(mockTransaction);
  });

  const mockLimit = vi.fn().mockReturnThis();
  const mockWhere = vi.fn().mockReturnThis();
  const mockCollection = vi.fn().mockReturnValue({
    where: mockWhere,
  });

  // Attach where's return to also have where and limit
  mockWhere.mockReturnValue({ where: mockWhere, limit: mockLimit });

  const db = {
    runTransaction: mockRunTransaction,
    collection: mockCollection,
  };

  return { db, mockUpdate, mockGet, mockRunTransaction };
}

const mockFieldValue = {
  serverTimestamp: vi.fn().mockReturnValue('SERVER_TIMESTAMP'),
};

describe('claimFounderCode', () => {
  it('returns null for missing email', async () => {
    const { db } = createMockFirestore();
    const result = await claimFounderCode('', 'guide', db as any, mockFieldValue as any);
    expect(result).toBeNull();
  });

  it('returns null for missing roleBucket', async () => {
    const { db } = createMockFirestore();
    const result = await claimFounderCode('test@test.com', '' as any, db as any, mockFieldValue as any);
    expect(result).toBeNull();
  });

  it('returns null for missing db', async () => {
    const result = await claimFounderCode('test@test.com', 'guide', null as any, mockFieldValue as any);
    expect(result).toBeNull();
  });

  it('returns the code when one is available', async () => {
    const { db } = createMockFirestore({ docId: 'HV-GUIDE-abc123' });
    const result = await claimFounderCode('user@test.com', 'guide', db as any, mockFieldValue as any);
    expect(result).toBe('HV-GUIDE-abc123');
  });

  it('returns null when no codes are available', async () => {
    const { db } = createMockFirestore({ empty: true });
    const result = await claimFounderCode('user@test.com', 'guide', db as any, mockFieldValue as any);
    expect(result).toBeNull();
  });

  it('updates the code document with claimed status', async () => {
    const { db, mockUpdate } = createMockFirestore();
    await claimFounderCode('user@test.com', 'guide', db as any, mockFieldValue as any);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        status: 'claimed',
        claimedBy: 'user@test.com',
        claimedAt: 'SERVER_TIMESTAMP',
      })
    );
  });

  it('throws when transaction fails', async () => {
    const { db, mockRunTransaction } = createMockFirestore();
    mockRunTransaction.mockRejectedValue(new Error('Transaction failed'));
    await expect(
      claimFounderCode('user@test.com', 'guide', db as any, mockFieldValue as any)
    ).rejects.toThrow('Transaction failed');
  });
});
