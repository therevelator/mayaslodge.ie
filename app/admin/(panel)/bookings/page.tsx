import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { nightsBetween, todayUTC } from "@/lib/dates";
import { formatDate, formatPrice } from "@/lib/format";
import { StatusBadge, SourceBadge } from "@/components/admin/StatusBadge";
import { BookingMeta } from "@/components/admin/BookingMeta";
import { setBookingStatus, deleteBooking } from "@/app/admin/actions";
import { BOOKING_STATUSES } from "@/lib/constants";

const FILTERS = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "UPCOMING", label: "Upcoming" },
  { key: "PAST", label: "Past" },
  { key: "DECLINED", label: "Declined" },
  { key: "CANCELLED", label: "Cancelled" },
];

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = "ALL" } = await searchParams;
  const settings = await getSettings();
  const today = todayUTC();

  const where: Prisma.BookingWhereInput =
    status === "ALL"
      ? {}
      : status === "UPCOMING"
        ? { checkIn: { gte: today }, status: { in: ["PENDING", "CONFIRMED"] } }
        : status === "PAST"
          ? { checkOut: { lt: today } }
          : (BOOKING_STATUSES as readonly string[]).includes(status)
            ? { status }
            : {};

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: { checkIn: "asc" },
    include: { room: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-brand-dark">Bookings</h1>
        <Link href="/admin/calendar" className="btn btn-primary">Add a reservation</Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={`/admin/bookings?status=${f.key}`}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
              status === f.key ? "bg-brand text-white" : "bg-white text-ink/70 hover:bg-cream-deep"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {bookings.length === 0 ? (
        <p className="rounded-xl bg-white p-8 text-center text-sm text-muted">No bookings in this view.</p>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b.id} className="card p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-ink">{b.guestName}</span>
                    <StatusBadge status={b.status} />
                    <SourceBadge source={b.source} />
                  </div>
                  <div className="mt-1 text-sm text-muted">
                    {b.room.name} · {formatDate(b.checkIn)} → {formatDate(b.checkOut)} ·{" "}
                    {nightsBetween(b.checkIn, b.checkOut)} night(s) · {b.guests} guest(s)
                    {b.totalPrice ? ` · ${formatPrice(b.totalPrice, settings.currency)}` : ""}
                  </div>
                  {(b.guestEmail || b.guestPhone) && (
                    <div className="mt-1 text-xs text-muted">
                      {b.guestEmail}
                      {b.guestEmail && b.guestPhone ? " · " : ""}
                      {b.guestPhone}
                    </div>
                  )}
                  {b.message && <p className="mt-1.5 text-sm text-ink/70">“{b.message}”</p>}
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

                <div className="flex shrink-0 flex-wrap gap-2">
                  {b.status !== "CONFIRMED" && (
                    <StatusButton id={b.id} status="CONFIRMED" label="Confirm" variant="primary" />
                  )}
                  {b.status === "PENDING" && (
                    <StatusButton id={b.id} status="DECLINED" label="Decline" variant="outline" />
                  )}
                  {b.status === "CONFIRMED" && (
                    <StatusButton id={b.id} status="CANCELLED" label="Cancel" variant="outline" />
                  )}
                  <form action={deleteBooking}>
                    <input type="hidden" name="id" value={b.id} />
                    <button className="btn btn-ghost px-3 py-1.5 text-sm text-orange-dark">Delete</button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusButton({
  id,
  status,
  label,
  variant,
}: {
  id: string;
  status: string;
  label: string;
  variant: "primary" | "outline";
}) {
  return (
    <form action={setBookingStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button className={`btn btn-${variant} px-3 py-1.5 text-sm`}>{label}</button>
    </form>
  );
}
