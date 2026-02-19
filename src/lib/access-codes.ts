import { firestoreDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { randomUUID } from 'crypto';

type RoleBucket = 'guide' | 'host' | 'vendor';

const QUOTA_CAPS = {
  guide: 100,
  host: 50,
  vendor: 100,
};

/**
 * Atomically assigns a unique founder code if capacity is available.
 * @param email - The email of the user to assign the code to.
 * @param roleBucket - The role bucket to assign the code from.
 * @returns The generated code, or null if capacity is reached.
 */
export async function assignFounderCode(email: string, roleBucket: RoleBucket): Promise<string | null> {
  const quotaRef = firestoreDb.collection('counters').doc('founder_quota');
  const codesRef = firestoreDb.collection('founder_codes');

  try {
    const code = await firestoreDb.runTransaction(async (transaction) => {
      const quotaDoc = await transaction.get(quotaRef);

      if (!quotaDoc.exists) {
        // Initialize the quota document if it doesn't exist
        const initialQuotas = { guideCount: 0, hostCount: 0, vendorCount: 0 };
        transaction.set(quotaRef, initialQuotas);
      }

      const currentQuotas = quotaDoc.exists ? quotaDoc.data() : { guideCount: 0, hostCount: 0, vendorCount: 0 };
      const countField = `${roleBucket}Count` as keyof typeof currentQuotas;
      const currentCount = currentQuotas ? currentQuotas[countField] : 0;
      const capacity = QUOTA_CAPS[roleBucket];

      if (currentCount >= capacity) {
        console.log(`Capacity reached for role: ${roleBucket}. No code assigned.`);
        return null;
      }

      // Generate a new unique code
      const newCode = `HVF-${randomUUID().substring(0, 8).toUpperCase()}`;
      const newCodeRef = codesRef.doc(newCode);

      // Create the code document
      transaction.set(newCodeRef, {
        roleBucket,
        assignedToEmail: email,
        assignedAt: FieldValue.serverTimestamp(),
        status: 'assigned',
        redeemedByUid: null,
        redeemedAt: null,
      });

      // Increment the counter
      transaction.update(quotaRef, { [countField]: FieldValue.increment(1) });

      return newCode;
    });

    return code;
  } catch (error) {
    console.error('Error assigning founder code in transaction:', error);
    // Return null to indicate failure, allowing the main process to continue
    return null;
  }
}

    