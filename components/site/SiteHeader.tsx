"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/rooms", label: "Rooms" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ phone }: { phone?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-brand/10 bg-cream/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo size={36} textClassName="text-lg text-brand-dark" />

        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-ink/80 transition hover:text-brand"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {phone && (
            <a
              href={`tel:${phone.replace(/\s+/g, "")}`}
              className="text-sm font-medium text-brand-dark hover:text-brand"
            >
              {phone}
            </a>
          )}
          <Link href="/rooms" className="btn btn-primary">
            Book a stay
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="btn btn-ghost px-2 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-brand/10 bg-cream md:hidden">
          <nav className="container-page flex flex-col py-3">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="py-2.5 text-base font-medium text-ink/85"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              <Link href="/rooms" onClick={() => setOpen(false)} className="btn btn-primary">
                Book a stay
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
