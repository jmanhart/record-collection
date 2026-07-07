import "./utils/env.js";
import { syncMusicBrainzDurations } from "./utils/fetchMusicBrainzDurations.js";
import { logError } from "./utils/log.js";

syncMusicBrainzDurations().catch((err) => {
  logError("MusicBrainz duration backfill failed", err);
  process.exit(1);
});
