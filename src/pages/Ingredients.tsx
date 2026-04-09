import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { allIngredients } from "@/data/ingredients";
import { Search, ArrowRight, X, Check, ChevronRight } from "lucide-react";
import { IngredientCategory } from "@/types/recipe";
import { Progress } from "@/components/ui/progress";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";

const categories: IngredientCategory[] = ["Protein", "Vegetables", "Carbs", "Extras"];

const categoryEmoji: Record<IngredientCategory, string> = {
  Protein: "🥩",
  Vegetables: "🥬",
  Carbs: "🍚",
  Extras: "🧂",
};

const categoryDescription: Record<IngredientCategory, string> = {
  Protein: "Chicken, beef, tofu, fish...",
  Vegetables: "Onion, tomato, carrot...",
  Carbs: "Rice, pasta, noodles...",
  Extras: "Cheese, sauces, spices...",
};

const Ingredients = () => {
  const { selectedIngredients, toggleIngredient, clearIngredients } = useApp();
  const [activeCategory, setActiveCategory] = useState<IngredientCategory | null>(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const currentStep = useMemo(() => {
    // Calculate how many categories have at least one selection
    return categories.filter(cat =>
      allIngredients
        .filter(i => i.category === cat)
        .some(i => selectedIngredients.includes(i.name))
    ).length;
  }, [selectedIngredients]);

  const progressValue = (currentStep / categories.length) * 100;

  const filteredIngredients = useMemo(() => {
    if (!activeCategory) return [];
    return allIngredients
      .filter(i => i.category === activeCategory)
      .filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
  }, [activeCategory, search]);

  const getCategorySelectionCount = (cat: IngredientCategory) => {
    return allIngredients
      .filter(i => i.category === cat)
      .filter(i => selectedIngredients.includes(i.name)).length;
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-foreground">Pick Ingredients</h1>
          <span className="text-xs font-medium text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
            {selectedIngredients.length} selected
          </span>
        </div>
        <Progress value={progressValue} className="h-2 bg-secondary" />
        <div className="flex justify-between mt-1.5">
          {categories.map((cat, i) => (
            <span key={cat} className={`text-[10px] font-medium ${i < currentStep ? 'text-primary' : 'text-muted-foreground/50'}`}>
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* Category cards */}
      <div className="px-4 pt-5 space-y-3">
        <p className="text-sm text-muted-foreground mb-1">Tap a category to add ingredients</p>
        {categories.map((cat, i) => {
          const count = getCategorySelectionCount(cat);
          return (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setSearch(""); }}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50 shadow-sm btn-press card-hover text-left animate-fade-in-up opacity-0"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <span className="text-3xl">{categoryEmoji[cat]}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{cat}</h3>
                  {count > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-primary/10 text-primary">
                      {count}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{categoryDescription[cat]}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground/50" />
            </button>
          );
        })}
      </div>

      {/* Selected ingredients preview */}
      {selectedIngredients.length > 0 && (
        <div className="px-4 mt-6 animate-fade-in">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Your picks</p>
          <div className="flex flex-wrap gap-2">
            {selectedIngredients.map(name => (
              <button
                key={name}
                onClick={() => toggleIngredient(name)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium btn-press"
              >
                <Check className="w-3 h-3" />
                {name}
                <X className="w-3 h-3 opacity-50" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom action bar */}
      {selectedIngredients.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 px-4 z-40 animate-slide-up">
          <div className="max-w-lg mx-auto flex gap-2">
            <button
              onClick={clearIngredients}
              className="px-4 py-3 rounded-xl bg-card border border-border text-sm font-medium text-muted-foreground btn-press"
            >
              Clear ({selectedIngredients.length})
            </button>
            <button
              onClick={() => navigate("/filters")}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-sm btn-press"
            >
              Find Recipes
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Category Drawer */}
      <Drawer open={activeCategory !== null} onOpenChange={(open) => !open && setActiveCategory(null)}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="pb-2">
            <DrawerTitle className="flex items-center gap-3 text-xl">
              <span className="text-2xl">{activeCategory ? categoryEmoji[activeCategory] : ''}</span>
              {activeCategory}
            </DrawerTitle>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={`Search ${activeCategory?.toLowerCase()}...`}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </DrawerHeader>

          <div className="px-4 pb-4 overflow-y-auto flex-1">
            <div className="grid grid-cols-2 gap-2 mt-2">
              {filteredIngredients.map((ing, i) => {
                const selected = selectedIngredients.includes(ing.name);
                return (
                  <button
                    key={ing.name}
                    onClick={() => toggleIngredient(ing.name)}
                    className={`relative flex items-center gap-2.5 p-3.5 rounded-xl text-sm font-medium border transition-all duration-200 btn-press ${
                      selected
                        ? "bg-primary/10 text-primary border-primary/30 shadow-sm"
                        : "bg-card text-foreground border-border hover:border-primary/30"
                    }`}
                    style={{ animationDelay: `${i * 0.03}s` }}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      selected ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                    }`}>
                      {selected && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                    {ing.name}
                  </button>
                );
              })}
            </div>
            {filteredIngredients.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">No ingredients found</p>
            )}
          </div>

          <DrawerFooter className="pt-2">
            <button
              onClick={() => setActiveCategory(null)}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm btn-press"
            >
              Done {getCategorySelectionCount(activeCategory!) > 0 && `(${getCategorySelectionCount(activeCategory!)} selected)`}
            </button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default Ingredients;
