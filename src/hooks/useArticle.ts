import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ComponentType } from "react";

interface Article {
  id: number;
  Content: ComponentType;
}

export function useArticle(recordId: number) {
  const queryClient = useQueryClient();

  // Dynamically import MDX article from the content directory
  const { data: article, isLoading } = useQuery<Article | null>({
    queryKey: ["article", recordId],
    queryFn: async () => {
      // Try .mdx first, then fall back to .md
      const extensions = [".mdx", ".md"];
      
      for (const ext of extensions) {
        try {
          const module = await import(
            /* @vite-ignore */
            `../content/articles/${recordId}${ext}`
          );

          if (module && module.default) {
            return {
              id: recordId,
              Content: module.default,
            };
          }
        } catch (error) {
          // Continue to next extension
          continue;
        }
      }
      
      // No article found
      return null;
    },
  });

  return {
    article,
    isLoading,
  };
}
