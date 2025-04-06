export interface Record {
  id: string;
  title: string;
  artist: string;
  releaseYear: number;
  coverImage: string;
  genres: string[];
  format: string;
  label: string;
  catalogNumber?: string;
  listenCount?: number;
  notes?: string;
  purchaseInfo?: {
    location: string;
    date: string;
    price?: number;
  };
  discogsId?: string;
  dateAdded: string;
}

export type SortField =
  | "title"
  | "artist"
  | "releaseYear"
  | "dateAdded"
  | "listenCount";
export type SortOrder = "asc" | "desc";
