import { dayInStay } from "@/lib/dates";

// Presentational month calendar (server component) that mirrors the look of the
// guest-facing room calendar, but instead of picking a range it shows the
// selected room's bookings, coloured by status.

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export type CalBooking = {
  id: string;
  guestName: string;
  checkIn: Date;
  checkOut: Date;
  status: string;
  source: string;
};

function leadingBlanks(year: number, month: number): number {
  const jsDay = new Date(Date.UTC(year, month, 1)).getUTCDay();
  return (jsDay + 6) % 7; // Monday-based
}

function cellColor(b: CalBooking): string {
  if (b.status === "PENDING") return "bg-orange text-white";
  if (b.source === "BLOCK") return "bg-charcoal text-white";
  if (b.source === "BOOKING_COM") return "bg-blue-500 text-white";
  return "bg-brand text-white";
}

export function MonthGrid({
  year,
  month,
  bookings,
  openDays,
  todayISO,
}: {
  year: number;
  month: number;
  bookings: CalBooking[];
  openDays: Set<string>;
  todayISO: string;
}) {
  const total = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const blanks = leadingBlanks(year, month);
  const monthStartMs = Date.UTC(year, month, 1);

  const cells: (Date | null)[] = [
    ...Array(blanks).fill(null),
    ...Array.from({ length: total }, (_, i) => new Date(Date.UTC(year, month, i + 1))),
  ];

  return (
    <div className="min-w-0 flex-1">
      <div className="mb-2 text-center text-sm font-semibold text-brand-dark">
        {MONTHS[month]} {year}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[0.7rem] font-medium text-muted">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1">{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const iso = day.toISOString().slice(0, 10);
          const booking = bookings.find((b) => dayInStay(day, b.checkIn, b.checkOut));
          const past = iso < todayISO;
          const isStart =
            booking &&
            (day.getTime() === booking.checkIn.getTime() ||
              day.getTime() === monthStartMs);

          if (!booking) {
            const open = openDays.has(iso);
            // Closed (default) days are tinted; open & free days are plain.
            const cls = past
              ? "text-ink/30"
              : open
                ? "text-ink"
                : "bg-cream-deep/70 text-ink/35";
            return (
              <div
                key={i}
                title={open ? "Open for booking" : "Closed"}
                className={`flex aspect-square items-center justify-center rounded-lg text-sm ${cls}`}
              >
                {day.getUTCDate()}
              </div>
            );
          }

          return (
            <div
              key={i}
              title={`${booking.guestName} · ${booking.status}`}
              className={`relative flex aspect-square flex-col items-center justify-center rounded-lg text-sm ${cellColor(booking)} ${past ? "opacity-60" : ""}`}
            >
              <span className="font-semibold leading-none">{day.getUTCDate()}</span>
              {isStart && (
                <span className="mt-0.5 max-w-full truncate px-1 text-[0.55rem] leading-tight">
                  {booking.guestName.split(" ")[0]}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
