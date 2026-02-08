'use client';

import { useUser } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function HostLayout({ children }: { children: React.ReactNode }) {
  const user = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait until user status and profile are definitively loaded
    if (user.status === 'loading' || (user.status === 'authenticated' && user.profile === undefined)) {
      return; 
    }

    // If not authenticated, redirect to the host join page
    if (user.status === 'unauthenticated') {
      router.replace('/join/host');
      return;
    }

    // If authenticated, check for role and profile status
    if (user.status === 'authenticated') {
      if (!user.profile?.roles?.host) {
        // User is logged in but is not a host, redirect to account page
        router.replace('/account');
      } else if (user.profile.profileStatus === 'incomplete' && !pathname.includes('/onboarding')) {
        // User is a host but hasn't completed onboarding.
        router.replace('/host/onboarding');
      }
    }
  }, [user, router, pathname]);

  // Render a loading state while we verify authentication and roles
  if (user.status === 'loading' || (user.status === 'authenticated' && user.profile === undefined)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>Loading Host Dashboard...</p>
      </div>
    );
  }

  // If the user is an authorized host, show the content
  if (user.profile?.roles?.host) {
    return <>{children}</>;
  }

  // Fallback for unauthorized users or during redirection
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <p>Verifying permissions...</p>
    </div>
  );
}
