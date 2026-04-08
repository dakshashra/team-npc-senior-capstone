"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/people", label: "People" },
  { href: "/research", label: "Research" },
  { href: "/news", label: "News" },
  { href: "/funding-opportunities", label: "Funding Opportunities" },
  { href: "/publications", label: "Publications" },
];

const navLinkClass =
  "rounded-lg px-3 py-2 text-base font-semibold text-zinc-800 transition hover:bg-zinc-100 hover:text-zinc-950";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">

        {/* Logo + Lab name */}
        <Link
          href="/"
          className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4"
        >
          <Image
            src="/texas_tech_logo.png"
            alt="Texas Tech University"
            width={160}
            height={56}
            className="h-12 w-auto shrink-0 object-contain sm:h-14"
            priority
          />
          <span className="text-lg font-bold leading-tight tracking-tight text-zinc-900 sm:text-xl md:text-2xl">
            Machine Learning &amp; Data Science Lab
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={navLinkClass}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Hamburger button — mobile only */}
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-700 hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 md:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            /* X icon */
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          ) : (
            /* Hamburger icon */
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <nav
          className="border-t border-zinc-100 bg-white px-4 pb-4 md:hidden"
          aria-label="Primary mobile"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-base font-semibold text-zinc-800 transition hover:bg-zinc-100 hover:text-zinc-950"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}

      <div className="h-1.5 w-full bg-[#CC0000]" aria-hidden />
    </header>
  );
}
