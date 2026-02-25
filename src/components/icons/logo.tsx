
'use client';

import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 100"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-auto w-auto", className)}
      aria-labelledby="logo-title"
    >
      <title id="logo-title">HighVibe Retreats</title>
       <text
        x="50%"
        y="45%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontFamily="var(--font-headline)"
        fontSize="48"
        fontWeight="700"
        letterSpacing="0.1em"
        fill="hsl(var(--foreground))"
      >
        HIGHVIBE
      </text>
      <text
        x="50%"
        y="75%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontFamily="var(--font-ui)"
        fontSize="14"
        letterSpacing="0.4em"
        fill="hsl(var(--beige-dark))"
      >
        RETREATS
      </text>
    </svg>
  );
}
