'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthForm } from '@/components/auth-form';
import { useUser, useFirestore } from '@/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
            <LoginPageContent />
        </Suspense>
    );
}

function LoginPageContent() {
    const user = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();
    const firestore = useFirestore();

    useEffect(() => {
        if (user.status === 'authenticated') {
            const checkAndRedirect = async () => {
                const isLaunchMode = process.env.NEXT_PUBLIC_LAUNCH_MODE === 'true';

                if (isLaunchMode) {
                    const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAIL_ALLOWLIST || '')
                        .split(',')
                        .map(e => e.trim().toLowerCase())
                        .filter(Boolean);
                    
                    const userEmail = user.data.email?.toLowerCase();
                    const isAdmin = userEmail ? adminEmails.includes(userEmail) : false;

                    if (!isAdmin && firestore && userEmail) {
                        try {
                            const waitlistRef = doc(firestore, 'waitlist', userEmail);
                            const waitlistSnap = await getDoc(waitlistRef);
                            
                            if (!waitlistSnap.exists() || waitlistSnap.data().status !== 'invited') {
                                if (user.app) {
                                    getAuth(user.app).signOut();
                                }
                                router.push('/?reason=prelaunch_non_invited');
                                return;
                            }
                        } catch (err) {
                            console.error("Error checking waitlist status:", err);
                             if (user.app) {
                                getAuth(user.app).signOut();
                            }
                            router.push('/?reason=prelaunch_error');
                            return;
                        }
                    }
                }

                // User is admin, or not in launch mode, or is an invited user. Proceed with normal redirect logic.
                const redirect = searchParams.get('redirect');
                if (redirect) {
                    router.push(redirect);
                    return;
                }

                if (user.profile && user.profile.onboardingComplete) {
                    const primaryRole = user.profile.primaryRole;
                    if (primaryRole) {
                        router.push(`/${primaryRole}`);
                    } else {
                        router.push('/onboarding/role');
                    }
                } else {
                    router.push('/onboarding/role');
                }
            };
            checkAndRedirect();
        }
    }, [user, router, searchParams, firestore]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Welcome back.</CardTitle>
          <CardDescription>Sign in to continue.</CardDescription>
        </CardHeader>
        <CardContent>
            <AuthForm mode="login" />
        </CardContent>
      </Card>
    </div>
  );
}
