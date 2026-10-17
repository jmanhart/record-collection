import { useMemo } from "react";
import type { ElementDefinition } from "cytoscape";
import type { Record } from "../types/Record";

export type NodeKind = "genre" | "artist" | "album";

// A fixed hue per genre so the genres read as stable color families; albums keep
// their own dominant color, artists inherit their most-common album color.
const GENRE_COLORS: { [genre: string]: string } = {
  Rock: "#e2504f",
  Pop: "#e86fb0",
  Jazz: "#d9a441",
  "Folk, World, & Country": "#6aa84f",
  "Funk / Soul": "#b06fe8",
  Electronic: "#4fb0e2",
  Blues: "#5878e6",
  "Hip Hop": "#e2a44f",
  Classical: "#9fa7b0",
  "Children's": "#7fd1c0",
  "Stage & Screen": "#c0895f",
  Reggae: "#5fc05f",
  "Non-Music": "#8a8f98",
  Latin: "#e06f8f",
};
const FALLBACK_COLOR = "#8a8f98";

export interface CollectionGraph {
  elements: ElementDefinition[];
  genreCount: number;
  artistCount: number;
  albumCount: number;
  /** [name, color, count] for the legend, ordered by record count desc. */
  genreLegend: { name: string; color: string; count: number }[];
}

interface AlbumEntry {
  id: number;
  title: string;
  color?: string;
}

interface ArtistAgg {
  albums: AlbumEntry[];
  genreCounts: Map<string, number>;
  color?: string;
}

export function useCollectionGraph(records: Record[]): CollectionGraph {
  return useMemo(() => {
    const artists = new Map<string, ArtistAgg>();
    const genreTotals = new Map<string, number>();

    for (const record of records) {
      const agg = artists.get(record.artist) ?? {
        albums: [],
        genreCounts: new Map<string, number>(),
        color: undefined,
      };
      agg.albums.push({
        id: record.id,
        title: record.title,
        color: record.dominant_color ?? undefined,
      });
      if (!agg.color && record.dominant_color) agg.color = record.dominant_color;
      for (const genre of record.genres ?? []) {
        agg.genreCounts.set(genre, (agg.genreCounts.get(genre) ?? 0) + 1);
        genreTotals.set(genre, (genreTotals.get(genre) ?? 0) + 1);
      }
      artists.set(record.artist, agg);
    }

    // Each artist lands in a single zone: their most-common genre.
    const artistPrimary = new Map<string, string>();
    const usedGenres = new Set<string>();
    for (const [name, agg] of artists) {
      let best: string | undefined;
      let bestCount = -1;
      for (const [genre, count] of agg.genreCounts) {
        if (count > bestCount) {
          bestCount = count;
          best = genre;
        }
      }
      const primary = best ?? "Other";
      artistPrimary.set(name, primary);
      usedGenres.add(primary);
    }

    const elements: ElementDefinition[] = [];

    for (const genre of usedGenres) {
      elements.push({
        data: {
          id: `genre:${genre}`,
          kind: "genre",
          label: genre,
          color: GENRE_COLORS[genre] ?? FALLBACK_COLOR,
        },
      });
    }

    let albumCount = 0;
    for (const [name, agg] of artists) {
      const genre = artistPrimary.get(name) ?? "Other";
      const genreColor = GENRE_COLORS[genre] ?? FALLBACK_COLOR;
      const artistColor = agg.color ?? genreColor;
      elements.push({
        data: {
          id: `artist:${name}`,
          kind: "artist",
          parent: `genre:${genre}`,
          label: name,
          color: artistColor,
          count: agg.albums.length,
        },
      });
      for (const album of agg.albums) {
        albumCount += 1;
        elements.push({
          data: {
            id: `album:${album.id}`,
            kind: "album",
            parent: `artist:${name}`,
            label: album.title,
            color: album.color ?? artistColor,
            artist: name,
            title: album.title,
          },
        });
      }
    }

    const genreLegend = Array.from(genreTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({
        name,
        count,
        color: GENRE_COLORS[name] ?? FALLBACK_COLOR,
      }));

    return {
      elements,
      genreCount: usedGenres.size,
      artistCount: artists.size,
      albumCount,
      genreLegend,
    };
  }, [records]);
}
