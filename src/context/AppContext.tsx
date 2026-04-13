import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { Recipe, Filters, Cuisine, MealType, Difficulty } from "@/types/recipe";
import { TasteProfile, PreferenceHighlights, CookingTimeBucket } from "@/types/preferences";
import { getRecipes, refreshRecipes } from "@/data/recipes";
import { matchesAnySelection, normalizeSelectionList } from "@/lib/ingredientMatching";
import {
  applyRecipeFilters,
  filterRecipesBySelectedIngredients,
  matchesMostlySelectedIngredients,
} from "@/lib/recipeFiltering";
import { rankRecipesForPickaMeal } from "@/lib/recipeRanking";
import ErrorBanner from "@/components/ErrorBanner";

interface AppState {
  selectedIngredients: string[];
  filters: Filters;
  savedRecipeIds: string[];
  recipes: Recipe[];
  tasteProfile: TasteProfile;
  preferenceHighlights: PreferenceHighlights;
  hasCompletedOnboarding: boolean;
  errorMessage: string | null;
  reportError: (error: unknown) => void;
  clearError: () => void;
  toggleIngredient: (name: string) => void;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  toggleSaved: (id: string) => void;
  isSaved: (id: string) => boolean;
  getFilteredRecipes: () => Recipe[];
  getSavedRecipes: () => Recipe[];
  getRandomRecipe: (from: "filtered" | "saved") => Recipe | null;
  getIngredientMatch: (recipe: Recipe) => number;
  scoreRecipe: (recipe: Recipe) => number;
  recordTasteDecision: (recipe: Recipe, outcome: PreferenceDecision) => void;
  clearIngredients: () => void;
  clearFilters: () => void;
  clearTasteProfile: () => void;
  completeOnboarding: () => void;
}

const defaultFilters: Filters = {
  cuisine: null,
  cookingTime: null,
  difficulty: null,
  mealType: null,
  useMostlyMyIngredients: false,
};

const PROFILE_STORAGE_KEY = "pickameal-taste-profile";
const ONBOARDING_STORAGE_KEY = "pickameal-onboarding-complete";

const defaultTasteProfile: TasteProfile = {
  cuisines: { Asian: 0, Vietnamese: 0, Korean: 0, Chinese: 0, Thai: 0, Japanese: 0, Western: 0, Mexican: 0, Italian: 0, "Middle Eastern": 0, Mediterranean: 0 },
  mealTypes: { Breakfast: 0, Lunch: 0, Dinner: 0, Snack: 0 },
  difficulties: { Easy: 0, Medium: 0, Hard: 0 },
  cookingTimes: {
    Quick: 0,
    Balanced: 0,
    Slow: 0,
  },
  ingredients: {},
  tags: {},
};

const categorizeCookingTime = (minutes: number): CookingTimeBucket => {
  if (minutes <= 25) return "Quick";
  if (minutes <= 45) return "Balanced";
  return "Slow";
};

const applyTaggedDelta = <T extends string>(map: Record<T, number>, key: T, delta: number) => {
  const next = { ...map };
  const current = next[key] ?? 0;
  const updated = current + delta;
  if (Math.abs(updated) < 0.01) {
    delete next[key];
  } else {
    next[key] = updated;
  }
  return next;
};

const applyTextDelta = (map: Record<string, number>, text: string, delta: number) => {
  const key = text.trim().toLowerCase();
  if (!key) return map;
  const next = { ...map };
  const current = next[key] ?? 0;
  const updated = current + delta;
  if (Math.abs(updated) < 0.01) {
    delete next[key];
  } else {
    next[key] = updated;
  }
  return next;
};

const mergeHighlightEntries = (map: Record<string, number>, direction: "positive" | "negative", limit = 3) => {
  const entries = Object.entries(map)
    .filter(([, value]) => (direction === "positive" ? value > 0 : value < 0))
    .sort((a, b) => (direction === "positive" ? b[1] - a[1] : a[1] - b[1]))
    .slice(0, limit)
    .map(([key]) => key);
  return entries;
};

const humanizeWord = (word: string) => word.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

const buildProfileFrom = (source?: Partial<TasteProfile>): TasteProfile => ({
  cuisines: { ...defaultTasteProfile.cuisines, ...(source?.cuisines ?? {}) },
  mealTypes: { ...defaultTasteProfile.mealTypes, ...(source?.mealTypes ?? {}) },
  difficulties: { ...defaultTasteProfile.difficulties, ...(source?.difficulties ?? {}) },
  cookingTimes: { ...defaultTasteProfile.cookingTimes, ...(source?.cookingTimes ?? {}) },
  ingredients: { ...defaultTasteProfile.ingredients, ...(source?.ingredients ?? {}) },
  tags: { ...defaultTasteProfile.tags, ...(source?.tags ?? {}) },
});

