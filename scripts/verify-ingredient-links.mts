#!/usr/bin/env node
import { readFile } from "fs/promises";
import path from "path";

const workspaceRoot = process.cwd();

const sanitizeIngredientName = (name: string) =>
  name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const ingredientCanonicalAliases: Record<string, string> = {
  sausage: "sausage",
  sausages: "sausage",
  mussel: "mussels",
  mussels: "mussels",
  chickpea: "chickpeas",
  chickpeas: "chickpeas",
  lentil: "lentils",
  lentils: "lentils",
  "black-bean": "black-beans",
  "black-beans": "black-beans",
  "green-bean": "green-beans",
  "green-beans": "green-beans",
  "bean-sprout": "bean-sprouts",
  "bean-sprouts": "bean-sprouts",
  "rice-noodles": "rice-noodle",
  "rice-noodle": "rice-noodle",
  "pickled-carrot": "pickled-carrots",
  "pickled-carrots": "pickled-carrots",
  "beef-slices": "beef-slices",
  "beef-slice": "beef-slices",
  "beef-steak": "beef",
  "beef-sirloin": "beef",
  "beef-ribeye": "beef",
  "beef-brisket": "beef",
  "beef-tenderloin": "beef",
  "beef-shank": "beef",
  "beef-chuck": "beef",
  "pork-chop": "pork",
  "pork-chops": "pork",
  "pork-loin": "pork",
  "pork-belly": "pork",
  "pork-shoulder": "pork",
  "pork-ribs": "pork",
  "pork-rib": "pork",
  "minced-beef": "ground-beef",
};

const generalizeRules: Array<{
  canonical: string;
  includes: string[];
  excludes?: string[];
}> = [
  {
    canonical: "beef",
    includes: ["beef"],
    excludes: ["ground", "broth", "stock", "sauce", "paste", "jerky"],
  },
  {
    canonical: "pork",
    includes: ["pork"],
    excludes: ["broth", "stock", "sauce"],
  },
  {
    canonical: "shrimp",
    includes: ["shrimp", "prawn"],
    excludes: ["broth", "stock", "sauce"],
  },
  {
    canonical: "salmon",
    includes: ["salmon"],
    excludes: ["broth", "stock", "sauce"],
  },
];

const normalizeForMatching = (value: string) => {
  const sanitized = sanitizeIngredientName(value);
  if (!sanitized) return "";
  const alias = ingredientCanonicalAliases[sanitized];
  if (alias) return alias;
  for (const rule of generalizeRules) {
    const matchesInclude = rule.includes.some((keyword) => sanitized.includes(keyword));
    if (!matchesInclude) continue;
    const hasExcluded = rule.excludes?.some((keyword) => sanitized.includes(keyword));
    if (hasExcluded) continue;
    return rule.canonical;
  }
  return sanitized;
};

const ingredientPath = path.join(workspaceRoot, "src", "data", "ingredients.ts");
const apiLoaderPath = path.join(workspaceRoot, "src", "lib", "apiLoader.ts");

const unique = <T>(items: T[]) => Array.from(new Set(items));

async function main() {
  const [ingredientSource, apiSource] = await Promise.all([
    readFile(ingredientPath, "utf8"),
    readFile(apiLoaderPath, "utf8"),
  ]);

  const pickerIngredients = Array.from(
    ingredientSource.matchAll(/\{ name: "([^"]+)", category: "([^"]+)" \}/g),
    (match) => ({ name: match[1], category: match[2] })
  );

  const recipeBlocks = Array.from(apiSource.matchAll(/title:\s*"([^"]+)"[\s\S]*?ingredients:\s*\[((?:.|\n)*?)\]/g));
  const recipes = recipeBlocks.map((match) => ({
    title: match[1],
    ingredients: Array.from(match[2].matchAll(/"([^"]+)"/g), (ingredientMatch) => ingredientMatch[1]),
  }));

  const pickerByKey = new Map<string, string>();
  const duplicatePickerKeys = new Map<string, string[]>();
  for (const ingredient of pickerIngredients) {
    const key = normalizeForMatching(ingredient.name);
    const existing = pickerByKey.get(key);
    if (existing && existing !== ingredient.name) {
      duplicatePickerKeys.set(key, unique([...(duplicatePickerKeys.get(key) ?? [existing]), ingredient.name]));
      continue;
    }
    pickerByKey.set(key, ingredient.name);
  }

  const missingRecipeLinks: Array<{ recipe: string; ingredient: string }> = [];
  for (const recipe of recipes) {
    for (const ingredient of recipe.ingredients) {
      const key = normalizeForMatching(ingredient);
      if (!pickerByKey.has(key)) {
        missingRecipeLinks.push({ recipe: recipe.title, ingredient });
      }
    }
  }

  const emptyPickerIngredients = Array.from(pickerByKey.entries())
    .map(([key, name]) => ({
      key,
      name,
      count: recipes.filter((recipe) =>
        recipe.ingredients.some((ingredient) => normalizeForMatching(ingredient) === key)
      ).length,
    }))
    .filter((entry) => entry.count === 0);

  console.log("Ingredient link audit complete\n");
  console.log(`Picker ingredient definitions: ${pickerIngredients.length}`);
  console.log(`Canonical picker ingredients: ${pickerByKey.size}`);
  console.log(`Curated recipes checked: ${recipes.length}`);

  if (duplicatePickerKeys.size > 0) {
    console.log(`\nDuplicate canonical picker entries: ${duplicatePickerKeys.size}`);
    duplicatePickerKeys.forEach((names, key) => {
      console.log(`- ${key}: ${names.join(", ")}`);
    });
  } else {
    console.log("\nNo duplicate canonical picker entries found.");
  }

  if (missingRecipeLinks.length > 0) {
    console.log(`\nCurated recipe ingredients without picker links: ${missingRecipeLinks.length}`);
    missingRecipeLinks.forEach((entry) => {
      console.log(`- ${entry.recipe}: ${entry.ingredient}`);
    });
  } else {
    console.log("\nAll curated recipe ingredients link to a picker ingredient.");
  }

  if (emptyPickerIngredients.length > 0) {
    console.log(`\nCanonical picker ingredients with zero curated recipes: ${emptyPickerIngredients.length}`);
    emptyPickerIngredients.forEach((entry) => {
      console.log(`- ${entry.name}`);
    });
  } else {
    console.log("\nEvery canonical picker ingredient has at least one curated recipe.");
  }

  const hasIssues =
    duplicatePickerKeys.size > 0 ||
    missingRecipeLinks.length > 0 ||
    emptyPickerIngredients.length > 0;

  process.exit(hasIssues ? 1 : 0);
}

main().catch((error) => {
  console.error("Ingredient link audit failed", error);
  process.exit(1);
});
