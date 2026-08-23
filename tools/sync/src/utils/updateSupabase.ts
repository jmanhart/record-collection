import { logInfo, logWarn, logError } from "./log.js";
import { supabase, supabaseAdmin } from "./supabase.js";
import { uploadImageToSupabase } from "./uploadImageToSupabase.js";
import { DiscogsRecord } from "./fetchDiscogs.js";

const TABLE_NAME = "records";

/**
 * Syncs the Supabase `records` table to match the current Discogs collection.
 * - Upserts every current record (adds new ones, refreshes metadata on existing ones).
 * - Uploads cover images for any record that doesn't have one yet.
 * - Removes rows whose release is no longer in the Discogs collection.
 *
 * @param {DiscogsRecord[]} records - The current Discogs collection.
 */
export async function updateSupabaseRecords(records: DiscogsRecord[]) {
  try {
    if (!Array.isArray(records)) {
      logError("❌ Records input is not an array:", records);
      return;
    }

    if (records.length === 0) {
      logWarn("⚠️ No records fetched from Discogs. Skipping Supabase update.");
      return;
    }

    // Fetch existing records to diff against and to preserve known image URLs
    const { data: existingRecords, error: fetchError } = await supabase
      .from(TABLE_NAME)
      .select("id, release_id, title, artist, supabase_image_url");

    if (fetchError) {
      logError("❌ Error fetching existing records:", fetchError);
      return;
    }

    const existingImageMap = new Map(
      existingRecords.map((r) => [r.id, r.supabase_image_url])
    );
    const currentReleaseIds = new Set(
      records.map((record) => record.basic_information.id)
    );

    const newCount = records.filter(
      (r) => !existingImageMap.has(r.basic_information.id)
    ).length;
    logInfo(`🆕 Found ${newCount} new records.`);

    // Clean records and preserve existing image URLs
    const cleanedRecords = records.map((record) => {
      const releaseId = record.basic_information.id;
      const format = record.basic_information.formats?.[0] || {};

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
        // Keep the confirmed uploaded URL if we have one; otherwise leave it
        // null so the upload pass below picks it up.
        supabase_image_url: existingImageMap.get(releaseId) || null,
        genres: record.basic_information.genres || [],
        styles: record.basic_information.styles || [],
        format_name: format.name || "Unknown",
        format_descriptions: format.descriptions || [],
        format_quantity: parseInt(format.qty || "1", 10),
        year: record.basic_information.year,
        acquired_at: record.date_added || null,
      };
    });

    // Insert/update records, using id for conflict resolution
    logInfo(`📦 Upserting ${cleanedRecords.length} records into Supabase...`);
    const { error } = await supabase.from(TABLE_NAME).upsert(cleanedRecords, {
      onConflict: "id",
    });

    if (error) {
      throw new Error(`❌ Supabase upsert error: ${error.message}`);
    }

    logInfo("✅ Supabase update successful!");

    // Upload cover images for any record that doesn't have a confirmed one yet
    const missingImageRecords = cleanedRecords.filter(
      (r) => !r.supabase_image_url
    );

    if (missingImageRecords.length > 0) {
      logInfo(
        `📸 Uploading images for ${missingImageRecords.length} records...`
      );

      for (const record of missingImageRecords) {
        if (!record.image_url) {
          logWarn(
            `⚠️ No cover image available for "${record.title}" (ID: ${record.id})`
          );
          continue;
        }

        try {
          const uploadedUrl = await uploadImageToSupabase(
            record.image_url,
            record.id
          );

          if (!uploadedUrl) {
            logWarn(
              `⚠️ Failed to upload image for "${record.title}" (ID: ${record.id})`
            );
            continue;
          }

          const { error: updateError } = await supabase
            .from(TABLE_NAME)
            .update({ supabase_image_url: uploadedUrl })
            .eq("id", record.id);

          if (updateError) {
            logError(
              `❌ Failed to update image URL for "${record.title}":`,
              updateError
            );
            continue;
          }

          logInfo(`✅ Image uploaded for "${record.title}" (ID: ${record.id})`);
        } catch (error) {
          logError(`❌ Error processing image for "${record.title}":`, error);
        }
      }
    }

    // Remove records that are no longer in the Discogs collection
    const recordsToRemove = existingRecords.filter(
      (r) => !currentReleaseIds.has(r.id)
    );

    if (recordsToRemove.length > 0) {
      logInfo(
        `🗑️ Removing ${recordsToRemove.length} records no longer in collection:`
      );
      recordsToRemove.forEach((r) => {
        logInfo(`  - ${r.artist ? `${r.artist} — ` : ""}${r.title} (ID: ${r.id})`);
      });

      const { error: deleteError } = await supabaseAdmin
        .from(TABLE_NAME)
        .delete()
        .in(
          "id",
          recordsToRemove.map((r) => r.id)
        );

      if (deleteError) {
        logError("❌ Error removing stale records:", deleteError);
      } else {
        logInfo("✅ Stale records removed.");
      }
    }
  } catch (error) {
    logError("❌ Error updating Supabase records:", error);
  }
}
