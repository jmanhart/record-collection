import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory path in ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../../../../.env");

// Try to load .env file, but don't fail if it's missing (e.g. in CI)
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.log("ℹ️  No .env file found, using environment variables directly");
} else {
  console.log("✅ .env file loaded successfully");
}

console.log("📝 Environment variables loaded:", {
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL ? "set" : "not set",
  VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY
    ? "set"
    : "not set",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
    ? "set"
    : "not set",
  DISCOGS_USER: process.env.DISCOGS_USER ? "set" : "not set",
  PUBLIC_DISCOGS_API_TOKEN: process.env.PUBLIC_DISCOGS_API_TOKEN
    ? "set"
    : "not set",
});

// Validate all required environment variables
const requiredEnvVars = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "DISCOGS_USER",
  "PUBLIC_DISCOGS_API_TOKEN",
] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`${envVar} is required but not set`);
  }
}

// Export validated environment variables
export const env = {
  SUPABASE_URL: process.env.VITE_SUPABASE_URL as string,
  SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY as string,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  DISCOGS_USER: process.env.DISCOGS_USER as string,
  DISCOGS_API_TOKEN: process.env.PUBLIC_DISCOGS_API_TOKEN as string,
} as const;
