
'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('relative w-full h-full', className)}>
      <Image
        src="/logo.svg"
        alt="HighVibe Retreats Logo"
        fill
        className="object-contain"
        priority
      />
    </div>
  );
}
