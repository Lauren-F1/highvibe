'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthForm } from '@/components/auth-form';
import { useUser } from '@/firebase';
import { useEffect, Suspense } from 'react';

const roleDisplayNames: Record<string, string> = {
    guide: 'Guide',
    host: 'Host',
    vendor: 'Vendor',
    seeker: 'Seeker'
};

export default function JoinRolePage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <JoinRoleContent />
    </Suspense>
  );
}

function JoinRoleContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useUser();
  const role = Array.isArray(params.role) ? params.role[0] : params.role;
  const displayName = roleDisplayNames[role] || 'Member';
  const ref = searchParams.get('ref');
  const source = searchParams.get('source');
  const isScoutReferral = ref === 'scout' && role === 'vendor';

  useEffect(() => {
    if (user.status === 'authenticated') {
        // If this was a scout referral, update outreach record
        if (isScoutReferral && source) {
          fetch('/api/scout/signup-complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: source }),
          }).catch(() => {});
        }

        const redirect = searchParams.get('redirect');
        if (redirect) {
            router.push(redirect);
        } else {
            router.push(`/${role}`);
        }
    }
  }, [user, router, role, searchParams, isScoutReferral, source]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Create your {displayName} Account</CardTitle>
          <CardDescription>
            {isScoutReferral
              ? 'A retreat leader found you and thinks you\'d be a great fit! Join HighVibe to connect with retreat leaders looking for your services.'
              : 'Welcome! Let\'s get you set up on HighVibe Retreats.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm mode="signup" role={role as 'guide' | 'host' | 'vendor' | 'seeker'}/>
        </CardContent>
      </Card>
    </div>
  );
}
