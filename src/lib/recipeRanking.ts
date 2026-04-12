import { sanitizeIngredientName } from "@/lib/apiLoader";
import { getIngredients } from "@/data/ingredients";
import {
  getNormalizedIngredientSet,
  normalizeForMatching,
  normalizeSelectionList,
} from "@/lib/ingredientMatching";
import type { IngredientCategory, Recipe } from "@/types/recipe";

interface RankRecipesOptions {
  selectedIngredients: string[];
  preferenceScore?: (recipe: Recipe) => number;
}

interface SelectionContext {
  normalizedSelections: string[];
  selectionSet: Set<string>;
  proteinSelections: string[];
  proteinSet: Set<string>;
  categoryByKey: Map<string, IngredientCategory>;
}

interface RankedRecipeCandidate {
  recipe: Recipe;
  baseScore: number;
  normalizedIngredients: Set<string>;
  titleTokens: Set<string>;
}

const titleStopwords = new Set(["a", "an", "and", "of", "style", "the", "with"]);

const extraIngredientWeights: Record<IngredientCategory, number> = {
  Protein: 2.5,
  Vegetables: 1.2,
  Carbs: 1.35,
  Extras: 0.75,
};

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

const getSelectionContext = (selectedIngredients: string[]): SelectionContext => {
  const normalizedSelections = normalizeSelectionList(selectedIngredients);
  const categoryByKey = ingredientCategoryByKey();
  const proteinSelections = normalizedSelections.filter(
    (selection) => categoryByKey.get(selection) === "Protein"
  );

  return {
    normalizedSelections,
    selectionSet: new Set(normalizedSelections),
    proteinSelections,
    proteinSet: new Set(proteinSelections),
    categoryByKey,
  };
};

const getIngredientCategory = (
  ingredientKey: string,
  categoryByKey: Map<string, IngredientCategory>
): IngredientCategory => {
  return categoryByKey.get(ingredientKey) ?? "Extras";
};

const getRecipeProteinKeys = (
  normalizedIngredients: Set<string>,
  categoryByKey: Map<string, IngredientCategory>
) =>
  Array.from(normalizedIngredients).filter(
    (ingredientKey) => getIngredientCategory(ingredientKey, categoryByKey) === "Protein"
  );

const getTitleTokens = (title: string) =>
  new Set(
    sanitizeIngredientName(title)
      .split("-")
      .filter((token) => token.length > 2 && !titleStopwords.has(token))
  );

const divide = (value: number, total: number) => (total > 0 ? value / total : 0);

const getSetIntersectionSize = <T,>(left: Set<T>, right: Set<T>) => {
  let count = 0;
  left.forEach((value) => {
    if (right.has(value)) {
      count += 1;
    }
  });
  return count;
};

const getJaccardSimilarity = <T,>(left: Set<T>, right: Set<T>) => {
  if (!left.size && !right.size) return 1;
  const intersectionSize = getSetIntersectionSize(left, right);
  const unionSize = left.size + right.size - intersectionSize;
  return divide(intersectionSize, unionSize);
};

const getOverlapAgainstSmallerSet = <T,>(left: Set<T>, right: Set<T>) => {
  const intersectionSize = getSetIntersectionSize(left, right);
  return divide(intersectionSize, Math.min(left.size, right.size));
};

