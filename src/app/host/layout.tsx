'use client';

import { useUser } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { AddRolePrompt } from '@/components/add-role-prompt';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { DevAuthBanner } from '@/components/dev-auth-banner';

export default function HostLayout({ children }: { children: ReactNode }) {
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

  if (!user.profile?.roles?.includes('host')) {
    return <AddRolePrompt role="host" />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DevAuthBanner />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
