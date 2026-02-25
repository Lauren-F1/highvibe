'use client';

import { redirect } from 'next/navigation';
import { useUser } from '@/firebase';
import { useEffect } from 'react';

/**
 * Entry point for the /host route.
 * Handles redirection based on user authentication and profile completion.
 */
export default function HostPage() {
    const user = useUser();

    useEffect(() => {
        if (user.status === 'authenticated') {
            if (user.profile?.profileComplete) {
                redirect('/host/dashboard');
            } else {
                redirect('/host/onboarding');
            }
        }
    }, [user]);

    return (
        <div className="container mx-auto px-4 py-12 text-center">
            Redirecting...
        </div>
    );
}
