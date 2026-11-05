import { prisma } from "@/lib/prisma";
import { VisibilityToggle } from "@/components/admin/VisibilityToggle";
import { roomLabel } from "@/lib/room-label";

export const metadata = { title: "Show / hide rooms" };

// Simple, mobile-first control for showing or hiding rooms on the website.
// Big green (live) / red (hidden) buttons — designed to be easy to use on a
// phone. Tapping a room toggles its visibility.
export default async function VisibilityPage() {
  const rooms = await prisma.room.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, adminName: true, published: true },
  });
  const liveCount = rooms.filter((r) => r.published).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-brand-dark">Show / hide rooms</h1>
        <p className="mt-2 text-base text-ink/80">
          Tap a room to show it on the website or hide it.
        </p>
        <p className="mt-1 text-base">
          <span className="font-semibold text-brand">Green = live</span>{" "}
          <span className="text-muted">(guests can see it)</span>
          <span className="mx-2 text-muted">·</span>
          <span className="font-semibold text-red-600">Red = hidden</span>
        </p>
        <p className="mt-2 text-sm text-muted">
          {liveCount} of {rooms.length} room{rooms.length === 1 ? "" : "s"} live on the website.
        </p>
      </div>

      {rooms.length === 0 ? (
        <p className="rounded-xl bg-white p-8 text-center text-sm text-muted">No rooms yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {rooms.map((room) => (
            <VisibilityToggle key={room.id} id={room.id} name={roomLabel(room)} published={room.published} />
          ))}
        </div>
      )}
    </div>
  );
}
