"use client";
import type { SVGProps } from 'react';
import { Store } from 'lucide-react';

/**
 * To use your own SVG, open your vendor.svg file in a text editor, copy the <svg> element,
 * and paste it here, replacing the existing <svg> element.
 * Make sure to add {...props} to the <svg> element to pass down styles.
 */
export function VendorIcon(props: SVGProps<SVGSVGElement>) {
  // This is a placeholder icon.
  return (
    <Store {...props} />
  );
}
