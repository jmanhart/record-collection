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

  console.log("Generated image URL:", {
    originalPath: path,
    fullPath,
    publicUrl: data.publicUrl,
  });

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

  // Log the structure of the first record
  if (data && data.length > 0) {
    console.log("Table structure (from first record):", {
      availableFields: Object.keys(data[0]),
      sampleRecord: data[0],
    });
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
