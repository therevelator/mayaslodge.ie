import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { RoomCard } from "@/components/site/RoomCard";
import { CloverMark, LogoMark } from "@/components/Logo";
import { Icon } from "@/components/Icon";

export default async function HomePage() {
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
      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden bg-brand-darker text-cream">
        {/* decorative clovers */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.08]">
          <div className="absolute -left-10 top-10"><CloverMark size={220} /></div>
          <div className="absolute right-6 bottom-0 translate-y-1/3"><CloverMark size={320} /></div>
        </div>
        <div className="container-page relative grid gap-10 py-20 lg:grid-cols-2 lg:py-28">
          <div className="max-w-xl">
            <span className="badge bg-white/10 text-cream/90">
              <span className="h-1.5 w-1.5 rounded-full bg-orange" /> {settings.tagline}
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.1] sm:text-5xl lg:text-6xl">
              {settings.heroHeadline}
            </h1>
            <p className="mt-5 text-lg text-cream/80">{settings.heroSubline}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/rooms" className="btn btn-accent">
                See our rooms
              </Link>
              <Link href="/contact" className="btn btn-outline border-cream/40 text-cream hover:bg-white/10">
                Get in touch
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative grid place-items-center">
              <div className="absolute h-72 w-72 rounded-full bg-white/10 blur-3xl" />
              <LogoMark size={300} priority className="relative drop-shadow-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Highlights ---------------- */}
      <section className="container-page -mt-10 relative grid gap-4 sm:grid-cols-3">
        {[
          { icon: "breakfast", title: "Full Irish breakfast", body: "Cooked fresh each morning, available on request for €10 per person, per day." },
          { icon: "family", title: "Family-run welcome", body: "Cosy rooms and the warm hospitality of a real Irish home." },
          { icon: "wave", title: "Perfectly placed", body: "Minutes from Dublin Airport and the city centre, with the coast close by." },
        ].map((f) => (
          <div key={f.title} className="card p-6">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand-light text-brand">
              <Icon name={f.icon} size={22} />
            </span>
            <h3 className="mt-4 font-serif text-lg font-semibold text-brand-dark">{f.title}</h3>
            <p className="mt-1.5 text-sm text-muted">{f.body}</p>
          </div>
        ))}
      </section>

      {/* ---------------- Rooms ---------------- */}
      <section className="container-page mt-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-orange">Stay with us</p>
            <h2 className="mt-1 text-3xl font-semibold text-brand-dark">Our rooms</h2>
          </div>
          <Link href="/rooms" className="hidden text-sm font-semibold text-brand hover:text-brand-dark sm:block">
            View all rooms →
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.slice(0, 3).map((room) => (
            <RoomCard key={room.id} room={room} currency={settings.currency} />
          ))}
        </div>
        <div className="mt-8 text-center sm:hidden">
          <Link href="/rooms" className="btn btn-outline">View all rooms</Link>
        </div>
      </section>

      {/* ---------------- About teaser ---------------- */}
      <section className="container-page mt-20">
        <div className="card grid gap-8 overflow-hidden p-8 lg:grid-cols-[1.2fr_1fr] lg:p-12">
          <div>
            <h2 className="text-3xl font-semibold text-brand-dark">{settings.aboutTitle}</h2>
            <p className="mt-4 whitespace-pre-line leading-relaxed text-ink/80">
              {settings.aboutBody}
            </p>
            <Link href="/about" className="btn btn-primary mt-6">More about us</Link>
          </div>
          <div className="rounded-2xl bg-brand-light p-6">
            <h3 className="font-serif text-lg font-semibold text-brand-dark">Good to know</h3>
            <ul className="mt-4 space-y-3 text-sm text-ink/80">
              <li className="flex gap-2"><Icon name="breakfast" size={18} className="text-brand" /> {settings.breakfastInfo}</li>
              <li className="flex gap-2"><Icon name="check" size={18} className="text-brand" /> Check-in from {settings.checkInTime}, check-out by {settings.checkOutTime}.</li>
              <li className="flex gap-2"><Icon name="parking" size={18} className="text-brand" /> Free street parking nearby, subject to availability.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ---------------- CTA band ---------------- */}
      <section className="container-page mt-20">
        <div className="rounded-2xl bg-brand px-8 py-12 text-center text-white">
          <h2 className="text-3xl font-semibold">Ready to book your stay?</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85">
            Browse our rooms, check the dates you&rsquo;d like and send us a request — we&rsquo;ll confirm by email.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/rooms" className="btn btn-accent">Check availability</Link>
          </div>
        </div>
      </section>
    </>
  );
}
