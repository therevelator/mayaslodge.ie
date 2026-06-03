import Link from "next/link";
import { Logo } from "@/components/Logo";
import type { Setting } from "@prisma/client";

export function SiteFooter({ settings }: { settings: Setting }) {
  const year = 2026; // build-time constant; bump as needed
  const addressParts = [
    settings.addressLine,
    settings.town,
    settings.county,
    settings.eircode,
    settings.country,
  ].filter(Boolean);

  return (
    <footer className="mt-20 bg-brand-darker text-cream/90">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo size={40} textClassName="text-lg text-white" href="/" />
          <p className="mt-4 max-w-xs text-sm text-cream/70">
            {settings.tagline}. A family-run bed &amp; breakfast in the heart of{" "}
            {settings.county || "Ireland"}.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-cream/60">
            Explore
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/rooms" className="hover:text-orange">Our rooms</Link></li>
            <li><Link href="/about" className="hover:text-orange">About us</Link></li>
            <li><Link href="/contact" className="hover:text-orange">Contact &amp; directions</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-cream/60">
            Find us
          </h3>
          <address className="mt-4 space-y-1 text-sm not-italic text-cream/80">
            {addressParts.map((p, i) => (
              <div key={i}>{p}</div>
            ))}
          </address>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-cream/60">
            Get in touch
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-cream/80">
            {settings.phone && (
              <li>
                <a href={`tel:${settings.phone.replace(/\s+/g, "")}`} className="hover:text-orange">
                  {settings.phone}
                </a>
              </li>
            )}
            {settings.email && (
              <li>
                <a href={`mailto:${settings.email}`} className="hover:text-orange">
                  {settings.email}
                </a>
              </li>
            )}
          </ul>
          <div className="mt-4 flex gap-3">
            {settings.facebookUrl && (
              <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="rounded-full border border-cream/20 p-2 hover:border-orange hover:text-orange">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M14 9h3V6h-3a3 3 0 0 0-3 3v2H9v3h2v6h3v-6h2.5l.5-3H14V9.5c0-.4.3-.5.7-.5Z"/></svg>
              </a>
            )}
            {settings.instagramUrl && (
              <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="rounded-full border border-cream/20 p-2 hover:border-orange hover:text-orange">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="3.5"/><circle cx="17" cy="7" r="1"/></svg>
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-5 text-xs text-cream/55 sm:flex-row">
          <p>© {year} {settings.propertyName}. All rights reserved.</p>
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link href="/terms" className="hover:text-orange">Terms &amp; Conditions</Link>
            <Link href="/privacy" className="hover:text-orange">Privacy Policy</Link>
            <Link href="/gdpr" className="hover:text-orange">GDPR</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
