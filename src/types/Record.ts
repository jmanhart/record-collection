export interface Record {
  id: number;
  title: string;
  artist: string;
  coverImage?: string;
  supabase_image_url?: string;
  dateAdded: string;
  format_name?: string;
  format_descriptions?: string[];
  format_quantity?: number;
  genres?: string[];
  styles?: string[];
  year?: number;
}

export type SortField = "dateAdded" | "artist" | "title" | "year";
export type SortOrder = "asc" | "desc";
