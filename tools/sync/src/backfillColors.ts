// One-time backfill: populate records.dominant_color for the existing catalog.
// New records get their color during the normal image-upload step, but records
// that already have a cover are never re-uploaded, so their color must be
// computed here from the stored cover. Idempotent: only touches rows where
// dominant_color is still null.
import "./utils/env.js";

import fetch from "node-fetch";
import { supabase, supabaseAdmin } from "./utils/supabase.js";
import { extractDominantColor } from "./utils/extractDominantColor.js";
import { logInfo, logWarn, logError } from "./utils/log.js";

async function backfillColors() {
  const { data: records, error } = await supabase
    .from("records")
    .select("id, title, supabase_image_url")
    .is("dominant_color", null)
    .not("supabase_image_url", "is", null);

  if (error || !records) {
    logError("❌ Failed to fetch records for backfill:", error);
    process.exit(1);
  }

  logInfo(`🎨 ${records.length} records need a dominant color.`);

  let updated = 0;
  let failed = 0;

  for (const record of records) {
    try {
      const response = await fetch(record.supabase_image_url as string);
      if (!response.ok) {
        logWarn(`⚠️ Cover fetch failed for "${record.title}" (${record.id})`);
        failed++;
        continue;
      }

      const color = await extractDominantColor(await response.arrayBuffer());
      if (!color) {
        logWarn(`⚠️ Color extraction failed for "${record.title}" (${record.id})`);
        failed++;
        continue;
      }

      const { error: updateError } = await supabaseAdmin
        .from("records")
        .update({ dominant_color: color })
        .eq("id", record.id);

      if (updateError) {
        logError(`❌ Update failed for "${record.title}":`, updateError);
        failed++;
        continue;
      }

      updated++;
      logInfo(`✅ ${record.title} → ${color}`);
    } catch (err) {
      logError(`❌ Error backfilling "${record.title}":`, err);
      failed++;
    }
  }

  logInfo(`🎨 Backfill complete: ${updated} updated, ${failed} failed.`);
}

backfillColors();
