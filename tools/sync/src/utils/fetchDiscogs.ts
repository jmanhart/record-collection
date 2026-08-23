import fetch from "node-fetch";
import { logInfo, logError } from "./log.js";
import { env } from "./env.js";

export interface DiscogsRecord {
  id: number; // Collection item ID
  date_added: string; // When this release was added to the Discogs collection
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

    return allRecords;
  } catch (error) {
    logError("❌ Error fetching Discogs records", error);
    return [];
  }
}
