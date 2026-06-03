import "server-only";
import { prisma } from "./prisma";

/**
 * Clear the technical metadata (IP, approximate location, device, language,
 * referer) from bookings older than the configured retention period. The
 * booking record itself is kept. Returns the number of rows cleared.
 *
 * Runs lazily whenever the owner opens the admin area, so no external cron is
 * required for a regularly-used dashboard. Safe to call often (idempotent).
 */
export async function purgeExpiredMeta(): Promise<number> {
  const setting = await prisma.setting.findUnique({
    where: { id: 1 },
    select: { metaRetentionDays: true },
  });
  const days = setting?.metaRetentionDays ?? 0;
  if (!days || days < 1) return 0; // 0 = keep indefinitely

  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const res = await prisma.booking.updateMany({
    where: {
      createdAt: { lt: cutoff },
      OR: [
        { ipAddress: { not: null } },
        { ipCountry: { not: null } },
        { ipRegion: { not: null } },
        { ipCity: { not: null } },
        { userAgent: { not: null } },
        { acceptLanguage: { not: null } },
        { referer: { not: null } },
      ],
    },
    data: {
      ipAddress: null,
      ipCountry: null,
      ipRegion: null,
      ipCity: null,
      userAgent: null,
      acceptLanguage: null,
      referer: null,
    },
  });
  return res.count;
}
