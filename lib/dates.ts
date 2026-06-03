// Date helpers. Convention: a calendar day is represented by a Date at 00:00:00
// UTC. A stay occupies the half-open interval [checkIn, checkOut) — the guest
// sleeps on every night from checkIn up to (but not including) checkout day.

/** Build a UTC-midnight Date from a YYYY-MM-DD string. */
export function dateFromISO(iso: string): Date {
  // `new Date("YYYY-MM-DD")` already parses as UTC midnight.
  const d = new Date(`${iso}T00:00:00.000Z`);
  return d;
}

/** Normalise any Date to UTC midnight of the same calendar day. */
export function startOfUTCDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}

/** Today at UTC midnight. */
export function todayUTC(): Date {
  return startOfUTCDay(new Date());
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

/** Whole nights between two UTC-midnight dates (checkOut - checkIn). */
export function nightsBetween(checkIn: Date, checkOut: Date): number {
  const ms = checkOut.getTime() - checkIn.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

/** Do two half-open date intervals overlap? */
export function intervalsOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/** Is `day` (UTC midnight) occupied by a stay [checkIn, checkOut)? */
export function dayInStay(day: Date, checkIn: Date, checkOut: Date): boolean {
  return day >= checkIn && day < checkOut;
}

export function isSameUTCDay(a: Date, b: Date): boolean {
  return startOfUTCDay(a).getTime() === startOfUTCDay(b).getTime();
}

/** All UTC-midnight days in a month (year, monthIndex 0-11). */
export function daysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const first = new Date(Date.UTC(year, month, 1));
  while (first.getUTCMonth() === month) {
    days.push(new Date(first));
    first.setUTCDate(first.getUTCDate() + 1);
  }
  return days;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function monthLabel(year: number, month: number): string {
  return `${MONTH_NAMES[month]} ${year}`;
}
