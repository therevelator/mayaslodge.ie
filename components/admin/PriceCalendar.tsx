"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import { MonthGrid, type CalBooking } from "./MonthGrid";
import {
  setDayPrices,
  clearDayPrices,
  blockDates,
  unblockDates,
  setDatesOpen,
  createManualBooking,
} from "@/app/admin/actions";
import { formatPrice, parsePriceToCents } from "@/lib/format";

// The admin room calendar — everything is done from here:
// select a day (click) or a range (click a later day), then for the selection
// set a price, open/close it for guests, block/unblock it, or add a reservation.
// Days with a guest booking can't be selected; blocked days can (to unblock).

type Month = { year: number; month: number };
type Msg = { kind: "ok" | "error"; text: string } | null;

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

function nextDay(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

function shortDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

function nightsText(n: number) {
  return `${n} night${n === 1 ? "" : "s"}`;
}

export function PriceCalendar({
  roomId,
  maxGuests,
  months,
  bookings,
  openDays,
  todayISO,
  prices,
  basePrice,
  currency,
}: {
  roomId: string;
  maxGuests: number;
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
  const [showReservation, setShowReservation] = useState(false);
  const [message, setMessage] = useState<Msg>(null);
  const [pending, startTransition] = useTransition();

  // Instant feedback for price changes (server confirms in the background).
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

  // Nights taken by guest bookings (not selectable) vs. by owner blocks (selectable).
  const { bookedSet, blockedSet } = useMemo(() => {
    const booked = new Set<string>();
    const blocked = new Set<string>();
    for (const b of bookings) {
      const target = b.source === "BLOCK" ? blocked : booked;
      const d = new Date(b.checkIn);
      while (d < b.checkOut) {
        target.add(d.toISOString().slice(0, 10));
        d.setUTCDate(d.getUTCDate() + 1);
      }
    }
    return { bookedSet: booked, blockedSet: blocked };
  }, [bookings]);

  const days = useMemo(() => (start ? isoRange(start, end ?? start) : []), [start, end]);
  const selected = useMemo(() => new Set(days), [days]);
  const first = days[0];
  const last = days[days.length - 1];

  const counts = useMemo(
    () => ({
      custom: days.filter((d) => shownPrices[d] !== undefined).length,
      open: days.filter((d) => openSet.has(d)).length,
      blocked: days.filter((d) => blockedSet.has(d)).length,
    }),
    [days, shownPrices, openSet, blockedSet]
  );

  function prefillPrice(range: string[]) {
    const values = range.map((d) => shownPrices[d]);
    setPrice(values.length && values.every((v) => v !== undefined && v === values[0]) ? String(values[0]! / 100) : "");
  }

  function onDayClick(iso: string) {
    setMessage(null);
    if (bookedSet.has(iso)) return;
    if (!start || end || iso < start) {
      setStart(iso);
      setEnd(null);
      prefillPrice([iso]);
      return;
    }
    if (iso === start) return;
    const range = isoRange(start, iso);
    if (range.some((d) => bookedSet.has(d))) {
      setStart(iso);
      setEnd(null);
      prefillPrice([iso]);
      setMessage({ kind: "error", text: "That range crosses a guest booking, so a new selection was started." });
      return;
    }
    setEnd(iso);
    prefillPrice(range);
  }

  function clearSelection() {
    setStart(null);
    setEnd(null);
    setPrice("");
    setShowReservation(false);
  }

  /** Run a server action for the selection and report the result. */
  function run(action: () => Promise<{ ok?: boolean; error?: string }>, okText: string, keepSelection = false) {
    startTransition(async () => {
      const res = await action();
      if (res.error) {
        setMessage({ kind: "error", text: res.error });
        return;
      }
      if (!keepSelection) clearSelection();
      setMessage({ kind: "ok", text: okText });
    });
  }

  function applyPrice(kind: "set" | "reset") {
    const dates = days;
    const cents = kind === "set" ? parsePriceToCents(price) : null;
    startTransition(async () => {
      if (kind === "reset" || (cents && cents > 0)) {
        applyLocal({ dates, cents });
        clearSelection();
      }
      const res = kind === "set" ? await setDayPrices(roomId, dates, price) : await clearDayPrices(roomId, dates);
      setMessage(
        res.error
          ? { kind: "error", text: res.error }
          : {
              kind: "ok",
              text: kind === "set" ? `Price saved for ${nightsText(dates.length)}.` : `${nightsText(dates.length)} back to the standard price.`,
            }
      );
    });
  }

  const rangeLabel = days.length === 1 ? shortDate(first) : days.length ? `${shortDate(first)} – ${shortDate(last)}` : "";
  const canReserve = days.length > 0 && counts.blocked === 0;

  return (
    <div className="card p-5 sm:p-6">
      <p className="mb-4 text-sm text-muted">
        Click a day to select it, then click a later day to select the whole range. Days with a guest booking can&rsquo;t be selected.
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
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded border border-brand/15 bg-cream-deep/70" /> Closed to guests</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded border border-brand/15 bg-white" /> Open to guests</span>
        <span className="flex items-center gap-1.5"><span className="font-semibold text-orange-dark">€</span> Custom price</span>
        <span className="flex items-center gap-1.5"><span className="text-ink/40">€</span> Standard price</span>
      </div>

      <div className="mt-5 rounded-xl bg-cream-deep/60 p-4">
        {days.length === 0 ? (
          <p className="text-sm text-muted">
            Standard price: <strong className="text-ink">{formatPrice(basePrice, currency)}</strong> / night. Select a day
            or a range to change its price, open or close it for guests, block it, or add a reservation.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm text-ink">
                <strong>{nightsText(days.length)} selected</strong>
                <span className="text-muted"> · {rangeLabel}</span>
              </p>
              <button type="button" className="text-xs font-medium text-brand hover:text-brand-dark" onClick={clearSelection}>
                Clear selection
              </button>
            </div>
            {!end && <p className="-mt-3 text-xs text-muted">Click a later day to extend this to a range.</p>}

            {/* Price */}
            <form
              className="flex flex-wrap items-end gap-3"
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
              <button type="submit" className="btn btn-primary" disabled={pending}>Set price</button>
              {counts.custom > 0 && (
                <button type="button" className="btn btn-outline" disabled={pending} onClick={() => applyPrice("reset")}>
                  Use standard price
                </button>
              )}
            </form>

            {/* Availability + blocking */}
            <div className="flex flex-wrap gap-2 border-t border-brand/10 pt-4">
              {counts.open < days.length && (
                <button
                  type="button"
                  className="btn btn-outline"
                  disabled={pending}
                  onClick={() => run(() => setDatesOpen(roomId, first, last, true), `${rangeLabel} open for guests.`)}
                >
                  Open for guests
                </button>
              )}
              {counts.open > 0 && (
                <button
                  type="button"
                  className="btn btn-outline"
                  disabled={pending}
                  onClick={() => run(() => setDatesOpen(roomId, first, last, false), `${rangeLabel} closed for guests.`)}
                >
                  Close for guests
                </button>
              )}
              {counts.blocked < days.length && (
                <button
                  type="button"
                  className="btn bg-charcoal text-white hover:bg-charcoal/90"
                  disabled={pending}
                  onClick={() => run(() => blockDates(roomId, first, last), `${rangeLabel} blocked.`)}
                >
                  {days.length === 1 ? "Block this day" : "Block these dates"}
                </button>
              )}
              {counts.blocked > 0 && (
                <button
                  type="button"
                  className="btn btn-outline"
                  disabled={pending}
                  onClick={() => run(() => unblockDates(roomId, first, last), `${rangeLabel} unblocked.`)}
                >
                  Unblock
                </button>
              )}
              {canReserve && !showReservation && (
                <button type="button" className="btn btn-outline" disabled={pending} onClick={() => setShowReservation(true)}>
                  Add reservation
                </button>
              )}
            </div>

            {/* Manual reservation for the selected nights */}
            {canReserve && showReservation && (
              <form
                className="grid gap-3 border-t border-brand/10 pt-4 sm:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  fd.set("roomId", roomId);
                  fd.set("checkIn", first);
                  fd.set("checkOut", nextDay(last));
                  run(
                    () => createManualBooking({}, fd),
                    `Reservation added: check-in ${shortDate(first)}, check-out ${shortDate(nextDay(last))}.`
                  );
                }}
              >
                <p className="text-sm text-ink sm:col-span-2">
                  Check-in <strong>{shortDate(first)}</strong> → check-out <strong>{shortDate(nextDay(last))}</strong>{" "}
                  <span className="text-muted">({nightsText(days.length)})</span>
                </p>
                <div>
                  <label className="label" htmlFor="res-name">Guest name</label>
                  <input id="res-name" name="guestName" className="input" required />
                </div>
                <div>
                  <label className="label" htmlFor="res-source">From</label>
                  <select id="res-source" name="source" className="input" defaultValue="MANUAL">
                    <option value="MANUAL">Phone / email / walk-in</option>
                    <option value="BOOKING_COM">Booking.com</option>
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="res-phone">Phone (optional)</label>
                  <input id="res-phone" name="guestPhone" className="input" inputMode="tel" />
                </div>
                <div>
                  <label className="label" htmlFor="res-email">Email (optional)</label>
                  <input id="res-email" name="guestEmail" type="email" className="input" />
                </div>
                <div>
                  <label className="label" htmlFor="res-guests">Guests</label>
                  <select id="res-guests" name="guests" className="input" defaultValue={String(Math.min(2, maxGuests))}>
                    {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="res-note">Note (optional)</label>
                  <input id="res-note" name="message" className="input" />
                </div>
                <div className="flex gap-2 sm:col-span-2">
                  <button type="submit" className="btn btn-primary" disabled={pending}>
                    {pending ? "Saving…" : "Save reservation"}
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowReservation(false)}>Cancel</button>
                </div>
              </form>
            )}
          </div>
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
