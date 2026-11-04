"use client";

import { useOptimistic, startTransition } from "react";
import { toggleRoomPublished } from "@/app/admin/actions";

// Big green/red show-hide button. Flips instantly (optimistic) while the
// change is saved in the background; if saving fails it flips back.
export function VisibilityToggle({
  id,
  name,
  published,
}: {
  id: string;
  name: string;
  published: boolean;
}) {
  const [live, setLive] = useOptimistic(published);

  return (
    <button
      type="button"
      onClick={() =>
        startTransition(async () => {
          setLive(!live);
          const fd = new FormData();
          fd.append("id", id);
          await toggleRoomPublished(fd);
        })
      }
      className={`flex w-full flex-col items-center justify-center gap-3 rounded-3xl px-5 py-10 text-center text-white shadow-sm transition active:scale-[0.98] ${
        live ? "bg-brand hover:bg-brand-dark" : "bg-red-600 hover:bg-red-700"
      }`}
    >
      <span className="text-2xl font-bold leading-tight">{name}</span>
      <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-5 py-2 text-lg font-bold tracking-wide">
        <span className="h-3 w-3 rounded-full bg-white" />
        {live ? "LIVE" : "HIDDEN"}
      </span>
      <span className="text-sm font-medium text-white/85">
        {live ? "Tap to hide it" : "Tap to show it"}
      </span>
    </button>
  );
}
