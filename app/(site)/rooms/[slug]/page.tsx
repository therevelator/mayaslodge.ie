import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { getBlockingStays, occupiedDaySet, getOpenWindows, openDaySet } from "@/lib/availability";
import { addDays, todayUTC } from "@/lib/dates";
import { toISODate } from "@/lib/format";
import { Gallery } from "@/components/site/Gallery";
import { BookingWidget } from "@/components/site/BookingWidget";
import { Icon } from "@/components/Icon";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const room = await prisma.room.findUnique({ where: { slug } });
  if (!room) return { title: "Room not found" };
  return {
    title: room.name,
    description: room.shortDesc ?? room.description.slice(0, 160),
  };
}

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [settings, room] = await Promise.all([
    getSettings(),
    prisma.room.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        amenities: { orderBy: { sortOrder: "asc" } },
        beds: { orderBy: { sortOrder: "asc" } },
      },
    }),
  ]);

  if (!room || !room.published) notFound();

  // Build a readable bed summary, e.g. "1 King bed · 2 Single beds · 1 Sofa bed".
  // Types that already name the item (Sofa bed, Bunk bed, Cot) don't get an
  // extra "bed" appended.
  const bedLabel = (type: string, qty: number) => {
    const names = /bed|cot/i.test(type);
    const noun = names ? type : `${type} bed`;
    const plural = qty > 1 ? `${noun.replace(/\bbed\b/i, "beds").replace(/\bcot\b/i, "cots")}` : noun;
    return `${qty} ${plural}`;
  };
  const bedSummary = room.beds.length
    ? room.beds.map((b) => bedLabel(b.type, b.quantity)).join(" · ")
    : room.bedConfig;

  const from = todayUTC();
  const to = addDays(from, 365);
  const [stays, windows] = await Promise.all([
    getBlockingStays(room.id, from, to),
    getOpenWindows(room.id, from, to),
  ]);
  // Bookable = open days minus occupied days. Rooms are closed by default, so
  // an unopened room has no bookable dates.
  const occupied = occupiedDaySet(stays);
  const available = Array.from(openDaySet(windows)).filter((d) => !occupied.has(d));

  // Group amenities by category for display.
  const byCategory = room.amenities.reduce<Record<string, typeof room.amenities>>(
    (acc, a) => {
      const key = a.category ?? "Other";
      (acc[key] ??= []).push(a);
      return acc;
    },
    {}
  );

  return (
    <div className="container-page py-10">
      <Link href="/rooms" className="text-sm font-medium text-brand hover:text-brand-dark">
        ← All rooms
      </Link>

      <div className="mt-4 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        {/* Left: gallery + details */}
        <div>
          <Gallery images={room.images} roomName={room.name} />

          <div className="mt-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="badge bg-brand-light text-brand-dark">{room.roomType}</span>
              <span className="text-sm text-muted">Sleeps up to {room.maxGuests}</span>
              {bedSummary && <span className="text-sm text-muted">· {bedSummary}</span>}
              {room.sizeSqm && <span className="text-sm text-muted">· {room.sizeSqm} m²</span>}
            </div>
            <h1 className="mt-3 text-3xl font-semibold text-brand-dark sm:text-4xl">{room.name}</h1>
            <p className="mt-4 whitespace-pre-line leading-relaxed text-ink/80">{room.description}</p>
          </div>

          {/* Amenities */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-brand-dark">What this room offers</h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              {Object.entries(byCategory).map(([cat, list]) => (
                <div key={cat}>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">{cat}</h3>
                  <ul className="mt-2 space-y-2">
                    {list.map((a) => (
                      <li key={a.id} className="flex items-center gap-2.5 text-sm text-ink/85">
                        <span className="text-brand"><Icon name={a.icon} size={18} /></span>
                        {a.label}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: sticky booking widget */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <BookingWidget
            roomId={room.id}
            basePrice={room.basePrice}
            currency={settings.currency}
            maxGuests={room.maxGuests}
            available={available}
            todayISO={toISODate(from)}
            breakfastIncluded={room.amenities.some((a) => a.key === "breakfast")}
          />
        </div>
      </div>
    </div>
  );
}
