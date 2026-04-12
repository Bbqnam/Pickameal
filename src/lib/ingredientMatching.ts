import { sanitizeIngredientName } from "@/lib/apiLoader";

const ingredientKeyAliases: Record<string, string> = {
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

const ingredientMatchingAliases: Record<string, string> = {
  ...ingredientKeyAliases,
  egg: "egg",
  eggs: "egg",
};

const ingredientKeyRules: Array<{
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

const ingredientMatchingRules: Array<{
  canonical: string;
  includes: string[];
  excludes?: string[];
}> = [
  ...ingredientKeyRules,
  {
    canonical: "chicken",
    includes: ["chicken"],
    excludes: ["broth", "stock", "sauce"],
  },
  {
    canonical: "tomato",
    includes: ["tomato"],
    excludes: ["sauce", "paste"],
  },
];

const canonicalizeIngredient = (
  value: string,
  aliases: Record<string, string>,
  rules: Array<{ canonical: string; includes: string[]; excludes?: string[] }>
) => {
  const sanitized = sanitizeIngredientName(value);
  if (!sanitized) return "";
  const alias = aliases[sanitized];
  if (alias) return alias;
  for (const rule of rules) {
    const matchesInclude = rule.includes.some((keyword) => sanitized.includes(keyword));
    if (!matchesInclude) continue;
    const hasExcluded = rule.excludes?.some((keyword) => sanitized.includes(keyword));
    if (hasExcluded) continue;
    return rule.canonical;
  }
  return sanitized;
};

export const normalizeForIngredientKey = (value: string) =>
  canonicalizeIngredient(value, ingredientKeyAliases, ingredientKeyRules);

export const normalizeForMatching = (value: string) =>
  canonicalizeIngredient(value, ingredientMatchingAliases, ingredientMatchingRules);

export const normalizeSelectionList = (ingredients: string[]) =>
  Array.from(new Set(ingredients.map(normalizeForMatching).filter(Boolean)));

export const getNormalizedIngredientSet = (ingredients: string[]) =>
  new Set(normalizeSelectionList(ingredients));

export const matchesNormalizedValues = (normalizedValue: string, normalizedSelection: string) => {
  if (!normalizedValue || !normalizedSelection) return false;
  return normalizedValue === normalizedSelection;
};

export const matchesAnySelection = (ingredient: string, normalizedSelections: string[]) => {
  if (!normalizedSelections.length) return false;
  const normalizedIngredient = normalizeForMatching(ingredient);
  if (!normalizedIngredient) return false;
  return normalizedSelections.some((selection) =>
    matchesNormalizedValues(normalizedIngredient, selection)
  );
};
