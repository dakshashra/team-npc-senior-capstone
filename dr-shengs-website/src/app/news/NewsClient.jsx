"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "@/app/firebase";

export function NewsClient() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const snap = await getDocs(query(collection(db, "manual-news")));
        const docs = [];
        snap.forEach((doc) => {
          const data = doc.data();
          docs.push({
            id: doc.id,
            title: data.title || "",
            description: data.description || "",
            year: data.year || "",
          });
        });

        // Sort descending by year (strings sort lexicographically, fine for 4-digit years)
        docs.sort((a, b) => b.year.localeCompare(a.year));
        setItems(docs);
      } catch (err) {
        console.error(err);
        setError("Could not load news.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Group items by year for optional section headers
  const grouped = items.reduce((acc, item) => {
    const yr = item.year || "Unknown";
    if (!acc[yr]) acc[yr] = [];
    acc[yr].push(item);
    return acc;
  }, {});
  const years = Object.keys(grouped); // already sorted desc

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 mb-10">
          News
        </h1>

        {loading ? (
          <p className="text-zinc-500">Loading…</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : items.length === 0 ? (
          <p className="text-zinc-600">No news at this time.</p>
        ) : (
          <div className="flex flex-col gap-10">
            {years.map((year) => (
              <section key={year}>
                <h2 className="text-xl font-semibold text-[#CC0000] mb-4 border-b border-zinc-200 pb-2">
                  {year}
                </h2>
                <div className="flex flex-col gap-4">
                  {grouped[year].map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-zinc-200 bg-white shadow-sm px-6 py-5"
                    >
                      <p className="text-lg font-bold text-zinc-900 leading-snug">
                        {item.title}
                      </p>
                      {item.description && (
                        <p className="mt-2 text-base text-zinc-600 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
