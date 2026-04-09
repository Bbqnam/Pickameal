import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Recipe } from "@/types/recipe";
import { Shuffle, ArrowRight, Utensils } from "lucide-react";

const RandomPicker = () => {
  const { getRandomRecipe, getFilteredRecipes, getSavedRecipes } = useApp();
  const navigate = useNavigate();
  const [picked, setPicked] = useState<Recipe | null>(null);
  const [spinning, setSpinning] = useState(false);

  const hasFiltered = getFilteredRecipes().length > 0;
  const hasSaved = getSavedRecipes().length > 0;

  const pickRandom = (from: "filtered" | "saved") => {
    setSpinning(true);
    setPicked(null);
    setTimeout(() => {
      const recipe = getRandomRecipe(from);
      setPicked(recipe);
      setSpinning(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Shuffle className="w-6 h-6 text-accent" />
          Random Meal
        </h1>
      </div>

      <div className="px-4 pt-8 flex flex-col items-center">
        <div className="w-full max-w-sm space-y-3">
          <button
            onClick={() => pickRandom("filtered")}
            disabled={!hasFiltered || spinning}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-base shadow-sm disabled:opacity-40 transition-opacity"
          >
            <Shuffle className="w-5 h-5" />
            Pick from All Recipes
          </button>
          <button
            onClick={() => pickRandom("saved")}
            disabled={!hasSaved || spinning}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-accent text-accent-foreground font-semibold text-base shadow-sm disabled:opacity-40 transition-opacity"
          >
            <Shuffle className="w-5 h-5" />
            Pick from Saved
          </button>
          {!hasSaved && (
            <p className="text-xs text-muted-foreground text-center">Save some recipes first to pick from them</p>
          )}
        </div>

        {spinning && (
          <div className="mt-12 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
              <Utensils className="w-8 h-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground mt-3">Picking your meal...</p>
          </div>
        )}

        {picked && !spinning && (
          <div className="mt-8 w-full max-w-sm">
            <div className="bg-card rounded-2xl overflow-hidden shadow-md border border-border/50">
              <img src={picked.image} alt={picked.title} className="w-full h-52 object-cover" />
              <div className="p-5 text-center">
                <p className="text-xs text-accent font-semibold uppercase tracking-wider mb-1">Your meal is</p>
                <h2 className="text-xl font-bold text-foreground">{picked.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {picked.cuisine} · {picked.cookingTime} min · {picked.difficulty}
                </p>
                <button
                  onClick={() => navigate(`/recipe/${picked.id}`)}
                  className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
                >
                  View Recipe <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RandomPicker;
