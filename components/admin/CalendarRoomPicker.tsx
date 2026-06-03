"use client";

import { useRouter } from "next/navigation";

export function CalendarRoomPicker({
  rooms,
  selectedId,
  month,
}: {
  rooms: { id: string; name: string }[];
  selectedId: string;
  month: string;
}) {
  const router = useRouter();
  return (
    <select
      className="input max-w-xs"
      value={selectedId}
      onChange={(e) =>
        router.push(`/admin/calendar?room=${e.target.value}&month=${month}`)
      }
      aria-label="Choose room"
    >
      {rooms.map((r) => (
        <option key={r.id} value={r.id}>{r.name}</option>
      ))}
    </select>
  );
}
