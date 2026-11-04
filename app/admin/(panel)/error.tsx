"use client";

import { useEffect } from "react";

// Admin error screen. The most common cause is a page that was open while a
// new version of the site went live — its buttons point at server code that no
// longer exists. In that case we simply reload to the new version.

function isStaleDeploy(error: Error): boolean {
  return /Failed to find Server Action|Server Action .* was not found|older or newer deployment/i.test(
    error.message
  );
}

export default function AdminError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const stale = isStaleDeploy(error);

  useEffect(() => {
    console.error(error);
    if (stale) {
      const t = setTimeout(() => window.location.reload(), 1200);
      return () => clearTimeout(t);
    }
  }, [error, stale]);

  return (
    <div className="card mx-auto max-w-lg p-8 text-center">
      <h2 className="text-xl font-semibold text-brand-dark">
        {stale ? "The site was just updated" : "Something went wrong"}
      </h2>
      <p className="mt-2 text-sm text-muted">
        {stale
          ? "Reloading the page with the latest version… If you were saving something, please do it again."
          : "Please try again. If it keeps happening, reload the page."}
      </p>
      <div className="mt-5 flex justify-center gap-3">
        <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
          Reload page
        </button>
        {!stale && (
          <button type="button" className="btn btn-outline" onClick={() => unstable_retry()}>
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
