"use client";

import { useMemo, useState } from "react";

// Week starts on Monday (Ireland).
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function iso(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** Monday-based weekday index (0 = Mon … 6 = Sun) for the 1st of a month. */
function leadingBlanks(year: number, month: number): number {
  const jsDay = new Date(Date.UTC(year, month, 1)).getUTCDay(); // 0 = Sun
  return (jsDay + 6) % 7;
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

export type RangeCalendarProps = {
  available: string[]; // YYYY-MM-DD days that are open AND free to book
  todayISO: string;
  checkIn: string | null;
  checkOut: string | null;
  onSelect: (checkIn: string | null, checkOut: string | null) => void;
  months?: number;
};

export function RangeCalendar({
  available,
  todayISO,
  checkIn,
  checkOut,
  onSelect,
  months = 2,
}: RangeCalendarProps) {
  const availableSet = useMemo(() => new Set(available), [available]);

  // Calendar view anchored at the first visible month.
  const [todayY, todayM] = todayISO.split("-").map(Number);
  const [view, setView] = useState({ year: todayY, month: todayM - 1 });

  // A night is bookable only if it's open, free and not in the past.
  const nightOpen = (day: string) => availableSet.has(day) && day >= todayISO;

  // Every night in [start, end) must be bookable for the range to be valid.
  const rangeHasClosedNight = (start: string, end: string) => {
    const cursor = new Date(`${start}T00:00:00Z`);
    const stop = new Date(`${end}T00:00:00Z`);
    while (cursor < stop) {
      const key = cursor.toISOString().slice(0, 10);
      if (!nightOpen(key)) return true;
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return false;
  };

  const handleClick = (day: string) => {
    // Starting a fresh selection.
    if (!checkIn || (checkIn && checkOut)) {
      if (!nightOpen(day)) return;
      onSelect(day, null);
      return;
    }
    // We have a check-in, choosing a check-out.
    if (day <= checkIn) {
      if (!nightOpen(day)) return;
      onSelect(day, null); // move the start earlier
      return;
    }
    if (rangeHasClosedNight(checkIn, day)) {
      // Can't span a closed/occupied night — restart from this day if it's open.
      if (nightOpen(day)) onSelect(day, null);
      return;
    }
    onSelect(checkIn, day);
  };

  const canGoPrev = view.year > todayY || (view.year === todayY && view.month > todayM - 1);
  const shift = (delta: number) => {
    setView((v) => {
      const d = new Date(Date.UTC(v.year, v.month + delta, 1));
      return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
    });
  };

  const renderMonth = (offset: number) => {
    const d = new Date(Date.UTC(view.year, view.month + offset, 1));
    const year = d.getUTCFullYear();
    const month = d.getUTCMonth();
    const total = daysInMonth(year, month);
    const blanks = leadingBlanks(year, month);
    const cells: (string | null)[] = [
      ...Array(blanks).fill(null),
      ...Array.from({ length: total }, (_, i) => iso(year, month, i + 1)),
    ];

    return (
      <div key={`${year}-${month}`} className="min-w-0 flex-1">
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

            const isStart = day === checkIn;
            const isEnd = day === checkOut;
            const inRange =
              checkIn && checkOut && day > checkIn && day < checkOut;
            const closed = !availableSet.has(day);
            const past = day < todayISO;
            // Closed days are not selectable, except as a check-out after a
            // valid check-in (you leave that morning, so it needn't be open).
            const disabled = past || (closed && !(checkIn && !checkOut && day > checkIn));

            const base =
              "relative aspect-square rounded-lg text-sm transition flex items-center justify-center";
            let cls = "text-ink hover:bg-brand-light";
            if (disabled) cls = "text-ink/25 line-through cursor-not-allowed";
            if (inRange) cls = "bg-brand-light text-brand-dark";
            if (isStart || isEnd) cls = "bg-brand text-white font-semibold";

            return (
              <button
                key={i}
                type="button"
                disabled={disabled && !(isStart || isEnd)}
                onClick={() => handleClick(day)}
                className={`${base} ${cls}`}
                aria-label={day}
                aria-pressed={isStart || isEnd}
              >
                {Number(day.slice(-2))}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shift(-1)}
          disabled={!canGoPrev}
          className="btn btn-ghost px-2 py-1 disabled:opacity-30"
          aria-label="Previous month"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 6l-6 6 6 6" /></svg>
        </button>
        <span className="text-xs text-muted">Select your dates</span>
        <button
          type="button"
          onClick={() => shift(1)}
          className="btn btn-ghost px-2 py-1"
          aria-label="Next month"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 6l6 6-6 6" /></svg>
        </button>
      </div>

      <div className="flex flex-col gap-6 sm:flex-row">
        {Array.from({ length: months }, (_, i) => renderMonth(i))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-brand" /> Selected</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-brand-light" /> In range</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-cream-deep" /> Unavailable</span>
      </div>
    </div>
  );
}
