import fetch from "node-fetch";
import { logInfo, logWarn, logError } from "./log.js";
import { supabaseAdmin } from "./supabase.js";
import { env } from "./env.js";

interface DiscogsTrack {
  position: string;
  title: string;
  duration: string;
  type_?: string;
}

interface DiscogsRelease {
  tracklist: DiscogsTrack[];
}

interface ReleaseDetails {
  durationSeconds: number;
  tracklist: DiscogsTrack[];
}

function parseDuration(duration: string): number {
  if (!duration || !duration.includes(":")) return 0;
  const parts = duration.split(":");
  const minutes = parseInt(parts[0], 10);
  const seconds = parseInt(parts[1], 10);
  if (isNaN(minutes) || isNaN(seconds)) return 0;
  return minutes * 60 + seconds;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchReleaseDetails(releaseId: number): Promise<ReleaseDetails> {
  const response = await fetch(
    `https://api.discogs.com/releases/${releaseId}`,
    {
      headers: { Authorization: `Discogs token=${env.DISCOGS_API_TOKEN}` },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch release ${releaseId}: ${response.status} ${response.statusText}`
    );
  }

  const data = (await response.json()) as DiscogsRelease;
  const tracklist = data.tracklist || [];
  const durationSeconds = tracklist.reduce(
    (sum, track) => sum + parseDuration(track.duration),
    0
  );

  return { durationSeconds, tracklist };
}

async function syncDurationsForTable(tableName: string): Promise<void> {
  const { data: records, error } = await supabaseAdmin
    .from(tableName)
    .select("id")
    .is("tracklist", null);

  if (error) {
    logError(`Error fetching ${tableName} records without tracklists:`, error);
    throw error;
  }

  if (!records || records.length === 0) {
    logInfo(`All ${tableName} records already have tracklists.`);
    return;
  }

  logInfo(
    `Found ${records.length} ${tableName} records without tracklists. Fetching from Discogs...`
  );

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    try {
      const { durationSeconds, tracklist } = await fetchReleaseDetails(record.id);

      const { error: updateError } = await supabaseAdmin
        .from(tableName)
        .update({ duration_seconds: durationSeconds, tracklist })
        .eq("id", record.id);

      if (updateError) {
        logError(
          `Failed to update duration/tracklist for ${tableName} record ${record.id}:`,
          updateError
        );
      } else {
        const formatted =
          durationSeconds > 0
            ? `${Math.floor(durationSeconds / 60)}m ${durationSeconds % 60}s`
            : "0s (no track durations)";
        logInfo(
          `[${i + 1}/${records.length}] ${tableName} record ${record.id}: ${formatted}, ${tracklist.length} tracks`
        );
      }
    } catch (err) {
      logError(
        `Error fetching duration/tracklist for ${tableName} record ${record.id}:`,
        err
      );
      // Continue with next record
    } finally {
      // Rate limit: 1 request per second, even after a failed request —
      // otherwise a single error (e.g. a transient 429) skips the delay
      // and the next request fires immediately, which can trip the rate
      // limit again and cascade into a run of back-to-back failures.
      if (i < records.length - 1) {
        await sleep(1000);
      }
    }
  }
}

export async function syncDurations(): Promise<void> {
  logInfo("Starting duration sync for collection...");
  await syncDurationsForTable("records");

  logInfo("Starting duration sync for wishlist...");
  await syncDurationsForTable("wishlist");

  logInfo("Duration sync completed!");
}
