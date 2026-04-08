"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/app/firebase";

export function ResearchPageClient() {
  const [interests, setInterests] = useState([]);
  const [fundings, setFundings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const snap = await getDocs(collection(db, "research"));
        if (!snap.empty) {
          const data = snap.docs[0].data();
          setInterests(Array.isArray(data.interests) ? data.interests.map(String) : []);
          setFundings(Array.isArray(data.research_fundings) ? data.research_fundings.map(String) : []);
        }
      } catch (err) {
        console.error(err);
        setError("Could not load research data.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Section 1 — Research Interests */}
        <h1 className="text-4xl font-bold font-sans tracking-tight text-black">
          Research Interests
        </h1>

        {loading ? (
          <p className="mt-6 text-sm text-zinc-500">Loading…</p>
        ) : error ? (
          <p className="mt-6 text-sm text-red-600">{error}</p>
        ) : (
          <ul className="mt-6 space-y-2">
            {interests.length === 0 ? (
              <li className="text-sm text-zinc-500">No interests listed.</li>
            ) : (
              interests.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-base text-zinc-800">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-zinc-800" />
                  {item}
                </li>
              ))
            )}
          </ul>
        )}

        {/* Divider */}
        <hr className="my-10 border-t border-zinc-200" />

        {/* Section 2 — Research Funding */}
        <h2 className="text-4xl font-bold font-sans tracking-tight text-black">
          Research Funding
        </h2>

        {!loading && !error && (
          <ul className="mt-6 space-y-2">
            {fundings.length === 0 ? (
              <li className="text-sm text-zinc-500">No funding listed.</li>
            ) : (
              fundings.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-base text-zinc-800">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-zinc-800" />
                  {item}
                </li>
              ))
            )}
          </ul>
        )}

      </div>
    </main>
  );
}
