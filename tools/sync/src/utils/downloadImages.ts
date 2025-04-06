import path from "path";
import { uploadImageToSupabase } from "./uploadImageToSupabase.js";
import { logInfo, logWarn, logError } from "./log.js";
import { supabaseAdmin, STORAGE_BUCKET } from "./supabase.js";
import type { DiscogsRecord } from "./fetchDiscogs.js";

/**
 * Downloads images for missing records and uploads them to Supabase Storage.
 * @param {DiscogsRecord[]} releases - List of Discogs releases.
 */
export async function downloadImages(releases: DiscogsRecord[]) {
  logInfo("📸 Checking and downloading images...");

  for (const release of releases) {
    try {
      const releaseId = release.id;
      const title = release.basic_information?.title || "Unknown Title";
      const discogsImageUrl = release.basic_information?.cover_image || "";

      if (!discogsImageUrl) {
        logWarn(`⚠️ No image found for ${title}`);
        continue;
      }

      // ✅ Ensure correct `.jpeg` extension
      let extension = path.extname(new URL(discogsImageUrl).pathname);
      if (!extension || extension === ".jpg") extension = ".jpeg"; // Use `.jpeg`

      // ✅ Check if image exists in Supabase Storage
      const { data: existingFiles, error: fileCheckError } =
        await supabaseAdmin.storage.from(STORAGE_BUCKET).list("covers");

      if (fileCheckError) {
        logError(
          `❌ Error checking existing file for ${title}`,
          fileCheckError
        );
        continue;
      }

      // ✅ Skip downloading if the image already exists
      if (
        existingFiles.some((file) => file.name === `${releaseId}${extension}`)
      ) {
        logInfo(`✅ Image already exists for ${title}, skipping...`);
        continue;
      }

      logInfo(`⬇️ Downloading image for ${title}...`);

      const uploadedUrl = await uploadImageToSupabase(
        discogsImageUrl,
        releaseId
      );
      if (uploadedUrl) {
        logInfo(`✅ Successfully uploaded: ${uploadedUrl}`);
      } else {
        logWarn(`⚠️ Failed to upload image for ${title}`);
      }
    } catch (error) {
      logError("❌ Error processing image:", error);
    }
  }

  logInfo("📸 Image processing complete.");
}
