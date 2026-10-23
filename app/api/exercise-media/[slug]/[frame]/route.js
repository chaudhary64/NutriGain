import { NextResponse } from "next/server";

/**
 * Exercise artwork proxy.
 *
 * The illustrations live in Bryl Lim's open Workout Guide library, not in this
 * repository: 302 movements × 3 frames is a catalogue that grows, and copying a
 * subset into public/ makes every new exercise a binary commit plus a redeploy.
 * Serving them through one route means a new movement only needs its slug,
 * and the artwork is fetched once and cached for a year.
 *
 * Upstream is jsDelivr's GitHub CDN rather than raw.githubusercontent.com:
 * GitHub rate-limits unauthenticated raw requests and asks that its raw
 * endpoints not be used as a CDN, while jsDelivr publishes the file from
 * permanent storage with `immutable` caching. The commit is pinned, so a cached
 * URL can never change its bytes; bump LIBRARY_COMMIT to take a new release.
 *
 * The artwork is CC BY-SA 4.0 — the credit lives in the gym board and in
 * ATTRIBUTION.md at the repository root.
 */

const LIBRARY_COMMIT = "aac599224bb9780305239607ef98540b7e0ce389";
const ASSET_PATH = "packages/workout-guide/assets";

/* Same commit, two origins: jsDelivr first, GitHub raw as the fallback if the
   CDN is unreachable from the deployment. */
const SOURCES = [
  `https://cdn.jsdelivr.net/gh/bryllim/workout-guide@${LIBRARY_COMMIT}/${ASSET_PATH}`,
  `https://raw.githubusercontent.com/bryllim/workout-guide/${LIBRARY_COMMIT}/${ASSET_PATH}`,
];

const FRAMES = new Set(["1", "2", "3"]);

/* The slug is a folder name and the frame a fixed set, so the only URLs this
   route can reach upstream are illustration files. */
const SLUG = /^[a-z0-9][a-z0-9-]{1,63}$/;

const ART_HEADERS = {
  "Content-Type": "image/svg+xml; charset=utf-8",
  // A pinned commit means these bytes are immutable.
  "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
  "X-Content-Type-Options": "nosniff",
  // The file is drawn, never a document: nothing in it should be able to load.
  "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'",
};

export async function GET(request, { params }) {
  const { slug, frame } = await params;

  if (!SLUG.test(slug || "") || !FRAMES.has(frame)) {
    return NextResponse.json(
      { error: "Unknown exercise illustration" },
      { status: 404, headers: { "Cache-Control": "public, max-age=3600" } }
    );
  }

  const path = `${slug}/frame-${frame}.svg`;
  let missing = 0;

  for (const source of SOURCES) {
    try {
      const upstream = await fetch(`${source}/${path}`, {
        // The URL is commit-pinned, so Next may hold the response indefinitely.
        next: { revalidate: 31536000 },
      });

      if (upstream.status === 404) {
        missing += 1;
        continue;
      }
      if (!upstream.ok) continue;

      return new NextResponse(await upstream.text(), {
        status: 200,
        headers: ART_HEADERS,
      });
    } catch {
      // Try the next origin; a CDN outage should not blank the board.
    }
  }

  // Every origin said the file does not exist: the slug is simply not in the
  // library, which is a client-side 404 rather than a delivery failure.
  if (missing === SOURCES.length) {
    return NextResponse.json(
      { error: "Unknown exercise illustration" },
      { status: 404, headers: { "Cache-Control": "public, max-age=3600" } }
    );
  }

  return NextResponse.json(
    { error: "Illustration unavailable" },
    { status: 502, headers: { "Cache-Control": "no-store" } }
  );
}
