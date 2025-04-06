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

    // ✅ Ensure `supabase_image_url` is correctly formatted and IDs match
    const cleanedRecords = records.map((record) => ({
      id: record.basic_information.id, // Set id to match release_id
      release_id: record.basic_information.id,
      title: record.basic_information.title || "Unknown Title",
      artist: record.basic_information.artists?.[0]?.name || "Unknown Artist",
      image_url: record.basic_information.cover_image || "",
      supabase_image_url: record.supabase_image_url
        ? `${SUPABASE_STORAGE_URL}${record.basic_information.id}.jpeg`
        : null,
    }));

    // ✅ Insert/update records, using id for conflict resolution
    const { error } = await supabase.from(TABLE_NAME).upsert(cleanedRecords, {
      onConflict: "id", // Use id for conflict resolution
    });

    if (error) {
      throw new Error(`❌ Supabase insert error: ${error.message}`);
    }

    logInfo("✅ Supabase update successful!");
  } catch (error) {
    logError("❌ Error updating Supabase records:", error);
  }
}
