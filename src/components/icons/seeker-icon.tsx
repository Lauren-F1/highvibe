"use client";
import type { SVGProps } from 'react';

export function SeekerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2 L4 11 L20 11 Z" />
      <path d="M12 13 L4 18 L12 23 L20 18 Z" />
    </svg>
  );
}
