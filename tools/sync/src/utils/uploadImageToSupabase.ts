import fetch from "node-fetch";
import { logError } from "./log.js";
import { supabaseAdmin, STORAGE_BUCKET } from "./supabase.js";
import { extractDominantColor } from "./extractDominantColor.js";

export interface UploadedImage {
  url: string;
  /** Dominant cover color as hex, or null if extraction failed. */
  dominantColor: string | null;
}

/**
 * Download a cover, upload it to Supabase Storage, and extract its dominant
 * color from the same buffer. Returns the public URL + color, or null if the
 * download/upload failed.
 */
export async function uploadImageToSupabase(
  imageUrl: string,
  releaseId: number
): Promise<UploadedImage | null> {
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

    // Extract the dominant color from the same buffer we just uploaded.
    const dominantColor = await extractDominantColor(imageBuffer);

    const { data: publicUrl } = supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(`covers/${releaseId}.jpeg`);

    return { url: publicUrl.publicUrl, dominantColor };
  } catch (error) {
    logError(`❌ Image upload failed for ${releaseId}:`, error);
    return null;
  }
}
