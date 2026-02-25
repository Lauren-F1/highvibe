
'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';

/**
 * The Logo component renders the HighVibe Retreats brand identity.
 * It is designed to scale responsively to the width of its container.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("relative w-full overflow-hidden", className)}>
       <Image
        src="/logo.svg"
        alt="HighVibe Retreats Logo"
        width={1200}
        height={240}
        priority
        className="w-full h-auto object-contain"
        unoptimized
      />
    </div>
  );
}
