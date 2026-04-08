"use client";

import Link from "next/link";

export function AdminEntryButton() {
  return (
    <Link
      href="/admin"
      className="group fixed bottom-5 right-5 z-[100] flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-700/40 bg-zinc-900/90 text-zinc-100 shadow-lg shadow-black/30 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-violet-500/50 hover:bg-zinc-900 hover:shadow-violet-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
      aria-label="Admin sign in"
      title="Admin"
    >
      <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-600/20 to-fuchsia-600/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <svg
        className="relative h-5 w-5 text-violet-300 transition-colors group-hover:text-violet-200"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" className="opacity-80" />
      </svg>
    </Link>
  );
}
