"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "@/app/firebase";

export function NewsClient() {
  const [newsDocs, setNewsDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const q = query(collection(db, "news"));
        const snap = await getDocs(q);

        const docs = [];
        snap.forEach((doc) => {
          const data = doc.data();
          docs.push({
            id: doc.id,
            title: data.title || "",
            summary: data.summary || "",
            link: data.link || "",
            source: data.source || "",
            image_url: data.image_url || "",
          });
        });

        setNewsDocs(docs);
      } catch (err) {
        console.error(err);
        setError("Could not load news.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 mb-8">
          News
        </h1>

        {loading ? (
          <p className="text-zinc-500">Loading news...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : newsDocs.length === 0 ? (
          <p className="text-zinc-600">No news at this time.</p>
        ) : (
          <div className="flex flex-col gap-6 w-full">
            {newsDocs.map((item) => (
              <a
                key={item.id}
                href={item.link ? item.link : "#"}
                target={item.link ? "_blank" : "_self"}
                rel={item.link ? "noopener noreferrer" : ""}
                className="group flex flex-row items-stretch overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md hover:ring-1 hover:ring-[#CC0000]"
              >
                {/* Thumbnail */}
                {item.image_url ? (
                  <div className="shrink-0 w-28 h-28 sm:w-32 sm:h-32 self-center m-4 rounded-xl overflow-hidden border border-zinc-100">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  /* Placeholder when no image */
                  <div className="shrink-0 w-28 h-28 sm:w-32 sm:h-32 self-center m-4 rounded-xl overflow-hidden border border-zinc-100 bg-zinc-100 flex items-center justify-center">
                    <svg className="h-8 w-8 text-zinc-300" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                  </div>
                )}

                {/* Text content */}
                <div className="flex flex-col justify-center py-4 pr-6 gap-1 min-w-0">
                  <h2 className="text-lg font-bold text-zinc-900 group-hover:text-[#CC0000] transition-colors leading-snug">
                    {item.title}
                  </h2>
                  {item.summary && (
                    <p className="text-sm text-zinc-600 leading-relaxed line-clamp-3">
                      {item.summary}
                    </p>
                  )}
                  {item.source && (
                    <p className="text-xs text-blue-600 font-medium mt-1">
                      {item.source}
                    </p>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
