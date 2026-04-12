import { getIngredients } from "@/data/ingredients";
import {
  getNormalizedIngredientSet,
  normalizeForMatching,
  normalizeSelectionList,
} from "@/lib/ingredientMatching";
import type { Cuisine, Difficulty, Filters, IngredientCategory, Recipe } from "@/types/recipe";

export type RollaMealStyle = "Quick meal" | "Healthy" | "Comfort food";
export type RollaMealSpiceLevel = "Mild" | "Medium" | "Spicy";

export interface RollaMealFilterState {
  selectedCuisine: Cuisine | "";
  selectedProtein: string;
  selectedDifficulty: Difficulty | "";
  selectedStyle: RollaMealStyle | "";
  selectedSpiceLevel: RollaMealSpiceLevel | "";
  maxTime: number | null;
}

const ingredientCategoryByKey = () => {
  const categoryByKey = new Map<string, IngredientCategory>();

  getIngredients().forEach((ingredient) => {
    const key = normalizeForMatching(ingredient.name);
    if (key && !categoryByKey.has(key)) {
      categoryByKey.set(key, ingredient.category);
    }
  });

  return categoryByKey;
};

const getSelectionBuckets = (selectedIngredients: string[]) => {
  const normalizedSelections = normalizeSelectionList(selectedIngredients);
  if (!normalizedSelections.length) {
    return {
      normalizedSelections,
      proteinSelections: [] as string[],
      secondarySelections: [] as string[],
    };
  }

  const categoryByKey = ingredientCategoryByKey();
  const proteinSelections = normalizedSelections.filter(
    (selection) => categoryByKey.get(selection) === "Protein"
  );
  const secondarySelections = normalizedSelections.filter(
    (selection) => !proteinSelections.includes(selection)
  );

  return { normalizedSelections, proteinSelections, secondarySelections };
};

const recipeContainsAllSelections = (recipe: Recipe, requiredSelections: string[]) => {
  if (!requiredSelections.length) return true;
  const normalizedIngredients = getNormalizedIngredientSet(recipe.ingredients);
  return requiredSelections.every((selection) => normalizedIngredients.has(selection));
};

export const countMatchedSelectedIngredients = (recipe: Recipe, selectedIngredients: string[]) => {
  const normalizedSelections = normalizeSelectionList(selectedIngredients);
  if (!normalizedSelections.length) return 0;
  const normalizedIngredients = getNormalizedIngredientSet(recipe.ingredients);
  return normalizedSelections.filter((selection) => normalizedIngredients.has(selection)).length;
};

export const filterRecipesBySelectedIngredients = (recipes: Recipe[], selectedIngredients: string[]) => {
  const { normalizedSelections, proteinSelections, secondarySelections } =
    getSelectionBuckets(selectedIngredients);

  if (!normalizedSelections.length) return recipes;

  const proteinAnchoredRecipes = proteinSelections.length
    ? recipes.filter((recipe) => recipeContainsAllSelections(recipe, proteinSelections))
    : recipes;

  const requiredSecondarySelections = proteinSelections.length
    ? secondarySelections
    : normalizedSelections;

  return proteinAnchoredRecipes.filter((recipe) =>
    recipeContainsAllSelections(recipe, requiredSecondarySelections)
  );
};

export const applyRecipeFilters = (recipes: Recipe[], filters: Filters) => {
  let result = recipes;

  if (filters.cuisine) {
    result = result.filter((recipe) => recipe.cuisine === filters.cuisine);
  }
  if (filters.cookingTime) {
    const max = filters.cookingTime === "Under 15 min" ? 15 : filters.cookingTime === "Under 30 min" ? 30 : 60;
    result = result.filter((recipe) => recipe.cookingTime <= max);
  }
  if (filters.difficulty) {
    result = result.filter((recipe) => recipe.difficulty === filters.difficulty);
  }
  if (filters.mealType) {
    result = result.filter((recipe) => recipe.mealType === filters.mealType);
  }

  return result;
};

export const matchesMostlySelectedIngredients = (recipe: Recipe, selectedIngredients: string[]) => {
  const normalizedSelections = normalizeSelectionList(selectedIngredients);
  if (!normalizedSelections.length) return true;
  const matchedSelectionCount = countMatchedSelectedIngredients(recipe, normalizedSelections);
  return matchedSelectionCount >= Math.ceil(normalizedSelections.length * 0.5);
};

export const recipeMatchesStyle = (recipe: Recipe, style: RollaMealStyle) => {
  const tags = recipe.tags.map((tag) => tag.toLowerCase());
  const ingredients = recipe.ingredients.map((ingredient) => ingredient.toLowerCase());

  if (style === "Quick meal") {
    return recipe.cookingTime <= 30 || tags.some((tag) => ["quick", "fast", "weeknight"].includes(tag));
  }

  if (style === "Healthy") {
    const healthyTags = ["light", "fresh", "vegetarian", "plant-based", "seafood", "herbs"];
    const richIngredients = ["bacon", "cream", "butter", "cheese", "sausage"];
    return (
      tags.some((tag) => healthyTags.includes(tag)) ||
      (ingredients.some((ingredient) =>
        ["cucumber", "lettuce", "spinach", "bean sprouts", "tomato", "broccoli"].some((needle) =>
          ingredient.includes(needle)
        )
      ) &&
        !ingredients.some((ingredient) => richIngredients.some((needle) => ingredient.includes(needle))))
    );
  }

  return (
    tags.some((tag) => ["comfort", "hearty", "baked", "curry", "soup", "one-pan", "skillet"].includes(tag)) ||
    recipe.cookingTime > 40
  );
};

export const getRecipeSpiceLevel = (recipe: Recipe): RollaMealSpiceLevel => {
  const tags = recipe.tags.map((tag) => tag.toLowerCase());
  const ingredients = recipe.ingredients.map((ingredient) => ingredient.toLowerCase());

  if (
    tags.includes("spicy") ||
    ingredients.some((ingredient) =>
      ["chili", "chilli", "chili flakes", "curry paste"].some((needle) => ingredient.includes(needle))
    )
  ) {
    return "Spicy";
  }

  if (
    ingredients.some((ingredient) =>
      ["paprika", "smoked paprika", "curry powder", "ginger", "mustard"].some((needle) =>
        ingredient.includes(needle)
      )
    )
  ) {
    return "Medium";
  }

  return "Mild";
};

export const filterRecipesForRollaMeal = (recipes: Recipe[], filters: RollaMealFilterState) => {
  return recipes.filter((recipe) => {
    if (filters.selectedCuisine && recipe.cuisine !== filters.selectedCuisine) return false;
    if (filters.selectedDifficulty && recipe.difficulty !== filters.selectedDifficulty) return false;
    if (filters.maxTime && recipe.cookingTime > filters.maxTime) return false;
    if (filters.selectedStyle && !recipeMatchesStyle(recipe, filters.selectedStyle)) return false;
    if (filters.selectedSpiceLevel && getRecipeSpiceLevel(recipe) !== filters.selectedSpiceLevel) return false;
    if (filters.selectedProtein) {
      const normalizedProtein = normalizeForMatching(filters.selectedProtein);
      if (!normalizedProtein) return false;
      const normalizedIngredients = getNormalizedIngredientSet(recipe.ingredients);
      if (!normalizedIngredients.has(normalizedProtein)) return false;
    }
    return true;
  });
};
