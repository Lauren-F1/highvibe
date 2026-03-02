'use client';

import { useState } from 'react';
import { getAuth, sendEmailVerification } from 'firebase/auth';
import { useUser, useFirebaseApp } from '@/firebase';
import { isFirebaseEnabled } from '@/firebase/config';
import { Button } from '@/components/ui/button';
import { Mail, X } from 'lucide-react';

export function EmailVerificationBanner() {
  const user = useUser();
  const app = useFirebaseApp();
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!isFirebaseEnabled) return null;
  if (user.status !== 'authenticated') return null;
  if (!('emailVerified' in user.data)) return null;
  if (user.data.emailVerified) return null;
  if (dismissed) return null;

  const handleResend = async () => {
    if (!app) return;
    setSending(true);
    try {
      const auth = getAuth(app);
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        setSent(true);
      }
    } catch (e) {
      console.warn('Failed to resend verification email:', e);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-sm text-amber-800">
          <Mail className="h-4 w-4 shrink-0" />
          <span>
            {sent
              ? 'Verification email sent! Check your inbox.'
              : 'Please verify your email address to get the most out of HighVibe.'}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!sent && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResend}
              disabled={sending}
              className="border-amber-300 text-amber-800 hover:bg-amber-100"
            >
              {sending ? 'Sending...' : 'Resend Email'}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-amber-600 hover:text-amber-800 hover:bg-amber-100"
            onClick={() => setDismissed(true)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
