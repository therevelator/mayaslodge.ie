import { dayInStay } from "@/lib/dates";
import { formatPrice } from "@/lib/format";

// Month calendar for the admin. Mirrors the look of the guest-facing room
// calendar, shows the selected room's bookings coloured by status, and — when
// `onDayClick` is given — lets the owner select days (e.g. to set prices).
// Nights with a custom price show that price under the day number.

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
  prices,
  currency = "EUR",
  selected,
  onDayClick,
}: {
  year: number;
  month: number;
  bookings: CalBooking[];
  openDays: Set<string>;
  todayISO: string;
  prices?: Record<string, number>;
  currency?: string;
  selected?: Set<string>;
  onDayClick?: (iso: string, shiftKey: boolean) => void;
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
          const custom = prices?.[iso];
          const isSelected = selected?.has(iso) ?? false;
          const clickable = Boolean(onDayClick) && !past;
          const isStart =
            booking &&
            (day.getTime() === booking.checkIn.getTime() ||
              day.getTime() === monthStartMs);

          let cls: string;
          let title: string;
          if (!booking) {
            const open = openDays.has(iso);
            // Closed (default) days are tinted; open & free days are plain.
            cls = past ? "text-ink/30" : open ? "text-ink" : "bg-cream-deep/70 text-ink/35";
            title = open ? "Open for booking" : "Closed";
          } else {
            cls = `${cellColor(booking)} ${past ? "opacity-60" : ""}`;
            title = `${booking.guestName} · ${booking.status}`;
          }
          if (custom !== undefined) title += ` · ${formatPrice(custom, currency)} / night`;

          const content = (
            <>
              <span className={booking ? "font-semibold leading-none" : "leading-none"}>
                {day.getUTCDate()}
              </span>
              {isStart ? (
                <span className="mt-0.5 max-w-full truncate px-1 text-[0.55rem] leading-tight">
                  {booking.guestName.split(" ")[0]}
                </span>
              ) : custom !== undefined ? (
                <span
                  className={`mt-0.5 max-w-full truncate px-0.5 text-[0.6rem] font-semibold leading-tight ${
                    booking ? "text-white" : "text-orange-dark"
                  }`}
                >
                  {formatPrice(custom, currency)}
                </span>
              ) : null}
            </>
          );

          const base = `relative flex aspect-square flex-col items-center justify-center rounded-lg text-sm ${cls} ${
            isSelected ? "ring-2 ring-orange ring-offset-1" : ""
          }`;

          if (clickable) {
            return (
              <button
                key={i}
                type="button"
                title={title}
                aria-pressed={isSelected}
                onClick={(e) => onDayClick!(iso, e.shiftKey)}
                className={`${base} cursor-pointer hover:ring-2 hover:ring-brand/40`}
              >
                {content}
              </button>
            );
          }
          return (
            <div key={i} title={title} className={base}>
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
