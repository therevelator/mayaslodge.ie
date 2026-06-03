export function LegalPage({
  title,
  subtitle,
  lastUpdated,
  children,
}: {
  title: string;
  subtitle?: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <section className="bg-brand-darker text-cream">
        <div className="container-page py-14">
          <p className="text-sm font-semibold uppercase tracking-wide text-orange">Legal</p>
          <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">{title}</h1>
          {subtitle && <p className="mt-3 max-w-2xl text-cream/80">{subtitle}</p>}
          <p className="mt-4 text-sm text-cream/60">Last updated: {lastUpdated}</p>
        </div>
      </section>

      <section className="container-page py-12">
        <div className="prose-legal max-w-3xl">{children}</div>
      </section>
    </>
  );
}
