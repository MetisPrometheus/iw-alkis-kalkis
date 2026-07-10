import type { SVGProps } from "react";
import type { CategoryIkon } from "@/lib/categories";

/**
 * Hand-drawn 24x24 duotone icons. Each icon is two layers of currentColor —
 * a translucent fill (the "duo" layer) plus solid strokes/details — so they
 * pick up whatever tone class the parent sets (e.g. text-tone-ol).
 */

type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps) {
  return {
    viewBox: "0 0 24 24",
    width: 24,
    height: 24,
    fill: "none",
    "aria-hidden": true,
    ...props,
  } as const;
}

/** Beer mug with foam — øl. */
export function BeerIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path
        d="M6 9h11v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9Z"
        fill="currentColor"
        opacity=".28"
      />
      <path
        d="M6 9h11v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M17 11h1.5a2.5 2.5 0 0 1 0 5H17"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M5.5 8.5a2.5 2.5 0 0 1 1.1-4.7 3.2 3.2 0 0 1 5.8-1 2.8 2.8 0 0 1 4.6 2.2 2.3 2.3 0 0 1-.5 3.5"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
        opacity=".9"
        fillOpacity=".15"
      />
      <path
        d="M9.5 12.5v5.5M13.5 12.5v5.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity=".55"
      />
    </svg>
  );
}

/** Wine glass, half full — vin. */
export function WineIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7.3 8.5c.4 2.6 2.3 4.5 4.7 4.5s4.3-1.9 4.7-4.5H7.3Z" fill="currentColor" opacity=".3" />
      <path
        d="M7 3h10c0 5.5-2.2 10-5 10S7 8.5 7 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M12 13v7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8.5 21h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/** Lowball tumbler with ice — brennevin. */
export function SpiritsIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 12h12l-.7 8H6.7L6 12Z" fill="currentColor" opacity=".3" />
      <path
        d="M5 5h14l-1.2 14a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M5.7 12h12.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <rect
        x="9.4"
        y="13.6"
        width="4"
        height="4"
        rx="1"
        transform="rotate(12 11.4 15.6)"
        stroke="currentColor"
        strokeWidth="1.4"
        opacity=".65"
      />
    </svg>
  );
}

/** Apple with leaf — sider & mjød. */
export function CiderIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path
        d="M12 7.8c-1-.9-2.4-1.3-3.8-.9C5.6 7.6 4.3 10.5 5 13.5c.8 3.4 3 6.1 5.2 6.4.7.1 1.3-.1 1.8-.4.5.3 1.1.5 1.8.4 2.2-.3 4.4-3 5.2-6.4.7-3-.6-5.9-3.2-6.6-1.4-.4-2.8 0-3.8.9Z"
        fill="currentColor"
        opacity=".3"
      />
      <path
        d="M12 7.8c-1-.9-2.4-1.3-3.8-.9C5.6 7.6 4.3 10.5 5 13.5c.8 3.4 3 6.1 5.2 6.4.7.1 1.3-.1 1.8-.4.5.3 1.1.5 1.8.4 2.2-.3 4.4-3 5.2-6.4.7-3-.6-5.9-3.2-6.6-1.4-.4-2.8 0-3.8.9Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M12 7.5c0-2 1-3.5 3-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M15 3.5c1.8-.4 3.2.2 3.8 1.4-1.1.9-2.7 1-3.8.2"
        fill="currentColor"
        opacity=".55"
      />
    </svg>
  );
}

/** Water drop — alkoholfritt. */
export function DropIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path
        d="M12 3s6.5 7 6.5 11.4A6.4 6.4 0 0 1 12 21a6.4 6.4 0 0 1-6.5-6.6C5.5 10 12 3 12 3Z"
        fill="currentColor"
        opacity=".3"
      />
      <path
        d="M12 3s6.5 7 6.5 11.4A6.4 6.4 0 0 1 12 21a6.4 6.4 0 0 1-6.5-6.6C5.5 10 12 3 12 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9 14.5c0 1.8 1.2 3.1 2.7 3.4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity=".6"
      />
    </svg>
  );
}

/** Bottle silhouette — placeholder when a product has no image. */
export function BottleIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path
        d="M10.2 2.5h3.6v4.2c0 .6.2 1.1.6 1.6 1 1.2 1.6 2.7 1.6 4.3v6.9a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-6.9c0-1.6.6-3.1 1.6-4.3.4-.5.6-1 .6-1.6V2.5Z"
        fill="currentColor"
        opacity=".25"
      />
      <path
        d="M10.2 2.5h3.6v4.2c0 .6.2 1.1.6 1.6 1 1.2 1.6 2.7 1.6 4.3v6.9a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-6.9c0-1.6.6-3.1 1.6-4.3.4-.5.6-1 .6-1.6V2.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M8.5 14h7" stroke="currentColor" strokeWidth="1.5" opacity=".6" />
    </svg>
  );
}

/** Magnifier for the header search field. */
export function SearchIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="10.5" cy="10.5" r="5.5" fill="currentColor" opacity=".18" />
      <circle cx="10.5" cy="10.5" r="5.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="m15 15 5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

/** Chevron used by the category accordion. */
export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path
        d="m6 9 6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Warning triangle for the demo-data banner. */
export function AlertIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path
        d="M10.3 4.1a2 2 0 0 1 3.4 0l7 12a2 2 0 0 1-1.7 3H5a2 2 0 0 1-1.7-3l7-12Z"
        fill="currentColor"
        opacity=".2"
      />
      <path
        d="M10.3 4.1a2 2 0 0 1 3.4 0l7 12a2 2 0 0 1-1.7 3H5a2 2 0 0 1-1.7-3l7-12Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M12 9v4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="12" cy="16.3" r="1" fill="currentColor" />
    </svg>
  );
}

const IKON_MAP: Record<CategoryIkon, (props: IconProps) => React.JSX.Element> = {
  beer: BeerIcon,
  wine: WineIcon,
  spirits: SpiritsIcon,
  cider: CiderIcon,
  drop: DropIcon,
};

export function CategoryIcon({ ikon, ...props }: { ikon: CategoryIkon } & IconProps) {
  const Icon = IKON_MAP[ikon];
  return <Icon {...props} />;
}
