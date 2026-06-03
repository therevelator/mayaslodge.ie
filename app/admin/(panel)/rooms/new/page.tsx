import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { RoomForm } from "@/components/admin/RoomForm";

export const metadata = { title: "Add room" };

export default async function NewRoomPage() {
  const amenities = await prisma.amenity.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/rooms" className="text-sm font-medium text-brand hover:text-brand-dark">← Rooms</Link>
        <h1 className="mt-2 text-2xl font-semibold text-brand-dark">Add a room</h1>
        <p className="text-sm text-muted">Create the room first, then add photos.</p>
      </div>
      <RoomForm
        amenities={amenities.map((a) => ({ key: a.key, label: a.label, category: a.category }))}
        selectedKeys={[]}
      />
    </div>
  );
}
