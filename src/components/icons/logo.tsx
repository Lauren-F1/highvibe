'use client';

import Image from 'next/image';

export function Logo() {
  return (
    <Image
      src="/logo.svg"
      alt="High Vibe Retreats Logo"
      width={600}
      height={215}
      className="mx-auto"
      priority
    />
  );
}
