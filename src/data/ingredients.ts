import type { Ingredient, IngredientCategory } from "@/types/recipe";
import {
  loadIngredients,
  fallbackIngredientImage,
  resolveIngredientImage,
} from "../lib/apiLoader.ts";
import { normalizeForIngredientKey } from "@/lib/ingredientMatching";

export const fallbackDefinitions: Array<{ name: string; category: IngredientCategory }> = [
  { name: "Chicken breast", category: "Protein" },
  { name: "Chicken thigh", category: "Protein" },
  { name: "Beef", category: "Protein" },
  { name: "Ground beef", category: "Protein" },
  { name: "Pork", category: "Protein" },
  { name: "Bacon", category: "Protein" },
  { name: "Sausage", category: "Protein" },
  { name: "Salmon", category: "Protein" },
  { name: "Tuna", category: "Protein" },
  { name: "Shrimp", category: "Protein" },
  { name: "White fish", category: "Protein" },
  { name: "Mussels", category: "Protein" },
  { name: "Egg", category: "Protein" },
  { name: "Tofu", category: "Protein" },
  { name: "Tempeh", category: "Protein" },
  { name: "Halloumi", category: "Protein" },
  { name: "Chickpeas", category: "Protein" },
  { name: "Lentils", category: "Protein" },
  { name: "Black beans", category: "Protein" },
  { name: "Minced plant based meat", category: "Protein" },
  { name: "Chicken", category: "Protein" },
  { name: "Beef slices", category: "Protein" },
  { name: "Onion", category: "Vegetables" },
  { name: "Garlic", category: "Vegetables" },
  { name: "Shallot", category: "Vegetables" },
  { name: "Tomato", category: "Vegetables" },
  { name: "Cherry tomato", category: "Vegetables" },
  { name: "Bell pepper", category: "Vegetables" },
  { name: "Chili", category: "Vegetables" },
  { name: "Carrot", category: "Vegetables" },
  { name: "Broccoli", category: "Vegetables" },
  { name: "Cauliflower", category: "Vegetables" },
  { name: "Spinach", category: "Vegetables" },
  { name: "Kale", category: "Vegetables" },
  { name: "Lettuce", category: "Vegetables" },
  { name: "Cabbage", category: "Vegetables" },
  { name: "Pak choi", category: "Vegetables" },
  { name: "Zucchini", category: "Vegetables" },
  { name: "Eggplant", category: "Vegetables" },
  { name: "Mushroom", category: "Vegetables" },
  { name: "Cucumber", category: "Vegetables" },
  { name: "Avocado", category: "Vegetables" },
  { name: "Green beans", category: "Vegetables" },
  { name: "Peas", category: "Vegetables" },
  { name: "Corn", category: "Vegetables" },
  { name: "Sweet potato", category: "Vegetables" },
  { name: "Pickled cucumber", category: "Vegetables" },
  { name: "Dill", category: "Vegetables" },
  { name: "Bean sprouts", category: "Vegetables" },
  { name: "Lemongrass", category: "Vegetables" },
  { name: "Cilantro", category: "Vegetables" },
  { name: "Pickled carrots", category: "Vegetables" },
  { name: "Mint", category: "Vegetables" },
  { name: "Rice", category: "Carbs" },
  { name: "Rice Noodle", category: "Carbs" },
  { name: "Pasta", category: "Carbs" },
  { name: "Spaghetti", category: "Carbs" },
  { name: "Noodles", category: "Carbs" },
  { name: "Ramen noodles", category: "Carbs" },
  { name: "Potatoes", category: "Carbs" },
  { name: "Sweet potatoes", category: "Carbs" },
  { name: "Bread", category: "Carbs" },
  { name: "Tortilla", category: "Carbs" },
  { name: "Baguette", category: "Carbs" },
  { name: "Rice paper", category: "Carbs" },
  { name: "Rice flour", category: "Carbs" },
  { name: "Soy sauce", category: "Extras" },
  { name: "Oyster sauce", category: "Extras" },
  { name: "Fish sauce", category: "Extras" },
  { name: "Teriyaki sauce", category: "Extras" },
  { name: "Tomato sauce", category: "Extras" },
  { name: "Pesto", category: "Extras" },
  { name: "Curry paste", category: "Extras" },
  { name: "Coconut milk", category: "Extras" },
  { name: "Cream", category: "Extras" },
  { name: "Cheese", category: "Extras" },
  { name: "Butter", category: "Extras" },
  { name: "Black pepper", category: "Extras" },
  { name: "Paprika", category: "Extras" },
  { name: "Smoked paprika", category: "Extras" },
  { name: "Chili flakes", category: "Extras" },
  { name: "Cumin", category: "Extras" },
  { name: "Curry powder", category: "Extras" },
  { name: "Turmeric", category: "Extras" },
  { name: "Oregano", category: "Extras" },
  { name: "Basil", category: "Extras" },
  { name: "Thyme", category: "Extras" },
  { name: "Rosemary", category: "Extras" },
  { name: "Garlic powder", category: "Extras" },
  { name: "Onion powder", category: "Extras" },
  { name: "Breadcrumbs", category: "Extras" },
  { name: "Nutmeg", category: "Extras" },
  { name: "Beef broth", category: "Extras" },
  { name: "Chicken broth", category: "Extras" },
  { name: "Sugar", category: "Extras" },
  { name: "Salt", category: "Extras" },
  { name: "Lemon", category: "Extras" },
  { name: "Mustard", category: "Extras" },
  { name: "Honey", category: "Extras" },
  { name: "Lingonberry jam", category: "Extras" },
  { name: "Ginger", category: "Extras" },
  { name: "Star anise", category: "Extras" },
  { name: "Cloves", category: "Extras" },
  { name: "Chinese cinnamon", category: "Extras" },
  { name: "Vinegar", category: "Extras" },
  { name: "Herbs", category: "Extras" },
  { name: "Peanut sauce", category: "Extras" },
];

