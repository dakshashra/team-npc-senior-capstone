"use client";

import { useEffect, useMemo, useState } from "react";
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

/**
 * Extracts the country from a location string.
 * Formats: "<city>, <country>"  or  "<city>, <state>, U.S.A."
 * → always take the last comma-separated segment.
 */
function extractCountry(location) {
  if (!location) return null;
  const parts = location.split(",").map((s) => s.trim()).filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1] : null;
}

const selectClass =
  "w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 shadow-sm outline-none cursor-pointer transition focus:border-[#CC0000]/50 focus:ring-2 focus:ring-[#CC0000]/10 hover:border-zinc-300";

export function ConferencesClient() {
  const [conferences, setConferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedTopic, setSelectedTopic] = useState("All");
  const [selectedCountry, setSelectedCountry] = useState("U.S.A.");

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

  // ── Derived filter options ──────────────────────────────────────────────────
  const topics = useMemo(() => {
    const set = new Set(conferences.map((c) => c.topic).filter(Boolean));
    return ["All", ...Array.from(set).sort()];
  }, [conferences]);

  const countries = useMemo(() => {
    const set = new Set(
      conferences.map((c) => extractCountry(c.location)).filter(Boolean)
    );
    return ["All", ...Array.from(set).sort()];
  }, [conferences]);

  // ── Filtered list ───────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return conferences.filter((c) => {
      const topicOk = selectedTopic === "All" || c.topic === selectedTopic;
      const countryOk =
        selectedCountry === "All" ||
        extractCountry(c.location) === selectedCountry;
      return topicOk && countryOk;
    });
  }, [conferences, selectedTopic, selectedCountry]);

  // ── Card wrapper ────────────────────────────────────────────────────────────
  const cardBase =
    "group flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white shadow-sm px-6 py-5 transition-all hover:shadow-md hover:ring-1 hover:ring-[#CC0000]/40";

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 mb-2">
          Conferences
        </h1>
        <p className="text-zinc-500 mb-8">Upcoming conferences and events.</p>

        {/* ── Filters ── */}
        {!loading && !error && conferences.length > 0 && (
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:gap-6">
            {/* Topic dropdown */}
            <div className="flex-1">
              <label
                htmlFor="filter-topic"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400"
              >
                Topic
              </label>
              <select
                id="filter-topic"
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className={selectClass}
              >
                {topics.map((t) => (
                  <option key={t} value={t}>
                    {t === "All" ? "All Topics" : t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Country dropdown */}
            <div className="flex-1">
              <label
                htmlFor="filter-country"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400"
              >
                Country
              </label>
              <select
                id="filter-country"
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className={selectClass}
              >
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c === "All" ? "All Countries" : c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* ── Results ── */}
        {loading ? (
          <p className="text-zinc-500">Loading…</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : filtered.length === 0 ? (
          <p className="text-zinc-600">No conferences match the selected filters.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((conf) => {
              const CardTag = conf.link ? "a" : "div";
              const linkProps = conf.link
                ? { href: conf.link, target: "_blank", rel: "noopener noreferrer" }
                : {};

              return (
                <CardTag key={conf.id} className={cardBase} {...linkProps}>
                  <p className="text-xl font-bold text-zinc-900 leading-snug group-hover:text-[#CC0000] transition-colors">
                    {conf.title}
                  </p>

                  {conf.description && (
                    <p className="text-base text-zinc-600 leading-relaxed">
                      {conf.description}
                    </p>
                  )}

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
