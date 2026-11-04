// Instant placeholder shown while a public page loads. Next.js prefetches this,
// so clicking a link switches the page immediately and the content streams in.
export default function SiteLoading() {
  return (
    <div className="container-page animate-pulse py-12" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-2/3 max-w-md rounded-lg bg-cream-deep" />
      <div className="mt-4 h-4 w-full max-w-xl rounded bg-cream-deep/80" />
      <div className="mt-2 h-4 w-5/6 max-w-lg rounded bg-cream-deep/80" />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card overflow-hidden">
            <div className="aspect-[4/3] bg-cream-deep" />
            <div className="space-y-2 p-5">
              <div className="h-5 w-1/2 rounded bg-cream-deep" />
              <div className="h-4 w-3/4 rounded bg-cream-deep/80" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
