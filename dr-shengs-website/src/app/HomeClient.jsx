"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/app/firebase";

export function HomeClient() {
  const [awards, setAwards] = useState([]);

  useEffect(() => {
    async function loadAwards() {
      try {
        const snap = await getDocs(collection(db, "awards"));
        const items = [];
        snap.forEach((doc) => {
          const data = doc.data();
          items.push({ id: doc.id, title: data.category || "", description: data.description || "" });
        });
        setAwards(items);
      } catch (err) {
        console.error("Failed to load awards:", err);
      }
    }
    loadAwards();
  }, []);

  return (
    <main className="w-full bg-white">
      <section className="mx-auto flex min-h-[calc(100svh-5rem)] w-full max-w-7xl flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 md:grid-cols-[20rem_1fr] lg:grid-cols-[23rem_1fr]">
          <div className="mx-auto w-full max-w-[23rem]">
            <div className="overflow-hidden rounded-2xl border border-zinc-200">
              <Image
                src="/drsheng.jpg"
                alt="Portrait of Dr. Victor S. Sheng"
                width={720}
                height={960}
                className="h-auto w-full object-cover"
                priority
              />
            </div>
          </div>

          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
              Victor S. Sheng, PhD.
            </h1>
            <p className="mt-4 text-xl text-zinc-800">Associate Professor</p>
            <p className="mt-1 text-lg text-zinc-700">
              Department of Computer Science
            </p>
            <p className="mt-1 text-lg text-zinc-700">Texas Tech University</p>
          </div>
        </div>

        <div className="mt-12 max-w-4xl border-t border-zinc-200 pt-8">
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 mb-6">Education</h2>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-4">
              <div>
                <div className="font-semibold text-zinc-900">NSERC Postdoctoral Fellow</div>
                <div className="text-sm text-zinc-700 mt-0.5">Leonard N. Stern School of Business, New York University, USA</div>
              </div>
              <div className="shrink-0 text-sm font-medium text-zinc-500">September 2007 - August 2009</div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-4">
              <div>
                <div className="font-semibold text-zinc-900">Ph.D., Computer Science</div>
                <div className="text-sm text-zinc-700 mt-0.5">The University of Western Ontario, London, Ontario, Canada</div>
              </div>
              <div className="shrink-0 text-sm font-medium text-zinc-500">August 2007</div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-4">
              <div>
                <div className="font-semibold text-zinc-900">M.Sc., Computer Science</div>
                <div className="text-sm text-zinc-700 mt-0.5">University of New Brunswick, Fredericton, New Brunswick, Canada</div>
              </div>
              <div className="shrink-0 text-sm font-medium text-zinc-500">December 2003</div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-4">
              <div>
                <div className="font-semibold text-zinc-900">M.Sc.E., Computer Engineering</div>
                <div className="text-sm text-zinc-700 mt-0.5">Suzhou University, Suzhou, Jiangsu, China</div>
              </div>
              <div className="shrink-0 text-sm font-medium text-zinc-500">July 1999</div>
            </div>
          </div>
        </div>

        {awards.length > 0 && (
          <div className="mt-10 max-w-4xl border-t border-zinc-200 pt-8">
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 mb-6">Awards</h2>
            <div className="flex flex-col gap-3">
              {awards.map((award) => (
                <p key={award.id} className="text-sm text-zinc-700">
                  <span className="font-semibold text-zinc-900">{award.title}</span>
                  {award.description && (
                    <span className="font-normal text-zinc-900"> – {award.description}</span>
                  )}
                </p>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 max-w-4xl border-t border-zinc-200 pt-8 text-sm leading-6 text-zinc-700">
          <p className="text-lg font-bold tracking-tight text-zinc-900">For Prospective Students</p>
          <p className="mt-3 font-semibold text-[#CC0000]">TA/RA positions in PhD program</p>
          <p className="mt-2 text-base">
            I am looking for self-motivated, creative and hard-working Ph.D.
            students. Please feel free to email me (
            <a
              href="mailto:victor.sheng@ttu.edu"
              className="font-medium text-[#CC0000] underline underline-offset-2"
            >
              victor.sheng@ttu.edu
            </a>
            ) your CV if you are interested in my research. TTU is a Carnegie
            Research I (R1) university.
          </p>
        </div>
      </section>
    </main>
  );
}
