"use client";

import Image from "next/image";
import Link from "next/link";

const navLinkClass =
  "rounded-lg px-3 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 hover:text-zinc-950";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4"
        >
          <Image
            src="/texas_tech_logo.png"
            alt="Texas Tech University"
            width={140}
            height={48}
            className="h-10 w-auto shrink-0 object-contain sm:h-12"
            priority
          />
          <span className="text-left text-base font-bold leading-tight tracking-tight text-zinc-900 sm:text-lg md:text-xl">
            Machine Learning &amp; Data Science Lab
          </span>
        </Link>

        {/* Desktop / hover-capable: News includes dropdown for Funding */}
        <nav
          className="hidden w-full flex-wrap items-center justify-end gap-1 md:flex md:w-auto md:gap-1"
          aria-label="Primary"
        >
          <Link href="/people" className={navLinkClass}>
            People
          </Link>
          <Link href="/research" className={navLinkClass}>
            Research
          </Link>

          <div className="relative group">
            <div className="flex items-center rounded-lg px-1 py-1 transition hover:bg-zinc-100">
              <Link href="/news" className={`${navLinkClass} pr-1`}>
                News
              </Link>
              <span
                className="pointer-events-none pr-2 text-xs text-zinc-500"
                aria-hidden
              >
                ▾
              </span>
            </div>
            <div
              className="invisible absolute right-0 top-full z-50 mt-0 min-w-[13rem] translate-y-1 rounded-lg border border-zinc-200 bg-white py-1 opacity-0 shadow-lg transition-[opacity,visibility,transform] duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100"
              role="menu"
            >
              <Link
                href="/funding-opportunities"
                className="block px-4 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
                role="menuitem"
              >
                Funding Opportunities
              </Link>
            </div>
          </div>

          <Link href="/publications" className={navLinkClass}>
            Publications
          </Link>
        </nav>

        {/* Mobile / touch: flat links including Funding Opportunities */}
        <nav
          className="flex w-full flex-wrap items-center justify-end gap-1 md:hidden"
          aria-label="Primary mobile"
        >
          <Link href="/people" className={navLinkClass}>
            People
          </Link>
          <Link href="/research" className={navLinkClass}>
            Research
          </Link>
          <Link href="/news" className={navLinkClass}>
            News
          </Link>
          <Link
            href="/funding-opportunities"
            className={`${navLinkClass} max-w-[11rem] text-right leading-snug`}
          >
            Funding Opportunities
          </Link>
          <Link href="/publications" className={navLinkClass}>
            Publications
          </Link>
        </nav>
      </div>
      <div className="h-1 w-full bg-[#CC0000]" aria-hidden />
    </header>
  );
}
