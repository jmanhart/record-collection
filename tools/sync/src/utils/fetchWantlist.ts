import fetch from "node-fetch";
import { logInfo, logWarn, logError } from "./log.js";
import { supabaseAdmin, SUPABASE_STORAGE_URL } from "./supabase.js";
import { uploadImageToSupabase } from "./uploadImageToSupabase.js";
import { env } from "./env.js";

interface DiscogsWant {
  id: number;
  basic_information: {
    id: number;
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
const DISCOGS_WANTLIST_URL = `https://api.discogs.com/users/${env.DISCOGS_USER}/wants?per_page=${PER_PAGE}`;
const TABLE_NAME = "wishlist";

/**
 * Fetch all wants from Discogs wantlist API, handling pagination.
 */
async function fetchAllWants(): Promise<DiscogsWant[]> {
  logInfo("📡 Fetching wantlist from Discogs API...");

  const allWants: DiscogsWant[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    logInfo(`📄 Fetching page ${page} of wantlist...`);

    const response = await fetch(`${DISCOGS_WANTLIST_URL}&page=${page}`, {
      headers: { Authorization: `Discogs token=${env.DISCOGS_API_TOKEN}` },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Discogs wantlist: ${response.statusText}`);
    }

    const data = (await response.json()) as {
      wants: DiscogsWant[];
      pagination: { items: number; pages: number };
    };

    allWants.push(...data.wants);

    if (page === 1) {
      totalPages = data.pagination.pages;
      logInfo(`🔄 Total wantlist pages to fetch: ${totalPages}`);
    }

    page++;
  } while (page <= totalPages);

  logInfo(`✅ Successfully fetched ${allWants.length} wants from Discogs.`);
  return allWants;
}

/**
 * Sync Discogs wantlist to Supabase wishlist table.
 */
export async function syncWishlist(): Promise<void> {
  try {
    const wants = await fetchAllWants();

    if (wants.length === 0) {
      logInfo("✅ No items in Discogs wantlist.");
      return;
    }

    // Fetch existing wishlist records
    const { data: existingRecords, error: fetchError } = await supabaseAdmin
      .from(TABLE_NAME)
      .select("id, release_id, supabase_image_url");

    if (fetchError) {
      logError("❌ Error fetching existing wishlist records:", fetchError);
      throw fetchError;
    }

    const existingImageMap = new Map(
      existingRecords.map((r: { id: number; supabase_image_url: string | null }) => [r.id, r.supabase_image_url])
    );

    // Build records for upsert
    const cleanedRecords = wants
      .filter((want) => {
        if (!want.basic_information?.id) {
          logWarn(`⚠️ Skipping want without release_id: ${want.basic_information?.title || "Unknown"}`);
          return false;
        }
        return true;
      })
      .map((want) => {
        const releaseId = want.basic_information.id;
        const existingImageUrl = existingImageMap.get(releaseId);
        const format = want.basic_information.formats?.[0] || {};

        return {
          id: releaseId,
          release_id: releaseId,
          title: want.basic_information.title || "Unknown Title",
          artist: want.basic_information.artists?.[0]?.name || "Unknown Artist",
          image_url: want.basic_information.cover_image || "",
          supabase_image_url:
            existingImageUrl || `${SUPABASE_STORAGE_URL}${releaseId}.jpeg`,
          genres: want.basic_information.genres || [],
          styles: want.basic_information.styles || [],
          format_name: format.name || "Unknown",
          year: want.basic_information.year,
        };
      });

    if (cleanedRecords.length === 0) {
      logWarn("⚠️ No valid wishlist records to upsert.");
      return;
    }

    logInfo(`📦 Upserting ${cleanedRecords.length} wishlist records into Supabase...`);

    const { error: upsertError } = await supabaseAdmin
      .from(TABLE_NAME)
      .upsert(cleanedRecords, { onConflict: "id" });

    if (upsertError) {
      throw new Error(`❌ Supabase wishlist upsert error: ${upsertError.message}`);
    }

    logInfo("✅ Wishlist upsert successful!");

    // Upload images for records missing them
    const missingImageRecords = cleanedRecords.filter(
      (r) => !existingImageMap.has(r.id)
    );

    if (missingImageRecords.length > 0) {
      logInfo(`📸 Uploading images for ${missingImageRecords.length} new wishlist records...`);

      for (const record of missingImageRecords) {
        if (!record.image_url) {
          logWarn(`⚠️ No cover image for wishlist item "${record.title}" (ID: ${record.id})`);
          continue;
        }

        try {
          const uploadedUrl = await uploadImageToSupabase(
            record.image_url,
            record.id
          );

          if (uploadedUrl) {
            const { error: updateError } = await supabaseAdmin
              .from(TABLE_NAME)
              .update({ supabase_image_url: uploadedUrl })
              .eq("release_id", record.release_id);

            if (updateError) {
              logError(`❌ Failed to update wishlist image URL for ${record.title}:`, updateError);
              continue;
            }

            logInfo(`✅ Image uploaded for wishlist item "${record.title}" (ID: ${record.id})`);
          }
        } catch (error) {
          logError(`❌ Error processing image for wishlist item "${record.title}":`, error);
        }
      }

      logInfo("✅ Finished processing wishlist images.");
    }

    // Remove records from wishlist table that are no longer in Discogs wantlist
    const currentWantIds = new Set(wants.map((w) => w.basic_information.id));
    const existingIds = existingRecords.map((r: { id: number }) => r.id);
    const idsToRemove = existingIds.filter((id: number) => !currentWantIds.has(id));

    if (idsToRemove.length > 0) {
      logInfo(`🗑️ Removing ${idsToRemove.length} records no longer in wantlist...`);
      const { error: deleteError } = await supabaseAdmin
        .from(TABLE_NAME)
        .delete()
        .in("id", idsToRemove);

      if (deleteError) {
        logError("❌ Error removing stale wishlist records:", deleteError);
      } else {
        logInfo("✅ Stale wishlist records removed.");
      }
    }
  } catch (error) {
    logError("❌ Error in syncWishlist:", error);
    throw error;
  }
}
