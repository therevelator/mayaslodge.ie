import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { formatPrice } from "@/lib/format";
import { deleteRoom } from "@/app/admin/actions";

export default async function AdminRoomsPage() {
  const [settings, rooms] = await Promise.all([
    getSettings(),
    prisma.room.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        _count: { select: { bookings: true, amenities: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-brand-dark">Rooms</h1>
        <Link href="/admin/rooms/new" className="btn btn-primary">Add room</Link>
      </div>

      {rooms.length === 0 ? (
        <p className="rounded-xl bg-white p-8 text-center text-sm text-muted">
          No rooms yet. <Link href="/admin/rooms/new" className="text-brand">Add your first room</Link>.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <div key={room.id} className="card overflow-hidden">
              <div className="relative aspect-[3/2] bg-cream-deep">
                {room.images[0] && (
                  <Image src={room.images[0].url} alt={room.name} fill sizes="33vw" className="object-cover" />
                )}
                {!room.published && (
                  <span className="badge absolute left-3 top-3 bg-ink/70 text-white">Hidden</span>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-serif text-lg font-semibold text-brand-dark">{room.name}</h2>
                  <span className="text-sm font-semibold text-ink">{formatPrice(room.basePrice, settings.currency)}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted">
                  {room.roomType} · sleeps {room.maxGuests} · {room._count.amenities} amenities · {room._count.bookings} bookings
                </p>
                <div className="mt-4 flex gap-2">
                  <Link href={`/admin/rooms/${room.id}`} className="btn btn-outline flex-1 px-3 py-1.5 text-sm">Edit</Link>
                  <Link href={`/rooms/${room.slug}`} target="_blank" className="btn btn-ghost px-3 py-1.5 text-sm">View</Link>
                  <form action={deleteRoom}>
                    <input type="hidden" name="id" value={room.id} />
                    <button className="btn btn-ghost px-3 py-1.5 text-sm text-orange-dark" title="Delete room">✕</button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
