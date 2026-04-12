import { describe, expect, it } from "vitest";
import {
  filterRecipesBySelectedIngredients,
  filterRecipesForRollaMeal,
  type RollaMealFilterState,
} from "@/lib/recipeFiltering";
import type { Recipe } from "@/types/recipe";

const buildRecipe = (overrides: Partial<Recipe> & Pick<Recipe, "id" | "title" | "ingredients">): Recipe => ({
  id: overrides.id,
  title: overrides.title,
  cuisine: overrides.cuisine ?? "Asian",
  mealType: overrides.mealType ?? "Dinner",
  cookingTime: overrides.cookingTime ?? 25,
  difficulty: overrides.difficulty ?? "Easy",
  ingredients: overrides.ingredients,
  instructions: overrides.instructions ?? ["Cook everything together."],
  image: overrides.image ?? "/placeholder.jpg",
  tags: overrides.tags ?? [],
});

const recipes: Recipe[] = [
  buildRecipe({
    id: "chicken-only",
    title: "Chicken Garlic Skillet",
    ingredients: ["Chicken breast", "Garlic"],
  }),
  buildRecipe({
    id: "chicken-tomato",
    title: "Chicken Tomato Saute",
    ingredients: ["Chicken thigh", "Tomatoes", "Onion"],
  }),
  buildRecipe({
    id: "chicken-tomato-rice",
    title: "Chicken Tomato Rice Bowl",
    ingredients: ["Chicken", "Tomato", "Rice"],
  }),
  buildRecipe({
    id: "egg-rice",
    title: "Egg Rice Bowl",
    ingredients: ["Egg", "Rice", "Scallion"],
  }),
];

const emptyRollaMealFilters: RollaMealFilterState = {
  selectedCuisine: "",
  selectedProtein: "",
  selectedDifficulty: "",
  selectedStyle: "",
  selectedSpiceLevel: "",
  maxTime: null,
};

describe("PickaMeal ingredient filtering", () => {
  it("keeps Chicken results constrained to recipes that contain chicken variants", () => {
    const result = filterRecipesBySelectedIngredients(recipes, ["Chicken"]);

    expect(result.map((recipe) => recipe.id)).toEqual([
      "chicken-only",
      "chicken-tomato",
      "chicken-tomato-rice",
    ]);
  });

  it("narrows from Chicken to Chicken + Tomato with AND matching", () => {
    const chickenOnly = filterRecipesBySelectedIngredients(recipes, ["Chicken"]);
    const chickenAndTomato = filterRecipesBySelectedIngredients(recipes, ["Chicken", "Tomato"]);

    expect(chickenAndTomato.map((recipe) => recipe.id)).toEqual([
      "chicken-tomato",
      "chicken-tomato-rice",
    ]);
    expect(chickenAndTomato.length).toBeLessThanOrEqual(chickenOnly.length);
  });

  it("narrows again from Chicken + Tomato to Chicken + Tomato + Rice", () => {
    const chickenAndTomato = filterRecipesBySelectedIngredients(recipes, ["Chicken", "Tomato"]);
    const chickenTomatoRice = filterRecipesBySelectedIngredients(recipes, ["Chicken", "Tomato", "Rice"]);

    expect(chickenTomatoRice.map((recipe) => recipe.id)).toEqual(["chicken-tomato-rice"]);
    expect(chickenTomatoRice.length).toBeLessThanOrEqual(chickenAndTomato.length);
  });
});

describe("PickaMeal and RollAMeal stay independent", () => {
  it("keeps PickaMeal with Egg selected scoped to egg recipes only", () => {
    const result = filterRecipesBySelectedIngredients(recipes, ["Egg"]);

    expect(result.map((recipe) => recipe.id)).toEqual(["egg-rice"]);
  });

  it("keeps RollAMeal on the full recipe pool when it has no filters", () => {
    const pickaMealResult = filterRecipesBySelectedIngredients(recipes, ["Egg"]);
    const rollaMealResult = filterRecipesForRollaMeal(recipes, emptyRollaMealFilters);

    expect(pickaMealResult).toHaveLength(1);
    expect(rollaMealResult).toHaveLength(recipes.length);
  });

  it("applies only RollAMeal's own filters when they are selected", () => {
    const rollaMealResult = filterRecipesForRollaMeal(recipes, {
      ...emptyRollaMealFilters,
      selectedProtein: "Egg",
      maxTime: 30,
    });

    expect(rollaMealResult.map((recipe) => recipe.id)).toEqual(["egg-rice"]);
  });
});
