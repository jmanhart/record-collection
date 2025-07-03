import { createClient } from "@supabase/supabase-js";

export const config = {
  runtime: "edge",
};

export default async function handler(request: Request) {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );

  try {
    // Fetch data from Discogs API
    const response = await fetch(
      "https://api.discogs.com/users/manhartjohn/collection/folders/0/releases",
      {
        headers: {
          Authorization: `Discogs token=${process.env.DISCOGS_TOKEN}`,
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
      return new Response("Failed to update Supabase", { status: 500 });
    }

    return new Response("Database updated successfully", { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