const buildRankedRecipeCandidate = (
  recipe: Recipe,
  context: SelectionContext,
  preferenceScore?: (recipe: Recipe) => number
): RankedRecipeCandidate => {
  const normalizedIngredients = getNormalizedIngredientSet(recipe.ingredients);
  const matchedSelectionCount = context.normalizedSelections.filter((selection) =>
    normalizedIngredients.has(selection)
  ).length;
  const recipeProteins = getRecipeProteinKeys(normalizedIngredients, context.categoryByKey);
  const matchedProteinCount = context.proteinSelections.filter((selection) =>
    normalizedIngredients.has(selection)
  ).length;
  const extraIngredients = Array.from(normalizedIngredients).filter(
    (ingredientKey) => !context.selectionSet.has(ingredientKey)
  );
  const extraProteinCount = recipeProteins.filter(
    (proteinKey) => !context.proteinSet.has(proteinKey)
  ).length;
  const extraIngredientPenalty = extraIngredients.reduce((sum, ingredientKey) => {
    return sum + extraIngredientWeights[getIngredientCategory(ingredientKey, context.categoryByKey)];
  }, 0);
  const selectionCoverage = context.normalizedSelections.length
    ? divide(matchedSelectionCount, context.normalizedSelections.length)
    : 1;
  const overlapRatio = context.normalizedSelections.length
    ? divide(matchedSelectionCount, normalizedIngredients.size)
    : 0;
  const proteinFocus = context.proteinSelections.length
    ? divide(matchedProteinCount, Math.max(recipeProteins.length, 1))
    : 1;
  const preference = preferenceScore?.(recipe) ?? 0;

  const baseScore = context.normalizedSelections.length
    ? selectionCoverage * 38 +
      (matchedSelectionCount === context.normalizedSelections.length ? 18 : 0) +
      matchedProteinCount * 16 +
      proteinFocus * 18 +
      overlapRatio * 26 +
      (extraIngredients.length === 0 ? 8 : 0) -
      extraIngredientPenalty * 4.25 -
      extraIngredients.length * 1.1 -
      extraProteinCount * 8 +
      preference * 0.9
    : preference;

  return {
    recipe,
    baseScore,
    normalizedIngredients,
    titleTokens: getTitleTokens(recipe.title),
  };
};

const getRecipeSimilarity = (left: RankedRecipeCandidate, right: RankedRecipeCandidate) => {
  const ingredientSimilarity = getOverlapAgainstSmallerSet(
    left.normalizedIngredients,
    right.normalizedIngredients
  );
  const titleSimilarity = getJaccardSimilarity(left.titleTokens, right.titleTokens);
  const cuisineBonus = left.recipe.cuisine === right.recipe.cuisine ? 0.05 : 0;
  const mealTypeBonus = left.recipe.mealType === right.recipe.mealType ? 0.03 : 0;

  return Math.min(1, ingredientSimilarity * 0.72 + titleSimilarity * 0.2 + cuisineBonus + mealTypeBonus);
};

const getDuplicatePenalty = (
  candidate: RankedRecipeCandidate,
  rankedRecipes: RankedRecipeCandidate[],
  hasSelections: boolean
) => {
  if (!rankedRecipes.length) return 0;

  const comparisonPool = rankedRecipes.slice(0, 8);
  const strongestSimilarity = comparisonPool.reduce((highest, rankedRecipe) => {
    return Math.max(highest, getRecipeSimilarity(candidate, rankedRecipe));
  }, 0);

  if (strongestSimilarity < 0.58) return 0;

  const penaltyWeight = hasSelections ? 28 : 8;
  return (strongestSimilarity - 0.58) * penaltyWeight;
};

export const rankRecipesForPickaMeal = (
  recipes: Recipe[],
  { selectedIngredients, preferenceScore }: RankRecipesOptions
) => {
  const context = getSelectionContext(selectedIngredients);
  const hasSelections = context.normalizedSelections.length > 0;
  const remaining = recipes
    .map((recipe) => buildRankedRecipeCandidate(recipe, context, preferenceScore))
    .sort(
      (left, right) =>
        right.baseScore - left.baseScore ||
        left.recipe.title.localeCompare(right.recipe.title) ||
        left.recipe.id.localeCompare(right.recipe.id)
    );

  if (remaining.length <= 1) {
    return remaining.map(({ recipe }) => recipe);
  }

  if (!hasSelections) {
    return remaining.map(({ recipe }) => recipe);
  }

  const ranked: RankedRecipeCandidate[] = [];

  while (remaining.length > 0) {
    let bestIndex = 0;
    let bestAdjustedScore = -Infinity;

    remaining.forEach((candidate, index) => {
      const adjustedScore = candidate.baseScore - getDuplicatePenalty(candidate, ranked, hasSelections);

      if (adjustedScore > bestAdjustedScore) {
        bestAdjustedScore = adjustedScore;
        bestIndex = index;
        return;
      }

      if (adjustedScore === bestAdjustedScore) {
        const bestCandidate = remaining[bestIndex];
        const titleComparison = candidate.recipe.title.localeCompare(bestCandidate.recipe.title);
        if (titleComparison < 0 || (titleComparison === 0 && candidate.recipe.id < bestCandidate.recipe.id)) {
          bestIndex = index;
        }
      }
    });

    ranked.push(remaining.splice(bestIndex, 1)[0]);
  }

  return ranked.map(({ recipe }) => recipe);
};
