import { useQuery } from "@tanstack/react-query";
import { getListens } from "../services/supabase";

export const useListens = () => {
  const query = useQuery({
    queryKey: ["listens"],
    queryFn: getListens,
  });

  return {
    listens: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
  };
};
