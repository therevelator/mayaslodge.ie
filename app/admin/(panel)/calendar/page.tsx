import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { monthLabel, nightsBetween, todayUTC } from "@/lib/dates";
import { formatDate, toISODate } from "@/lib/format";
import { getOpenWindows, openDaySet } from "@/lib/availability";
import { PriceCalendar } from "@/components/admin/PriceCalendar";
import { getCustomPrices } from "@/lib/pricing";
import { getSettings } from "@/lib/settings";
import { CalendarRoomPicker } from "@/components/admin/CalendarRoomPicker";
import { AdminBookingRow } from "@/components/admin/AdminBookingRow";

function parseMonth(input?: string): { year: number; month: number } {
  if (input && /^\d{4}-\d{2}$/.test(input)) {
    const [y, m] = input.split("-").map(Number);
    return { year: y, month: m - 1 };
  }
  const now = new Date();
  return { year: now.getUTCFullYear(), month: now.getUTCMonth() };
}

function monthParam(year: number, month: number): string {
  const d = new Date(Date.UTC(year, month, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export default async function AdminCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ room?: string; month?: string }>;
}) {
  const { room: roomParam, month: monthStr } = await searchParams;
  const { year, month } = parseMonth(monthStr);

  const rooms = await prisma.room.findMany({ orderBy: { sortOrder: "asc" } });
  if (rooms.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-brand-dark">Calendar</h1>
        <p className="rounded-xl bg-white p-8 text-center text-sm text-muted">
          Add a room first to see its calendar.
        </p>
      </div>
    );
  }

  const selectedRoom = rooms.find((r) => r.id === roomParam) ?? rooms[0];

  // Two-month window shown on screen.
  const windowStart = new Date(Date.UTC(year, month, 1));
  const windowEnd = new Date(Date.UTC(year, month + 2, 1));

  // Everything below depends only on the room and the month, so load it in
  // parallel (one database round trip instead of four).
  const [bookings, viewWindows, customPrices, settings] = await Promise.all([
    prisma.booking.findMany({
      where: {
        roomId: selectedRoom.id,
        status: { in: ["PENDING", "CONFIRMED"] },
        checkIn: { lt: windowEnd },
        checkOut: { gt: windowStart },
      },
      orderBy: { checkIn: "asc" },
    }),
    getOpenWindows(selectedRoom.id, windowStart, windowEnd),
    getCustomPrices(selectedRoom.id, windowStart, windowEnd),
    getSettings(),
  ]);

  const calBookings = bookings.map((b) => ({
    id: b.id,
    guestName: b.guestName,
    checkIn: b.checkIn,
    checkOut: b.checkOut,
    status: b.status,
    source: b.source,
  }));

  // Open availability: the set shown on the grid + the full future list managed
  // in the "Open dates" card.
  const openDays = Array.from(openDaySet(viewWindows));


  const todayISO = toISODate(todayUTC());
  const month1 = monthParam(year, month);
  const prev = monthParam(year, month - 1);
  const next = monthParam(year, month + 1);
  const currentMonth = monthParam(
    new Date().getUTCFullYear(),
    new Date().getUTCMonth()
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-brand-dark">Calendar</h1>
        <CalendarRoomPicker
          rooms={rooms.map((r) => ({ id: r.id, name: r.name }))}
          selectedId={selectedRoom.id}
          month={month1}
        />
      </div>

      {/* Month navigation */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Link href={`/admin/calendar?room=${selectedRoom.id}&month=${prev}`} className="btn btn-ghost px-3 py-1.5 text-sm" aria-label="Previous month">←</Link>
        <span className="min-w-44 text-center font-semibold text-brand-dark">{monthLabel(year, month)}</span>
        <Link href={`/admin/calendar?room=${selectedRoom.id}&month=${next}`} className="btn btn-ghost px-3 py-1.5 text-sm" aria-label="Next month">→</Link>
        <Link href={`/admin/calendar?room=${selectedRoom.id}&month=${currentMonth}`} className="btn btn-outline px-3 py-1.5 text-sm">Today</Link>
      </div>

      {/* Calendar — select days to set custom nightly prices */}
      <PriceCalendar
        roomId={selectedRoom.id}
        maxGuests={selectedRoom.maxGuests}
        months={[
          { year, month },
          { year: month === 11 ? year + 1 : year, month: (month + 1) % 12 },
        ]}
        bookings={calBookings}
        openDays={openDays}
        todayISO={todayISO}
        prices={customPrices}
        basePrice={selectedRoom.basePrice}
        currency={settings.currency}
      />

      {/* Bookings shown in this view, with quick actions */}
      <section>
        <h2 className="text-lg font-semibold text-brand-dark">
          {selectedRoom.name} — bookings in view
        </h2>
        {bookings.length === 0 ? (
          <p className="mt-2 rounded-xl bg-white p-6 text-sm text-muted">
            Nothing booked for this room in these two months.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {bookings.map((b) => (
              <AdminBookingRow
                key={b.id}
                rooms={rooms.map((r) => ({ id: r.id, name: r.name }))}
                booking={{
                  id: b.id,
                  roomId: b.roomId,
                  guestName: b.guestName,
                  guestEmail: b.guestEmail,
                  guestPhone: b.guestPhone,
                  checkInISO: toISODate(b.checkIn),
                  checkOutISO: toISODate(b.checkOut),
                  guests: b.guests,
                  status: b.status,
                  source: b.source,
                  message: b.message,
                  nights: nightsBetween(b.checkIn, b.checkOut),
                  dateLabel: `${formatDate(b.checkIn)} → ${formatDate(b.checkOut)} · ${nightsBetween(b.checkIn, b.checkOut)} night(s)`,
                  meta: {
                    ipAddress: b.ipAddress,
                    ipCountry: b.ipCountry,
                    ipRegion: b.ipRegion,
                    ipCity: b.ipCity,
                    userAgent: b.userAgent,
                    acceptLanguage: b.acceptLanguage,
                    referer: b.referer,
                    createdAt: b.createdAt,
                  },
                }}
              />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
