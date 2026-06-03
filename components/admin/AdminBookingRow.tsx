"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { StatusBadge, SourceBadge } from "@/components/admin/StatusBadge";
import { BookingMeta, type BookingMetaData } from "@/components/admin/BookingMeta";
import {
  setBookingStatus,
  deleteBooking,
  updateBooking,
  type ManualBookingState,
} from "@/app/admin/actions";

export type RowBooking = {
  id: string;
  roomId: string;
  guestName: string;
  guestEmail: string | null;
  guestPhone: string | null;
  checkInISO: string;
  checkOutISO: string;
  guests: number;
  status: string;
  source: string;
  message: string | null;
  nights: number;
  dateLabel: string; // pre-formatted "Mon 15 Jun → Thu 18 Jun · 3 night(s)"
  meta?: BookingMetaData;
};

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary px-4 py-1.5 text-sm" disabled={pending}>
      {pending ? "Saving…" : "Save changes"}
    </button>
  );
}

export function AdminBookingRow({
  booking,
  rooms,
}: {
  booking: RowBooking;
  rooms: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [state, formAction] = useActionState<ManualBookingState, FormData>(updateBooking, {});

  useEffect(() => {
    if (state.ok) {
      setEditing(false);
      router.refresh();
    }
  }, [state.ok, router]);

  if (editing) {
    return (
      <div className="card p-4">
        <form action={formAction} className="grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="id" value={booking.id} />
          <div>
            <label className="label">Room</label>
            <select name="roomId" className="input" defaultValue={booking.roomId}>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Type</label>
            <select name="source" className="input" defaultValue={booking.source}>
              <option value="WEBSITE">Website</option>
              <option value="MANUAL">Manual</option>
              <option value="BLOCK">Blocked</option>
            </select>
          </div>
          <div>
            <label className="label">Guest name / label</label>
            <input name="guestName" className="input" defaultValue={booking.guestName} required />
          </div>
          <div>
            <label className="label">Status</label>
            <select name="status" className="input" defaultValue={booking.status}>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="DECLINED">Declined</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="label">Check-in</label>
            <input name="checkIn" type="date" className="input" defaultValue={booking.checkInISO} required />
          </div>
          <div>
            <label className="label">Check-out</label>
            <input name="checkOut" type="date" className="input" defaultValue={booking.checkOutISO} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input name="guestEmail" type="email" className="input" defaultValue={booking.guestEmail ?? ""} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input name="guestPhone" className="input" defaultValue={booking.guestPhone ?? ""} />
          </div>
          <div>
            <label className="label">Guests</label>
            <input name="guests" type="number" min={0} className="input w-28" defaultValue={booking.guests} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Note</label>
            <input name="message" className="input" defaultValue={booking.message ?? ""} />
          </div>

          {state.error && (
            <p className="sm:col-span-2 rounded-lg bg-orange/10 px-3 py-2 text-sm text-orange-dark">{state.error}</p>
          )}

          <div className="sm:col-span-2 flex gap-2">
            <SaveButton />
            <button type="button" onClick={() => setEditing(false)} className="btn btn-ghost px-4 py-1.5 text-sm">Cancel</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-ink">{booking.guestName}</span>
          <StatusBadge status={booking.status} />
          <SourceBadge source={booking.source} />
        </div>
        <div className="mt-1 text-sm text-muted">{booking.dateLabel}</div>
        {(booking.guestEmail || booking.guestPhone) && (
          <div className="mt-1 text-xs text-muted">
            {booking.guestEmail}
            {booking.guestEmail && booking.guestPhone ? " · " : ""}
            {booking.guestPhone}
          </div>
        )}
        {booking.message && <p className="mt-1.5 text-sm text-ink/70">“{booking.message}”</p>}
        {booking.meta && <BookingMeta data={booking.meta} />}
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        {booking.status === "PENDING" && (
          <>
            <StatusForm id={booking.id} status="CONFIRMED" label="Confirm" variant="primary" />
            <StatusForm id={booking.id} status="DECLINED" label="Decline" variant="outline" />
          </>
        )}
        {booking.status === "CONFIRMED" && (
          <StatusForm id={booking.id} status="CANCELLED" label="Cancel" variant="outline" />
        )}
        <button type="button" onClick={() => setEditing(true)} className="btn btn-outline px-3 py-1.5 text-sm">Edit</button>
        <form action={deleteBooking}>
          <input type="hidden" name="id" value={booking.id} />
          <button className="btn btn-ghost px-3 py-1.5 text-sm text-orange-dark">Delete</button>
        </form>
      </div>
    </div>
  );
}

function StatusForm({
  id, status, label, variant,
}: {
  id: string; status: string; label: string; variant: "primary" | "outline";
}) {
  return (
    <form action={setBookingStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button className={`btn btn-${variant} px-3 py-1.5 text-sm`}>{label}</button>
    </form>
  );
}
