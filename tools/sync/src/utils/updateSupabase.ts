import { logInfo, logWarn, logError } from "./log.js";
import { supabase, SUPABASE_STORAGE_URL } from "./supabase.js";
import { DiscogsRecord } from "./fetchDiscogs.js";

const TABLE_NAME = "records";

/**
 * Updates the Supabase `records` table with new records from Discogs.
 * - Ensures only new/missing records are added.
 * - Updates missing `supabase_image_url` values.
 *
 * @param {DiscogsRecord[]} records - The records to insert/update in Supabase.
 */
export async function updateSupabaseRecords(records: DiscogsRecord[]) {
  try {
    if (!Array.isArray(records)) {
      logError("❌ Records input is not an array:", records);
      return;
    }

    if (records.length === 0) {
      logWarn("⚠️ No new records to insert. Skipping Supabase update.");
      return;
    }

    logInfo(
      `📦 Preparing to insert ${records.length} records into Supabase...`
    );

    // ✅ Ensure `supabase_image_url` is correctly formatted
    const cleanedRecords = records.map((record) => ({
      ...record,
      supabase_image_url: record.supabase_image_url
        ? `${SUPABASE_STORAGE_URL}${record.release_id}.jpeg`
        : null, // Ensure correct formatting
    }));

    // ✅ Insert/update records, avoiding duplicates
    const { error } = await supabase.from(TABLE_NAME).upsert(cleanedRecords, {
      onConflict: ["release_id"],
    });

    if (error) {
      throw new Error(`❌ Supabase insert error: ${error.message}`);
    }

    logInfo("✅ Supabase update successful!");
  } catch (error) {
    logError("❌ Error updating Supabase records:", error);
  }
}
