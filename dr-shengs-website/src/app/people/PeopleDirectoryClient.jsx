"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/app/firebase";

export function PeopleDirectoryClient() {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPeople() {
      setLoading(true);
      setError("");
      try {
        const snap = await getDocs(collection(db, "people"));
        const rows = snap.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            name: String(data.name ?? ""),
            education: String(data.education ?? ""),
            position: String(data.position ?? ""),
            area: String(data.area ?? ""),
            image_url: String(data.image_url ?? ""),
          };
        });
        setPeople(rows);
      } catch (err) {
        console.error(err);
        setError("Could not load people right now.");
      } finally {
        setLoading(false);
      }
    }

    loadPeople();
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold font-sans tracking-tight text-black">
          People
        </h1>

        {loading ? (
          <p className="mt-8 text-sm text-zinc-500">Loading people...</p>
        ) : error ? (
          <p className="mt-8 text-sm text-red-600">{error}</p>
        ) : people.length === 0 ? (
          <p className="mt-8 text-sm text-zinc-600">No people found.</p>
        ) : (
          <section className="mt-8">
            {people.map((person, index) => (
              <div key={person.id}>
                <article className="grid grid-cols-1 gap-5 py-6 sm:grid-cols-[11rem_1fr] sm:gap-7">
                  <div className="h-44 w-44 overflow-hidden rounded-xl border border-black/70 bg-zinc-50">
                    {person.image_url ? (
                      <img
                        src={person.image_url}
                        alt={person.name || "Profile picture"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-zinc-500">
                        Picture
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 text-zinc-900">
                    <p className="text-xl font-bold">{person.name || "-"}</p>
                    <p className="text-base">
                      <span className="font-semibold">Education:</span>{" "}
                      {person.education || "-"}
                    </p>
                    <p className="text-base">
                      <span className="font-semibold">Position:</span>{" "}
                      {person.position || "-"}
                    </p>
                    <p className="text-base">
                      <span className="font-semibold">Area of Research:</span>{" "}
                      {person.area || "-"}
                    </p>
                  </div>
                </article>

                {index < people.length - 1 && (
                  <hr className="border-t border-zinc-200" />
                )}
              </div>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
