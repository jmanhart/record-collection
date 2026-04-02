import fetch from "node-fetch";
import { logInfo, logWarn, logError } from "./log.js";
import { supabaseAdmin } from "./supabase.js";
import { env } from "./env.js";

interface DiscogsTrack {
  position: string;
  title: string;
  duration: string;
}

interface DiscogsRelease {
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

async function fetchReleaseDuration(releaseId: number): Promise<number> {
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
  const totalSeconds = (data.tracklist || []).reduce(
    (sum, track) => sum + parseDuration(track.duration),
    0
  );

  return totalSeconds;
}

async function syncDurationsForTable(tableName: string): Promise<void> {
  const { data: records, error } = await supabaseAdmin
    .from(tableName)
    .select("id")
    .is("duration_seconds", null);

  if (error) {
    logError(`Error fetching ${tableName} records without durations:`, error);
    throw error;
  }

  if (!records || records.length === 0) {
    logInfo(`All ${tableName} records already have durations.`);
    return;
  }

  logInfo(
    `Found ${records.length} ${tableName} records without durations. Fetching from Discogs...`
  );

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    try {
      const duration = await fetchReleaseDuration(record.id);

      const { error: updateError } = await supabaseAdmin
        .from(tableName)
        .update({ duration_seconds: duration })
        .eq("id", record.id);

      if (updateError) {
        logError(
          `Failed to update duration for ${tableName} record ${record.id}:`,
          updateError
        );
      } else {
        const formatted =
          duration > 0
            ? `${Math.floor(duration / 60)}m ${duration % 60}s`
            : "0s (no track durations)";
        logInfo(
          `[${i + 1}/${records.length}] ${tableName} record ${record.id}: ${formatted}`
        );
      }

      // Rate limit: 1 request per second
      if (i < records.length - 1) {
        await sleep(1000);
      }
    } catch (err) {
      logError(
        `Error fetching duration for ${tableName} record ${record.id}:`,
        err
      );
      // Continue with next record
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