const loadTasteProfile = (): TasteProfile => {
  if (typeof window === "undefined") return defaultTasteProfile;
  const stored = window.localStorage.getItem(PROFILE_STORAGE_KEY);
  if (!stored) return defaultTasteProfile;
  try {
    const parsed = JSON.parse(stored) as Partial<TasteProfile>;
    return buildProfileFrom(parsed);
  } catch {
    return defaultTasteProfile;
  }
};

const loadOnboardingFlag = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(ONBOARDING_STORAGE_KEY) === "true";
};

const saveTasteProfile = (profile: TasteProfile) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
};

const saveOnboardingFlag = (value: boolean) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ONBOARDING_STORAGE_KEY, value ? "true" : "false");
};

const preferenceWeights = {
  like: 1,
  skip: -0.2,
  dislike: -0.75,
} as const;

export type PreferenceDecision = keyof typeof preferenceWeights;

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recipes, setRecipes] = useState<Recipe[]>(getRecipes());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const reportError = useCallback((error: unknown) => {
    console.error("App error:", error);
    const formatted =
      typeof error === "string"
        ? error
        : error instanceof Error
        ? error.message
        : "An unexpected error occurred. Please try again soon.";
    setErrorMessage(formatted);
  }, []);
  const clearError = useCallback(() => setErrorMessage(null), []);
  useEffect(() => {
    let mounted = true;
    refreshRecipes()
      .then((data) => {
        if (mounted) {
          setRecipes(data);
        }
      })
      .catch(reportError);
    return () => {
      mounted = false;
    };
  }, [reportError]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [savedRecipeIds, setSavedRecipeIds] = useState<string[]>([]);
  const [tasteProfile, setTasteProfile] = useState<TasteProfile>(() => loadTasteProfile());
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => loadOnboardingFlag());

  const toggleIngredient = useCallback((name: string) => {
    setSelectedIngredients(prev =>
      prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]
    );
  }, []);

  const toggleSaved = useCallback((id: string) => {
    setSavedRecipeIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  const isSaved = useCallback((id: string) => savedRecipeIds.includes(id), [savedRecipeIds]);

  const normalizedSelectedIngredients = useMemo(
    () => normalizeSelectionList(selectedIngredients),
    [selectedIngredients]
  );

  const getIngredientMatch = useCallback((recipe: Recipe) => {
    if (!normalizedSelectedIngredients.length) return 0;
    return recipe.ingredients.filter((ingredient) =>
      matchesAnySelection(ingredient, normalizedSelectedIngredients)
    ).length;
  }, [normalizedSelectedIngredients]);

  const scoreRecipe = useCallback((recipe: Recipe) => {
    const cuisineWeight = tasteProfile.cuisines[recipe.cuisine] ?? 0;
    const mealWeight = tasteProfile.mealTypes[recipe.mealType] ?? 0;
    const difficultyWeight = tasteProfile.difficulties[recipe.difficulty] ?? 0;
    const timeWeight = tasteProfile.cookingTimes[categorizeCookingTime(recipe.cookingTime)] ?? 0;
    const ingredientScore = recipe.ingredients.reduce((sum, ingredient) => {
      const key = ingredient.trim().toLowerCase();
      return sum + (tasteProfile.ingredients[key] ?? 0);
    }, 0);
    const tagScore = recipe.tags.reduce((sum, tag) => {
      const key = tag.trim().toLowerCase();
      return sum + (tasteProfile.tags[key] ?? 0);
    }, 0);
    return cuisineWeight * 1.5 + mealWeight * 1.2 + difficultyWeight * 1.1 + timeWeight * 0.9 + ingredientScore * 0.35 + tagScore * 0.3;
  }, [tasteProfile]);

  const recordTasteDecision = useCallback((recipe: Recipe, outcome: PreferenceDecision) => {
    const delta = preferenceWeights[outcome];
    setTasteProfile((prev) => {
      const nextCuisines = applyTaggedDelta(prev.cuisines, recipe.cuisine, delta);
      const nextMealTypes = applyTaggedDelta(prev.mealTypes, recipe.mealType, delta);
      const nextDifficulties = applyTaggedDelta(prev.difficulties, recipe.difficulty, delta);
      const nextCookingTimes = applyTaggedDelta(prev.cookingTimes, categorizeCookingTime(recipe.cookingTime), delta);
      const nextIngredients = recipe.ingredients.reduce<Record<string, number>>(
        (acc, ingredient) => applyTextDelta(acc, ingredient, delta),
        prev.ingredients
      );
      const nextTags = recipe.tags.reduce<Record<string, number>>(
        (acc, tag) => applyTextDelta(acc, tag, delta),
        prev.tags
      );
      return {
        cuisines: nextCuisines,
        mealTypes: nextMealTypes,
        difficulties: nextDifficulties,
        cookingTimes: nextCookingTimes,
        ingredients: nextIngredients,
        tags: nextTags,
      };
    });
  }, []);

  const preferenceHighlights = useMemo<PreferenceHighlights>(() => ({
    likedCuisines: mergeHighlightEntries(tasteProfile.cuisines, "positive") as Cuisine[],
    dislikedCuisines: mergeHighlightEntries(tasteProfile.cuisines, "negative") as Cuisine[],
    likedIngredients: mergeHighlightEntries(tasteProfile.ingredients, "positive", 4).map(humanizeWord),
    dislikedIngredients: mergeHighlightEntries(tasteProfile.ingredients, "negative", 4).map(humanizeWord),
    likedMealTypes: mergeHighlightEntries(tasteProfile.mealTypes, "positive") as MealType[],
    dislikedMealTypes: mergeHighlightEntries(tasteProfile.mealTypes, "negative") as MealType[],
    likedDifficulties: mergeHighlightEntries(tasteProfile.difficulties, "positive") as Difficulty[],
    dislikedDifficulties: mergeHighlightEntries(tasteProfile.difficulties, "negative") as Difficulty[],
    favoriteTags: mergeHighlightEntries(tasteProfile.tags, "positive", 4).map(humanizeWord),
    avoidedTags: mergeHighlightEntries(tasteProfile.tags, "negative", 4).map(humanizeWord),
  }), [tasteProfile]);

  const getFilteredRecipes = useCallback(() => {
    const sourceRecipes = recipes.length ? recipes : getRecipes();
    let result = filterRecipesBySelectedIngredients(sourceRecipes, selectedIngredients);
    result = applyRecipeFilters(result, filters);

    if (filters.useMostlyMyIngredients && selectedIngredients.length > 0) {
      result = result.filter((recipe) => matchesMostlySelectedIngredients(recipe, selectedIngredients));
    }

    return rankRecipesForPickaMeal(result, {
      selectedIngredients,
      preferenceScore: scoreRecipe,
    });
  }, [selectedIngredients, filters, recipes, scoreRecipe]);

  const getSavedRecipes = useCallback(() => {
    const source = recipes.length ? recipes : getRecipes();
    return source.filter(r => savedRecipeIds.includes(r.id));
  }, [recipes, savedRecipeIds]);

  const getRandomRecipe = useCallback((from: "filtered" | "saved"): Recipe | null => {
    const pool = from === "filtered" ? getFilteredRecipes() : getSavedRecipes();
    if (pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }, [getFilteredRecipes, getSavedRecipes]);

  const clearIngredients = useCallback(() => setSelectedIngredients([]), []);
  const clearFilters = useCallback(() => setFilters(defaultFilters), []);
  const clearTasteProfile = useCallback(() => setTasteProfile(defaultTasteProfile), []);

  useEffect(() => {
    saveTasteProfile(tasteProfile);
  }, [tasteProfile]);

  useEffect(() => {
    saveOnboardingFlag(hasCompletedOnboarding);
  }, [hasCompletedOnboarding]);

  const completeOnboarding = useCallback(() => setHasCompletedOnboarding(true), []);

  const value = useMemo(() => ({
    selectedIngredients,
    filters,
    savedRecipeIds,
    toggleIngredient,
    setFilters,
    toggleSaved,
    isSaved,
    getFilteredRecipes,
    getSavedRecipes,
    getRandomRecipe,
    getIngredientMatch,
    scoreRecipe,
    recordTasteDecision,
    tasteProfile,
    preferenceHighlights,
    hasCompletedOnboarding,
    completeOnboarding,
    clearIngredients,
    clearFilters,
    clearTasteProfile,
    errorMessage,
    reportError,
    clearError,
    recipes,
  }), [selectedIngredients, filters, savedRecipeIds, toggleIngredient, setFilters, toggleSaved, isSaved, getFilteredRecipes, getSavedRecipes, getRandomRecipe, getIngredientMatch, scoreRecipe, recordTasteDecision, tasteProfile, preferenceHighlights, hasCompletedOnboarding, completeOnboarding, clearIngredients, clearFilters, clearTasteProfile, errorMessage, reportError, clearError, recipes]);

  return (
    <AppContext.Provider value={value}>
      <ErrorBanner message={errorMessage} onClose={clearError} />
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
