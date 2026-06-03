// Presentational block showing the technical metadata captured when a guest
// submitted their request. Server-safe (no hooks) so it works in server pages
// and inside client components alike.

export type BookingMetaData = {
  ipAddress: string | null;
  ipCountry: string | null;
  ipRegion: string | null;
  ipCity: string | null;
  userAgent: string | null;
  acceptLanguage: string | null;
  referer: string | null;
  createdAt: Date;
};

/** Rough, human-friendly device/browser label from a user-agent string. */
function briefDevice(ua: string | null): string | null {
  if (!ua) return null;
  const browser =
    /Edg\//.test(ua) ? "Edge" :
    /OPR\/|Opera/.test(ua) ? "Opera" :
    /Chrome\//.test(ua) ? "Chrome" :
    /Firefox\//.test(ua) ? "Firefox" :
    /Safari\//.test(ua) ? "Safari" :
    "Browser";
  const os =
    /iPhone|iPad|iOS/.test(ua) ? "iOS" :
    /Android/.test(ua) ? "Android" :
    /Mac OS X|Macintosh/.test(ua) ? "macOS" :
    /Windows/.test(ua) ? "Windows" :
    /Linux/.test(ua) ? "Linux" :
    "";
  return os ? `${browser} · ${os}` : browser;
}

const TS = new Intl.DateTimeFormat("en-IE", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Dublin",
});

export function BookingMeta({ data }: { data: BookingMetaData }) {
  const location = [data.ipCity, data.ipRegion, data.ipCountry]
    .filter(Boolean)
    .join(", ");
  const device = briefDevice(data.userAgent);

  const rows: { label: string; value: string | null }[] = [
    { label: "Location (from IP)", value: location || null },
    { label: "IP address", value: data.ipAddress },
    { label: "Device", value: device },
    { label: "Language", value: data.acceptLanguage },
    { label: "Came from", value: data.referer },
    { label: "Submitted", value: TS.format(data.createdAt) },
  ];

  const shown = rows.filter((r) => r.value);
  if (shown.length === 0) return null;

  return (
    <details className="mt-2 rounded-lg bg-cream-deep/40 px-3 py-2 text-xs">
      <summary className="cursor-pointer font-semibold text-brand-dark">
        Captured details
      </summary>
      <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
        {shown.map((r) => (
          <div key={r.label} className="contents">
            <dt className="text-muted">{r.label}</dt>
            <dd className="break-all text-ink/80">{r.value}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}
