"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { RangeCalendar } from "./RangeCalendar";
import { requestBooking, type BookingFormState } from "@/app/(site)/rooms/[slug]/actions";
import { formatPrice } from "@/lib/format";

function nightsBetween(a: string, b: string): number {
  const ms = new Date(`${b}T00:00:00Z`).getTime() - new Date(`${a}T00:00:00Z`).getTime();
  return Math.round(ms / 86400000);
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary w-full" disabled={disabled || pending}>
      {pending ? "Sending…" : "Request to book"}
    </button>
  );
}

export function BookingWidget({
  roomId,
  basePrice,
  currency,
  maxGuests,
  available,
  todayISO,
  breakfastIncluded,
}: {
  roomId: string;
  basePrice: number;
  currency: string;
  maxGuests: number;
  available: string[];
  todayISO: string;
  breakfastIncluded: boolean;
}) {
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [state, formAction] = useActionState<BookingFormState, FormData>(
    requestBooking,
    { ok: false }
  );

  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;
  const total = nights * basePrice;
  const ready = Boolean(checkIn && checkOut);

  const fmt = (s: string) =>
    new Date(`${s}T00:00:00Z`).toLocaleDateString("en-IE", {
      weekday: "short", day: "numeric", month: "short", timeZone: "UTC",
    });

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-2xl font-semibold text-ink">{formatPrice(basePrice, currency)}</span>
          <span className="text-muted"> / night</span>
        </div>
        {breakfastIncluded && (
          <span className="badge bg-brand-light text-brand-dark">Breakfast included</span>
        )}
      </div>

      {available.length === 0 ? (
        <div className="mt-5 rounded-xl bg-cream-deep/60 p-5 text-center text-sm text-muted">
          No dates are open for online booking right now. Please{" "}
          <a href="/contact" className="font-semibold text-brand hover:text-brand-dark">get in touch</a>{" "}
          and we&rsquo;ll be glad to help.
        </div>
      ) : (
        <div className="mt-5">
          <RangeCalendar
            available={available}
            todayISO={todayISO}
            checkIn={checkIn}
            checkOut={checkOut}
            onSelect={(ci, co) => {
              setCheckIn(ci);
              setCheckOut(co);
            }}
          />
        </div>
      )}

      {/* Selection summary */}
      <div className="mt-4 rounded-xl bg-cream-deep/60 p-4 text-sm">
        {ready ? (
          <>
            <div className="flex justify-between">
              <span className="text-muted">Check-in</span>
              <span className="font-medium">{fmt(checkIn!)} · from 3pm</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-muted">Check-out</span>
              <span className="font-medium">{fmt(checkOut!)} · by 11am</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-brand/10 pt-2">
              <span className="text-muted">
                {formatPrice(basePrice, currency)} × {nights} night{nights > 1 ? "s" : ""}
              </span>
              <span className="font-semibold">{formatPrice(total, currency)}</span>
            </div>
            <button
              type="button"
              onClick={() => { setCheckIn(null); setCheckOut(null); }}
              className="mt-2 text-xs font-medium text-brand hover:text-brand-dark"
            >
              Clear dates
            </button>
          </>
        ) : (
          <p className="text-muted">
            {checkIn ? "Now choose your check-out date." : "Pick your check-in date to begin."}
          </p>
        )}
      </div>

      {/* Guest details + submit */}
      <form action={formAction} className="mt-5 space-y-3">
        <input type="hidden" name="roomId" value={roomId} />
        <input type="hidden" name="checkIn" value={checkIn ?? ""} />
        <input type="hidden" name="checkOut" value={checkOut ?? ""} />

        <div>
          <label className="label" htmlFor="guestName">Your name</label>
          <input id="guestName" name="guestName" className="input" required autoComplete="name" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="guestEmail">Email</label>
            <input id="guestEmail" name="guestEmail" type="email" className="input" required autoComplete="email" />
          </div>
          <div>
            <label className="label" htmlFor="guestPhone">Phone</label>
            <input id="guestPhone" name="guestPhone" className="input" required autoComplete="tel" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="guests">Guests</label>
          <select id="guests" name="guests" className="input" defaultValue="2">
            {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n} guest{n > 1 ? "s" : ""}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="message">Anything we should know?</label>
          <textarea id="message" name="message" rows={3} className="input" required placeholder="Arrival time, dietary needs, special occasion…" />
        </div>

        {state.error && (
          <p className="rounded-lg bg-orange/10 px-3 py-2 text-sm text-orange-dark">{state.error}</p>
        )}

        <SubmitButton disabled={!ready} />
        <p className="text-center text-xs text-muted">
          This is a booking request, not a confirmation. No payment now — we&rsquo;ll
          email you to confirm your stay.
        </p>
      </form>
    </div>
  );
}
