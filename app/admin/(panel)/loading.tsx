// Instant placeholder for admin pages while their data loads. Because the
// admin nav links prefetch this, switching tabs feels immediate.
export default function AdminLoading() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-48 rounded-lg bg-cream-deep" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="card h-24 bg-white/70" />
        ))}
      </div>
      <div className="card h-80 bg-white/70" />
    </div>
  );
}
