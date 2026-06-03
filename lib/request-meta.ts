import "server-only";
import { headers } from "next/headers";

export type RequestMeta = {
  ipAddress: string | null;
  ipCountry: string | null;
  ipRegion: string | null;
  ipCity: string | null;
  userAgent: string | null;
  acceptLanguage: string | null;
  referer: string | null;
};

function firstValue(v: string | null): string | null {
  if (!v) return null;
  return v.split(",")[0]!.trim() || null;
}

function isPrivateIp(ip: string | null): boolean {
  if (!ip) return true;
  return (
    ip === "::1" ||
    ip.startsWith("127.") ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    ip.startsWith("::ffff:127.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip)
  );
}

/** Best-effort IP geolocation via a free, keyless service. Never throws. */
async function geolocate(
  ip: string
): Promise<{ country: string | null; region: string | null; city: string | null }> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, {
      signal: controller.signal,
      headers: { "User-Agent": "MayasLodge/1.0" },
      cache: "no-store",
    });
    clearTimeout(timer);
    if (!res.ok) return { country: null, region: null, city: null };
    const data = (await res.json()) as Record<string, unknown>;
    return {
      country: (data.country_name as string) || null,
      region: (data.region as string) || null,
      city: (data.city as string) || null,
    };
  } catch {
    return { country: null, region: null, city: null };
  }
}

/**
 * Capture technical metadata about the current request. Server-side only — no
 * browser prompts. Geolocation is approximate (derived from IP). Disclosed in
 * the Privacy Policy.
 */
export async function captureRequestMeta(): Promise<RequestMeta> {
  const h = await headers();

  const ip =
    firstValue(h.get("x-forwarded-for")) ||
    h.get("x-real-ip") ||
    h.get("cf-connecting-ip") ||
    null;

  // Geo from edge/CDN headers if the host provides them (Vercel / Cloudflare).
  let country =
    h.get("x-vercel-ip-country") || h.get("cf-ipcountry") || null;
  let region = h.get("x-vercel-ip-country-region") || null;
  let city = h.get("x-vercel-ip-city")
    ? decodeURIComponent(h.get("x-vercel-ip-city")!)
    : null;

  // Otherwise look it up (best effort) for public IPs.
  if (!country && ip && !isPrivateIp(ip)) {
    const geo = await geolocate(ip);
    country = geo.country;
    region = geo.region;
    city = geo.city;
  }

  return {
    ipAddress: ip,
    ipCountry: country,
    ipRegion: region,
    ipCity: city,
    userAgent: h.get("user-agent"),
    acceptLanguage: firstValue(h.get("accept-language")),
    referer: h.get("referer"),
  };
}
