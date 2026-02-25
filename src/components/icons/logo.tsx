'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';

export function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/logo.svg"
      alt="HighVibe Retreats Logo"
      width={252}
      height={63}
      className={cn(className)}
      priority
    />
  );
}
