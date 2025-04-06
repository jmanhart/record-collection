import express from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure environment variables exist
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ Missing Supabase environment variables!");
  process.exit(1); // Stop the server if env variables are missing
}

// ✅ Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ✅ API Route to Fetch Records
app.get("/api/records", async (req, res) => {
  try {
    console.log("📡 Fetching records from Supabase...");

    const { data, error } = await supabase.from("records").select("*");

    if (error) throw error;

    console.log(`✅ Retrieved ${data.length} records.`);
    res.status(200).json(data);
  } catch (error) {
    console.error("❌ API Error fetching records:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
