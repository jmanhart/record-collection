import fetch from "node-fetch";
import { downloadImages } from "./downloadImages.js";
import { uploadImageToSupabase } from "./uploadImageToSupabase.js";
import { logInfo, logWarn, logError } from "./log.js";
import { supabase } from "./supabase.js";
import { env } from "./env.js";

export interface DiscogsRecord {
  id: number;
  release_id: number;
  title: string;
  artist: string;
  image_url?: string;
  supabase_image_url?: string;
  basic_information?: {
    title: string;
    artists: Array<{ name: string }>;
    cover_image?: string;
  };
}

const PER_PAGE = 100;
const DISCOGS_COLLECTION_URL = `https://api.discogs.com/users/${env.DISCOGS_USER}/collection/folders/0/releases?per_page=${PER_PAGE}`;

/**
 * Fetch all records from Discogs API, handling pagination.
 * @returns Promise<DiscogsRecord[]> Array of Discogs records
 */
export async function fetchDiscogsRecords(): Promise<DiscogsRecord[]> {
  try {
    logInfo("📡 Fetching all records from Discogs API...");

    const allRecords: DiscogsRecord[] = [];
    let page = 1;
    let totalPages = 1;

    do {
      logInfo(`📄 Fetching page ${page} of Discogs records...`);

      const response = await fetch(`${DISCOGS_COLLECTION_URL}&page=${page}`, {
        headers: { Authorization: `Discogs token=${env.DISCOGS_API_TOKEN}` },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch Discogs data: ${response.statusText}`);
      }

      const data = (await response.json()) as {
        releases: DiscogsRecord[];
        pagination: { items: number };
      };
      allRecords.push(...data.releases);

      if (page === 1) {
        totalPages = Math.ceil(data.pagination.items / PER_PAGE);
        logInfo(`🔄 Total pages to fetch: ${totalPages}`);
      }

      page++;
    } while (page <= totalPages);

    logInfo(
      `✅ Successfully fetched ${allRecords.length} records from Discogs.`
    );

    // Step 2: Fetch existing records from Supabase
    const { data: existingRecords, error } = await supabase
      .from("records")
      .select("release_id, supabase_image_url");

    if (error) throw error;

    const existingIds = new Set(existingRecords.map((r) => r.release_id));
    const missingImageRecords = existingRecords.filter(
      (record) => !record.supabase_image_url
    );

    // Step 3: Filter only new records
    const newRecords = allRecords.filter(
      (release) => !existingIds.has(release.id)
    );

    if (newRecords.length === 0 && missingImageRecords.length === 0) {
      logInfo(
        "✅ No new records to add and no missing images to fix. Everything is already up-to-date."
      );
      return [];
    }

    logInfo(`🆕 Found ${newRecords.length} new records.`);
    logInfo(`📸 Found ${missingImageRecords.length} records missing images.`);

    // Step 4: Download only missing images for new records
    await downloadImages(newRecords);

    // Step 5: Process missing images and update them in Supabase
    for (const record of missingImageRecords) {
      const release = allRecords.find((r) => r.id === record.release_id);
      if (!release) continue;

      const discogsImageUrl = release.basic_information?.cover_image || "";
      if (!discogsImageUrl) continue;

      const uploadedUrl = await uploadImageToSupabase(
        discogsImageUrl,
        record.release_id
      );
      if (uploadedUrl) {
        await supabase
          .from("records")
          .update({ supabase_image_url: uploadedUrl })
          .eq("release_id", record.release_id);

        logInfo(
          `🖼️ Image was missing for ${release.basic_information?.title}. Downloaded & updated in Supabase.`
        );
      } else {
        logWarn(
          `⚠️ Image was missing for ${release.basic_information?.title}, but failed to upload.`
        );
      }
    }

    // Step 6: Prepare new records for insertion
    logInfo(
      `📦 Preparing to insert ${newRecords.length} records into Supabase...`
    );
    const recordsToInsert = newRecords.map((release) => ({
      release_id: release.id,
      title: release.basic_information?.title || "Unknown Title",
      artist: release.basic_information?.artists?.[0]?.name || "Unknown Artist",
      image_url: release.basic_information?.cover_image || "",
      supabase_image_url: null, // Will be updated after image upload
    }));

    // Step 7: Insert new records into Supabase
    if (recordsToInsert.length > 0) {
      const { error: upsertError } = await supabase
        .from("records")
        .upsert(recordsToInsert);

      if (upsertError) {
        logError("❌ Error updating Supabase records:", upsertError);
        throw upsertError;
      }
      logInfo("✅ Successfully updated Supabase with new records.");
    }

    return allRecords;
  } catch (error) {
    logError("❌ Error in fetchDiscogsRecords", error);
    return [];
  }
}
