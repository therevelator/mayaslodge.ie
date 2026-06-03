import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = {
  title: "Contact & Directions",
  description: "Get in touch with Maya's Lodge — phone, email, address and directions.",
};

export default async function ContactPage() {
  const settings = await getSettings();
  const addressParts = [
    settings.addressLine,
    settings.town,
    settings.county,
    settings.eircode,
    settings.country,
  ].filter(Boolean);
  const mapsQuery = encodeURIComponent(addressParts.join(", "));

  return (
    <>
      <section className="bg-brand-darker text-cream">
        <div className="container-page py-16">
          <p className="text-sm font-semibold uppercase tracking-wide text-orange">Say hello</p>
          <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">Contact &amp; directions</h1>
          <p className="mt-3 max-w-2xl text-cream/80">
            We&rsquo;re always happy to help with your stay. The quickest way to book
            is through our{" "}
            <Link href="/rooms" className="underline decoration-orange underline-offset-4">rooms page</Link>,
            but feel free to call or email us.
          </p>
        </div>
      </section>

      <section className="container-page grid gap-8 py-14 lg:grid-cols-2">
        <div className="space-y-5">
          <div className="card p-6">
            <h2 className="font-serif text-lg font-semibold text-brand-dark">Get in touch</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {settings.phone && (
                <li className="flex items-center gap-3">
                  <span className="text-brand"><Icon name="check" size={18} /></span>
                  <a href={`tel:${settings.phone.replace(/\s+/g, "")}`} className="font-medium text-ink hover:text-brand">{settings.phone}</a>
                </li>
              )}
              {settings.email && (
                <li className="flex items-center gap-3">
                  <span className="text-brand"><Icon name="check" size={18} /></span>
                  <a href={`mailto:${settings.email}`} className="font-medium text-ink hover:text-brand">{settings.email}</a>
                </li>
              )}
            </ul>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/rooms" className="btn btn-primary">Check availability</Link>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-serif text-lg font-semibold text-brand-dark">Where to find us</h2>
            <address className="mt-3 space-y-1 text-sm not-italic text-ink/80">
              {addressParts.map((p, i) => <div key={i}>{p}</div>)}
            </address>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-cream-deep/60 p-3">
                <div className="text-xs text-muted">Check-in</div>
                <div className="font-semibold text-brand-dark">from {settings.checkInTime}</div>
              </div>
              <div className="rounded-lg bg-cream-deep/60 p-3">
                <div className="text-xs text-muted">Check-out</div>
                <div className="font-semibold text-brand-dark">by {settings.checkOutTime}</div>
              </div>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline mt-4"
            >
              Open in Google Maps
            </a>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-brand/10 bg-cream-deep min-h-80">
          {settings.mapEmbedUrl ? (
            <iframe
              src={settings.mapEmbedUrl}
              title="Map to Maya's Lodge"
              className="h-full min-h-80 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="flex h-full min-h-80 items-center justify-center p-8 text-center text-sm text-muted">
              A map will appear here once an embed link is added in the admin
              settings.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
