import fs from "node:fs/promises";
import path from "node:path";

const DBLP_URL = "https://dblp.org/pid/36/4372.xml";
const OUT_FILE = path.join(
  process.cwd(),
  "src/app/publications/fallback-publications.json",
);

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

function parsePublications(xml) {
  const rBlocks = extractTags(xml, "r");
  return rBlocks.map((block, i) => {
    const typeMatch = block.match(/^<(\w+)\s/);
    const type = typeMatch ? typeMatch[1] : "unknown";
    const isJournal = type === "article";
    const key = getAttribute(block, "key") ?? `pub-${i}`;
    const title = extractTag(block, "title")?.replace(/\.$/, "") ?? "Untitled";
    const year = parseInt(extractTag(block, "year") ?? "0", 10) || 0;
    const authors = extractTags(block, "author").map((a) =>
      a.replace(/<[^>]+>/g, "").trim(),
    );
    const venue =
      extractTag(block, "journal") ?? extractTag(block, "booktitle") ?? "";
    const url = extractTag(block, "ee") ?? null;
    return { key, title, authors, venue, year, isJournal, url };
  });
}

async function main() {
  const res = await fetch(DBLP_URL);
  if (!res.ok) {
    throw new Error(`DBLP fetch failed: ${res.status}`);
  }
  const xml = await res.text();
  const pubs = parsePublications(xml);
  await fs.writeFile(OUT_FILE, `${JSON.stringify(pubs, null, 2)}\n`, "utf8");
  console.log(`Wrote ${pubs.length} publications to ${OUT_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
