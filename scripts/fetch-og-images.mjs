#!/usr/bin/env node

/**
 * Fetches OG images for all article URLs and saves to src/data/og-images.json
 * Run: node scripts/fetch-og-images.mjs
 */

const articles = [
  // Writing 2025
  "https://www.asimov.press/p/arabidopsis",
  "https://www.asimov.press/p/broad-antivenom",
  "https://www.asimov.press/p/leeches",
  "https://www.asimov.press/p/food-futurism",
  "https://www.asimov.press/p/barcoding-brains",
  "https://longnow.org/ideas/pantone-02123/",
  // Writing 2024
  "https://worksinprogress.co/issue/animals-as-chemical-factories/",
  "https://www.asimov.press/p/rodent-welfare",
  "https://www.asimov.press/p/lessons-on-starting-a-magazine",
  // Fiction
  "https://press.asimov.com/articles/obit",
  "https://www.asimov.press/p/farma",
  "https://www.asimov.press/p/the-vector-zoo",
];

async function fetchOgImage(url) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; OGImageFetcher/1.0)" },
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
    });
    const html = await res.text();

    // Try og:image first, then twitter:image
    const ogMatch = html.match(
      /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i
    ) || html.match(
      /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i
    );

    if (ogMatch) return ogMatch[1];

    const twitterMatch = html.match(
      /<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i
    ) || html.match(
      /<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i
    );

    return twitterMatch ? twitterMatch[1] : null;
  } catch (err) {
    console.error(`  Failed: ${url} — ${err.message}`);
    return null;
  }
}

async function main() {
  const results = {};
  console.log(`Fetching OG images for ${articles.length} articles...\n`);

  for (const url of articles) {
    process.stdout.write(`  ${url} ... `);
    const image = await fetchOgImage(url);
    if (image) {
      results[url] = image;
      console.log("OK");
    } else {
      console.log("no image found");
    }
  }

  const outPath = new URL("../src/data/og-images.json", import.meta.url);
  const fs = await import("fs");
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2) + "\n");
  console.log(`\nSaved ${Object.keys(results).length} images to src/data/og-images.json`);
}

main();
