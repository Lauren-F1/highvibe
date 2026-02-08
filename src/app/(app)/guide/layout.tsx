'use client';

import { useUser } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { AddRolePrompt } from '@/components/add-role-prompt';

export default function GuideLayout({ children }: { children: ReactNode }) {
  const user = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (user.status === 'loading') {
      return;
    }
    if (user.status === 'unauthenticated') {
      router.replace(`/login?redirect=${pathname}`);
    }
  }, [user, router, pathname]);

  if (user.status === 'loading' || user.status === 'unauthenticated') {
    return <div className="container mx-auto px-4 py-12 text-center">Loading...</div>;
  }

  if (!user.profile?.roles?.includes('guide')) {
    return <AddRolePrompt role="guide" />;
  }

  return <>{children}</>;
}
