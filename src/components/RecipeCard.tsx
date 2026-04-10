import { Recipe } from "@/types/recipe";
import { useApp } from "@/context/AppContext";
import { Heart, Clock, ChefHat, ArrowRight, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RecipeCardProps {
  recipe: Recipe;
  index?: number;
}

const RecipeCard = ({ recipe, index = 0 }: RecipeCardProps) => {
  const { toggleSaved, isSaved, getIngredientMatch, selectedIngredients } = useApp();
  const navigate = useNavigate();
  const saved = isSaved(recipe.id);
  const matchCount = getIngredientMatch(recipe);
  const matchPercentage = selectedIngredients.length > 0
    ? Math.round((matchCount / recipe.ingredients.length) * 100)
    : 0;
  const isBestMatch = matchPercentage >= 70;

  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm card-hover animate-fade-in-up opacity-0"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div className="relative">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-48 object-cover transition-transform duration-500 hover:scale-105"
          loading="lazy"
        />
        <button
          onClick={(e) => { e.stopPropagation(); toggleSaved(recipe.id); }}
          className="absolute top-3 right-3 w-9 h-9 rounded-full glass flex items-center justify-center btn-press"
        >
          <Heart
            className={`w-5 h-5 transition-all duration-200 ${saved ? "fill-accent text-accent scale-110" : "text-card-foreground/60"}`}
          />
        </button>

        {/* Match badge */}
        {selectedIngredients.length > 0 && isBestMatch && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wide shadow-md animate-scale-in">
            <Star className="w-3 h-3 fill-current" />
            Best match
          </div>
        )}

        {/* Tags overlay */}
        <div className="absolute bottom-3 left-3 flex gap-1.5">
          <span className="px-2.5 py-1 text-xs font-medium rounded-full glass text-foreground">
            {recipe.cuisine}
          </span>
          <span className="px-2.5 py-1 text-xs font-medium rounded-full glass text-foreground">
            {recipe.difficulty}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3
          className="min-h-[3.5rem] text-lg font-semibold leading-tight text-foreground"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {recipe.title}
        </h3>
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

        {/* Match bar */}
        {selectedIngredients.length > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">{matchCount}/{recipe.ingredients.length} ingredients</span>
              <span className={`font-bold ${isBestMatch ? 'text-primary' : 'text-muted-foreground'}`}>{matchPercentage}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${matchPercentage}%` }}
              />
            </div>
          </div>
        )}

        <button
          onClick={() => navigate(`/recipe/${recipe.id}`)}
          className="mt-auto w-full flex items-center justify-center gap-2 rounded-xl bg-primary/10 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground btn-press"
        >
          View Recipe
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default RecipeCard;
