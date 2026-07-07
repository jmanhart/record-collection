import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTagOptions, createTagOption } from "../services/supabase";

export const useTagOptions = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["tag-options"],
    queryFn: getTagOptions,
  });

  const createMutation = useMutation({
    mutationFn: createTagOption,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tag-options"] });
    },
  });

  return {
    options: query.data ?? [],
    isLoading: query.isLoading,
    createOption: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
};
