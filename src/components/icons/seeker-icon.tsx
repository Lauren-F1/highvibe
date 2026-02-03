import type { SVGProps } from 'react';

/**
 * To use your own SVG, open your seeker.svg file in a text editor, copy the <svg> element,
 * and paste it here, replacing the existing <svg> element.
 * Make sure to add {...props} to the <svg> element to pass down styles.
 */
export function SeekerIcon(props: SVGProps<SVGSVGElement>) {
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
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}
