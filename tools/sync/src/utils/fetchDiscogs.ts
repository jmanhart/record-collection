import fetch from "node-fetch";
import { uploadImageToSupabase } from "./uploadImageToSupabase.js";
import { logInfo, logWarn, logError } from "./log.js";
import { supabase } from "./supabase.js";
import { env } from "./env.js";

export interface DiscogsRecord {
  id: number; // Collection item ID
  basic_information: {
    id: number; // Release ID
    title: string;
    artists: Array<{ name: string }>;
    cover_image?: string;
    formats: Array<{
      name: string;
      descriptions?: string[];
      qty?: string;
    }>;
    year?: number;
    genres?: string[];
    styles?: string[];
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

      // Debug: Log the first record from each page
      if (data.releases.length > 0) {
        const sampleRecord = data.releases[0];
        logInfo(
          `📝 Sample record structure: ${JSON.stringify(
            {
              collection_id: sampleRecord.id,
              release_id: sampleRecord.basic_information.id,
              basic_information: {
                title: sampleRecord.basic_information.title,
                artists: sampleRecord.basic_information.artists,
                cover_image: sampleRecord.basic_information.cover_image,
                formats: sampleRecord.basic_information.formats,
                genres: sampleRecord.basic_information.genres,
                styles: sampleRecord.basic_information.styles,
                year: sampleRecord.basic_information.year,
              },
            },
            null,
            2
          )}`
        );

        // Add detailed ID logging
        logInfo(`🔍 ID Details for "${sampleRecord.basic_information.title}":
  - Collection Item ID (id): ${sampleRecord.id}
  - Release ID (basic_information.id): ${sampleRecord.basic_information.id}
  - Format: ${JSON.stringify(sampleRecord.basic_information.formats?.[0] || {})}
  - Genres: ${JSON.stringify(sampleRecord.basic_information.genres || [])}
  - Styles: ${JSON.stringify(sampleRecord.basic_information.styles || [])}
`);
      }

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
      .select("id, release_id, title, supabase_image_url");

    if (error) throw error;

    // Log existing records details
    logInfo("📊 First few records in Supabase:");
    existingRecords.slice(0, 5).forEach((record) => {
      logInfo(
        `  - "${record.title}": id=${record.id}, release_id=${record.release_id}`
      );
    });

    const existingIds = new Set(existingRecords.map((r) => r.release_id));
    const missingImageRecords = existingRecords.filter(
      (record) => !record.supabase_image_url
    );

    // Step 3: Filter only new records
    const newRecords = allRecords.filter(
      (release) => !existingIds.has(release.basic_information.id)
    );

    // Debug: Check for records with missing release_id
    const recordsWithoutReleaseId = newRecords.filter(
      (record) => !record.basic_information?.id
    );
    if (recordsWithoutReleaseId.length > 0) {
      logWarn(
        `⚠️ Found ${recordsWithoutReleaseId.length} records without release_id:`
      );
      recordsWithoutReleaseId.forEach((record) => {
        logWarn(`  - Title: ${record.basic_information?.title || "Unknown"}`);
      });
    }

    if (newRecords.length === 0 && missingImageRecords.length === 0) {
      logInfo(
        "✅ No new records to add and no missing images to fix. Everything is already up-to-date."
      );
      return [];
    }

    logInfo(`🆕 Found ${newRecords.length} new records.`);
    logInfo(`📸 Found ${missingImageRecords.length} records missing images.`);

    // Step 4: Process missing images for existing records
    if (missingImageRecords.length > 0) {
      logInfo(
        `🔄 Processing ${missingImageRecords.length} records with missing images...`
      );

      for (const record of missingImageRecords) {
        const release = allRecords.find(
          (r) => r.basic_information.id === record.release_id
        );

        if (!release) {
          logWarn(
            `⚠️ Could not find Discogs data for record ${record.title} (ID: ${record.release_id})`
          );
          continue;
        }

        const discogsImageUrl = release.basic_information?.cover_image;
        if (!discogsImageUrl) {
          logWarn(
            `⚠️ No cover image available for ${record.title} (ID: ${record.release_id})`
          );
          continue;
        }

        try {
          const uploadedUrl = await uploadImageToSupabase(
            discogsImageUrl,
            record.release_id
          );

          if (uploadedUrl) {
            const { error: updateError } = await supabase
              .from("records")
              .update({ supabase_image_url: uploadedUrl })
              .eq("release_id", record.release_id);

            if (updateError) {
              logError(
                `❌ Failed to update image URL for ${record.title}:`,
                updateError
              );
              continue;
            }

            logInfo(
              `✅ Successfully updated image for ${record.title} (ID: ${record.release_id})`
            );
          } else {
            logWarn(
              `⚠️ Failed to upload image for ${record.title} (ID: ${record.release_id})`
            );
          }
        } catch (error) {
          logError(`❌ Error processing image for ${record.title}:`, error);
        }
      }
    }

    // Step 5: Process new records
    if (newRecords.length > 0) {
      logInfo(
        `📦 Preparing to insert ${newRecords.length} records into Supabase...`
      );

      // First, insert the records
      const recordsToInsert = newRecords
        .filter((release) => {
          if (!release.basic_information?.id) {
            logWarn(
              `⚠️ Skipping record without release_id: ${
                release.basic_information?.title || "Unknown"
              }`
            );
            return false;
          }
          return true;
        })
        .map((release) => ({
          id: release.basic_information.id,
          release_id: release.basic_information.id,
          title: release.basic_information.title || "Unknown Title",
          artist:
            release.basic_information.artists?.[0]?.name || "Unknown Artist",
          image_url: release.basic_information.cover_image || "",
          supabase_image_url: null,
        }));

      if (recordsToInsert.length === 0) {
        logWarn(
          "⚠️ No valid records to insert. All records are missing release_id."
        );
        return [];
      }

      logInfo(
        `📦 Inserting ${recordsToInsert.length} valid records into Supabase...`
      );

      const { error: upsertError } = await supabase
        .from("records")
        .upsert(recordsToInsert);

      if (upsertError) {
        logError("❌ Error updating Supabase records:", upsertError);
        throw upsertError;
      }
      logInfo("✅ Successfully inserted new records into Supabase.");

      // Then, process and upload images for new records
      logInfo("📸 Processing images for new records...");
      for (const release of newRecords) {
        if (!release.basic_information?.id) continue;

        const discogsImageUrl = release.basic_information.cover_image;
        if (!discogsImageUrl) {
          logWarn(
            `⚠️ No image URL found for ${release.basic_information.title} (ID: ${release.basic_information.id})`
          );
          continue;
        }

        try {
          const uploadedUrl = await uploadImageToSupabase(
            discogsImageUrl,
            release.basic_information.id
          );

          if (uploadedUrl) {
            const { error: updateError } = await supabase
              .from("records")
              .update({ supabase_image_url: uploadedUrl })
              .eq("release_id", release.basic_information.id);

            if (updateError) {
              logError(
                `❌ Failed to update image URL for ${release.basic_information.title}:`,
                updateError
              );
              continue;
            }

            logInfo(
              `✅ Image uploaded for ${release.basic_information.title} (ID: ${release.basic_information.id})`
            );
          } else {
            logWarn(
              `⚠️ Failed to upload image for ${release.basic_information.title} (ID: ${release.basic_information.id})`
            );
          }
        } catch (error) {
          logError(
            `❌ Error processing image for ${release.basic_information.title}:`,
            error
          );
        }
      }
      logInfo("✅ Finished processing images for new records.");
    }

    return allRecords;
  } catch (error) {
    logError("❌ Error in fetchDiscogsRecords", error);
    return [];
  }
}
