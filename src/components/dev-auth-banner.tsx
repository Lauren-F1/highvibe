'use client';

import { isFirebaseEnabled } from '@/firebase/config';

export function DevAuthBanner() {
  if (isFirebaseEnabled) {
    return null;
  }

  return (
    <div className="bg-yellow-500 text-black text-center p-2 text-sm font-bold">
      Dev Auth Mode (Firebase not configured)
    </div>
  );
}
