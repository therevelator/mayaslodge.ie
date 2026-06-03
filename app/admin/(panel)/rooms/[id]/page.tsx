import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RoomForm } from "@/components/admin/RoomForm";
import { ImageManager } from "@/components/admin/ImageManager";

export const metadata = { title: "Edit room" };

export default async function EditRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [room, amenities] = await Promise.all([
    prisma.room.findUnique({
      where: { id },
      include: {
        amenities: true,
        images: { orderBy: { sortOrder: "asc" } },
        beds: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.amenity.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  if (!room) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/rooms" className="text-sm font-medium text-brand hover:text-brand-dark">← Rooms</Link>
          <h1 className="mt-2 text-2xl font-semibold text-brand-dark">{room.name}</h1>
        </div>
        <Link href={`/rooms/${room.slug}`} target="_blank" className="btn btn-ghost text-sm">View on site ↗</Link>
      </div>

      <section className="card p-6">
        <h2 className="text-lg font-semibold text-brand-dark">Photos</h2>
        <p className="mt-1 text-sm text-muted">Drag in real photos to replace the placeholders.</p>
        <div className="mt-4">
          <ImageManager roomId={room.id} images={room.images} />
        </div>
      </section>

      <RoomForm
        room={{
          id: room.id,
          name: room.name,
          slug: room.slug,
          roomType: room.roomType,
          shortDesc: room.shortDesc,
          description: room.description,
          maxGuests: room.maxGuests,
          bedConfig: room.bedConfig,
          sizeSqm: room.sizeSqm,
          basePrice: room.basePrice,
          published: room.published,
          sortOrder: room.sortOrder,
        }}
        amenities={amenities.map((a) => ({ key: a.key, label: a.label, category: a.category }))}
        selectedKeys={room.amenities.map((a) => a.key)}
        beds={room.beds.map((b) => ({ type: b.type, quantity: b.quantity }))}
      />
    </div>
  );
}
