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
      xmlnsXlink="http://www.w3.org/1999/xlink"
      width="2000"
      zoomAndPan="magnify"
      viewBox="0 0 1500 1499.999933"
      height="2000"
      preserveAspectRatio="xMidYMid meet"
      version="1.0"
      {...props}
    >
      <defs>
        <clipPath id="0c84a7841a">
          <path
            d="M 0.238281 0.269531 L 1055.761719 0.269531 L 1055.761719 894.972656 L 0.238281 894.972656 Z M 0.238281 0.269531 "
            clipRule="nonzero"
          />
        </clipPath>
        <clipPath id="ddbc88a074">
          <path
            d="M 195 308.214844 L 861 308.214844 L 861 1481.796875 L 195 1481.796875 Z M 195 308.214844 "
            clipRule="nonzero"
          />
        </clipPath>
        <clipPath id="a33b8cdc15">
          <rect x="0" width="1056" y="0" height="1483" />
        </clipPath>
      </defs>
      <g transform="matrix(1, 0, 0, 1, 222, 9)">
        <g clipPath="url(#a33b8cdc15)">
          <g clipPath="url(#0c84a7841a)">
            <path
              fill="currentColor"
              d="M 1055.535156 894.972656 L 0.464844 894.972656 L 528 0.269531 Z M 7.425781 891.175781 L 1048.785156 891.175781 L 528 8.078125 Z M 7.425781 891.175781 "
              fillOpacity="1"
              clipRule="nonzero"
            />
          </g>
          <g clipPath="url(#ddbc88a074)">
            <path
              fill="currentColor"
              d="M 528.25 1481.714844 C 526.210938 1481.714844 524.175781 1480.699219 523.410156 1478.914062 L 195.839844 897.640625 C 194.820312 895.859375 194.820312 893.820312 195.839844 892.035156 L 523.15625 311.019531 C 524.175781 309.234375 525.957031 308.214844 527.996094 308.214844 C 530.03125 308.214844 532.070312 309.234375 532.835938 311.019531 L 860.152344 892.035156 C 861.171875 893.820312 861.171875 895.859375 860.152344 897.640625 L 533.089844 1478.660156 C 532.070312 1480.441406 530.289062 1481.714844 528.25 1481.714844 Z M 207.300781 894.839844 L 527.996094 1464.140625 L 848.6875 894.839844 L 528.25 325.539062 Z M 207.300781 894.839844 "
              fillOpacity="1"
              clipRule="nonzero"
            />
          </g>
        </g>
      </g>
    </svg>
  );
}
