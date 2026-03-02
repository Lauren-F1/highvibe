import "server-only";
import { getAuth } from 'firebase-admin/auth';
import { getFirebaseAdmin } from './firebase-admin';

/**
 * Verifies that a request comes from an authenticated Firebase user.
 * Returns the user's uid if valid, throws otherwise.
 */
export async function verifyAuthToken(request: Request): Promise<string> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing authorization header');
  }

  // Ensure Admin SDK is initialized
  await getFirebaseAdmin();

  const token = authHeader.split('Bearer ')[1];
  const decodedToken = await getAuth().verifyIdToken(token);
  return decodedToken.uid;
}
