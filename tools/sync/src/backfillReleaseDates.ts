// Backfill records.original_release_date — the album's ORIGINAL release date
// (day/month/year when known), not the owned pressing's year.
//
// Discogs `basic_information.year` (stored in records.year) is the pressing /
// reissue year, so reissues report the wrong era. Here we resolve the original
// date from the internet:
//   1. MusicBrainz release-group `first-release-date` (ISO, often full YYYY-MM-DD)
//   2. fallback: Discogs master `year` (year only)
// Stored as a text ISO 8601 string with whatever precision the source has
// ("1959-08-17", "1972-03", or "1959"). Idempotent + resumable: only rows whose
// original_release_date is still null are touched.
import "./utils/env.js";

import fetch from "node-fetch";
import { supabaseAdmin } from "./utils/supabase.js";
import { env } from "./utils/env.js";
import { logInfo, logWarn, logError } from "./utils/log.js";

const USER_AGENT = "RecordCollection/1.0 (https://records.manhart.io)";

const sleep = (ms: number) => {
  const { promise, resolve } = Promise.withResolvers<void>();
  setTimeout(resolve, ms);
  return promise;
};

// Strip characters that break a Lucene phrase query.
const lucene = (s: string) => s.replace(/["\\:]/g, " ").replace(/\s+/g, " ").trim();

interface MbReleaseGroup {
  title: string;
  "first-release-date"?: string;
  "primary-type"?: string;
  score?: number;
}

// MusicBrainz: 1 req/s with a descriptive User-Agent (their requirement).
async function musicBrainzDate(
  artist: string,
  title: string
): Promise<string | null> {
  await sleep(1100);
  const q = `artist:"${lucene(artist)}" AND releasegroup:"${lucene(title)}"`;
  const u = `https://musicbrainz.org/ws/2/release-group/?query=${encodeURIComponent(
    q
  )}&fmt=json&limit=15`;
  const res = await fetch(u, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) {
    logWarn(`⚠️ MB ${res.status} for "${artist} – ${title}"`);
    return null;
  }
  const data = (await res.json()) as { "release-groups"?: MbReleaseGroup[] };
  const groups = (data["release-groups"] || []).filter(
    (g) => g["first-release-date"]
  );
  if (!groups.length) return null;
  // Best textual match wins; among comparable scores prefer the earliest date
  // (the true original) and a primary Album over singles/compilations.
  groups.sort((a, b) => {
    const score = (b.score ?? 0) - (a.score ?? 0);
    if (Math.abs(score) > 5) return score;
    const albumA = a["primary-type"] === "Album" ? 0 : 1;
    const albumB = b["primary-type"] === "Album" ? 0 : 1;
    if (albumA !== albumB) return albumA - albumB;
    return (a["first-release-date"] || "").localeCompare(
      b["first-release-date"] || ""
    );
  });
  return groups[0]["first-release-date"] || null;
}

// Discogs fallback: master year (year only). 1.1s/request stays under the
// authenticated 60/min limit.
const masterCache = new Map<number, number | null>();
async function discogsMasterYear(releaseId: number): Promise<number | null> {
  const headers = {
    "User-Agent": USER_AGENT,
    Authorization: `Discogs token=${env.DISCOGS_API_TOKEN}`,
  };
  await sleep(1100);
  const rel = (await (
    await fetch(`https://api.discogs.com/releases/${releaseId}`, { headers })
  ).json()) as { master_id?: number; year?: number };
  const masterId = rel?.master_id;
  if (masterId) {
    let y = masterCache.get(masterId);
    if (y === undefined) {
      await sleep(1100);
      const m = (await (
        await fetch(`https://api.discogs.com/masters/${masterId}`, { headers })
      ).json()) as { year?: number };
      y = m?.year || null;
      masterCache.set(masterId, y);
    }
    if (y) return y;
  }
  return rel?.year || null;
}

async function backfill() {
  const { data: records, error } = await supabaseAdmin
    .from("records")
    .select("id, release_id, artist, title, year")
    .is("original_release_date", null)
    .order("id", { ascending: true });

  if (error || !records) {
    logError("❌ Failed to fetch records:", error);
    process.exit(1);
  }

  logInfo(`📅 ${records.length} records need an original release date.`);
  let mb = 0;
  let dg = 0;
  let missed = 0;

  for (const r of records) {
    const label = `${r.artist} – ${r.title}`;
    try {
      let date = await musicBrainzDate(r.artist, r.title);
      let source = "MB";
      if (!date) {
        const year = await discogsMasterYear(
          (r.release_id as number) ?? r.id
        );
        if (year) {
          date = String(year);
          source = "Discogs";
        }
      }
      if (!date) {
        missed++;
        logWarn(`⚠️ No date found for "${label}"`);
        continue;
      }

      const { error: upErr } = await supabaseAdmin
        .from("records")
        .update({ original_release_date: date })
        .eq("id", r.id);
      if (upErr) {
        logError(`❌ Update failed for "${label}":`, upErr);
        continue;
      }

      source === "MB" ? mb++ : dg++;
      logInfo(`✅ ${label} → ${date} [${source}]`);
    } catch (err) {
      logError(`❌ Error on "${label}":`, err);
    }
  }

  logInfo(
    `📅 Done: ${mb} from MusicBrainz, ${dg} from Discogs year, ${missed} unresolved.`
  );
}

backfill();
