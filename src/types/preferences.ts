import type { Cuisine, MealType, Difficulty } from "./recipe";

export type CookingTimeBucket = "Quick" | "Balanced" | "Slow";

export interface TasteProfile {
  cuisines: Record<Cuisine, number>;
  mealTypes: Record<MealType, number>;
  difficulties: Record<Difficulty, number>;
  cookingTimes: Record<CookingTimeBucket, number>;
  ingredients: Record<string, number>;
  tags: Record<string, number>;
}

export interface PreferenceHighlights {
  likedCuisines: Cuisine[];
  dislikedCuisines: Cuisine[];
  likedIngredients: string[];
  dislikedIngredients: string[];
  likedMealTypes: MealType[];
  dislikedMealTypes: MealType[];
  likedDifficulties: Difficulty[];
  dislikedDifficulties: Difficulty[];
  favoriteTags: string[];
  avoidedTags: string[];
}
