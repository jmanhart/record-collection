import { createClient } from "@supabase/supabase-js";
import { env } from "./env.js";

// Regular client for database operations
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

// Admin client for storage operations (bypasses RLS)
export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

export const STORAGE_BUCKET = "record-images";
export const COVERS_PATH = "covers";
export const SUPABASE_STORAGE_URL = `${env.SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${COVERS_PATH}/`;
