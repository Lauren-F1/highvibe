"use client";
import type { SVGProps } from 'react';

export function HostIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1500 1500"
      {...props}
    >
      <circle cx="750" cy="505.85" r="450" fill="none" stroke="currentColor" strokeWidth="20"/>
      <circle cx="450" cy="979.98" r="450" fill="none" stroke="currentColor" strokeWidth="20"/>
      <circle cx="1050" cy="979.98" r="450" fill="none" stroke="currentColor" strokeWidth="20"/>
    </svg>
  );
}
