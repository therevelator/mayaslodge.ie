import { prisma } from "@/lib/prisma";
import { toggleRoomPublished } from "@/app/admin/actions";

export const metadata = { title: "Show / hide rooms" };

// Simple, mobile-first control for showing or hiding rooms on the website.
// Big green (live) / red (hidden) buttons — designed to be easy to use on a
// phone. Tapping a room toggles its visibility.
export default async function VisibilityPage() {
  const rooms = await prisma.room.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, published: true },
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
            <form key={room.id} action={toggleRoomPublished}>
              <input type="hidden" name="id" value={room.id} />
              <button
                type="submit"
                className={`flex w-full flex-col items-center justify-center gap-3 rounded-3xl px-5 py-10 text-center text-white shadow-sm transition active:scale-[0.98] ${
                  room.published
                    ? "bg-brand hover:bg-brand-dark"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                <span className="text-2xl font-bold leading-tight">{room.name}</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-5 py-2 text-lg font-bold tracking-wide">
                  <span className="h-3 w-3 rounded-full bg-white" />
                  {room.published ? "LIVE" : "HIDDEN"}
                </span>
                <span className="text-sm font-medium text-white/85">
                  {room.published ? "Tap to hide it" : "Tap to show it"}
                </span>
              </button>
            </form>
          ))}
        </div>
      )}
    </div>
  );
}
