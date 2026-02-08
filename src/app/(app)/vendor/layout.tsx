'use client';

import { useUser } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { isFirebaseEnabled, isBuilderMode } from '@/firebase/config';
import { BuilderModeBanner } from '@/components/builder-mode-banner';

function AuthGatedVendorLayout({ children }: { children: React.ReactNode }) {
  const user = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait until user status and profile are definitively loaded
    if (user.status === 'loading' || (user.status === 'authenticated' && user.profile === undefined)) {
      return; 
    }

    // If not authenticated, redirect to the vendor join page
    if (user.status === 'unauthenticated') {
      router.replace('/join/vendor');
      return;
    }

    // If authenticated, check for role and profile status
    if (user.status === 'authenticated') {
      if (!user.profile?.roles?.vendor) {
        // User is logged in but is not a vendor, redirect to account page
        router.replace('/account');
      } else if (user.profile.profileStatus === 'incomplete' && !pathname.includes('/onboarding')) {
        // User is a vendor but hasn't completed onboarding.
        router.replace('/vendor/onboarding');
      }
    }
  }, [user, router, pathname]);

  // Render a loading state while we verify authentication and roles
  if (user.status === 'loading' || (user.status === 'authenticated' && user.profile === undefined)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>Loading Vendor Dashboard...</p>
      </div>
    );
  }

  // If the user is an authorized vendor, show the content
  if (user.profile?.roles?.vendor) {
    return <>{children}</>;
  }

  // Fallback for unauthorized users or during redirection
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <p>Verifying permissions...</p>
    </div>
  );
}


export default function VendorLayout({ children }: { children: React.ReactNode }) {
  if (isBuilderMode) {
    return (
      <>
        <BuilderModeBanner pageName="Vendor Dashboard" />
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

  return <AuthGatedVendorLayout>{children}</AuthGatedVendorLayout>;
}
