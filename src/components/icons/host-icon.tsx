import type { SVGProps } from 'react';
import { Palmtree } from 'lucide-react';

/**
 * To use your own SVG, open your guide.svg file in a text editor, copy the <svg> element,
 * and paste it here, a-s an SVG component.
 * Make sure to add {...props} to the <svg> element to pass down styles.
 */
export function HostIcon(props: SVGProps<SVGSVGElement>) {
  // This is a placeholder icon.
  return (
   <Palmtree {...props} />
  );
}