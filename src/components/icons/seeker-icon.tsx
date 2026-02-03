"use client";
import type { SVGProps } from 'react';
import { Search } from 'lucide-react';

/**
 * To use your own SVG, open your guide.svg file in a text editor, copy the <svg> element,
 * and paste it here, a-s an SVG component.
 * Make sure to add {...props} to the <svg> element to pass down styles.
 */
export function SeekerIcon(props: SVGProps<SVGSVGElement>) {
  // This is a placeholder icon.
  return (
   <Search {...props} />
  );
}
