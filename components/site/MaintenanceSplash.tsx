import { LogoMark } from "@/components/Logo";
import type { Setting } from "@prisma/client";

// Full-screen splash shown on the public site while the settings flag
// (Setting.comingSoon) is on. Admin stays accessible at /admin.
export function MaintenanceSplash({ settings }: { settings: Setting }) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-brand-darker px-6 text-center text-cream">
      {/* faint decorative clovers via the real logo, low opacity */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
        <div className="absolute -left-16 top-10 rotate-12">
          <LogoMark size={280} />
        </div>
        <div className="absolute -right-10 bottom-0 -rotate-6">
          <LogoMark size={340} />
        </div>
      </div>

      <div className="relative flex flex-col items-center">
        <LogoMark size={96} priority className="drop-shadow-xl" />

        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-orange">
          {settings.propertyName}
        </p>

        <h1 className="mt-3 max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
          We&rsquo;ll be right back
        </h1>

        <p className="mt-4 max-w-xl text-lg text-cream/80">
          Our website is currently down for a little maintenance. We&rsquo;re
          putting the finishing touches in place and will be back online shortly.
          Thank you for your patience.
        </p>

        {settings.phone && (
          <div className="mt-8 rounded-2xl border border-cream/15 bg-white/5 px-6 py-4 text-sm text-cream/85">
            <p className="text-cream/60">In the meantime, you can call us:</p>
            <a
              href={`tel:${settings.phone.replace(/\s+/g, "")}`}
              className="mt-1 block font-medium hover:text-orange"
            >
              {settings.phone}
            </a>
          </div>
        )}

        <p className="mt-8 text-xs text-cream/50">
          {[settings.town, settings.county].filter(Boolean).join(", ")}
        </p>
      </div>
    </main>
  );
}
