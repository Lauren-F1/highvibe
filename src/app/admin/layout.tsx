'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = useUser();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (user.status === 'loading') {
      return; // Still loading, wait
    }

    if (user.status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    user.data
      ?.getIdTokenResult()
      .then(idTokenResult => {
        const isAdminClaim = idTokenResult.claims.admin === true;
        // IMPORTANT: This value must be kept in sync with the ADMIN_EMAIL_ALLOWLIST variable in your production environment.
        const adminEmailList = (process.env.NEXT_PUBLIC_ADMIN_EMAIL_ALLOWLIST || '').split(',').map(e => e.trim().toLowerCase());
        const isAdminEmail =
          user.data?.email && adminEmailList.includes(user.data.email.toLowerCase());

        if (isAdminClaim || isAdminEmail) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
          router.push('/not-authorized');
        }
      })
      .catch(() => {
        setIsAuthorized(false);
        router.push('/not-authorized');
      });
  }, [user, router]);

  if (isAuthorized !== true) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>Loading & checking authorization...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
