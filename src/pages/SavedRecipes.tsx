import { useApp } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import { Heart, ArrowRight, Trash2 } from "lucide-react";

const SavedRecipes = () => {
  const { getSavedRecipes, toggleSaved } = useApp();
  const navigate = useNavigate();
  const saved = getSavedRecipes();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Heart className="w-6 h-6 text-accent" />
          Saved Recipes
        </h1>
      </div>

      {saved.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <Heart className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <p className="text-lg font-medium text-foreground">No saved recipes yet</p>
          <p className="text-sm text-muted-foreground mt-1">Save recipes you love to find them quickly</p>
          <button
            onClick={() => navigate("/ingredients")}
            className="mt-4 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
          >
            Discover Recipes
          </button>
        </div>
      ) : (
        <div className="px-4 pt-4 space-y-3">
          {saved.map(recipe => (
            <div
              key={recipe.id}
              className="flex items-center gap-3 bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm"
            >
              <img
                src={recipe.image}
                alt={recipe.title}
                className="w-24 h-24 object-cover flex-shrink-0"
              />
              <div className="flex-1 py-3 pr-2">
                <h3 className="font-semibold text-foreground text-sm">{recipe.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {recipe.cuisine} · {recipe.cookingTime} min
                </p>
                <button
                  onClick={() => navigate(`/recipe/${recipe.id}`)}
                  className="mt-2 flex items-center gap-1 text-xs font-medium text-primary"
                >
                  View <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <button
                onClick={() => toggleSaved(recipe.id)}
                className="p-3 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedRecipes;
