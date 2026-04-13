import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { ArrowLeft, Heart, Clock, ChefHat, Check, Circle } from "lucide-react";
import { matchesAnySelection, normalizeSelectionList } from "@/lib/ingredientMatching";
import PageShell from "@/components/PageShell";

const RecipeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { recipes, toggleSaved, isSaved, selectedIngredients } = useApp();
  const normalizedSelectedIngredients = useMemo(
    () => normalizeSelectionList(selectedIngredients),
    [selectedIngredients]
  );
  const recipe = recipes.find(r => r.id === id);

  if (recipes.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <span className="text-5xl">🍳</span>
          <p className="text-foreground mt-4 font-medium">Loading recipes...</p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <span className="text-5xl">🤔</span>
          <p className="text-foreground mt-4 font-medium">Recipe not found</p>
          <button onClick={() => navigate("/")} className="mt-3 text-sm text-primary font-medium btn-press">
            Go home
          </button>
        </div>
      </div>
    );
  }

  const saved = isSaved(recipe.id);
  const matchCount = recipe.ingredients.filter((ingredient) =>
    matchesAnySelection(ingredient, normalizedSelectedIngredients)
  ).length;
  const instructionSteps = recipe.instructions.filter((step) => step.trim().length > 0);

  return (
    <PageShell noPadding className="bg-background">
      {/* Hero image */}
      <div className="relative">
        <img src={recipe.image} alt={recipe.title} loading="lazy" className="w-full h-80 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full glass flex items-center justify-center btn-press"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => toggleSaved(recipe.id)}
              className="w-10 h-10 rounded-full glass flex items-center justify-center btn-press"
            >
              <Heart className={`w-5 h-5 transition-all duration-200 ${saved ? "fill-accent text-accent scale-110" : "text-foreground/60"}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-10 relative z-10">
        {/* Title area */}
        <div className="animate-fade-in-up">
          <h1 className="text-2xl font-bold text-foreground">{recipe.title}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-secondary text-secondary-foreground">
              {recipe.cuisine}
            </span>
            <span className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full bg-secondary text-secondary-foreground">
              <Clock className="w-3 h-3" /> {recipe.cookingTime} min
            </span>
            <span className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full bg-secondary text-secondary-foreground">
              <ChefHat className="w-3 h-3" /> {recipe.difficulty}
            </span>
            <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-accent/10 text-accent">
              {recipe.mealType}
            </span>
          </div>
        </div>

        {/* Ingredient match summary */}
        {selectedIngredients.length > 0 && (
          <div className="mt-5 p-3 rounded-xl bg-primary/5 border border-primary/10 animate-fade-in opacity-0 stagger-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground font-medium">Ingredient match</span>
              <span className="text-primary font-bold">{matchCount}/{recipe.ingredients.length}</span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden mt-2">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700"
                style={{ width: `${(matchCount / recipe.ingredients.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Ingredients */}
        <section className="mt-6 animate-fade-in-up opacity-0 stagger-3">
          <h2 className="text-lg font-semibold text-foreground mb-3">Ingredients</h2>
          <div className="bg-card rounded-xl border border-border/50 p-4 space-y-2.5">
            {recipe.ingredients.map(ing => {
              const hasIt = matchesAnySelection(ing, normalizedSelectedIngredients);
              return (
                <div key={ing} className={`flex items-center gap-2.5 py-1 ${hasIt ? '' : ''}`}>
                  {hasIt ? (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground/30 flex-shrink-0" />
                  )}
                  <span className={`text-sm ${hasIt ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                    {ing}
                  </span>
                  {hasIt && (
                    <span className="ml-auto text-[10px] text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full">
                      ✓ Have it
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Instructions */}
        <section className="mt-6 animate-fade-in-up opacity-0 stagger-4">
          <h2 className="text-lg font-semibold text-foreground mb-3">Instructions</h2>
          <div className="space-y-4">
            {instructionSteps.map((step, i) => (
              <div key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="text-sm text-foreground leading-relaxed pt-1.5">{step}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
};

export default RecipeDetail;
