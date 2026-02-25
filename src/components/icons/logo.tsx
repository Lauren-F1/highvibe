'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';

export function Logo({ className }: { className?: string }) {
  // Using a container with aspect-ratio is a reliable way to size the Image component with `fill`.
  // This avoids issues where the parent has no intrinsic size.
  return (
    <div className={cn("relative w-full h-auto aspect-[5/1]", className)}>
       <Image
        src="/logo.svg"
        alt="HighVibe Retreats Logo"
        fill
        priority
        className="object-contain"
      />
    </div>
  );
}
