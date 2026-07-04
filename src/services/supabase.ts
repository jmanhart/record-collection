import { createClient } from "@supabase/supabase-js";
import type { Record } from "../types/Record";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

const STORAGE_BUCKET = "record-images";
const COVERS_PATH = "covers";

export const getImageUrl = (path: string) => {
  if (!path) return null;

  // If the path already includes 'covers/', don't add it again
  const fullPath = path.startsWith(`${COVERS_PATH}/`)
    ? path
    : `${COVERS_PATH}/${path}`;
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fullPath);

  return data.publicUrl;
};

export const uploadImage = async (file: File) => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${COVERS_PATH}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  return filePath;
};

export const getRecords = async () => {
  const { data, error } = await supabase.from("records").select("*");

  if (error) {
    console.error("Error fetching records:", error);
    throw error;
  }

  // Transform the records to include full image URLs
  const transformedRecords = data.map((record: Record) => {
    const imagePath = `${record.id}.jpeg`;
    const transformed = {
      ...record,
      coverImage: getImageUrl(imagePath),
    };
    return transformed;
  }) as Record[];

  return transformedRecords;
};

export const getWishlist = async () => {
  const { data, error } = await supabase.from("wishlist").select("*");

  if (error) {
    console.error("Error fetching wishlist:", error);
    throw error;
  }

  const transformedRecords = data.map((record: Record) => {
    const imagePath = `${record.id}.jpeg`;
    return {
      ...record,
      coverImage: getImageUrl(imagePath),
    };
  }) as Record[];

  return transformedRecords;
};

export const addRecord = async (record: Omit<Record, "id" | "dateAdded">) => {
  const { data, error } = await supabase
    .from("records")
    .insert([{ ...record, dateAdded: new Date().toISOString() }])
    .select()
    .single();

  if (error) throw error;
  return {
    ...data,
    coverImage: data.coverImage ? getImageUrl(data.coverImage) : null,
  } as Record;
};

export const updateRecord = async (id: string, updates: Partial<Record>) => {
  const { data, error } = await supabase
    .from("records")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return {
    ...data,
    coverImage: data.coverImage ? getImageUrl(data.coverImage) : null,
  } as Record;
};

export const deleteRecord = async (id: string) => {
  const { error } = await supabase.from("records").delete().eq("id", id);

  if (error) throw error;
};

export const deleteImage = async (path: string) => {
  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);

  if (error) throw error;
};

export interface DiscographyTarget {
  release_id: number;
  artist: string;
  title: string;
  year: number | null;
  supabase_image_url: string | null;
}

export interface NfcTag {
  id: string;
  nfc_uid: string;
  release_id: number;
  created_at: string;
}

export const getNfcTags = async (): Promise<NfcTag[]> => {
  const { data, error } = await supabase.from("nfc_tags").select("*");

  if (error) {
    console.error("Error fetching NFC tags:", error);
    throw error;
  }

  return data || [];
};

export const createNfcTag = async (
  nfcUid: string,
  releaseId: number
): Promise<NfcTag> => {
  const { data, error } = await supabase
    .from("nfc_tags")
    .insert({ nfc_uid: nfcUid, release_id: releaseId })
    .select()
    .single();

  if (error) throw error;
  return data as NfcTag;
};

export const deleteNfcTag = async (id: string): Promise<void> => {
  const { error } = await supabase.from("nfc_tags").delete().eq("id", id);
  if (error) throw error;
};

export const logListen = async (releaseId: number): Promise<void> => {
  const { error } = await supabase
    .from("listens")
    .insert({ release_id: releaseId, source: "nfc" });

  if (error) {
    console.error("Error logging listen:", error);
    throw error;
  }
};

export const getListenCount = async (releaseId: number): Promise<number> => {
  const { count, error } = await supabase
    .from("listens")
    .select("*", { count: "exact", head: true })
    .eq("release_id", releaseId);

  if (error) {
    console.error("Error fetching listen count:", error);
    throw error;
  }

  return count || 0;
};

export interface Listen {
  id: string;
  release_id: number;
  listened_at: string;
  source: string;
}

export const getListens = async (): Promise<Listen[]> => {
  const { data, error } = await supabase
    .from("listens")
    .select("*")
    .order("listened_at", { ascending: false });

  if (error) {
    console.error("Error fetching listens:", error);
    throw error;
  }

  return data || [];
};

export const getDiscographyTargets = async (): Promise<DiscographyTarget[]> => {
  const { data, error } = await supabase
    .from("discography_targets")
    .select("*");

  if (error) {
    console.error("Error fetching discography targets:", error);
    throw error;
  }

  return (data || []).map((row: DiscographyTarget) => ({
    ...row,
    supabase_image_url: row.supabase_image_url || getImageUrl(`${row.release_id}.jpeg`),
  }));
};
