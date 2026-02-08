'use client';

import { useUser } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { isFirebaseEnabled } from '@/firebase/config';

function AuthGatedHostLayout({ children }: { children: React.ReactNode }) {
  const user = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (user.status === 'loading' || (user.status === 'authenticated' && user.profile === undefined)) {
      return; 
    }

    if (user.status === 'unauthenticated') {
      router.replace(`/join/host?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (user.status === 'authenticated') {
      if (!user.profile?.roles?.includes('host')) {
        router.replace('/onboarding/role');
      } else if (!user.profile.profileComplete && !pathname.includes('/account/edit')) {
        router.replace('/account/edit');
      }
    }
  }, [user, router, pathname]);

  if (user.status === 'loading' || (user.status === 'authenticated' && user.profile === undefined)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>Loading Host Dashboard...</p>
      </div>
    );
  }

  if (user.profile?.roles?.includes('host')) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <p>Verifying permissions...</p>
    </div>
  );
}

export default function HostLayout({ children }: { children: React.ReactNode }) {
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

  return <AuthGatedHostLayout>{children}</AuthGatedHostLayout>;
}
