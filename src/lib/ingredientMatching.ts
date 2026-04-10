import { sanitizeIngredientName } from "@/lib/apiLoader";

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

const canonicalizeIngredient = (value: string) => {
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

export const normalizeForMatching = (value: string) => canonicalizeIngredient(value);

export const normalizeSelectionList = (ingredients: string[]) =>
  ingredients.map(normalizeForMatching).filter(Boolean);

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
