import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNfcTags,
  createNfcTag,
  deleteNfcTag,
  type NfcTag,
} from "../services/supabase";

export const useNfcTags = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["nfc-tags"],
    queryFn: getNfcTags,
  });

  const tagsByReleaseId = useMemo(() => {
    const map = new Map<number, NfcTag>();
    if (query.data) {
      for (const tag of query.data) {
        map.set(tag.release_id, tag);
      }
    }
    return map;
  }, [query.data]);

  const pairMutation = useMutation({
    mutationFn: ({ nfcUid, releaseId }: { nfcUid: string; releaseId: number }) =>
      createNfcTag(nfcUid, releaseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nfc-tags"] });
    },
  });

  const unpairMutation = useMutation({
    mutationFn: deleteNfcTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nfc-tags"] });
    },
  });

  return {
    nfcTags: query.data ?? [],
    isLoading: query.isLoading,
    hasNfcTag: (releaseId: number) => tagsByReleaseId.has(releaseId),
    getNfcTag: (releaseId: number) => tagsByReleaseId.get(releaseId),
    pairTag: pairMutation.mutateAsync,
    unpairTag: unpairMutation.mutateAsync,
    isPairing: pairMutation.isPending,
    isUnpairing: unpairMutation.isPending,
  };
};
