import "server-only";
import { getAuth } from 'firebase-admin/auth';
import { getFirebaseAdmin } from './firebase-admin';

/**
 * Verifies that a request comes from an authenticated admin user.
 * Checks for `admin` custom claim or email allowlist membership.
 */
export async function verifyAdminRequest(request: Request): Promise<{ authorized: boolean; uid?: string }> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return { authorized: false };

  try {
    // Ensure Admin SDK is initialized
    await getFirebaseAdmin();

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);

    const isAdminClaim = decodedToken.admin === true;
    const adminEmailList = (process.env.NEXT_PUBLIC_ADMIN_EMAIL_ALLOWLIST || '')
      .split(',').map(e => e.trim().toLowerCase());
    const isAdminEmail = adminEmailList.includes(decodedToken.email?.toLowerCase() || '');

    if (isAdminClaim || isAdminEmail) {
      return { authorized: true, uid: decodedToken.uid };
    }

    return { authorized: false };
  } catch (error) {
    console.error('[ADMIN_AUTH] Token verification failed:', error);
    return { authorized: false };
  }
}
