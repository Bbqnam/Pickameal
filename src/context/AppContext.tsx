import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { Recipe, Filters, CookingTime } from "@/types/recipe";
import { recipes as allRecipes } from "@/data/recipes";

interface AppState {
  selectedIngredients: string[];
  filters: Filters;
  savedRecipeIds: string[];
  toggleIngredient: (name: string) => void;
  setFilters: (filters: Filters) => void;
  toggleSaved: (id: string) => void;
  isSaved: (id: string) => boolean;
  getFilteredRecipes: () => Recipe[];
  getSavedRecipes: () => Recipe[];
  getRandomRecipe: (from: "filtered" | "saved") => Recipe | null;
  getIngredientMatch: (recipe: Recipe) => number;
  clearIngredients: () => void;
  clearFilters: () => void;
}

const defaultFilters: Filters = {
  cuisine: null,
  cookingTime: null,
  difficulty: null,
  mealType: null,
  useMostlyMyIngredients: false,
};

const AppContext = createContext<AppState | undefined>(undefined);

function cookingTimeMax(ct: CookingTime): number {
  if (ct === "Under 15 min") return 15;
  if (ct === "Under 30 min") return 30;
  return 60;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [savedRecipeIds, setSavedRecipeIds] = useState<string[]>([]);

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

  const getIngredientMatch = useCallback((recipe: Recipe) => {
    return recipe.ingredients.filter(i =>
      selectedIngredients.some(si => si.toLowerCase() === i.toLowerCase())
    ).length;
  }, [selectedIngredients]);

  const getFilteredRecipes = useCallback(() => {
    let result = allRecipes;

    if (selectedIngredients.length > 0) {
      result = result.filter(r =>
        r.ingredients.some(i =>
          selectedIngredients.some(si => si.toLowerCase() === i.toLowerCase())
        )
      );
    }

    if (filters.cuisine) {
      result = result.filter(r => r.cuisine === filters.cuisine);
    }
    if (filters.cookingTime) {
      const max = cookingTimeMax(filters.cookingTime);
      result = result.filter(r => r.cookingTime <= max);
    }
    if (filters.difficulty) {
      result = result.filter(r => r.difficulty === filters.difficulty);
    }
    if (filters.mealType) {
      result = result.filter(r => r.mealType === filters.mealType);
    }
    if (filters.useMostlyMyIngredients && selectedIngredients.length > 0) {
      result = result.filter(r => {
        const match = getIngredientMatch(r);
        return match >= r.ingredients.length * 0.5;
      });
    }

    // Sort by ingredient match count
    if (selectedIngredients.length > 0) {
      result.sort((a, b) => getIngredientMatch(b) - getIngredientMatch(a));
    }

    return result;
  }, [selectedIngredients, filters, getIngredientMatch]);

  const getSavedRecipes = useCallback(() => {
    return allRecipes.filter(r => savedRecipeIds.includes(r.id));
  }, [savedRecipeIds]);

  const getRandomRecipe = useCallback((from: "filtered" | "saved"): Recipe | null => {
    const pool = from === "filtered" ? getFilteredRecipes() : getSavedRecipes();
    if (pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }, [getFilteredRecipes, getSavedRecipes]);

  const clearIngredients = useCallback(() => setSelectedIngredients([]), []);
  const clearFilters = useCallback(() => setFilters(defaultFilters), []);

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
    clearIngredients,
    clearFilters,
  }), [selectedIngredients, filters, savedRecipeIds, toggleIngredient, setFilters, toggleSaved, isSaved, getFilteredRecipes, getSavedRecipes, getRandomRecipe, getIngredientMatch, clearIngredients, clearFilters]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
