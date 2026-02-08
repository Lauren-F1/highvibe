'use client';

import { useUser } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { isFirebaseEnabled, isBuilderMode } from '@/firebase/config';
import { BuilderModeBanner } from '@/components/builder-mode-banner';

function AuthGatedGuideLayout({ children }: { children: React.ReactNode }) {
  const user = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait until user status and profile are definitively loaded
    if (user.status === 'loading' || (user.status === 'authenticated' && user.profile === undefined)) {
      return;
    }

    // If not authenticated, redirect to the guide join page
    if (user.status === 'unauthenticated') {
      router.replace('/join/guide');
      return;
    }

    // If authenticated, check for role and profile status
    if (user.status === 'authenticated') {
      if (!user.profile?.roles?.guide) {
        // User is logged in but is not a guide, redirect to account page
        // where they could potentially add the role.
        router.replace('/account');
      } else if (user.profile.profileStatus === 'incomplete' && !pathname.includes('/onboarding')) {
        // User is a guide but hasn't completed onboarding.
        router.replace('/guide/onboarding');
      }
    }
  }, [user, router, pathname]);

  // Render a loading state while we verify authentication and roles
  if (user.status === 'loading' || (user.status === 'authenticated' && user.profile === undefined)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>Loading Guide Dashboard...</p>
      </div>
    );
  }

  // If the user is an authorized guide and their profile is complete (or on the onboarding page), show the content
  if (user.profile?.roles?.guide) {
    return <>{children}</>;
  }

  // Fallback for unauthorized users or during redirection
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <p>Verifying permissions...</p>
    </div>
  );
}

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  if (isBuilderMode) {
    return (
      <>
        <BuilderModeBanner />
        {children}
      </>
    );
  }
  
  if (!isFirebaseEnabled) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>Firebase not configured. Please contact support.</p>
      </div>
    );
  }

  return <AuthGatedGuideLayout>{children}</AuthGatedGuideLayout>;
}
