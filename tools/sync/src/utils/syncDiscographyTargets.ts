import fetch from "node-fetch";
import path from "path";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { logInfo, logWarn, logError } from "./log.js";
import { supabaseAdmin, STORAGE_BUCKET } from "./supabase.js";
import { uploadImageToSupabase } from "./uploadImageToSupabase.js";
import { env } from "./env.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface DiscographyTarget {
  artist: string;
  slug: string;
  releaseIds: number[];
}

interface DiscogsRelease {
  title: string;
  year: number;
  images?: Array<{ type: string; uri: string }>;
  artists?: Array<{ name: string }>;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function syncDiscographyTargets(): Promise<void> {
  const targetsPath = path.resolve(
    __dirname,
    "../../../../src/data/discography-targets.json"
  );
  const targets: DiscographyTarget[] = JSON.parse(
    readFileSync(targetsPath, "utf-8")
  );

  const allReleaseIds = targets.flatMap((t) => t.releaseIds);

  if (allReleaseIds.length === 0) {
    logInfo("No discography target release IDs found.");
    return;
  }

  // Check which IDs already exist in the table
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from("discography_targets")
    .select("release_id")
    .in("release_id", allReleaseIds);

  if (fetchError) {
    logError("Error fetching existing discography targets:", fetchError);
    throw fetchError;
  }

  const existingIds = new Set((existing || []).map((r) => r.release_id));
  const missingIds: Array<{ releaseId: number; artist: string }> = [];

  for (const target of targets) {
    for (const id of target.releaseIds) {
      if (!existingIds.has(id)) {
        missingIds.push({ releaseId: id, artist: target.artist });
      }
    }
  }

  if (missingIds.length === 0) {
    logInfo("All discography targets already synced.");
    return;
  }

  logInfo(
    `Found ${missingIds.length} new discography targets to sync from Discogs...`
  );

  for (let i = 0; i < missingIds.length; i++) {
    const { releaseId, artist } = missingIds[i];
    try {
      const response = await fetch(
        `https://api.discogs.com/releases/${releaseId}`,
        {
          headers: {
            Authorization: `Discogs token=${env.DISCOGS_API_TOKEN}`,
          },
        }
      );

      if (!response.ok) {
        logWarn(
          `Failed to fetch release ${releaseId}: ${response.status} ${response.statusText}`
        );
        if (i < missingIds.length - 1) await sleep(1000);
        continue;
      }

      const data = (await response.json()) as DiscogsRelease;

      // Upload cover image
      const primaryImage = data.images?.find((img) => img.type === "primary");
      const imageUrl = primaryImage?.uri || data.images?.[0]?.uri;
      let supabaseImageUrl: string | null = null;

      if (imageUrl) {
        supabaseImageUrl = await uploadImageToSupabase(imageUrl, releaseId);
      }

      // Upsert into discography_targets table
      const { error: upsertError } = await supabaseAdmin
        .from("discography_targets")
        .upsert(
          {
            release_id: releaseId,
            artist,
            title: data.title,
            year: data.year || null,
            supabase_image_url: supabaseImageUrl,
          },
          { onConflict: "release_id" }
        );

      if (upsertError) {
        logError(
          `Failed to upsert discography target ${releaseId}:`,
          upsertError
        );
      } else {
        logInfo(
          `[${i + 1}/${missingIds.length}] Synced: ${artist} - ${data.title} (${data.year || "unknown year"})`
        );
      }

      // Rate limit: 1 request per second
      if (i < missingIds.length - 1) {
        await sleep(1000);
      }
    } catch (err) {
      logError(`Error syncing discography target ${releaseId}:`, err);
    }
  }
}
