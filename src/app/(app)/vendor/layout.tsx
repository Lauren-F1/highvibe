'use client';

import { useUser } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { isFirebaseEnabled } from '@/firebase/config';
import { AddRolePrompt } from '@/components/add-role-prompt';
import { DevModeBanner } from '@/components/dev-mode-banner';

function AuthGatedVendorLayout({ children }: { children: React.ReactNode }) {
  const user = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (user.status === 'loading') {
      return; 
    }

    if (user.status === 'unauthenticated') {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (user.status === 'authenticated' && user.profile) {
      if (user.profile.roles?.includes('vendor') && !user.profile.profileComplete && !pathname.includes('/account/edit')) {
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
    // This state is a fallback, as the useEffect should have redirected.
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>Redirecting to login...</p>
      </div>
    );
  }


  if (user.status === 'authenticated' && user.profile) {
    if (!user.profile.roles?.includes('vendor')) {
      return <AddRolePrompt role="vendor" />;
    }
    return <>{children}</>;
  }

  // Fallback for profile not existing or other errors
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <p>Verifying permissions...</p>
    </div>
  );
}


export default function VendorLayout({ children }: { children: React.ReactNode }) {
    if (!isFirebaseEnabled) {
    return (
       <>
        <DevModeBanner />
        {children}
       </>
    );
  }

  return <AuthGatedVendorLayout>{children}</AuthGatedVendorLayout>;
}
