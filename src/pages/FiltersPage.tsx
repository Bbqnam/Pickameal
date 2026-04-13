import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Cuisine, CookingTime, Difficulty, MealType, Filters } from "@/types/recipe";
import { ArrowRight, RotateCcw } from "lucide-react";
import RecipeProgressBar from "@/components/RecipeProgressBar";
import PageShell from "@/components/PageShell";

const cuisines: Cuisine[] = [
  "Vietnamese",
  "Korean",
  "Chinese",
  "Thai",
  "Japanese",
  "Asian",
  "Western",
  "Mexican",
  "Italian",
  "Middle Eastern",
  "Mediterranean",
];
const times: CookingTime[] = ["Under 15 min", "Under 30 min", "Under 60 min"];
const difficulties: Difficulty[] = ["Easy", "Medium", "Hard"];
const mealTypes: MealType[] = ["Breakfast", "Lunch", "Dinner", "Snack"];

const cuisineEmoji: Record<string, string> = {
  Vietnamese: "🍲",
  Korean: "🔥",
  Chinese: "🥢",
  Thai: "🍛",
  Japanese: "🍙",
  Asian: "🍜",
  Western: "🥩",
  Mexican: "🌮",
  Italian: "🍝",
  "Middle Eastern": "🧆",
  Mediterranean: "🫒",
};
const diffEmoji: Record<string, string> = { Easy: "😊", Medium: "👨‍🍳", Hard: "🔥" };
const mealEmoji: Record<string, string> = { Breakfast: "🌅", Lunch: "☀️", Dinner: "🌙", Snack: "🍿" };

const FilterChip = ({
  label,
  active,
  onClick,
  emoji,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  emoji?: string;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium border transition-all duration-200 btn-press ${
      active
        ? "bg-primary text-primary-foreground border-primary shadow-sm scale-105"
        : "bg-card text-foreground border-border hover:border-primary/40 hover:bg-primary/5"
    }`}
  >
    {emoji && <span>{emoji}</span>}
    {label}
  </button>
);

const FiltersPage = () => {
  const { filters, setFilters, clearFilters, selectedIngredients, recipes, getFilteredRecipes } = useApp();
  const filteredCount = useMemo(() => getFilteredRecipes().length, [getFilteredRecipes]);
  const totalCount = recipes.length || filteredCount || 1;
  const filteredPercent = totalCount > 0 ? (filteredCount / totalCount) * 100 : 0;
  const navigate = useNavigate();

  const update = <K extends keyof Filters>(key: K, value: Exclude<Filters[K], null>) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key] === value ? null : value,
    }));
  };

  return (
    <PageShell noPadding className="bg-background">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Filters</h1>
          <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-muted-foreground btn-press hover:text-foreground transition-colors">
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
        <div className="mt-3">
          <div className="rounded-[28px] border border-border bg-card/80 px-4 py-3 shadow-sm">
            <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
              <span>Matching recipes</span>
              <span className="text-foreground">{filteredCount}/{totalCount}</span>
            </div>
            <div className="mt-2">
              <RecipeProgressBar percent={filteredPercent} />
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-5 space-y-7">
        <section className="animate-fade-in-up opacity-0 stagger-1">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Cuisine</h2>
          <div className="flex flex-wrap gap-2">
            {cuisines.map(c => (
              <FilterChip key={c} label={c} emoji={cuisineEmoji[c]} active={filters.cuisine === c} onClick={() => update("cuisine", c)} />
            ))}
          </div>
        </section>

        <section className="animate-fade-in-up opacity-0 stagger-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Cooking Time</h2>
          <div className="flex flex-wrap gap-2">
            {times.map(t => (
              <FilterChip key={t} label={t} emoji="⏱️" active={filters.cookingTime === t} onClick={() => update("cookingTime", t)} />
            ))}
          </div>
        </section>

        <section className="animate-fade-in-up opacity-0 stagger-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Difficulty</h2>
          <div className="flex flex-wrap gap-2">
            {difficulties.map(d => (
              <FilterChip key={d} label={d} emoji={diffEmoji[d]} active={filters.difficulty === d} onClick={() => update("difficulty", d)} />
            ))}
          </div>
        </section>

        <section className="animate-fade-in-up opacity-0 stagger-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Meal Type</h2>
          <div className="flex flex-wrap gap-2">
            {mealTypes.map(m => (
              <FilterChip key={m} label={m} emoji={mealEmoji[m]} active={filters.mealType === m} onClick={() => update("mealType", m)} />
            ))}
          </div>
        </section>

        {selectedIngredients.length > 0 && (
          <section className="animate-fade-in-up opacity-0 stagger-5">
            <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl bg-card border border-border/50 btn-press">
              <div
                onClick={() => setFilters({ ...filters, useMostlyMyIngredients: !filters.useMostlyMyIngredients })}
                className={`w-12 h-7 rounded-full transition-colors relative flex-shrink-0 ${
                  filters.useMostlyMyIngredients ? "bg-primary" : "bg-muted"
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-card shadow transition-transform ${
                    filters.useMostlyMyIngredients ? "translate-x-5" : ""
                  }`}
                />
              </div>
              <div>
                <span className="text-sm font-medium text-foreground">Use mostly my ingredients</span>
                <p className="text-xs text-muted-foreground mt-0.5">Show recipes matching 50%+ of your picks</p>
              </div>
            </label>
          </section>
        )}
      </div>

      <div className="fixed bottom-20 left-0 right-0 px-4 z-40 animate-slide-up">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => navigate("/results")}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-md btn-press"
          >
            Show Recipes
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </PageShell>
  );
};

export default FiltersPage;
