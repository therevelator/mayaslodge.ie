import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { todayUTC, addDays, nightsBetween } from "@/lib/dates";
import { formatDate, formatPrice } from "@/lib/format";
import { StatusBadge, SourceBadge } from "@/components/admin/StatusBadge";
import { BookingMeta } from "@/components/admin/BookingMeta";
import { setBookingStatus } from "@/app/admin/actions";

export default async function AdminDashboard() {
  const settings = await getSettings();
  const today = todayUTC();
  const weekAhead = addDays(today, 7);

  const [pending, upcomingArrivals, roomCount, confirmedFuture] = await Promise.all([
    prisma.booking.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      include: { room: true },
    }),
    prisma.booking.findMany({
      where: {
        status: "CONFIRMED",
        checkIn: { gte: today, lt: weekAhead },
      },
      orderBy: { checkIn: "asc" },
      include: { room: true },
    }),
    prisma.room.count(),
    prisma.booking.count({
      where: { status: "CONFIRMED", checkOut: { gte: today } },
    }),
  ]);

  const stats = [
    { label: "Pending requests", value: pending.length, href: "/admin/bookings?status=PENDING", accent: pending.length > 0 },
    { label: "Arrivals next 7 days", value: upcomingArrivals.length, href: "/admin/bookings" },
    { label: "Confirmed (upcoming)", value: confirmedFuture, href: "/admin/calendar" },
    { label: "Rooms", value: roomCount, href: "/admin/rooms" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-brand-dark">
            Welcome back{settings ? `, ${settings.propertyName.split("'")[0]}` : ""} 👋
          </h1>
          <p className="text-sm text-muted">Here&rsquo;s what&rsquo;s happening at the lodge.</p>
        </div>
        <Link href="/admin/calendar" className="btn btn-primary hidden sm:inline-flex">
          Add a reservation
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className={`card p-5 transition hover:shadow-md ${s.accent ? "ring-1 ring-orange/40" : ""}`}>
            <div className="text-3xl font-semibold text-brand-dark">{s.value}</div>
            <div className="mt-1 text-sm text-muted">{s.label}</div>
          </Link>
        ))}
      </div>

      {/* Pending requests */}
      <section>
        <h2 className="text-lg font-semibold text-brand-dark">Booking requests</h2>
        {pending.length === 0 ? (
          <p className="mt-2 rounded-xl bg-white p-6 text-sm text-muted">
            No pending requests right now. 🎉
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {pending.map((b) => (
              <div key={b.id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-ink">{b.guestName}</span>
                    <StatusBadge status={b.status} />
                    <SourceBadge source={b.source} />
                  </div>
                  <div className="mt-1 text-sm text-muted">
                    {b.room.name} · {formatDate(b.checkIn)} → {formatDate(b.checkOut)} ·{" "}
                    {nightsBetween(b.checkIn, b.checkOut)} night(s) · {b.guests} guest(s)
                  </div>
                  {b.message && <p className="mt-1 text-sm text-ink/70">“{b.message}”</p>}
                  <div className="mt-1 text-xs text-muted">
                    {b.guestEmail}{b.guestPhone ? ` · ${b.guestPhone}` : ""}
                    {b.totalPrice ? ` · ${formatPrice(b.totalPrice, settings.currency)}` : ""}
                  </div>
                  <BookingMeta
                    data={{
                      ipAddress: b.ipAddress,
                      ipCountry: b.ipCountry,
                      ipRegion: b.ipRegion,
                      ipCity: b.ipCity,
                      userAgent: b.userAgent,
                      acceptLanguage: b.acceptLanguage,
                      referer: b.referer,
                      createdAt: b.createdAt,
                    }}
                  />
                </div>
                <div className="flex shrink-0 gap-2">
                  <form action={setBookingStatus}>
                    <input type="hidden" name="id" value={b.id} />
                    <input type="hidden" name="status" value="CONFIRMED" />
                    <button className="btn btn-primary px-3 py-1.5 text-sm">Confirm</button>
                  </form>
                  <form action={setBookingStatus}>
                    <input type="hidden" name="id" value={b.id} />
                    <input type="hidden" name="status" value="DECLINED" />
                    <button className="btn btn-outline px-3 py-1.5 text-sm">Decline</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Upcoming arrivals */}
      <section>
        <h2 className="text-lg font-semibold text-brand-dark">Arrivals this week</h2>
        {upcomingArrivals.length === 0 ? (
          <p className="mt-2 rounded-xl bg-white p-6 text-sm text-muted">No confirmed arrivals in the next 7 days.</p>
        ) : (
          <div className="mt-3 overflow-hidden rounded-2xl border border-brand/10 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-cream-deep/50 text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-2.5">Guest</th>
                  <th className="px-4 py-2.5">Room</th>
                  <th className="px-4 py-2.5">Check-in</th>
                  <th className="px-4 py-2.5">Nights</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand/5">
                {upcomingArrivals.map((b) => (
                  <tr key={b.id}>
                    <td className="px-4 py-2.5 font-medium">{b.guestName}</td>
                    <td className="px-4 py-2.5 text-muted">{b.room.name}</td>
                    <td className="px-4 py-2.5">{formatDate(b.checkIn)}</td>
                    <td className="px-4 py-2.5">{nightsBetween(b.checkIn, b.checkOut)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
