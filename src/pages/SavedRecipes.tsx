import { useApp } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import { Heart, ArrowRight, Trash2 } from "lucide-react";
import PageShell from "@/components/PageShell";

const SavedRecipes = () => {
  const { getSavedRecipes, toggleSaved } = useApp();
  const navigate = useNavigate();
  const saved = getSavedRecipes();

  return (
    <PageShell noPadding className="bg-background">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <span className="text-2xl">❤️</span>
          Saved Recipes
        </h1>
        {saved.length > 0 && (
          <p className="text-sm text-muted-foreground mt-1">{saved.length} recipe{saved.length > 1 ? 's' : ''} saved</p>
        )}
      </div>

      {saved.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-in">
          <span className="text-5xl mb-4">💭</span>
          <p className="text-lg font-medium text-foreground">No saved recipes yet</p>
          <p className="text-sm text-muted-foreground mt-1">Save recipes you love to find them quickly</p>
          <button
            onClick={() => navigate("/ingredients")}
            className="mt-4 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium btn-press"
          >
            Discover Recipes
          </button>
        </div>
      ) : (
        <div className="px-4 pt-4 space-y-3">
          {saved.map((recipe, i) => (
            <div
              key={recipe.id}
              className="flex items-center gap-3 bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm card-hover animate-fade-in-up opacity-0"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <img
                src={recipe.image}
                alt={recipe.title}
                loading="lazy"
                className="w-24 h-24 object-cover rounded-2xl flex-shrink-0"
              />
              <div className="flex-1 py-3 pr-2 min-w-0">
                <h3 className="font-semibold text-foreground text-sm truncate">{recipe.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {recipe.cuisine} · {recipe.cookingTime} min
                </p>
                <button
                  onClick={() => navigate(`/recipe/${recipe.id}`)}
                  className="mt-2 flex items-center gap-1 text-xs font-medium text-primary btn-press"
                >
                  View <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <button
                onClick={() => toggleSaved(recipe.id)}
                className="p-3 text-muted-foreground hover:text-destructive transition-colors btn-press"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
};

export default SavedRecipes;
