
'use client';
import Link from 'next/link';
import { useState } from 'react';
import { WaitlistModal } from './waitlist-modal';
import { Button } from './ui/button';
import { Logo } from './icons/logo';

export function Footer() {
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);

  return (
    <>
      <footer className="bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col items-center justify-between sm:flex-row">
            <Link href="/">
              <Logo className="w-[140px] h-[35px]" />
            </Link>
            <p className="mt-4 text-sm text-muted-foreground sm:mt-0">
              © {new Date().getFullYear()} HighVibe Retreats Inc. All rights reserved.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 sm:mt-0 items-center">
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">
                About
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                Contact
              </Link>
              <Link href="/support" className="text-sm text-muted-foreground hover:text-foreground">
                Support
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy Policy
              </Link>
              <Button variant="link" className="text-sm text-muted-foreground hover:text-foreground p-0 h-auto" onClick={() => setIsWaitlistModalOpen(true)}>
                Get updates
              </Button>
            </div>
          </div>
        </div>
      </footer>
      <WaitlistModal
        isOpen={isWaitlistModalOpen}
        onOpenChange={setIsWaitlistModalOpen}
        source="footer"
      />
    </>
  );
}
