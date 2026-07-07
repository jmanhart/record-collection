export interface TrackListEntry {
  position: string;
  title: string;
  duration: string;
  type_?: string;
}

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
  duration_seconds?: number;
  acquired_at?: string | null;
  purchase_location?: string | null;
  tags?: string[];
  is_favorite?: boolean;
  tracklist?: TrackListEntry[] | null;
}

export type WishlistRecord = Pick<
  Record,
  "id" | "title" | "artist" | "coverImage" | "supabase_image_url" | "format_name" | "genres" | "styles" | "year" | "duration_seconds"
>;

export type SortField = "dateAdded" | "artist" | "title" | "year";
export type SortOrder = "asc" | "desc";
