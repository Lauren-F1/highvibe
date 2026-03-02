'use client';

import { useUser } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, ReactNode } from 'react';
import { AddRolePrompt } from '@/components/add-role-prompt';

export default function HostLayout({ children }: { children: ReactNode }) {
  const user = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (user.status === 'loading') {
      const timer = setTimeout(() => setTimedOut(true), 10000);
      return () => clearTimeout(timer);
    }
    if (user.status === 'unauthenticated') {
      router.replace(`/login?redirect=${pathname}`);
    }
  }, [user, router, pathname]);

  if (user.status === 'loading' || user.status === 'unauthenticated') {
    if (timedOut) {
      return (
        <div className="container mx-auto px-4 py-12 text-center space-y-4">
          <p className="text-muted-foreground">Taking longer than expected to load.</p>
          <button onClick={() => router.replace(`/login?redirect=${pathname}`)} className="text-primary underline">Go to login</button>
        </div>
      );
    }
    return <div className="container mx-auto px-4 py-12 text-center">Loading...</div>;
  }

  if (!user.profile?.roles?.includes('host')) {
    return <AddRolePrompt role="host" />;
  }

  return <>{children}</>;
}
