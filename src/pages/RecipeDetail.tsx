import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { recipes } from "@/data/recipes";
import { ArrowLeft, Heart, Clock, ChefHat, Check, Circle } from "lucide-react";

const RecipeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toggleSaved, isSaved, selectedIngredients } = useApp();
  const recipe = recipes.find(r => r.id === id);

  if (!recipe) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Recipe not found</p>
      </div>
    );
  }

  const saved = isSaved(recipe.id);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="relative">
        <img src={recipe.image} alt={recipe.title} className="w-full h-72 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <button
          onClick={() => toggleSaved(recipe.id)}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center"
        >
          <Heart className={`w-5 h-5 ${saved ? "fill-accent text-accent" : "text-foreground/60"}`} />
        </button>
      </div>

      <div className="px-4 -mt-8 relative z-10">
        <h1 className="text-2xl font-bold text-foreground">{recipe.title}</h1>
        <div className="flex flex-wrap items-center gap-3 mt-3">
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-secondary text-secondary-foreground">
            {recipe.cuisine}
          </span>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="w-3.5 h-3.5" /> {recipe.cookingTime} min
          </span>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <ChefHat className="w-3.5 h-3.5" /> {recipe.difficulty}
          </span>
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-secondary text-secondary-foreground">
            {recipe.mealType}
          </span>
        </div>

        <section className="mt-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">Ingredients</h2>
          <ul className="space-y-2">
            {recipe.ingredients.map(ing => {
              const hasIt = selectedIngredients.some(
                si => si.toLowerCase() === ing.toLowerCase()
              );
              return (
                <li key={ing} className="flex items-center gap-2.5">
                  {hasIt ? (
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                  )}
                  <span className={`text-sm ${hasIt ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                    {ing}
                  </span>
                  {hasIt && (
                    <span className="text-[10px] text-primary font-medium bg-primary/10 px-1.5 py-0.5 rounded-full">
                      You have this
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mt-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">Instructions</h2>
          <ol className="space-y-4">
            {recipe.instructions.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="text-sm text-foreground leading-relaxed pt-1">{step}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
};

export default RecipeDetail;
