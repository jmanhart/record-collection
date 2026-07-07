import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPurchaseLocationOptions,
  createPurchaseLocationOption,
} from "../services/supabase";

export const usePurchaseLocationOptions = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["purchase-location-options"],
    queryFn: getPurchaseLocationOptions,
  });

  const createMutation = useMutation({
    mutationFn: createPurchaseLocationOption,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-location-options"] });
    },
  });

  return {
    options: query.data ?? [],
    isLoading: query.isLoading,
    createOption: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
};
