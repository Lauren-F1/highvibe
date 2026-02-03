import type { SVGProps } from 'react';

/**
 * To use your own SVG, open your space-owner.svg file in a text editor, copy the <svg> element,
 * and paste it here, replacing the existing <svg> element.
 * Make sure to add {...props} to the <svg> element to pass down styles.
 */
export function SpaceOwnerIcon(props: SVGProps<SVGSVGElement>) {
  // This is a placeholder icon.
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
