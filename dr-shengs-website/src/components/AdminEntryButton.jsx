"use client";

import Link from "next/link";

export function AdminEntryButton() {
  return (
    <Link
      href="/admin"
      className="group fixed bottom-5 right-5 z-[100] flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-700/40 bg-zinc-900/90 text-zinc-100 shadow-lg shadow-black/30 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-[#CC0000]/50 hover:bg-zinc-900 hover:shadow-[#CC0000]/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CC0000] focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
      aria-label="Admin sign in"
      title="Admin"
    >
      <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#CC0000]/20 to-[#CC0000]/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <svg
        className="relative h-5 w-5 text-[#CC0000] transition-colors group-hover:text-[#ff1a1a]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    </Link>
  );
}
