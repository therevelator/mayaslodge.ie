import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { CloverMark } from "@/components/Logo";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = {
  title: "About",
  description: "The story behind Maya's Lodge, a family-run Irish bed & breakfast.",
};

export default async function AboutPage() {
  const settings = await getSettings();

  return (
    <>
      <section className="bg-brand-darker text-cream">
        <div className="container-page relative overflow-hidden py-16">
          <div className="pointer-events-none absolute right-0 top-0 opacity-10">
            <CloverMark size={240} />
          </div>
          <p className="text-sm font-semibold uppercase tracking-wide text-orange">Our story</p>
          <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">{settings.aboutTitle}</h1>
        </div>
      </section>

      <section className="container-page grid gap-10 py-14 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="whitespace-pre-line text-lg leading-relaxed text-ink/85">
            {settings.aboutBody}
          </p>
          <div className="mt-8">
            <Link href="/rooms" className="btn btn-primary">See our rooms</Link>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="card p-6">
            <h2 className="font-serif text-lg font-semibold text-brand-dark">Breakfast</h2>
            <p className="mt-2 text-sm text-ink/80">{settings.breakfastInfo}</p>
          </div>
          <div className="card p-6">
            <h2 className="font-serif text-lg font-semibold text-brand-dark">House rules</h2>
            <ul className="mt-3 space-y-2 text-sm text-ink/80">
              {settings.houseRules
                .split(/[·\n]/)
                .map((r) => r.trim())
                .filter(Boolean)
                .map((rule, i) => (
                  <li key={i} className="flex gap-2">
                    <Icon name="check" size={18} className="mt-0.5 shrink-0 text-brand" />
                    {rule}
                  </li>
                ))}
            </ul>
          </div>
        </aside>
      </section>
    </>
  );
}
