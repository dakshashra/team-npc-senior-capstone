"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "@/app/firebase";

function toDate(val) {
  if (!val) return null;
  const d = val?.toDate ? val.toDate() : new Date(val);
  return isNaN(d) ? null : d;
}

function formatDate(dateVal) {
  const d = toDate(dateVal);
  if (!d) return null;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

/** Returns true if the conference date is today or in the future (date-only comparison). */
function isFutureOrToday(dateVal) {
  const d = toDate(dateVal);
  if (!d) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const confDay = new Date(d);
  confDay.setHours(0, 0, 0, 0);
  return confDay >= today;
}

export function NewsClient() {
  const [newsDocs, setNewsDocs] = useState([]);
  const [conferences, setConferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        // Fetch news
        const newsSnap = await getDocs(query(collection(db, "news")));
        const docs = [];
        newsSnap.forEach((doc) => {
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

        // Fetch conferences — only keep upcoming ones
        const confSnap = await getDocs(query(collection(db, "conferences")));
        const confDocs = [];
        confSnap.forEach((doc) => {
          const data = doc.data();
          const entry = {
            id: doc.id,
            name: data.name || "",
            description: data.description || "",
            date: data.date || null,
          };
          if (isFutureOrToday(entry.date)) confDocs.push(entry);
        });
        setConferences(confDocs);
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
          <p className="text-zinc-500">Loading...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <div className="flex flex-col gap-12">

            {/* Conferences Section */}
            <section>
              <h2 className="text-2xl font-bold text-zinc-800 mb-6">Conferences</h2>
              {conferences.length === 0 ? (
                <p className="text-zinc-600">No conferences at this time.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {conferences.map((conf) => (
                    <div
                      key={conf.id}
                      className="rounded-2xl border border-zinc-200 bg-white shadow-sm px-6 py-5"
                    >
                      <p className="text-xl font-bold text-zinc-900 leading-snug">
                        {conf.name}
                      </p>
                      {conf.description && (
                        <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
                          {conf.description}
                        </p>
                      )}
                      {conf.date && (
                        <p className="mt-3 text-sm text-zinc-500">
                          <span className="font-semibold text-zinc-700">Date:</span>{" "}
                          {formatDate(conf.date)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Tech News Section */}
            <section>
              <h2 className="text-2xl font-bold text-zinc-800 mb-6">Tech News</h2>
              {newsDocs.length === 0 ? (
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
                        <div className="shrink-0 w-28 h-28 sm:w-32 sm:h-32 self-center m-4 rounded-xl overflow-hidden border border-zinc-100 bg-zinc-100 flex items-center justify-center">
                          <svg className="h-8 w-8 text-zinc-300" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                          </svg>
                        </div>
                      )}

                      {/* Text content */}
                      <div className="flex flex-col justify-center py-4 pr-6 gap-1 min-w-0">
                        <h3 className="text-lg font-bold text-zinc-900 group-hover:text-[#CC0000] transition-colors leading-snug">
                          {item.title}
                        </h3>
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
            </section>

          </div>
        )}
      </div>
    </main>
  );
}
