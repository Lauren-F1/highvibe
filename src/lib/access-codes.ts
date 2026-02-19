type RoleBucket = 'guide' | 'host' | 'vendor';

/**
 * Atomically claims an available founder code for a given role and assigns it to an email.
 * @param email The email of the user to claim the code.
 * @param roleBucket The role bucket for which to claim a code.
 * @returns The claimed code string, or null if no codes are available.
 */
export async function claimFounderCode(email: string, roleBucket: RoleBucket): Promise<string | null> {
  // Dynamically import to ensure server-only code isn't bundled on the client
  const { getFirestoreDb } = await import('@/lib/firebase-admin');
  const { FieldValue } = await import('firebase-admin/firestore');
  const firestoreDb = getFirestoreDb();

  try {
    const code = await firestoreDb.runTransaction(async (transaction) => {
      const availableCodesQuery = firestoreDb.collection('founder_codes')
        .where('roleBucket', '==', roleBucket)
        .where('status', '==', 'available')
        .limit(1);
      
      const snapshot = await transaction.get(availableCodesQuery);

      if (snapshot.empty) {
        console.log(`No available founder codes for role: ${roleBucket}`);
        return null;
      }

      const codeDoc = snapshot.docs[0];
      const codeRef = codeDoc.ref;

      transaction.update(codeRef, {
        status: 'claimed',
        claimedBy: email,
        claimedAt: FieldValue.serverTimestamp(),
      });

      return codeDoc.id; // The document ID is the code itself
    });
    return code;
  } catch (error) {
    console.error('Error claiming founder code in transaction:', error);
    return null;
  }
}
