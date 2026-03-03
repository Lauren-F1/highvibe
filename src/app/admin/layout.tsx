'use client';

import { useUser } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const adminNavLinks = [
  { href: '/admin/analytics', label: 'Analytics' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/bookings', label: 'Bookings' },
  { href: '/admin/waitlist', label: 'Waitlist' },
  { href: '/admin/contact', label: 'Contact' },
  { href: '/admin/founder-codes', label: 'Founder Codes' },
  { href: '/admin/chargebacks', label: 'Chargebacks' },
  { href: '/admin/flagged-conversations', label: 'Flagged Messages' },
];

function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="border-b bg-secondary/50">
      <div className="container mx-auto px-4 flex gap-1 overflow-x-auto py-2">
        {adminNavLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors',
              pathname.startsWith(link.href)
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

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

  if (isAuthorized === false) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p className="text-muted-foreground">Access denied. Redirecting...</p>
      </div>
    );
  }

  if (isAuthorized !== true) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>Checking authorization...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <AdminNav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
