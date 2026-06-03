import type { SVGProps } from "react";

// Minimal inline icon set keyed by the `icon` field in the amenity catalog.
// All icons share a 24x24 viewBox and use currentColor so they inherit text
// colour. Unknown keys fall back to a checkmark.

const paths: Record<string, React.ReactNode> = {
  bath: (
    <>
      <path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3Z" />
      <path d="M6 12V6a2 2 0 0 1 2-2 2 2 0 0 1 2 2" />
      <path d="M6 19l-1 2M18 19l1 2" />
    </>
  ),
  shower: (
    <>
      <path d="M4 13h13a3 3 0 0 0 3-3V5a2 2 0 0 0-2-2h-2" />
      <path d="M14 3a2 2 0 0 0-2 2" />
      <path d="M8 17v.01M12 18v.01M8 21v.01M12 22v.01M16 17v.01M16 21v.01" />
    </>
  ),
  soap: (
    <>
      <path d="M5 11h10v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-8Z" />
      <path d="M9 11V8a2 2 0 0 1 2-2h2" />
      <path d="M15 7h3M15 10h3" />
    </>
  ),
  wind: (
    <>
      <path d="M3 8h10a2.5 2.5 0 1 0-2.5-2.5" />
      <path d="M3 12h14a2.5 2.5 0 1 1-2.5 2.5" />
      <path d="M3 16h7a2 2 0 1 1-2 2" />
    </>
  ),
  wifi: (
    <>
      <path d="M5 12.5a10 10 0 0 1 14 0" />
      <path d="M8.5 16a5 5 0 0 1 7 0" />
      <path d="M12 19h.01" />
    </>
  ),
  tv: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M8 21h8M12 18v3" />
    </>
  ),
  flame: (
    <path d="M12 3c1 3-2 4-2 7a2 2 0 0 0 4 0c0 1 2 2 2 4a4 4 0 0 1-8 0c0-4 4-5 4-11Z" />
  ),
  desk: (
    <>
      <path d="M3 9h18M4 9v11M20 9v11" />
      <path d="M7 9V6h6v3" />
    </>
  ),
  wardrobe: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="1" />
      <path d="M12 3v18M10 11h.01M14 11h.01" />
    </>
  ),
  moon: <path d="M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10Z" />,
  coffee: (
    <>
      <path d="M4 8h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Z" />
      <path d="M17 9h2a2 2 0 0 1 0 4h-2" />
      <path d="M7 3v2M11 3v2" />
    </>
  ),
  kettle: (
    <>
      <path d="M6 9h10l1 9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2l1-9Z" />
      <path d="M16 11l3-2M9 6h4l-1-2h-2l-1 2Z" />
    </>
  ),
  fridge: (
    <>
      <rect x="6" y="3" width="12" height="18" rx="2" />
      <path d="M6 10h12M9 6v2M9 13v3" />
    </>
  ),
  breakfast: (
    <>
      <circle cx="12" cy="13" r="7" />
      <circle cx="12" cy="13" r="3" />
      <path d="M12 3v3" />
    </>
  ),
  leaf: (
    <>
      <path d="M5 19c0-8 6-13 14-13 0 8-6 13-14 13Z" />
      <path d="M5 19c3-5 6-7 10-9" />
    </>
  ),
  wave: (
    <>
      <path d="M3 9c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
      <path d="M3 14c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
    </>
  ),
  mountain: <path d="M3 19l6-11 4 7 2-3 6 7H3Z" />,
  parking: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M9 17V8h3a2.5 2.5 0 0 1 0 5H9" />
    </>
  ),
  nosmoke: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M5 12h11v2H5zM18 12h1v2h-1z" />
      <path d="M5 5l14 14" />
    </>
  ),
  family: (
    <>
      <circle cx="8" cy="7" r="2.2" />
      <circle cx="16" cy="7" r="2.2" />
      <path d="M4 20v-3a4 4 0 0 1 4-4M20 20v-3a4 4 0 0 0-4-4" />
      <circle cx="12" cy="14" r="1.6" />
      <path d="M9.5 21v-2a2.5 2.5 0 0 1 5 0v2" />
    </>
  ),
  paw: (
    <>
      <circle cx="7" cy="9" r="1.6" />
      <circle cx="12" cy="7" r="1.6" />
      <circle cx="17" cy="9" r="1.6" />
      <path d="M9 16c0-2 1.5-3 3-3s3 1 3 3-1.5 3-3 3-3-1-3-3Z" />
    </>
  ),
  accessible: (
    <>
      <circle cx="12" cy="5" r="1.6" />
      <path d="M9 9h6M12 9v5M12 14l3 5M12 14l-3 5" />
    </>
  ),
  check: <path d="M5 12l5 5L20 7" />,
};

export function Icon({
  name,
  size = 20,
  ...props
}: { name: string; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name] ?? paths.check}
    </svg>
  );
}
