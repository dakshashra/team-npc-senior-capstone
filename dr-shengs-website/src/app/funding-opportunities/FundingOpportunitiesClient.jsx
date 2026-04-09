"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "@/app/firebase";

export function FundingOpportunitiesClient() {
  const [fundingDocs, setFundingDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const q = query(collection(db, "funding"));
        const snap = await getDocs(q);

        const now = new Date();
        now.setHours(0, 0, 0, 0); // Include today's deadlines

        const docs = [];
        snap.forEach((doc) => {
          const data = doc.data();
          if (data.deadline && data.deadline !== "N/A") {
            let dateObj = null;
            let deadlineStr = data.deadline;

            if (typeof data.deadline === 'string') {
              dateObj = new Date(data.deadline);
            } else if (typeof data.deadline?.toDate === 'function') {
              dateObj = data.deadline.toDate();
              deadlineStr = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
            } else if (data.deadline instanceof Date) {
              dateObj = data.deadline;
              deadlineStr = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
            } else if (typeof data.deadline === 'number') {
              dateObj = new Date(data.deadline);
              deadlineStr = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
            }

            if (dateObj && !isNaN(dateObj) && dateObj >= now) {
              let desc = data.description || "";
              if (desc.length > 1000) {
                desc = desc.substring(0, 1000) + "...";
              }

              docs.push({
                id: doc.id,
                title: data.title || "",
                source: data.source || "",
                description: desc,
                link: data.link || "",
                deadlineStr: typeof deadlineStr === "string" ? deadlineStr : String(deadlineStr),
                deadlineDate: dateObj,
                awardFloor: data.award_floor,
                awardCeiling: data.award_ceiling,
              });
            }
          }
        });

        // "most recent to later" -> Ascending order by deadline
        docs.sort((a, b) => a.deadlineDate - b.deadlineDate);

        setFundingDocs(docs);
      } catch (err) {
        console.error(err);
        setError("Could not load funding opportunities.");
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
          Funding Opportunities
        </h1>

        {loading ? (
          <p className="text-zinc-500">Loading opportunities...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : fundingDocs.length === 0 ? (
          <p className="text-zinc-600">No upcoming funding opportunities at this time.</p>
        ) : (
          <div className="flex flex-col gap-6 w-full">
            {fundingDocs.map((item) => (
              <a
                key={item.id}
                href={item.link ? item.link : '#'}
                target={item.link ? "_blank" : "_self"}
                rel={item.link ? "noopener noreferrer" : ""}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:ring-1 hover:ring-[#CC0000]"
              >
                <div>
                  <h2 className="text-xl font-bold text-zinc-900 group-hover:text-[#CC0000] transition-colors">{item.title || item.source}</h2>
                  {item.title && item.source && (
                    <p className="mt-1 text-sm font-semibold text-zinc-500 tracking-wide">{item.source}</p>
                  )}
                  <p className="mt-4 text-sm leading-relaxed text-zinc-700 whitespace-pre-wrap">
                    {item.description}
                  </p>
                </div>
                <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-zinc-100 pt-4">
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-zinc-400 group-hover:text-[#CC0000] transition-colors shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                    <span className="text-sm font-semibold text-zinc-600 group-hover:text-[#CC0000] transition-colors">
                      Due: {item.deadlineStr}
                    </span>
                  </div>
                  
                  {(item.awardFloor != null || item.awardCeiling != null) && (
                    <div className="flex items-center gap-2">
                      <svg className="h-5 w-5 text-zinc-400 group-hover:text-[#CC0000] transition-colors shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-semibold text-zinc-600 group-hover:text-[#CC0000] transition-colors">
                        {item.awardFloor != null && item.awardCeiling != null
                          ? `${!isNaN(Number(item.awardFloor)) ? '$' + Number(item.awardFloor).toLocaleString() : item.awardFloor} - ${!isNaN(Number(item.awardCeiling)) ? '$' + Number(item.awardCeiling).toLocaleString() : item.awardCeiling}`
                          : item.awardCeiling != null
                            ? `Up to ${!isNaN(Number(item.awardCeiling)) ? '$' + Number(item.awardCeiling).toLocaleString() : item.awardCeiling}`
                            : `Starts at ${!isNaN(Number(item.awardFloor)) ? '$' + Number(item.awardFloor).toLocaleString() : item.awardFloor}`
                        }
                      </span>
                    </div>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}

        <div className="mt-10 pt-6 border-t border-zinc-200">
          <a
            href="https://simpler.grants.gov/search"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#CC0000] hover:text-[#aa0000] transition-colors group"
          >
            Find More Opportunities
            <svg
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </div>
      </div>
    </main>
  );
}
