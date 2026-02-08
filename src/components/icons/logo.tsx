'use client';

import Image from 'next/image';

export function Logo() {
  return (
    <Image
      src="/logo.svg"
      alt="RETREAT Logo"
      width={1152}
      height={413}
      className="mx-auto"
      priority
    />
  );
}
