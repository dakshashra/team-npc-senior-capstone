"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "@/app/firebase";

/** Handles both Firestore Timestamps and ISO date strings */
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

function isFutureOrToday(dateVal) {
  const d = toDate(dateVal);
  if (!d) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const confDay = new Date(d);
  confDay.setHours(0, 0, 0, 0);
  return confDay >= today;
}

export function ConferencesClient() {
  const [conferences, setConferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const snap = await getDocs(query(collection(db, "conferences")));
        const docs = [];
        snap.forEach((doc) => {
          const data = doc.data();
          const entry = {
            id: doc.id,
            title: data.title || data.name || "",
            description: data.description || "",
            date: data.date || null,
            location: data.location || "",
            topic: data.topic || "",
            link: data.link || "",
          };
          if (isFutureOrToday(entry.date)) docs.push(entry);
        });

        // Sort ascending by date (soonest first)
        docs.sort((a, b) => {
          const da = toDate(a.date);
          const db_ = toDate(b.date);
          if (!da && !db_) return 0;
          if (!da) return 1;
          if (!db_) return -1;
          return da - db_;
        });

        setConferences(docs);
      } catch (err) {
        console.error(err);
        setError("Could not load conferences.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const cardBase =
    "group flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white shadow-sm px-6 py-5 transition-all hover:shadow-md hover:ring-1 hover:ring-[#CC0000]/40";

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 mb-2">
          Conferences
        </h1>
        <p className="text-zinc-500 mb-10">Upcoming conferences and events.</p>

        {loading ? (
          <p className="text-zinc-500">Loading…</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : conferences.length === 0 ? (
          <p className="text-zinc-600">No upcoming conferences at this time.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {conferences.map((conf) => {
              const CardTag = conf.link ? "a" : "div";
              const linkProps = conf.link
                ? { href: conf.link, target: "_blank", rel: "noopener noreferrer" }
                : {};

              return (
                <CardTag key={conf.id} className={cardBase} {...linkProps}>
                  {/* Title */}
                  <p className="text-xl font-bold text-zinc-900 leading-snug group-hover:text-[#CC0000] transition-colors">
                    {conf.title}
                  </p>

                  {/* Description */}
                  {conf.description && (
                    <p className="text-base text-zinc-600 leading-relaxed">
                      {conf.description}
                    </p>
                  )}

                  {/* Meta row */}
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-zinc-500 mt-1">
                    {conf.date && (
                      <span>
                        <span className="font-semibold text-zinc-700">Date:</span>{" "}
                        {formatDate(conf.date)}
                      </span>
                    )}
                    {conf.location && (
                      <span>
                        <span className="font-semibold text-zinc-700">Location:</span>{" "}
                        {conf.location}
                      </span>
                    )}
                    {conf.topic && (
                      <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 capitalize">
                        {conf.topic}
                      </span>
                    )}
                  </div>
                </CardTag>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
