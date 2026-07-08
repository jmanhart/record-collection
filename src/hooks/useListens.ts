import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getListens, deleteListen } from "../services/supabase";

export const useListens = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["listens"],
    queryFn: getListens,
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id }: { id: string; releaseId: number }) => deleteListen(id),
    onSuccess: (_data, { releaseId }) => {
      queryClient.invalidateQueries({ queryKey: ["listens"] });
      queryClient.invalidateQueries({ queryKey: ["listen-count", releaseId] });
    },
  });

  return {
    listens: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    deleteListen: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
};
