"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MonthGrid, type CalBooking } from "./MonthGrid";
import { setDayPrices, clearDayPrices } from "@/app/admin/actions";
import { formatPrice } from "@/lib/format";

// The admin room calendar: two months side by side. The owner can select one
// or more days and give those nights a custom price, or reset them to the
// room's standard price.

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
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [anchor, setAnchor] = useState<string | null>(null);
  const [rangeMode, setRangeMode] = useState(false);
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const openSet = useMemo(() => new Set(openDays), [openDays]);
  const sorted = useMemo(() => Array.from(selected).sort(), [selected]);

  function onDayClick(iso: string, shiftKey: boolean) {
    setMessage(null);
    const next = new Set(selected);
    if ((shiftKey || rangeMode) && anchor) {
      for (const d of isoRange(anchor, iso)) if (d >= todayISO) next.add(d);
      setAnchor(rangeMode ? null : iso);
    } else {
      if (next.has(iso)) next.delete(iso);
      else next.add(iso);
      setAnchor(iso);
    }
    setSelected(next);

    // Pre-fill the price box when every selected night has the same custom price.
    const values = Array.from(next).map((d) => prices[d]);
    if (values.length && values.every((v) => v !== undefined && v === values[0])) {
      setPrice(String(values[0]! / 100));
    }
  }

  function clearSelection() {
    setSelected(new Set());
    setAnchor(null);
    setPrice("");
  }

  function apply(kind: "set" | "reset") {
    const dates = sorted;
    startTransition(async () => {
      const res =
        kind === "set"
          ? await setDayPrices(roomId, dates, price)
          : await clearDayPrices(roomId, dates);
      if (res.error) {
        setMessage({ kind: "error", text: res.error });
        return;
      }
      setMessage({
        kind: "ok",
        text:
          kind === "set"
            ? `Price saved for ${dates.length} night${dates.length > 1 ? "s" : ""}.`
            : `${dates.length} night${dates.length > 1 ? "s" : ""} back to the standard price.`,
      });
      clearSelection();
      router.refresh();
    });
  }

  const customCount = sorted.filter((d) => prices[d] !== undefined).length;

  return (
    <div className="card p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className="text-muted">
          Click days to select them. <span className="hidden sm:inline">Shift+click selects a range.</span>
        </p>
        <label className="flex cursor-pointer items-center gap-2 text-ink/80">
          <input
            type="checkbox"
            checked={rangeMode}
            onChange={(e) => {
              setRangeMode(e.target.checked);
              setAnchor(null);
            }}
          />
          Range: tap first and last day
        </label>
      </div>

      <div className="flex flex-col gap-8 sm:flex-row">
        {months.map((m) => (
          <MonthGrid
            key={`${m.year}-${m.month}`}
            year={m.year}
            month={m.month}
            bookings={bookings}
            openDays={openSet}
            todayISO={todayISO}
            prices={prices}
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
      </div>

      {/* Price panel */}
      <div className="mt-5 rounded-xl bg-cream-deep/60 p-4">
        {sorted.length === 0 ? (
          <p className="text-sm text-muted">
            Standard price for this room: <strong className="text-ink">{formatPrice(basePrice, currency)}</strong> / night.
            Select days above to give those nights a different price.
          </p>
        ) : (
          <>
            <p className="text-sm text-ink">
              <strong>{sorted.length} night{sorted.length > 1 ? "s" : ""} selected</strong>
              <span className="text-muted">
                {" "}· {sorted.length === 1 ? shortDate(sorted[0]) : `${shortDate(sorted[0])} – ${shortDate(sorted[sorted.length - 1])}`}
                {customCount > 0 && ` · ${customCount} with a custom price`}
              </span>
            </p>
            <p className="mt-1 text-xs text-muted">
              Each day&rsquo;s price is for the night starting that day. Standard price: {formatPrice(basePrice, currency)}.
            </p>
            <form
              className="mt-3 flex flex-wrap items-end gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                apply("set");
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
                <button type="button" className="btn btn-outline" disabled={pending} onClick={() => apply("reset")}>
                  Use standard price
                </button>
              )}
              <button type="button" className="btn btn-ghost" disabled={pending} onClick={clearSelection}>
                Clear selection
              </button>
            </form>
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
