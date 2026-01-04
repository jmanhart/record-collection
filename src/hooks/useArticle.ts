import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ComponentType } from "react";
import { articleImports } from "../content/articles";

interface Article {
  id: number;
  Content: ComponentType;
}

export function useArticle(recordId: number) {
  const queryClient = useQueryClient();

  // Import MDX article using the manifest
  const { data: article, isLoading } = useQuery<Article | null>({
    queryKey: ["article", recordId],
    queryFn: async () => {
      const recordIdStr = String(recordId);
      const importFn = articleImports[recordIdStr as keyof typeof articleImports];
      
      if (!importFn) {
        // Article doesn't exist
        return null;
      }

      try {
        const module = await importFn();
        
        if (module && module.default) {
          return {
            id: recordId,
            Content: module.default,
          };
        }
      } catch (error) {
        console.error(`Error loading article for record ${recordId}:`, error);
        console.error("Import function:", importFn);
        console.error("Available articles:", Object.keys(articleImports));
        return null;
      }
      
      return null;
    },
  });

  return {
    article,
    isLoading,
  };
}
