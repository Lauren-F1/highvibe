'use client';

import { useUser } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { isFirebaseEnabled } from '@/firebase/config';
import { AddRolePrompt } from '@/components/add-role-prompt';
import { DevModeBanner } from '@/components/dev-mode-banner';

function AuthGatedGuideLayout({ children }: { children: React.ReactNode }) {
  const user = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // This effect only handles redirection for unauthenticated users
    // and for incomplete profiles. The role-based content is handled by conditional rendering below.
    if (user.status === 'loading') {
      return;
    }

    if (user.status === 'unauthenticated') {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (user.status === 'authenticated' && user.profile) {
      if (user.profile.roles?.includes('guide') && !user.profile.profileComplete && !pathname.includes('/account/edit')) {
        router.replace('/account/edit');
      }
    }
  }, [user, router, pathname]);

  if (user.status === 'loading' || (user.status === 'authenticated' && user.profile === undefined)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>Loading Guide Dashboard...</p>
      </div>
    );
  }
  
  if (user.status === 'unauthenticated') {
    // This is a fallback UI, as the useEffect should have redirected.
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>Redirecting to login...</p>
      </div>
    );
  }
  
  if (user.status === 'authenticated' && user.profile) {
    if (!user.profile.roles?.includes('guide')) {
        return <AddRolePrompt role="guide" />;
    }
    // User has the role, render children
    return <>{children}</>;
  }

  // Fallback for when profile is null after loading or other edge cases
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <p>Verifying permissions...</p>
    </div>
  );
}

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  if (!isFirebaseEnabled) {
    return (
      <>
        <DevModeBanner />
        {children}
      </>
    );
  }

  return <AuthGatedGuideLayout>{children}</AuthGatedGuideLayout>;
}
