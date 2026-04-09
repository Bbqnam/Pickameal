import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { allIngredients } from "@/data/ingredients";
import IngredientChip from "@/components/IngredientChip";
import { Search, ArrowRight, X } from "lucide-react";
import { IngredientCategory } from "@/types/recipe";

const categories: IngredientCategory[] = ["Protein", "Vegetables", "Carbs", "Extras"];

const Ingredients = () => {
  const { selectedIngredients, toggleIngredient, clearIngredients } = useApp();
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filtered = allIngredients.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-foreground mb-4">Pick Your Ingredients</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search ingredients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      <div className="px-4 pt-4">
        {categories.map(category => {
          const items = filtered.filter(i => i.category === category);
          if (items.length === 0) return null;
          return (
            <div key={category} className="mb-6">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {category}
              </h2>
              <div className="flex flex-wrap gap-2">
                {items.map(ing => (
                  <IngredientChip
                    key={ing.name}
                    name={ing.name}
                    selected={selectedIngredients.includes(ing.name)}
                    onToggle={() => toggleIngredient(ing.name)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selectedIngredients.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 px-4 z-40">
          <div className="max-w-lg mx-auto flex gap-2">
            <button
              onClick={clearIngredients}
              className="px-4 py-3 rounded-xl bg-card border border-border text-sm font-medium text-muted-foreground"
            >
              Clear ({selectedIngredients.length})
            </button>
            <button
              onClick={() => navigate("/filters")}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-sm"
            >
              Find Recipes
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ingredients;
