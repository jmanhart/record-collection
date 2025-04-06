import fetch from "node-fetch";
import { logError } from "./log.js";
import { supabaseAdmin, STORAGE_BUCKET } from "./supabase.js";

/**
 * Upload an image to Supabase Storage and return the new URL.
 * @param {string} imageUrl - The URL of the image to download.
 * @param {number} releaseId - The ID of the release.
 * @returns {Promise<string | null>} The new URL of the uploaded image, or null if failed.
 */
export async function uploadImageToSupabase(
  imageUrl: string,
  releaseId: number
): Promise<string | null> {
  try {
    // Download the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const imageBuffer = await response.arrayBuffer();

    // Upload to Supabase Storage
    const { error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(`covers/${releaseId}.jpeg`, imageBuffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) {
      throw error;
    }

    // Return the public URL
    const { data: publicUrl } = supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(`covers/${releaseId}.jpeg`);

    return publicUrl.publicUrl;
  } catch (error) {
    logError(`❌ Image upload failed for ${releaseId}:`, error);
    return null;
  }
}
