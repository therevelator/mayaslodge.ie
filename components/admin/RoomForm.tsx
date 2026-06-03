"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { saveRoom, type RoomFormState } from "@/app/admin/actions";
import { ROOM_TYPES, BED_TYPES } from "@/lib/constants";

type BedRow = { type: string; quantity: number };

type AmenityOption = { key: string; label: string; category: string | null };

type RoomData = {
  id: string;
  name: string;
  slug: string;
  roomType: string;
  shortDesc: string | null;
  description: string;
  maxGuests: number;
  bedConfig: string | null;
  sizeSqm: number | null;
  basePrice: number;
  published: boolean;
  sortOrder: number;
};

function SaveButton({ isNew }: { isNew: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" disabled={pending}>
      {pending ? "Saving…" : isNew ? "Create room" : "Save changes"}
    </button>
  );
}

export function RoomForm({
  room,
  amenities,
  selectedKeys,
  beds: initialBeds = [],
}: {
  room?: RoomData;
  amenities: AmenityOption[];
  beds?: BedRow[];
  selectedKeys: string[];
}) {
  const [state, formAction] = useActionState<RoomFormState, FormData>(saveRoom, {});
  const selected = new Set(selectedKeys);
  const isNew = !room;

  const [beds, setBeds] = useState<BedRow[]>(initialBeds);
  const addBed = () => setBeds((b) => [...b, { type: "Double", quantity: 1 }]);
  const updateBed = (i: number, patch: Partial<BedRow>) =>
    setBeds((b) => b.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  const removeBed = (i: number) => setBeds((b) => b.filter((_, idx) => idx !== i));

  const grouped = amenities.reduce<Record<string, AmenityOption[]>>((acc, a) => {
    const k = a.category ?? "Other";
    (acc[k] ??= []).push(a);
    return acc;
  }, {});

  return (
    <form action={formAction} className="space-y-8">
      {room && <input type="hidden" name="id" value={room.id} />}

      <section className="card p-6">
        <h2 className="text-lg font-semibold text-brand-dark">Basics</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="name">Room name</label>
            <input id="name" name="name" className="input" required defaultValue={room?.name} placeholder="The Shamrock Room" />
          </div>
          <div>
            <label className="label" htmlFor="roomType">Room type</label>
            <select id="roomType" name="roomType" className="input" defaultValue={room?.roomType ?? "Double"}>
              {ROOM_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="basePrice">Price per night (€)</label>
            <input id="basePrice" name="basePrice" className="input" required inputMode="decimal" defaultValue={room ? (room.basePrice / 100).toString() : ""} placeholder="95" />
          </div>
          <div>
            <label className="label" htmlFor="maxGuests">Max guests</label>
            <input id="maxGuests" name="maxGuests" type="number" min={1} max={20} className="input" defaultValue={room?.maxGuests ?? 2} />
          </div>
          {/* Legacy free-text bed note is preserved but beds are now managed below. */}
          <input type="hidden" name="bedConfig" value={room?.bedConfig ?? ""} />
          <div>
            <label className="label" htmlFor="sizeSqm">Size (m², optional)</label>
            <input id="sizeSqm" name="sizeSqm" type="number" min={0} className="input" defaultValue={room?.sizeSqm ?? ""} placeholder="18" />
          </div>
          <div>
            <label className="label" htmlFor="sortOrder">Display order</label>
            <input id="sortOrder" name="sortOrder" type="number" className="input" defaultValue={room?.sortOrder ?? 0} />
          </div>
          {room && (
            <div className="sm:col-span-2">
              <label className="label" htmlFor="slug">URL slug</label>
              <input id="slug" name="slug" className="input" defaultValue={room.slug} />
              <p className="mt-1 text-xs text-muted">/rooms/{room.slug}</p>
            </div>
          )}
        </div>
      </section>

      <section className="card p-6">
        <input type="hidden" name="beds" value={JSON.stringify(beds)} />
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-brand-dark">Beds</h2>
            <p className="mt-1 text-sm text-muted">Add as many beds as the room has.</p>
          </div>
          <button type="button" onClick={addBed} className="btn btn-outline px-3 py-1.5 text-sm">+ Add bed</button>
        </div>

        {beds.length === 0 ? (
          <p className="mt-4 rounded-lg bg-cream-deep/50 px-4 py-3 text-sm text-muted">
            No beds added yet. Click <strong>+ Add bed</strong> to add one or more.
          </p>
        ) : (
          <div className="mt-4 space-y-2">
            {beds.map((bed, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={bed.quantity}
                  onChange={(e) => updateBed(i, { quantity: Math.max(1, Number(e.target.value) || 1) })}
                  className="input w-20"
                  aria-label="Quantity"
                />
                <span className="text-muted">×</span>
                <select
                  value={bed.type}
                  onChange={(e) => updateBed(i, { type: e.target.value })}
                  className="input max-w-xs"
                  aria-label="Bed type"
                >
                  {BED_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeBed(i)}
                  className="btn btn-ghost px-2 py-1.5 text-sm text-orange-dark"
                  aria-label="Remove bed"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-semibold text-brand-dark">Description</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="label" htmlFor="shortDesc">Short teaser (shown on cards)</label>
            <input id="shortDesc" name="shortDesc" className="input" maxLength={200} defaultValue={room?.shortDesc ?? ""} placeholder="A bright double with ensuite and countryside views." />
          </div>
          <div>
            <label className="label" htmlFor="description">Full description</label>
            <textarea id="description" name="description" rows={6} className="input" required defaultValue={room?.description} />
          </div>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-semibold text-brand-dark">Amenities</h2>
        <p className="mt-1 text-sm text-muted">Tick everything this room offers — including the private/shared bathroom.</p>
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(grouped).map(([cat, list]) => (
            <div key={cat}>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">{cat}</h3>
              <div className="mt-2 space-y-1.5">
                {list.map((a) => (
                  <label key={a.key} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="amenityKeys"
                      value={a.key}
                      defaultChecked={selected.has(a.key)}
                      className="h-4 w-4 rounded border-brand/30 text-brand accent-[var(--color-brand)]"
                    />
                    {a.label}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-6">
        <label className="flex items-center gap-3">
          <input type="checkbox" name="published" defaultChecked={room?.published ?? true} className="h-4 w-4 accent-[var(--color-brand)]" />
          <span className="text-sm font-medium text-ink">Published (visible on the website)</span>
        </label>
      </section>

      {state.error && (
        <p className="rounded-lg bg-orange/10 px-3 py-2 text-sm text-orange-dark">{state.error}</p>
      )}

      <div className="flex items-center gap-3">
        <SaveButton isNew={isNew} />
        <a href="/admin/rooms" className="btn btn-ghost">Cancel</a>
      </div>
    </form>
  );
}
