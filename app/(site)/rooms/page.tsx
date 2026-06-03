import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { RoomCard } from "@/components/site/RoomCard";

export const metadata: Metadata = {
  title: "Our Rooms",
  description:
    "Browse the six rooms at Maya's Lodge — doubles, twins, a family room and a suite, all with a hearty Irish breakfast included.",
};

export default async function RoomsPage() {
  const [settings, rooms] = await Promise.all([
    getSettings(),
    prisma.room.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
      include: { images: { orderBy: { sortOrder: "asc" } }, amenities: true },
    }),
  ]);

  return (
    <>
      <section className="bg-brand-darker text-cream">
        <div className="container-page py-16">
          <p className="text-sm font-semibold uppercase tracking-wide text-orange">
            Stay with us
          </p>
          <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">Our rooms</h1>
          <p className="mt-3 max-w-2xl text-cream/80">
            Six individually styled rooms, each with a hearty Irish breakfast
            included. Pick the one that suits you, choose your dates and send a
            request — we&rsquo;ll confirm by email.
          </p>
        </div>
      </section>

      <section className="container-page py-14">
        {rooms.length === 0 ? (
          <p className="text-muted">No rooms published yet. Please check back soon.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} currency={settings.currency} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
