import type { Recipe } from "@/types/recipe";
import { loadRecipes } from "@/lib/apiLoader";

let recipeCache: Recipe[] = [];

export async function refreshRecipes() {
  const fetched = await loadRecipes();
  recipeCache = [...fetched];
  return recipeCache;
}

export function getRecipes(): Recipe[] {
  return recipeCache.length ? recipeCache : (refreshRecipes(), recipeCache);
}
