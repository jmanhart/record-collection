// Import environment module first to ensure variables are loaded
import "./utils/env.js";

import { fetchDiscogsRecords } from "./utils/fetchDiscogs.js";
import { updateSupabaseRecords } from "./utils/updateSupabase.js";
import { syncWishlist } from "./utils/fetchWantlist.js";
import { syncDurations } from "./utils/fetchDurations.js";
import { syncMusicBrainzDurations } from "./utils/fetchMusicBrainzDurations.js";
import { syncDiscographyTargets } from "./utils/syncDiscographyTargets.js";
import { logInfo, logError } from "./utils/log.js";

async function run() {
  try {
    logInfo("🚀 Starting Discogs sync...");
    const records = await fetchDiscogsRecords();
    await updateSupabaseRecords(records);
    logInfo("✅ Collection sync completed!");

    logInfo("🚀 Starting wishlist sync...");
    await syncWishlist();
    logInfo("✅ Wishlist sync completed!");

    logInfo("🕐 Starting duration sync...");
    await syncDurations();
    logInfo("✅ Duration sync completed!");

    // Best-effort: MusicBrainz is a second external service, and this step
    // fills gaps Discogs itself didn't have data for. A failure here
    // shouldn't fail the whole sync run (see outer catch below).
    logInfo("🎵 Starting MusicBrainz duration backfill...");
    try {
      await syncMusicBrainzDurations();
      logInfo("✅ MusicBrainz duration backfill completed!");
    } catch (error) {
      logError("⚠️ MusicBrainz backfill failed (non-fatal)", error);
    }

    logInfo("🎯 Starting discography targets sync...");
    await syncDiscographyTargets();
    logInfo("✅ Discography targets sync completed!");

    logInfo("✅ All syncs completed successfully!");
  } catch (error) {
    logError("❌ Sync failed", error);
    process.exit(1);
  }
}

run();
