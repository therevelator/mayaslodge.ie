"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { createManualBooking, type ManualBookingState } from "@/app/admin/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" disabled={pending}>
      {pending ? "Saving…" : "Add reservation"}
    </button>
  );
}

export function AddReservationForm({
  rooms,
  defaultRoomId,
}: {
  rooms: { id: string; name: string }[];
  defaultRoomId?: string;
}) {
  const [state, formAction] = useActionState<ManualBookingState, FormData>(
    createManualBooking,
    {}
  );
  const [source, setSource] = useState("MANUAL");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  const isBlock = source === "BLOCK";

  return (
    <form ref={formRef} action={formAction} className="grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="label">Type</label>
        <div className="flex gap-2">
          {[
            { v: "MANUAL", l: "Reservation" },
            { v: "BLOCK", l: "Block dates" },
          ].map((o) => (
            <label
              key={o.v}
              className={`flex-1 cursor-pointer rounded-lg border px-3 py-2 text-center text-sm font-medium ${
                source === o.v
                  ? "border-brand bg-brand-light text-brand-dark"
                  : "border-brand/15 text-ink/70"
              }`}
            >
              <input
                type="radio"
                name="source"
                value={o.v}
                checked={source === o.v}
                onChange={() => setSource(o.v)}
                className="sr-only"
              />
              {o.l}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="label" htmlFor="ar-room">Room</label>
        <select id="ar-room" name="roomId" className="input" required defaultValue={defaultRoomId}>
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="ar-name">{isBlock ? "Reason / label" : "Guest name"}</label>
        <input id="ar-name" name="guestName" className="input" required defaultValue={isBlock ? "Blocked" : ""} />
      </div>

      <div>
        <label className="label" htmlFor="ar-in">Check-in</label>
        <input id="ar-in" name="checkIn" type="date" className="input" required />
      </div>
      <div>
        <label className="label" htmlFor="ar-out">Check-out</label>
        <input id="ar-out" name="checkOut" type="date" className="input" required />
      </div>

      {!isBlock && (
        <>
          <div>
            <label className="label" htmlFor="ar-email">Email (optional)</label>
            <input id="ar-email" name="guestEmail" type="email" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="ar-phone">Phone (optional)</label>
            <input id="ar-phone" name="guestPhone" className="input" />
          </div>
        </>
      )}

      <div className={isBlock ? "sm:col-span-2" : "sm:col-span-2"}>
        <label className="label" htmlFor="ar-guests">Guests</label>
        <input id="ar-guests" name="guests" type="number" min={0} defaultValue={isBlock ? 0 : 2} className="input w-28" />
      </div>

      <div className="sm:col-span-2">
        <label className="label" htmlFor="ar-note">Note (optional)</label>
        <input id="ar-note" name="message" className="input" />
      </div>

      {state.error && (
        <p className="sm:col-span-2 rounded-lg bg-orange/10 px-3 py-2 text-sm text-orange-dark">{state.error}</p>
      )}
      {state.ok && (
        <p className="sm:col-span-2 rounded-lg bg-brand-light px-3 py-2 text-sm text-brand-dark">Reservation added.</p>
      )}

      <div className="sm:col-span-2">
        <SubmitButton />
      </div>
    </form>
  );
}
