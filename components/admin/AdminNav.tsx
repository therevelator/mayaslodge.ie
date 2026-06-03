"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { logout } from "@/app/admin/actions";

const LINKS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/calendar", label: "Calendar" },
  { href: "/admin/rooms", label: "Rooms" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-40 border-b border-brand/10 bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-6">
          <Logo size={30} textClassName="text-base text-brand-dark" href="/admin" />
          <nav className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  isActive(l.href, l.exact)
                    ? "bg-brand-light text-brand-dark"
                    : "text-ink/70 hover:bg-cream-deep"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/" target="_blank" className="hidden text-sm text-muted hover:text-brand sm:block">
            View site ↗
          </Link>
          <form action={logout}>
            <button type="submit" className="btn btn-ghost px-3 py-1.5 text-sm">
              Sign out
            </button>
          </form>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="btn btn-ghost px-2 md:hidden"
            aria-label="Menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-brand/10 bg-white px-4 py-2 md:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`block rounded-lg px-3 py-2 text-sm font-medium ${
                isActive(l.href, l.exact) ? "bg-brand-light text-brand-dark" : "text-ink/75"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
