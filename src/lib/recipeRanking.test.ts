import { rankRecipesForPickaMeal } from "@/lib/recipeRanking";
import type { Recipe } from "@/types/recipe";

const buildRecipe = (overrides: Partial<Recipe> & Pick<Recipe, "id" | "title" | "ingredients">): Recipe => ({
  id: overrides.id,
  title: overrides.title,
  cuisine: overrides.cuisine ?? "Western",
  mealType: overrides.mealType ?? "Dinner",
  cookingTime: overrides.cookingTime ?? 30,
  difficulty: overrides.difficulty ?? "Easy",
  ingredients: overrides.ingredients,
  instructions: overrides.instructions ?? ["Cook and serve."],
  image: overrides.image ?? "https://example.com/recipe.jpg",
  tags: overrides.tags ?? [],
});

describe("rankRecipesForPickaMeal", () => {
  it("prefers tighter ingredient matches with fewer unrelated extras", () => {
    const cleanMatch = buildRecipe({
      id: "clean-match",
      title: "Simple Chicken Rice Bowl",
      ingredients: ["Chicken breast", "Rice", "Cucumber"],
    });

    const mixedProteinMatch = buildRecipe({
      id: "mixed-protein-match",
      title: "Chicken Rice with Bacon",
      ingredients: ["Chicken breast", "Rice", "Bacon", "Cheese"],
    });

    const noisyMatch = buildRecipe({
      id: "noisy-match",
      title: "Loaded Chicken Rice Bake",
      ingredients: ["Chicken breast", "Rice", "Bacon", "Cheese", "Cream", "Avocado"],
    });

    const ranked = rankRecipesForPickaMeal(
      [noisyMatch, mixedProteinMatch, cleanMatch],
      { selectedIngredients: ["Chicken breast", "Rice"] }
    );

    expect(ranked.map((recipe) => recipe.id)).toEqual([
      "clean-match",
      "mixed-protein-match",
      "noisy-match",
    ]);
  });

  it("pushes near-duplicate matches below a strong alternative", () => {
    const noodleBowl = buildRecipe({
      id: "noodle-bowl",
      title: "Fresh Tofu Noodle Bowl",
      cuisine: "Vietnamese",
      mealType: "Lunch",
      ingredients: ["Tofu", "Rice Noodle", "Bean sprouts", "Cucumber", "Mint"],
    });

    const curryNoodles = buildRecipe({
      id: "curry-noodles",
      title: "Tofu Curry Noodles",
      cuisine: "Thai",
      mealType: "Dinner",
      ingredients: ["Tofu", "Rice Noodle", "Curry paste", "Coconut milk", "Bell pepper", "Green beans"],
    });

    const secondNoodleBowl = buildRecipe({
      id: "second-noodle-bowl",
      title: "Caramelized Tofu Noodle Bowl",
      cuisine: "Vietnamese",
      mealType: "Lunch",
      ingredients: ["Tofu", "Rice Noodle", "Bean sprouts", "Cucumber", "Pickled carrots"],
    });

    const ranked = rankRecipesForPickaMeal(
      [secondNoodleBowl, curryNoodles, noodleBowl],
      { selectedIngredients: ["Tofu", "Rice Noodle"] }
    );

    const rankedIds = ranked.map((recipe) => recipe.id);

    expect(rankedIds[1]).toBe("curry-noodles");
    expect([rankedIds[0], rankedIds[2]].sort()).toEqual([
      "noodle-bowl",
      "second-noodle-bowl",
    ]);
  });

  it("keeps the existing preference-based ordering when no ingredients are selected", () => {
    const lowPreference = buildRecipe({
      id: "low-preference",
      title: "Mild Veggie Pasta",
      ingredients: ["Pasta", "Tomato", "Zucchini"],
    });

    const highPreference = buildRecipe({
      id: "high-preference",
      title: "Favorite Salmon Bowl",
      ingredients: ["Salmon", "Rice", "Cucumber"],
    });

    const ranked = rankRecipesForPickaMeal(
      [lowPreference, highPreference],
      {
        selectedIngredients: [],
        preferenceScore: (recipe) => (recipe.id === "high-preference" ? 5 : 1),
      }
    );

    expect(ranked.map((recipe) => recipe.id)).toEqual([
      "high-preference",
      "low-preference",
    ]);
  });
});
