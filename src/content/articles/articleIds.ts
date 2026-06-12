import { articleImports } from "./index";

export const articleIds = new Set(Object.keys(articleImports));

export function hasArticle(id: number | string): boolean {
  return articleIds.has(String(id));
}
