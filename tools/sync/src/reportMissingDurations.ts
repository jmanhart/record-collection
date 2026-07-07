import "./utils/env.js";
import { logInfo } from "./utils/log.js";
import { supabaseAdmin } from "./utils/supabase.js";

interface TrackListEntry {
  position: string;
  title: string;
  duration: string;
  type_?: string;
}

async function reportForTable(tableName: string): Promise<{
  recordsWithGaps: number;
  tracksMissing: number;
}> {
  const { data: records, error } = await supabaseAdmin
    .from(tableName)
    .select("id, artist, title, tracklist")
    .not("tracklist", "is", null);

  if (error) {
    throw new Error(`Error fetching ${tableName}: ${error.message}`);
  }

  let recordsWithGaps = 0;
  let tracksMissing = 0;

  for (const record of records || []) {
    const tracklist = (record.tracklist || []) as TrackListEntry[];
    const tracks = tracklist.filter((t) => t.type_ !== "heading");
    const missing = tracks.filter((t) => !t.duration);

    if (missing.length > 0) {
      recordsWithGaps++;
      tracksMissing += missing.length;
      logInfo(
        `[${tableName}] ${record.artist} — ${record.title} (id ${record.id}): ${missing.length}/${tracks.length} tracks missing duration`
      );
    }
  }

  return { recordsWithGaps, tracksMissing };
}

async function run() {
  logInfo("Scanning for tracks with missing durations...");

  const recordsResult = await reportForTable("records");
  const wishlistResult = await reportForTable("wishlist");

  logInfo(
    `Summary — records: ${recordsResult.recordsWithGaps} records / ${recordsResult.tracksMissing} tracks missing duration`
  );
  logInfo(
    `Summary — wishlist: ${wishlistResult.recordsWithGaps} records / ${wishlistResult.tracksMissing} tracks missing duration`
  );
}

run();
