"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { openDates, deleteAvailabilityWindow, type OpenDatesState } from "@/app/admin/actions";

function OpenButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" disabled={pending}>
      {pending ? "Opening…" : "Open these dates"}
    </button>
  );
}

export function OpenDatesForm({
  roomId,
  roomName,
  windows,
}: {
  roomId: string;
  roomName: string;
  windows: { id: string; label: string }[];
}) {
  const router = useRouter();
  const [state, formAction] = useActionState<OpenDatesState, FormData>(openDates, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [state.ok, router]);

  async function remove(id: string) {
    const fd = new FormData();
    fd.append("id", id);
    await deleteAvailabilityWindow(fd);
    router.refresh();
  }

  return (
    <div>
      <p className="text-sm text-muted">
        Rooms are <strong>closed by default</strong>. Guests can only request the
        dates you open here for <strong>{roomName}</strong>. To close specific days
        inside an open range, add a <em>Block</em> below.
      </p>

      <form ref={formRef} action={formAction} className="mt-4 flex flex-wrap items-end gap-3">
        <input type="hidden" name="roomId" value={roomId} />
        <div>
          <label className="label" htmlFor="open-start">Open from</label>
          <input id="open-start" name="start" type="date" className="input" required />
        </div>
        <div>
          <label className="label" htmlFor="open-end">Open until (checkout)</label>
          <input id="open-end" name="end" type="date" className="input" required />
        </div>
        <OpenButton />
      </form>
      {state.error && (
        <p className="mt-2 rounded-lg bg-orange/10 px-3 py-2 text-sm text-orange-dark">{state.error}</p>
      )}
      {state.ok && (
        <p className="mt-2 rounded-lg bg-brand-light px-3 py-2 text-sm text-brand-dark">Dates opened.</p>
      )}

      <div className="mt-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Open periods</h3>
        {windows.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No open dates yet — this room is fully closed to guests.</p>
        ) : (
          <ul className="mt-2 flex flex-wrap gap-2">
            {windows.map((w) => (
              <li key={w.id} className="flex items-center gap-2 rounded-full bg-brand-light px-3 py-1 text-sm text-brand-dark">
                {w.label}
                <button
                  type="button"
                  onClick={() => remove(w.id)}
                  className="text-orange-dark hover:text-orange"
                  aria-label="Remove open period"
                  title="Close this period"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