const ingredientKeyFor = (name: string) => normalizeForIngredientKey(name) || name.trim().toLowerCase();

const canonicalFallbackDefinitions = Array.from(
  fallbackDefinitions.reduce((map, ingredient) => {
    const key = ingredientKeyFor(ingredient.name);
    if (!map.has(key)) {
      map.set(key, ingredient);
    }
    return map;
  }, new Map<string, { name: string; category: IngredientCategory }>())
    .values()
);

const fallbackDefinitionByKey = new Map(
  canonicalFallbackDefinitions.map((ingredient) => [ingredientKeyFor(ingredient.name), ingredient] as const)
);

const fallbackIngredients: Ingredient[] = canonicalFallbackDefinitions.map((ingredient) => {
  const { image, secondaryImage } = resolveIngredientImage(ingredient.name);
  return { ...ingredient, image, secondaryImage };
});

let ingredientCache: Ingredient[] = [...fallbackIngredients];

export async function refreshIngredients() {
  const fetched = await loadIngredients();
  const merged = new Map<string, Ingredient>();
  const addIngredient = (ingredient: Ingredient) => {
    const key = ingredientKeyFor(ingredient.name);
    const preferred = fallbackDefinitionByKey.get(key);
    const normalizedIngredient: Ingredient = {
      ...ingredient,
      name: preferred?.name ?? ingredient.name,
      category: preferred?.category ?? ingredient.category,
    };
    const existing = merged.get(key);
    if (!existing) {
      merged.set(key, normalizedIngredient);
      return;
    }
    merged.set(key, {
      ...existing,
      ...normalizedIngredient,
      image: normalizedIngredient.image ?? existing.image,
      secondaryImage: normalizedIngredient.secondaryImage ?? existing.secondaryImage,
    });
  };

  fallbackIngredients.forEach((ingredient) => addIngredient(ingredient));
  fetched.forEach((ingredient) => {
    const key = ingredientKeyFor(ingredient.name);
    const preferred = fallbackDefinitionByKey.get(key);
    const canonicalName = preferred?.name ?? ingredient.name;
    const { image, secondaryImage } = resolveIngredientImage(canonicalName);
    addIngredient({
      ...ingredient,
      name: canonicalName,
      category: preferred?.category ?? ingredient.category,
      image: ingredient.image ?? image,
      secondaryImage: ingredient.secondaryImage ?? secondaryImage,
    });
  });

  ingredientCache = [...merged.values()];
  return ingredientCache;
}

export function getIngredients(): Ingredient[] {
  return ingredientCache.length ? ingredientCache : (refreshIngredients(), ingredientCache);
}
