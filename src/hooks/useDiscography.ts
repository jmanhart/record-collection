import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDiscographyTargets } from "../services/supabase";
import type { DiscographyTarget } from "../services/supabase";
import { useRecords } from "./useRecords";
import discographyTargets from "../data/discography-targets.json";

export interface DiscographyAlbum {
  releaseId: number;
  title: string;
  year: number | null;
  imageUrl: string | null;
  owned: boolean;
  artist: string;
  slug: string;
}

interface ArtistDiscography {
  artist: string;
  slug: string;
  albums: DiscographyAlbum[];
  progress: { owned: number; total: number };
  isLoading: boolean;
}

interface ArtistSummary {
  artist: string;
  slug: string;
  progress: { owned: number; total: number };
}

export function useArtistDiscography(slug: string): ArtistDiscography {
  const { records, isLoading: isLoadingRecords } = useRecords();
  const { data: targets, isLoading: isLoadingTargets } = useQuery({
    queryKey: ["discography-targets"],
    queryFn: getDiscographyTargets,
  });

  const result = useMemo(() => {
    const config = discographyTargets.find((t) => t.slug === slug);
    if (!config) {
      return {
        artist: "",
        slug,
        albums: [],
        progress: { owned: 0, total: 0 },
      };
    }

    const ownedIds = new Set(records.map((r) => r.id));
    const targetMap = new Map(
      (targets || []).map((t: DiscographyTarget) => [t.release_id, t])
    );

    const albums: DiscographyAlbum[] = config.releaseIds.map((id) => {
      const target = targetMap.get(id);
      const ownedRecord = records.find((r) => r.id === id);
      return {
        releaseId: id,
        title: target?.title || "Unknown",
        year: target?.year || null,
        imageUrl: ownedRecord?.coverImage || target?.supabase_image_url || null,
        owned: ownedIds.has(id),
        artist: config.artist,
        slug: config.slug,
      };
    });

    albums.sort((a, b) => (a.year || 9999) - (b.year || 9999));

    const owned = albums.filter((a) => a.owned).length;

    return {
      artist: config.artist,
      slug: config.slug,
      albums,
      progress: { owned, total: albums.length },
    };
  }, [slug, records, targets]);

  return {
    ...result,
    isLoading: isLoadingRecords || isLoadingTargets,
  };
}

export function useArtistList(): {
  artists: ArtistSummary[];
  isLoading: boolean;
} {
  const { records, isLoading: isLoadingRecords } = useRecords();
  const { data: targets, isLoading: isLoadingTargets } = useQuery({
    queryKey: ["discography-targets"],
    queryFn: getDiscographyTargets,
  });

  const artists = useMemo(() => {
    const ownedIds = new Set(records.map((r) => r.id));

    return discographyTargets.map((config) => {
      const owned = config.releaseIds.filter((id) => ownedIds.has(id)).length;
      return {
        artist: config.artist,
        slug: config.slug,
        progress: { owned, total: config.releaseIds.length },
      };
    });
  }, [records, targets]);

  return {
    artists,
    isLoading: isLoadingRecords || isLoadingTargets,
  };
}
