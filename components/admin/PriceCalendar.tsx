"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import { MonthGrid, type CalBooking } from "./MonthGrid";
import { setDayPrices, clearDayPrices, blockDates } from "@/app/admin/actions";
import { formatPrice, parsePriceToCents } from "@/lib/format";

// The admin room calendar: two months side by side.
//
// Selecting: click a day to select it; click a later day to extend the
// selection to that range (both days included); click again to start over.
// Days that already have a booking or block (pending included) can't be
// selected, so their price can't be changed and they can't be double-blocked.
//
// For the selection the owner can set a custom nightly price, go back to the
// standard price, or block the room.

type Month = { year: number; month: number };

function isoRange(a: string, b: string): string[] {
  const [start, end] = a <= b ? [a, b] : [b, a];
  const out: string[] = [];
  const d = new Date(`${start}T00:00:00Z`);
  const last = new Date(`${end}T00:00:00Z`);
  while (d <= last) {
    out.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

function shortDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export function PriceCalendar({
  roomId,
  months,
  bookings,
  openDays,
  todayISO,
  prices,
  basePrice,
  currency,
}: {
  roomId: string;
  months: Month[];
  bookings: CalBooking[];
  openDays: string[];
  todayISO: string;
  prices: Record<string, number>;
  basePrice: number;
  currency: string;
}) {
  const [start, setStart] = useState<string | null>(null);
  const [end, setEnd] = useState<string | null>(null);
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  // Show saved prices instantly; the server confirms in the background and the
  // real data replaces this when it arrives (or it rolls back on error).
  const [shownPrices, applyLocal] = useOptimistic(
    prices,
    (current, change: { dates: string[]; cents: number | null }) => {
      const next = { ...current };
      for (const d of change.dates) {
        if (change.cents === null) delete next[d];
        else next[d] = change.cents;
      }
      return next;
    }
  );

  const openSet = useMemo(() => new Set(openDays), [openDays]);

  // Every night taken by a pending/confirmed booking or a block.
  const bookedSet = useMemo(() => {
    const set = new Set<string>();
    for (const b of bookings) {
      const d = new Date(b.checkIn);
      while (d < b.checkOut) {
        set.add(d.toISOString().slice(0, 10));
        d.setUTCDate(d.getUTCDate() + 1);
      }
    }
    return set;
  }, [bookings]);

  const days = useMemo(() => (start ? isoRange(start, end ?? start) : []), [start, end]);
  const selected = useMemo(() => new Set(days), [days]);
  const first = days[0];
  const last = days[days.length - 1];

  function prefillPrice(range: string[]) {
    const values = range.map((d) => shownPrices[d]);
    if (values.length && values.every((v) => v !== undefined && v === values[0])) {
      setPrice(String(values[0]! / 100));
    } else {
      setPrice("");
    }
  }

  function onDayClick(iso: string) {
    setMessage(null);
    if (bookedSet.has(iso)) return; // MonthGrid doesn't offer these, but be safe.

    // Start a new selection: nothing selected yet, a range already chosen, or
    // the new day is before the current start.
    if (!start || end || iso < start) {
      setStart(iso);
      setEnd(null);
      prefillPrice([iso]);
      return;
    }
    // Same day again: keep the single-day selection.
    if (iso === start) return;

    const range = isoRange(start, iso);
    if (range.some((d) => bookedSet.has(d))) {
      setStart(iso);
      setEnd(null);
      prefillPrice([iso]);
      setMessage({ kind: "error", text: "That range crosses booked days, so I started a new selection." });
      return;
    }
    setEnd(iso);
    prefillPrice(range);
  }

  function clearSelection() {
    setStart(null);
    setEnd(null);
    setPrice("");
  }

  const nightsLabel = `${days.length} night${days.length > 1 ? "s" : ""}`;

  function applyPrice(kind: "set" | "reset") {
    const dates = days;
    const cents = kind === "set" ? parsePriceToCents(price) : null;
    startTransition(async () => {
      if (kind === "reset" || (cents && cents > 0)) {
        applyLocal({ dates, cents });
        clearSelection();
      }
      const res =
        kind === "set" ? await setDayPrices(roomId, dates, price) : await clearDayPrices(roomId, dates);
      setMessage(
        res.error
          ? { kind: "error", text: res.error }
          : {
              kind: "ok",
              text:
                kind === "set"
                  ? `Price saved for ${dates.length} night${dates.length > 1 ? "s" : ""}.`
                  : `${dates.length} night${dates.length > 1 ? "s" : ""} back to the standard price.`,
            }
      );
    });
  }

  function block() {
    if (!first || !last) return;
    const [from, to, count] = [first, last, days.length];
    startTransition(async () => {
      const res = await blockDates(roomId, from, to);
      if (res.error) {
        setMessage({ kind: "error", text: res.error });
        return;
      }
      clearSelection();
      setMessage({
        kind: "ok",
        text: `Room blocked for ${count} night${count > 1 ? "s" : ""} (${shortDate(from)}${count > 1 ? ` – ${shortDate(to)}` : ""}). To unblock, delete the block in the list below.`,
      });
    });
  }

  const customCount = days.filter((d) => shownPrices[d] !== undefined).length;

  return (
    <div className="card p-5 sm:p-6">
      <p className="mb-4 text-sm text-muted">
        Click a day to select it. Click a later day to select the whole range. Booked days can&rsquo;t be selected.
      </p>

      <div className="flex flex-col gap-8 sm:flex-row">
        {months.map((m) => (
          <MonthGrid
            key={`${m.year}-${m.month}`}
            year={m.year}
            month={m.month}
            bookings={bookings}
            openDays={openSet}
            todayISO={todayISO}
            prices={shownPrices}
            basePrice={basePrice}
            currency={currency}
            selected={selected}
            onDayClick={onDayClick}
          />
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-4 border-t border-brand/10 pt-4 text-xs text-muted">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-brand" /> Confirmed</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-orange" /> Pending</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-charcoal" /> Blocked</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded border border-brand/15 bg-cream-deep/70" /> Closed</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded border border-brand/15 bg-white" /> Open</span>
        <span className="flex items-center gap-1.5"><span className="font-semibold text-orange-dark">€</span> Custom price</span>
        <span className="flex items-center gap-1.5"><span className="text-ink/40">€</span> Standard price</span>
      </div>

      {/* Actions for the selection */}
      <div className="mt-5 rounded-xl bg-cream-deep/60 p-4">
        {days.length === 0 ? (
          <p className="text-sm text-muted">
            Standard price for this room: <strong className="text-ink">{formatPrice(basePrice, currency)}</strong> / night.
            Select a day or a range to change its price or block the room.
          </p>
        ) : (
          <>
            <p className="text-sm text-ink">
              <strong>{nightsLabel} selected</strong>
              <span className="text-muted">
                {" "}· {days.length === 1 ? shortDate(first) : `${shortDate(first)} – ${shortDate(last)}`}
                {customCount > 0 && ` · ${customCount} with a custom price`}
              </span>
            </p>
            {!end && (
              <p className="mt-1 text-xs text-muted">Click a later day to extend this to a range.</p>
            )}

            <form
              className="mt-3 flex flex-wrap items-end gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                applyPrice("set");
              }}
            >
              <div>
                <label className="label" htmlFor="day-price">Price per night (€)</label>
                <input
                  id="day-price"
                  className="input w-32"
                  inputMode="decimal"
                  placeholder={String(basePrice / 100)}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={pending}>
                {pending ? "Saving…" : "Set price"}
              </button>
              {customCount > 0 && (
                <button type="button" className="btn btn-outline" disabled={pending} onClick={() => applyPrice("reset")}>
                  Use standard price
                </button>
              )}
            </form>

            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-brand/10 pt-4">
              <button
                type="button"
                className="btn bg-charcoal text-white hover:bg-charcoal/90"
                disabled={pending}
                onClick={block}
              >
                {pending ? "Working…" : days.length === 1 ? "Block this day" : "Block these dates"}
              </button>
              <button type="button" className="btn btn-ghost" disabled={pending} onClick={clearSelection}>
                Clear selection
              </button>
              <span className="text-xs text-muted">Blocking stops guests booking these nights.</span>
            </div>
          </>
        )}
        {message && (
          <p
            className={`mt-3 rounded-lg px-3 py-2 text-sm ${
              message.kind === "ok" ? "bg-brand-light text-brand-dark" : "bg-orange/10 text-orange-dark"
            }`}
          >
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
}
