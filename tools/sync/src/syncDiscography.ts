import "./utils/env.js";
import { syncDiscographyTargets } from "./utils/syncDiscographyTargets.js";
import { logInfo, logError } from "./utils/log.js";

async function run() {
  try {
    logInfo("🎯 Starting discography targets sync...");
    await syncDiscographyTargets();
    logInfo("✅ Discography targets sync completed!");
  } catch (error) {
    logError("❌ Sync failed", error);
    process.exit(1);
  }
}

run();
