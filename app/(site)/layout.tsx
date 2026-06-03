import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { getSettings } from "@/lib/settings";

// The whole public site is data-driven (rooms, settings, availability all come
// from the database), so render it per-request instead of statically at build
// time. This also avoids needing a database during `next build`.
export const dynamic = "force-dynamic";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  return (
    <>
      <SiteHeader phone={settings.phone} />
      <main className="flex-1">{children}</main>
      <SiteFooter settings={settings} />
    </>
  );
}
