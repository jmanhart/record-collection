import { useMemo } from "react";
import type { ElementDefinition } from "cytoscape";
import type { Record } from "../types/Record";

export type NodeKind = "genre" | "artist";

// A fixed hue per genre so the 14 genres read as stable color families; artists
// inherit their representative album's dominant color, falling back to genre.
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
  /** [name, color] for the legend, ordered by record count desc. */
  genreLegend: { name: string; color: string; count: number }[];
}

interface ArtistAgg {
  count: number;
  color?: string;
  genres: Set<string>;
}

export function useCollectionGraph(records: Record[]): CollectionGraph {
  return useMemo(() => {
    const genreCounts = new Map<string, number>();
    const artists = new Map<string, ArtistAgg>();
    const pairs = new Set<string>();

    for (const record of records) {
      const artist = record.artist;
      const agg = artists.get(artist) ?? {
        count: 0,
        color: undefined,
        genres: new Set<string>(),
      };
      agg.count += 1;
      if (!agg.color && record.dominant_color) agg.color = record.dominant_color;
      for (const genre of record.genres ?? []) {
        genreCounts.set(genre, (genreCounts.get(genre) ?? 0) + 1);
        agg.genres.add(genre);
        pairs.add(`${artist}\u0000${genre}`);
      }
      artists.set(artist, agg);
    }

    const elements: ElementDefinition[] = [];

    for (const [genre, count] of genreCounts) {
      elements.push({
        data: {
          id: `genre:${genre}`,
          kind: "genre",
          label: genre,
          count,
          color: GENRE_COLORS[genre] ?? FALLBACK_COLOR,
          diam: 40 + Math.sqrt(count) * 5,
        },
      });
    }

    for (const [artist, agg] of artists) {
      const domGenre = agg.genres.values().next().value;
      const color =
        agg.color ?? (domGenre ? GENRE_COLORS[domGenre] : undefined) ?? FALLBACK_COLOR;
      elements.push({
        data: {
          id: `artist:${artist}`,
          kind: "artist",
          label: artist,
          count: agg.count,
          color,
          diam: 13 + Math.sqrt(agg.count) * 6,
        },
      });
    }

    for (const pair of pairs) {
      const [artist, genre] = pair.split("\u0000");
      elements.push({
        data: {
          id: `edge:${artist}\u0000${genre}`,
          source: `artist:${artist}`,
          target: `genre:${genre}`,
        },
      });
    }

    const genreLegend = Array.from(genreCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({
        name,
        count,
        color: GENRE_COLORS[name] ?? FALLBACK_COLOR,
      }));

    return {
      elements,
      genreCount: genreCounts.size,
      artistCount: artists.size,
      genreLegend,
    };
  }, [records]);
}
