export const metadata = {
  title: "Publications · Machine Learning & Data Science Lab",
  description: "Publications from the lab",
};

export const revalidate = 86400;

function extractTags(xml, tag) {
  const results = [];
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "g");
  let match;
  while ((match = regex.exec(xml)) !== null) {
    results.push(match[1].trim());
  }
  return results;
}

function extractTag(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  return match ? match[1].trim() : null;
}

function getAttribute(xml, attr) {
  const match = xml.match(new RegExp(`${attr}="([^"]*)"`));
  return match ? match[1] : null;
}

async function fetchPublications() {
  try {
    const res = await fetch("https://dblp.org/pid/36/4372.xml", {
      cache: "no-store",
    });

    if (!res.ok) throw new Error(`DBLP responded with status ${res.status}`);

    const xml = await res.text();

    if (!xml || xml.trim().length === 0) {
      throw new Error("DBLP returned an empty response");
    }

    // Split into individual <r>...</r> publication blocks
    const rBlocks = extractTags(xml, "r");

    if (rBlocks.length === 0) {
      throw new Error("No publication records found in DBLP response");
    }

    return {
      pubs: rBlocks.map((block, i) => {
        const typeMatch = block.match(/^<(\w+)\s/);
        const type = typeMatch ? typeMatch[1] : "unknown";
        const isJournal = type === "article";

        const key = getAttribute(block, "key") ?? `pub-${i}`;
        const title = extractTag(block, "title")?.replace(/\.$/, "") ?? "Untitled";
        const year = parseInt(extractTag(block, "year") ?? "0") || 0;
        const authors = extractTags(block, "author").map((a) =>
          a.replace(/<[^>]+>/g, "").trim()
        );
        const venue =
          extractTag(block, "journal") ?? extractTag(block, "booktitle") ?? "";
        const url = extractTag(block, "ee") ?? null;

        return { key, title, authors, venue, year, isJournal, url };
      }),
      error: null,
    };
  } catch (err) {
    console.error("Failed to fetch DBLP publications:", err);
    return { pubs: [], error: err.message };
  }
}

function groupByYear(pubs) {
  const map = {};
  for (const pub of pubs) {
    if (!map[pub.year]) map[pub.year] = [];
    map[pub.year].push(pub);
  }
  return Object.entries(map)
    .sort(([a], [b]) => Number(b) - Number(a))
    .map(([year, items]) => ({ year: Number(year), items }));
}

function PublicationCard({ pub }) {
  const href = pub.url || "#";
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-zinc-400 hover:shadow-md"
    >
      <span
        className={`mb-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
          pub.isJournal
            ? "bg-blue-50 text-blue-700"
            : "bg-amber-50 text-amber-700"
        }`}
      >
        {pub.isJournal ? "Journal" : "Conference"}
      </span>

      <p className="mb-2 font-semibold text-zinc-900 leading-snug group-hover:text-blue-700 transition-colors duration-150">
        {pub.title}
      </p>

      <p className="mb-1 text-sm text-zinc-500 line-clamp-2">
        {pub.authors.join(", ")}
      </p>

      {pub.venue && (
        <p className="text-sm font-medium text-zinc-600 italic">{pub.venue}</p>
      )}
    </a>
  );
}

export default async function PublicationsPage() {
  const { pubs, error } = await fetchPublications();
  const grouped = groupByYear(pubs);
  const total = pubs.length;

  return (
    <main className="min-h-screen bg-zinc-50">
      <section className="border-b border-zinc-200 bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-bold tracking-tight text-black">
            Publications
          </h1>
          {total > 0 && (
            <p className="mt-2 text-zinc-500">
              {total} publications · sourced from{" "}
              <a
                href="https://dblp.org/pid/36/4372.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                DBLP
              </a>
            </p>
          )}
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          {total === 0 ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-10 text-center">
              <p className="text-zinc-500">
                Could not load publications. Please try again later or visit{" "}
                <a
                  href="https://dblp.org/pid/36/4372.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  DBLP directly
                </a>
                .
              </p>
              {error && (
                <p className="mt-3 text-xs text-red-400 font-mono">{error}</p>
              )}
            </div>
          ) : (
            <div className="space-y-12">
              {grouped.map(({ year, items }) => (
                <div key={year}>
                  <div className="mb-5 flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-zinc-900">{year}</h2>
                    <span className="rounded-full bg-zinc-200 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
                      {items.length}
                    </span>
                    <div className="h-px flex-1 bg-zinc-200" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {items.map((pub) => (
                      <PublicationCard key={pub.key} pub={pub} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
