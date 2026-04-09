import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import RecipeCard from "@/components/RecipeCard";
import { Shuffle, ArrowLeft, Sparkles } from "lucide-react";

const Results = () => {
  const { getFilteredRecipes, getRandomRecipe } = useApp();
  const navigate = useNavigate();
  const recipes = getFilteredRecipes();

  const handleRandom = () => {
    const recipe = getRandomRecipe("filtered");
    if (recipe) navigate(`/recipe/${recipe.id}`);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(-1)} className="text-muted-foreground btn-press">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Recipes</h1>
          <span className="ml-auto text-sm text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
            {recipes.length} found
          </span>
        </div>
        {recipes.length > 0 && (
          <button
            onClick={handleRandom}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-accent text-accent-foreground font-semibold text-sm shadow-sm btn-press group"
          >
            <Shuffle className="w-4 h-4 group-hover:animate-wiggle" />
            Random Pick
          </button>
        )}
      </div>

      <div className="px-4 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {recipes.map((recipe, i) => (
          <RecipeCard key={recipe.id} recipe={recipe} index={i} />
        ))}
      </div>

      {recipes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-in">
          <span className="text-5xl mb-4">🍽️</span>
          <p className="text-lg font-medium text-foreground">No recipes found</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your ingredients or filters</p>
          <button
            onClick={() => navigate("/ingredients")}
            className="mt-4 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium btn-press"
          >
            Back to Ingredients
          </button>
        </div>
      )}
    </div>
  );
};

export default Results;
