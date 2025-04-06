// Import environment module first to ensure variables are loaded
import "./utils/env.js";

import { fetchDiscogsRecords } from "./utils/fetchDiscogs.js";
import { updateSupabaseRecords } from "./utils/updateSupabase.js";
import { logInfo, logError } from "./utils/log.js";

async function run() {
  try {
    logInfo("🚀 Starting Discogs sync...");
    const records = await fetchDiscogsRecords();
    await updateSupabaseRecords(records);
    logInfo("✅ Sync completed successfully!");
  } catch (error) {
    logError("❌ Sync failed", error);
    process.exit(1);
  }
}

run();
