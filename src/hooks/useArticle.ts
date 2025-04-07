import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Article {
  id: number;
  content: string;
}

export function useArticle(recordId: number) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // Fetch article from the content directory
  const { data: article, isLoading } = useQuery<Article | null>({
    queryKey: ["article", recordId],
    queryFn: async () => {
      try {
        // Dynamically import the markdown file
        const response = await fetch(`/articles/${recordId}.md`);
        if (!response.ok) {
          if (response.status === 404) {
            return null;
          }
          throw new Error(`Failed to load article: ${response.statusText}`);
        }
        const content = await response.text();
        // Only return article if content looks like markdown (not HTML)
        if (
          content.includes("<!DOCTYPE html>") ||
          content.includes("<script")
        ) {
          return null;
        }
        return {
          id: recordId,
          content,
        };
      } catch (error) {
        console.error(`Error loading article for record ${recordId}:`, error);
        return null;
      }
    },
  });

  // Save article
  const { mutate: saveArticle } = useMutation({
    mutationFn: async (content: string) => {
      if (!article) {
        // Create new article
        const { data, error } = await supabase
          .from("articles")
          .insert([
            {
              record_id: recordId,
              content,
            },
          ])
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Update existing article
        const { data, error } = await supabase
          .from("articles")
          .update({ content })
          .eq("id", article.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["article", recordId] });
      setError(null);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  return {
    article,
    isLoading,
    error,
    saveArticle,
  };
}
