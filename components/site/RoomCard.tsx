import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { formatPrice } from "@/lib/format";
import type { Room, RoomImage, Amenity } from "@prisma/client";

type RoomWithRelations = Room & { images: RoomImage[]; amenities: Amenity[] };

export function RoomCard({
  room,
  currency,
}: {
  room: RoomWithRelations;
  currency: string;
}) {
  const cover = room.images[0];
  const highlights = room.amenities.slice(0, 3);

  return (
    <Link
      href={`/rooms/${room.slug}`}
      className="card group flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-[3/2] overflow-hidden bg-cream-deep">
        {cover ? (
          <Image
            src={cover.url}
            alt={cover.alt ?? room.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : null}
        <span className="badge absolute left-3 top-3 bg-white/90 text-brand-dark">
          {room.roomType}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-serif text-xl font-semibold text-brand-dark">
          {room.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted">
          {room.shortDesc ?? room.description}
        </p>

        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink/70">
          <li className="inline-flex items-center gap-1.5">
            <Icon name="family" size={15} /> Sleeps {room.maxGuests}
          </li>
          {highlights.map((a) => (
            <li key={a.id} className="inline-flex items-center gap-1.5">
              <Icon name={a.icon} size={15} /> {a.label}
            </li>
          ))}
        </ul>

        <div className="mt-5 flex items-end justify-between border-t border-brand/10 pt-4">
          <div>
            <span className="text-lg font-semibold text-ink">
              {formatPrice(room.basePrice, currency)}
            </span>
            <span className="text-sm text-muted"> / night</span>
          </div>
          <span className="text-sm font-semibold text-brand group-hover:text-brand-dark">
            View &amp; book →
          </span>
        </div>
      </div>
    </Link>
  );
}
