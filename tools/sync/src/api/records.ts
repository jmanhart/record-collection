import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

// ✅ Ensure environment variables are set
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ Missing Supabase environment variables!");
  throw new Error("Supabase credentials are missing!");
}

// ✅ Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ✅ Supabase Storage URL
const SUPABASE_STORAGE_URL = `${SUPABASE_URL}/storage/v1/object/public/record-images/covers/`;

/**
 * API handler to fetch records from Supabase.
 * Returns all records with properly formatted `supabase_image_url`.
 */
export async function GET(_: Request): Promise<Response> {
  try {
    console.log("📡 Fetching records from Supabase...");

    // ✅ Fetch records from Supabase
    const { data, error } = await supabase.from("records").select("*");

    if (error) throw error;

    // ✅ Format the `supabase_image_url`
    const records = data.map((record) => ({
      ...record,
      supabase_image_url:
        record.supabase_image_url &&
        !record.supabase_image_url.startsWith(SUPABASE_STORAGE_URL)
          ? `${SUPABASE_STORAGE_URL}${record.release_id}.jpeg`
          : record.supabase_image_url, // Use the existing value if already correct
    }));

    console.log(`✅ Retrieved ${records.length} records from Supabase.`);

    return new Response(JSON.stringify(records), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("❌ API Error fetching records:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
