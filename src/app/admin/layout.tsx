'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

const ADMIN_EMAILS: string[] = []; // Add admin emails here, e.g. ['admin@example.com']

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
        const isAdminEmail =
          user.data?.email && ADMIN_EMAILS.includes(user.data.email);

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
