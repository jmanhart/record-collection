import fetch from "node-fetch";
import { logInfo, logWarn, logError } from "./log.js";
import { supabaseAdmin } from "./supabase.js";

const USER_AGENT = "record-collection-sync/1.0 (https://records.manhart.io)";
// MusicBrainz allows ~1 req/sec; each record can involve 2 calls (search +
// release detail), so we sleep this long after every individual call.
const REQUEST_INTERVAL_MS = 1100;

interface DiscogsTrack {
  position: string;
  title: string;
  duration: string;
  type_?: string;
}

interface MusicBrainzSearchRelease {
  id: string;
  title: string;
  media?: Array<{ "track-count"?: number }>;
}

interface MusicBrainzSearchResponse {
  releases?: MusicBrainzSearchRelease[];
}

interface MusicBrainzTrack {
  title: string;
  length: number | null;
}

interface MusicBrainzReleaseDetail {
  id: string;
  media?: Array<{ tracks?: MusicBrainzTrack[] }>;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseDuration(duration: string): number {
  if (!duration || !duration.includes(":")) return 0;
  const parts = duration.split(":");
  const minutes = parseInt(parts[0], 10);
  const seconds = parseInt(parts[1], 10);
  if (isNaN(minutes) || isNaN(seconds)) return 0;
  return minutes * 60 + seconds;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

async function searchMusicBrainzRelease(
  artist: string,
  title: string
): Promise<MusicBrainzSearchRelease[]> {
  const query = `artist:"${artist}" AND release:"${title}"`;
  const url = `https://musicbrainz.org/ws/2/release/?query=${encodeURIComponent(
    query
  )}&fmt=json`;

  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!response.ok) {
    throw new Error(
      `MusicBrainz search failed: ${response.status} ${response.statusText}`
    );
  }

  const data = (await response.json()) as MusicBrainzSearchResponse;
  return data.releases || [];
}

function pickCandidate(
  releases: MusicBrainzSearchRelease[],
  targetTrackCount: number
): MusicBrainzSearchRelease | null {
  for (const release of releases) {
    const totalTracks = (release.media || []).reduce(
      (sum, m) => sum + (m["track-count"] || 0),
      0
    );
    if (totalTracks === targetTrackCount) {
      return release;
    }
  }
  return null;
}

async function fetchMusicBrainzReleaseDetail(
  mbid: string
): Promise<MusicBrainzReleaseDetail> {
  const url = `https://musicbrainz.org/ws/2/release/${mbid}?inc=recordings&fmt=json`;

  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!response.ok) {
    throw new Error(
      `MusicBrainz release lookup failed: ${response.status} ${response.statusText}`
    );
  }

  return (await response.json()) as MusicBrainzReleaseDetail;
}

function matchTracks(
  tracklist: DiscogsTrack[],
  mbTracks: MusicBrainzTrack[]
): { filled: number; updated: DiscogsTrack[] } {
  const updated = tracklist.map((t) => ({ ...t }));

  const mbByTitle = new Map<string, number | null>();
  for (const mbTrack of mbTracks) {
    const key = normalizeTitle(mbTrack.title);
    if (!mbByTitle.has(key)) mbByTitle.set(key, mbTrack.length);
  }

  const nonHeading = updated
    .map((t, idx) => ({ t, idx }))
    .filter(({ t }) => t.type_ !== "heading");
  const sameCount = nonHeading.length === mbTracks.length;

  let filled = 0;
  nonHeading.forEach(({ t, idx }, position) => {
    if (t.duration) return; // never overwrite an existing Discogs value

    const key = normalizeTitle(t.title);
    let length = mbByTitle.get(key);

    if ((length === undefined || length === null) && sameCount) {
      length = mbTracks[position]?.length ?? undefined;
    }

    if (length) {
      updated[idx].duration = formatDuration(length);
      filled++;
    }
  });

  return { filled, updated };
}

async function backfillForTable(tableName: string): Promise<void> {
  const { data: records, error } = await supabaseAdmin
    .from(tableName)
    .select("id, artist, title, tracklist")
    .not("tracklist", "is", null);

  if (error) {
    throw new Error(`Error fetching ${tableName}: ${error.message}`);
  }

  const candidates = (records || []).filter((r) => {
    const tracklist = (r.tracklist || []) as DiscogsTrack[];
    return tracklist.some((t) => t.type_ !== "heading" && !t.duration);
  });

  if (candidates.length === 0) {
    logInfo(`No ${tableName} records need a MusicBrainz backfill.`);
    return;
  }

  logInfo(
    `Found ${candidates.length} ${tableName} records with missing durations. Querying MusicBrainz...`
  );

  for (let i = 0; i < candidates.length; i++) {
    const record = candidates[i];
    const label = `[${i + 1}/${candidates.length}] ${tableName} ${record.artist} — ${record.title}`;

    try {
      const tracklist = (record.tracklist || []) as DiscogsTrack[];
      const targetCount = tracklist.filter((t) => t.type_ !== "heading").length;

      const releases = await searchMusicBrainzRelease(record.artist, record.title);
      const candidate = pickCandidate(releases, targetCount);

      if (!candidate) {
        logWarn(`${label}: no MusicBrainz release matched track count ${targetCount}`);
        continue;
      }

      await sleep(REQUEST_INTERVAL_MS);
      const detail = await fetchMusicBrainzReleaseDetail(candidate.id);
      const mbTracks = (detail.media || []).flatMap((m) => m.tracks || []);

      const { filled, updated } = matchTracks(tracklist, mbTracks);

      if (filled === 0) {
        logWarn(
          `${label}: matched MusicBrainz release ${candidate.id} but filled 0 tracks (title/position mismatch)`
        );
        continue;
      }

      const durationSeconds = updated.reduce(
        (sum, t) => sum + parseDuration(t.duration),
        0
      );

      const { error: updateError } = await supabaseAdmin
        .from(tableName)
        .update({ tracklist: updated, duration_seconds: durationSeconds })
        .eq("id", record.id);

      if (updateError) {
        logError(`Failed to update ${tableName} record ${record.id}:`, updateError);
      } else {
        logInfo(
          `${label}: filled ${filled} track(s) from MusicBrainz release ${candidate.id}`
        );
      }
    } catch (err) {
      logError(`Error backfilling ${tableName} record ${record.id}:`, err);
    } finally {
      if (i < candidates.length - 1) {
        await sleep(REQUEST_INTERVAL_MS);
      }
    }
  }
}

export async function syncMusicBrainzDurations(): Promise<void> {
  logInfo("Starting MusicBrainz duration backfill for collection...");
  await backfillForTable("records");

  logInfo("Starting MusicBrainz duration backfill for wishlist...");
  await backfillForTable("wishlist");

  logInfo("MusicBrainz duration backfill completed!");
}
