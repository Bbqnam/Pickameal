import { Recipe } from "@/types/recipe";
import { useApp } from "@/context/AppContext";
import { Heart, Clock, ChefHat, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard = ({ recipe }: RecipeCardProps) => {
  const { toggleSaved, isSaved, getIngredientMatch, selectedIngredients } = useApp();
  const navigate = useNavigate();
  const saved = isSaved(recipe.id);
  const matchCount = getIngredientMatch(recipe);

  return (
    <div className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border/50 transition-shadow hover:shadow-md">
      <div className="relative">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-48 object-cover"
          loading="lazy"
        />
        <button
          onClick={() => toggleSaved(recipe.id)}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center transition-colors"
        >
          <Heart
            className={`w-5 h-5 ${saved ? "fill-accent text-accent" : "text-foreground/60"}`}
          />
        </button>
        <div className="absolute bottom-3 left-3 flex gap-1.5">
          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-card/80 backdrop-blur-sm text-foreground">
            {recipe.cuisine}
          </span>
          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-card/80 backdrop-blur-sm text-foreground">
            {recipe.difficulty}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-foreground text-lg leading-tight">{recipe.title}</h3>
        <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {recipe.cookingTime} min
          </span>
          <span className="flex items-center gap-1">
            <ChefHat className="w-3.5 h-3.5" />
            {recipe.mealType}
          </span>
        </div>
        {selectedIngredients.length > 0 && (
          <p className="text-xs text-primary font-medium mt-2">
            {matchCount} of {recipe.ingredients.length} ingredients matched
          </p>
        )}
        <button
          onClick={() => navigate(`/recipe/${recipe.id}`)}
          className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium transition-colors hover:opacity-90"
        >
          View Recipe
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default RecipeCard;
