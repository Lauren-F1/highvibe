'use client';

import { useUser } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { isFirebaseEnabled } from '@/firebase/config';

function AuthGatedVendorLayout({ children }: { children: React.ReactNode }) {
  const user = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (user.status === 'loading' || (user.status === 'authenticated' && user.profile === undefined)) {
      return; 
    }

    if (user.status === 'unauthenticated') {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (user.status === 'authenticated') {
      if (!user.profile?.roles?.includes('vendor')) {
        router.replace('/onboarding/role');
      } else if (!user.profile.profileComplete && !pathname.includes('/account/edit')) {
        router.replace('/account/edit');
      }
    }
  }, [user, router, pathname]);

  if (user.status === 'loading' || (user.status === 'authenticated' && user.profile === undefined)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>Loading Vendor Dashboard...</p>
      </div>
    );
  }

  if (user.status === 'unauthenticated') {
    // This state should be handled by the redirect, but as a fallback:
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>Redirecting to login...</p>
      </div>
    );
  }


  if (user.profile?.roles?.includes('vendor')) {
    return <>{children}</>;
  }

  // This case handles users who are logged in but not vendors.
  // They get redirected in the useEffect, but we need a fallback UI.
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <p>Verifying permissions...</p>
    </div>
  );
}


export default function VendorLayout({ children }: { children: React.ReactNode }) {
    if (!isFirebaseEnabled) {
    return (
       <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <h2 className="text-xl font-bold">Authentication Not Configured</h2>
        <p className="mt-2 text-muted-foreground">
            This page requires authentication. To enable it, please add your Firebase configuration to your environment variables.
        </p>
      </div>
    );
  }

  return <AuthGatedVendorLayout>{children}</AuthGatedVendorLayout>;
}
