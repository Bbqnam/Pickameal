import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Recipe } from "@/types/recipe";
import { recipes as allRecipes } from "@/data/recipes";
import { Shuffle, ArrowRight, Heart } from "lucide-react";

const RandomPicker = () => {
  const { getRandomRecipe, getFilteredRecipes, getSavedRecipes, toggleSaved, isSaved } = useApp();
  const navigate = useNavigate();
  const [picked, setPicked] = useState<Recipe | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [slotRecipes, setSlotRecipes] = useState<Recipe[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const hasFiltered = getFilteredRecipes().length > 0;
  const hasSaved = getSavedRecipes().length > 0;

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const pickRandom = (from: "filtered" | "saved") => {
    setSpinning(true);
    setPicked(null);
    setSlotRecipes([]);

    // Simulate slot-machine style rapid cycling
    let count = 0;
    const maxCount = 15;
    let speed = 80;

    const cycle = () => {
      const pool = from === "filtered" ? allRecipes : getSavedRecipes();
      const rand = pool[Math.floor(Math.random() * pool.length)];
      setSlotRecipes(prev => [rand, ...prev.slice(0, 2)]);
      count++;

      if (count >= maxCount) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        // Final pick
        const finalPick = getRandomRecipe(from);
        setTimeout(() => {
          setPicked(finalPick);
          setSpinning(false);
        }, 300);
      }
    };

    intervalRef.current = setInterval(cycle, speed);

    // Slow down the interval progressively
    setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(cycle, 150);
    }, 600);

    setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(cycle, 250);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <span className="text-2xl">🎰</span>
          Random Meal
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Let fate decide your next meal</p>
      </div>

      <div className="px-4 pt-8 flex flex-col items-center">
        <div className="w-full max-w-sm space-y-3">
          <button
            onClick={() => pickRandom("filtered")}
            disabled={!hasFiltered || spinning}
            className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl bg-primary text-primary-foreground font-semibold text-base shadow-md disabled:opacity-40 btn-press group"
          >
            <Shuffle className={`w-5 h-5 ${spinning ? 'animate-spin-slow' : 'group-hover:animate-wiggle'}`} />
            Pick from All Recipes
          </button>
          <button
            onClick={() => pickRandom("saved")}
            disabled={!hasSaved || spinning}
            className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl bg-accent text-accent-foreground font-semibold text-base shadow-md disabled:opacity-40 btn-press group"
          >
            <Shuffle className={`w-5 h-5 ${spinning ? 'animate-spin-slow' : 'group-hover:animate-wiggle'}`} />
            Pick from Saved
          </button>
          {!hasSaved && (
            <p className="text-xs text-muted-foreground text-center">Save some recipes first to pick from them</p>
          )}
        </div>

        {/* Spinning slot display */}
        {spinning && (
          <div className="mt-10 w-full max-w-sm">
            <div className="relative overflow-hidden rounded-2xl bg-card border border-border shadow-lg h-48">
              <div className="absolute inset-0 bg-gradient-to-b from-card via-transparent to-card z-10" />
              <div className="flex flex-col items-center justify-center h-full gap-2">
                {slotRecipes.slice(0, 3).map((r, i) => (
                  <div
                    key={`${r.id}-${i}`}
                    className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-150 ${
                      i === 0 ? 'opacity-100 scale-105 bg-primary/5' : i === 1 ? 'opacity-40 scale-95' : 'opacity-20 scale-90'
                    }`}
                  >
                    <img src={r.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    <span className="font-medium text-foreground text-sm truncate">{r.title}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center mt-4">
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse-soft" />
                Picking your meal...
              </div>
            </div>
          </div>
        )}

        {/* Result card */}
        {picked && !spinning && (
          <div className="mt-8 w-full max-w-sm animate-bounce-in">
            <div className="relative bg-card rounded-2xl overflow-hidden shadow-xl border border-border/50">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
              <img src={picked.image} alt={picked.title} className="w-full h-52 object-cover" />
              <button
                onClick={() => toggleSaved(picked.id)}
                className="absolute top-3 right-3 w-10 h-10 rounded-full glass flex items-center justify-center btn-press"
              >
                <Heart className={`w-5 h-5 ${isSaved(picked.id) ? "fill-accent text-accent" : "text-card-foreground/60"}`} />
              </button>
              <div className="p-5 text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider mb-2">
                  <span>🎉</span> Your meal is
                </div>
                <h2 className="text-xl font-bold text-foreground">{picked.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {picked.cuisine} · {picked.cookingTime} min · {picked.difficulty}
                </p>
                <button
                  onClick={() => navigate(`/recipe/${picked.id}`)}
                  className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold btn-press"
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
