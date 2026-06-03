import Link from "next/link";
import Image from "next/image";

// The real Maya's Lodge clover, extracted from the owner's artwork with a
// transparent background (see scripts/make-logo.py). Used as the site logo.
// Intrinsic aspect ratio of public/logo.png is ~817×902.
export function LogoMark({
  size = 40,
  className = "",
  priority = false,
}: {
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/logo.png"
      alt="Maya's Lodge"
      width={Math.round(size * 0.906)}
      height={size}
      priority={priority}
      className={className}
    />
  );
}

/**
 * The Maya's Lodge clover mark, recreated as inline SVG so it stays crisp at
 * any size and works on light or dark backgrounds.
 *
 * To use the owner's exact logo instead, drop a file at /public/logo.png (or
 * .svg) and swap this component for an <Image> — the layout already reserves
 * the same footprint.
 */
export function CloverMark({
  size = 40,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const frame = "#2b2b2b";
  // A single heart pointing inward toward the centre, before rotation.
  const heartPath =
    "M0 26 C -34 -2, -11 -33, 0 -11 C 11 -33, 34 -2, 0 26 Z";
  const hearts: { rot: number; fill: string }[] = [
    { rot: 0, fill: "#ffffff" }, // top
    { rot: 90, fill: "#e8841a" }, // right (orange)
    { rot: 180, fill: "#ffffff" }, // bottom
    { rot: 270, fill: "#1f8a3b" }, // left (green)
  ];

  return (
    <svg
      width={size}
      height={size}
      viewBox="-60 -60 120 130"
      className={className}
      role="img"
      aria-label="Maya's Lodge clover"
    >
      {/* stem */}
      <rect x="-4" y="38" width="8" height="26" rx="3" fill={frame} />
      {hearts.map((h) => (
        <g key={h.rot} transform={`rotate(${h.rot}) translate(0 -20)`}>
          <path d={heartPath} fill={frame} transform="scale(1.16)" />
          <path d={heartPath} fill={h.fill} />
        </g>
      ))}
    </svg>
  );
}

// The site logo: the clover mark only, no wordmark text (per the owner's
// request). Extra props are accepted but ignored so existing call sites keep
// working.
export function Logo({
  size = 40,
  href = "/",
}: {
  size?: number;
  withText?: boolean;
  textClassName?: string;
  href?: string | null;
}) {
  const inner = <LogoMark size={size} />;
  if (href === null) return inner;
  return (
    <Link href={href} className="inline-flex items-center" aria-label="Maya's Lodge — home">
      {inner}
    </Link>
  );
}
