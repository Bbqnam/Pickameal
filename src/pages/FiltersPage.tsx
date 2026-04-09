import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Cuisine, CookingTime, Difficulty, MealType } from "@/types/recipe";
import { ArrowRight, RotateCcw } from "lucide-react";

const cuisines: Cuisine[] = ["Asian", "Western", "Mexican", "Italian", "Middle Eastern"];
const times: CookingTime[] = ["Under 15 min", "Under 30 min", "Under 60 min"];
const difficulties: Difficulty[] = ["Easy", "Medium", "Hard"];
const mealTypes: MealType[] = ["Breakfast", "Lunch", "Dinner", "Snack"];

const FilterChip = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
      active
        ? "bg-primary text-primary-foreground border-primary"
        : "bg-card text-foreground border-border hover:border-primary/40"
    }`}
  >
    {label}
  </button>
);

const FiltersPage = () => {
  const { filters, setFilters, clearFilters, selectedIngredients } = useApp();
  const navigate = useNavigate();

  const update = (key: string, value: any) => {
    setFilters({
      ...filters,
      [key]: filters[key as keyof typeof filters] === value ? null : value,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 pt-6 pb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Filters</h1>
        <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-muted-foreground">
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      <div className="px-4 pt-4 space-y-6">
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Cuisine</h2>
          <div className="flex flex-wrap gap-2">
            {cuisines.map(c => (
              <FilterChip key={c} label={c} active={filters.cuisine === c} onClick={() => update("cuisine", c)} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Cooking Time</h2>
          <div className="flex flex-wrap gap-2">
            {times.map(t => (
              <FilterChip key={t} label={t} active={filters.cookingTime === t} onClick={() => update("cookingTime", t)} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Difficulty</h2>
          <div className="flex flex-wrap gap-2">
            {difficulties.map(d => (
              <FilterChip key={d} label={d} active={filters.difficulty === d} onClick={() => update("difficulty", d)} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Meal Type</h2>
          <div className="flex flex-wrap gap-2">
            {mealTypes.map(m => (
              <FilterChip key={m} label={m} active={filters.mealType === m} onClick={() => update("mealType", m)} />
            ))}
          </div>
        </section>

        {selectedIngredients.length > 0 && (
          <section>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setFilters({ ...filters, useMostlyMyIngredients: !filters.useMostlyMyIngredients })}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  filters.useMostlyMyIngredients ? "bg-primary" : "bg-muted"
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-card shadow transition-transform ${
                    filters.useMostlyMyIngredients ? "translate-x-5" : ""
                  }`}
                />
              </div>
              <span className="text-sm font-medium text-foreground">Use mostly my ingredients</span>
            </label>
          </section>
        )}
      </div>

      <div className="fixed bottom-20 left-0 right-0 px-4 z-40">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => navigate("/results")}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-sm"
          >
            Show Recipes
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FiltersPage;
