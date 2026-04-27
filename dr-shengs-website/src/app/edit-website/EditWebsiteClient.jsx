"use client";

import { useState } from "react";
import Link from "next/link";
import { AwardsEditor } from "./sections/AwardsEditor";
import { PeopleEditor } from "./sections/PeopleEditor";
import { ResearchEditor } from "./sections/ResearchEditor";


const TABS = [
  { id: "awards", label: "Awards" },
  { id: "people", label: "People" },
  { id: "research", label: "Research" },

];

export function EditWebsiteClient() {
  const [tab, setTab] = useState("awards");

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_0%,rgba(204,0,0,0.14),transparent)]" />

      <header className="relative border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#CC0000]/90">
              
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Edit Website
            </h1>
          </div>
          <Link
            href="/"
            className="self-start rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white"
          >
            Back to site
          </Link>
        </div>

        <nav
          className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-3"
          aria-label="Content sections"
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={
                "shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition " +
                (tab === t.id
                  ? "bg-[#CC0000] text-white shadow-md shadow-[#CC0000]/25"
                  : "text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-200")
              }
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="relative mx-auto max-w-6xl px-4 py-10">
        {tab === "awards" && <AwardsEditor />}
        {tab === "people" && <PeopleEditor />}
        {tab === "research" && <ResearchEditor />}

      </main>
    </div>
  );
}
