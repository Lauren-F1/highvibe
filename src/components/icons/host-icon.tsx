"use client";
import type { SVGProps } from 'react';

export function HostIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="5"
      {...props}
    >
      {/* Outer ring */}
      <circle cx="50" cy="50" r="45" />

      {/* Two inner overlapping rings */}
      <circle cx="38" cy="50" r="22" />
      <circle cx="62" cy="50" r="22" />
    </svg>
  );
}
