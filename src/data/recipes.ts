import type { Recipe } from "@/types/recipe";
import { loadRecipes } from "@/lib/apiLoader";

const recipeCache: Recipe[] = [];

export async function refreshRecipes() {
  const fetched = await loadRecipes();
  recipeCache.length = 0;
  recipeCache.push(...fetched);
  return recipeCache;
}

export function getRecipes(): Recipe[] {
  return recipeCache.length ? recipeCache : (refreshRecipes(), recipeCache);
}
