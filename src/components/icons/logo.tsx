'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn(className)}>
      <Image
        src="/logo.svg"
        alt="HighVibe Retreats Logo"
        width={1200}
        height={192}
        priority
        style={{
          width: '100%',
          maxWidth: '100%',
          height: 'auto',
        }}
      />
    </div>
  );
}
