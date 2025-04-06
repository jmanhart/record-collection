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

    // First, fetch existing records to check their image status
    const { data: existingRecords, error: fetchError } = await supabase
      .from(TABLE_NAME)
      .select("id, release_id, supabase_image_url");

    if (fetchError) {
      logError("❌ Error fetching existing records:", fetchError);
      return;
    }

    const existingImageMap = new Map(
      existingRecords.map((r) => [r.id, r.supabase_image_url])
    );

    // Clean records and preserve existing image URLs
    const cleanedRecords = records.map((record) => {
      const releaseId = record.basic_information.id;
      const existingImageUrl = existingImageMap.get(releaseId);

      // Log if we're missing a cover image
      if (!record.basic_information.cover_image) {
        logWarn(
          `⚠️ No cover image URL for "${record.basic_information.title}" (ID: ${releaseId})`
        );
      }

      return {
        id: releaseId,
        release_id: releaseId,
        title: record.basic_information.title || "Unknown Title",
        artist: record.basic_information.artists?.[0]?.name || "Unknown Artist",
        image_url: record.basic_information.cover_image || "",
        // Keep existing image URL if available, otherwise expect .jpeg format
        supabase_image_url:
          existingImageUrl || `${SUPABASE_STORAGE_URL}${releaseId}.jpeg`,
      };
    });

    // Insert/update records, using id for conflict resolution
    const { error } = await supabase.from(TABLE_NAME).upsert(cleanedRecords, {
      onConflict: "id",
    });

    if (error) {
      throw new Error(`❌ Supabase insert error: ${error.message}`);
    }

    logInfo("✅ Supabase update successful!");

    // Log statistics about image status
    const missingImages = cleanedRecords.filter((r) => !r.image_url).length;
    if (missingImages > 0) {
      logWarn(`⚠️ Found ${missingImages} records without Discogs cover images`);
    }
  } catch (error) {
    logError("❌ Error updating Supabase records:", error);
  }
}
