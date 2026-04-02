import { useQuery } from "@tanstack/react-query";
import { getWishlist } from "../services/supabase";

export const useWishlist = () => {
  const wishlist = useQuery({
    queryKey: ["wishlist"],
    queryFn: getWishlist,
  });

  return {
    records: wishlist.data ?? [],
    isLoading: wishlist.isLoading,
    error: wishlist.error,
  };
};
