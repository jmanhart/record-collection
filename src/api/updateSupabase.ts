import { createClient } from "@supabase/supabase-js";

export async function updateSupabase() {
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );

  try {
    // Fetch data from Discogs API
    const response = await fetch(
      "https://api.discogs.com/users/manhartjohn/collection/folders/0/releases",
      {
        headers: {
          Authorization: `Discogs token=${import.meta.env.VITE_DISCOGS_TOKEN}`,
          "User-Agent": "YourAppName/1.0",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Discogs API error: ${response.status}`);
    }

    const data = await response.json();

    // Insert or upsert into Supabase
    const { error } = await supabase.from("records").upsert(data);

    if (error) {
      console.error("Error updating supabase:", error);
      throw new Error("Failed to update Supabase");
    }

    return { success: true, message: "Database updated successfully" };
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}
