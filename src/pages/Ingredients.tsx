import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { getIngredients } from "@/data/ingredients";
import { getRecipes } from "@/data/recipes";
import { fallbackIngredientImage } from "@/lib/apiLoader";
import { matchesAnySelection, normalizeSelectionList } from "@/lib/ingredientMatching";
import { Search, ArrowRight, X, Check, ChevronRight, ArrowUpDown } from "lucide-react";
import { Ingredient, IngredientCategory } from "@/types/recipe";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import RecipeProgressBar from "@/components/RecipeProgressBar";

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

const placeholderAccents: Record<IngredientCategory, string> = {
  Protein: "from-rose-100 via-orange-50 to-amber-100",
  Vegetables: "from-emerald-100 via-lime-50 to-teal-100",
  Carbs: "from-yellow-100 via-orange-50 to-amber-100",
  Extras: "from-slate-100 via-zinc-50 to-stone-100",
};

type IngredientSortMode = "popular" | "alphabetical";

const ingredientSortMeta: Record<IngredientSortMode, { label: string; button: string }> = {
  popular: { label: "Most recipes", button: "Popular" },
  alphabetical: { label: "A-Z", button: "A-Z" },
};

const getIngredientPlaceholderEmoji = (name: string, category: IngredientCategory) => {
  const normalized = name.toLowerCase();
  if (normalized.includes("chicken")) return "🍗";
  if (normalized.includes("beef") || normalized.includes("steak")) return "🥩";
  if (normalized.includes("pork") || normalized.includes("bacon") || normalized.includes("sausage")) return "🥓";
  if (normalized.includes("salmon") || normalized.includes("tuna") || normalized.includes("fish")) return "🐟";
  if (normalized.includes("shrimp")) return "🦐";
  if (normalized.includes("mussel")) return "🦪";
  if (normalized.includes("egg")) return "🥚";
  if (normalized.includes("tofu")) return "🧊";
  if (normalized.includes("lentil") || normalized.includes("bean") || normalized.includes("chickpea")) return "🫘";
  if (normalized.includes("mushroom")) return "🍄";
  if (normalized.includes("tomato")) return "🍅";
  if (normalized.includes("pepper") || normalized.includes("chili")) return "🌶️";
  if (normalized.includes("carrot")) return "🥕";
  if (normalized.includes("broccoli")) return "🥦";
  if (normalized.includes("onion")) return "🧅";
  if (normalized.includes("garlic")) return "🧄";
  if (normalized.includes("rice") || normalized.includes("noodle") || normalized.includes("pasta")) return "🍜";
  if (normalized.includes("potato")) return "🥔";
  if (normalized.includes("bread") || normalized.includes("baguette")) return "🥖";
  if (normalized.includes("cheese")) return "🧀";
  if (normalized.includes("butter")) return "🧈";
  if (normalized.includes("lemon")) return "🍋";
  if (normalized.includes("herb") || normalized.includes("basil") || normalized.includes("mint")) return "🌿";
  return categoryEmoji[category];
};

const Ingredients = () => {
  const { selectedIngredients, toggleIngredient, clearIngredients, getFilteredRecipes, recipes } = useApp();
  const ingredientList = getIngredients();
  const [activeCategory, setActiveCategory] = useState<IngredientCategory | null>(null);
  const [search, setSearch] = useState("");
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [sortMode, setSortMode] = useState<IngredientSortMode>("popular");
  const navigate = useNavigate();
  const sourceRecipes = useMemo(() => (recipes.length ? recipes : getRecipes()), [recipes]);

  const ingredientRecipeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    ingredientList.forEach((ingredient) => {
      const normalizedSelections = normalizeSelectionList([ingredient.name]);
      counts[ingredient.name] = sourceRecipes.filter((recipe) =>
        recipe.ingredients.some((name) => matchesAnySelection(name, normalizedSelections))
      ).length;
    });
    return counts;
  }, [ingredientList, sourceRecipes, sourceRecipes.length]);

  const totalRecipes = sourceRecipes.length;
  const matchedRecipeCount = useMemo(() => {
    if (totalRecipes === 0) return 0;
    return selectedIngredients.length === 0 ? totalRecipes : getFilteredRecipes().length;
  }, [totalRecipes, selectedIngredients.length, getFilteredRecipes]);
  const matchPercent = totalRecipes > 0 ? (matchedRecipeCount / totalRecipes) * 100 : 0;

  const enrichedIngredients = useMemo(() => ingredientList, [ingredientList]);

  const filteredIngredients = useMemo(() => {
    const filtered = !activeCategory
      ? enrichedIngredients
      : enrichedIngredients
      .filter((ing) => ing.category === activeCategory)
      .filter((ing) => ing.name.toLowerCase().includes(search.toLowerCase()));

    return [...filtered].sort((left, right) => {
      if (sortMode === "popular") {
        const recipeDelta = (ingredientRecipeCounts[right.name] ?? 0) - (ingredientRecipeCounts[left.name] ?? 0);
        if (recipeDelta !== 0) return recipeDelta;
      }
      return left.name.localeCompare(right.name);
    });
  }, [activeCategory, search, enrichedIngredients, sortMode, ingredientRecipeCounts]);

  const getCategorySelectionCount = (cat: IngredientCategory) =>
    enrichedIngredients.filter((ing) => ing.category === cat && selectedIngredients.includes(ing.name)).length;

  return (
    <div className="min-h-screen bg-background pb-48">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Pick Ingredients</h1>
          <span className="text-xs font-semibold text-foreground bg-secondary/60 px-3 py-1 rounded-full shadow-sm">
            {selectedIngredients.length} selected
          </span>
        </div>
        <div className="mt-4">
          <div className="rounded-[28px] border border-border bg-card/80 px-4 py-3 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-foreground">
              <span className="uppercase tracking-[0.35em] text-[11px] text-muted-foreground">Recipes unlocked</span>
              <span className="text-[14px]">{matchedRecipeCount} / {totalRecipes || matchedRecipeCount}</span>
            </div>
            <div className="mt-2">
              <RecipeProgressBar percent={matchPercent} />
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-5 space-y-3">
        <p className="text-sm text-muted-foreground mb-1">Choose a category to explore ingredients</p>
        {categories.map((cat, i) => {
          const count = getCategorySelectionCount(cat);
          return (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setSearch("");
              }}
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

      {selectedIngredients.length > 0 && (
        <div className="px-4 mt-6 mb-16 animate-fade-in">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Your picks</p>
          <div className="flex flex-wrap gap-2">
            {selectedIngredients.map((name) => (
              <button
                key={name}
                onClick={() => toggleIngredient(name)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-2xl border border-emerald-200 bg-emerald-50/70 text-emerald-700 text-xs font-semibold shadow-[0_10px_30px_-22px_rgba(16,185,129,0.9)] btn-press"
              >
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                {name}
                <X className="w-3 h-3 text-emerald-600/70" />
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedIngredients.length > 0 && (
        <div className="fixed bottom-24 left-0 right-0 px-4 z-40 animate-slide-up">
            <div className="max-w-lg mx-auto flex gap-2">
              <button
                onClick={clearIngredients}
                className="px-4 py-3 rounded-xl bg-card border border-border text-sm font-medium text-muted-foreground btn-press"
              >
                Clear ({selectedIngredients.length})
              </button>
              <button
                onClick={() => {
                  setActiveCategory(null);
                  setSearch("");
                  navigate("/filters");
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-sm btn-press"
              >
                Find Recipes
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
        </div>
      )}

      <Drawer open={activeCategory !== null} onOpenChange={(open) => !open && setActiveCategory(null)}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="pb-2">
            <DrawerTitle className="flex items-center gap-3 text-xl">
              <span className="text-2xl">{activeCategory ? categoryEmoji[activeCategory] : ""}</span>
              {activeCategory}
            </DrawerTitle>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={`Search ${activeCategory?.toLowerCase()}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs font-medium text-muted-foreground">
                Sorted by {ingredientSortMeta[sortMode].label}
              </p>
              <button
                type="button"
                onClick={() => setSortMode((prev) => (prev === "popular" ? "alphabetical" : "popular"))}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm btn-press"
              >
                <ArrowUpDown className="h-3.5 w-3.5" />
                {ingredientSortMeta[sortMode].button}
              </button>
            </div>
          </DrawerHeader>

          <div className="px-4 pb-4 overflow-y-auto flex-1">
            <div className="grid grid-cols-2 gap-3 mt-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {filteredIngredients.map((ing, i) => {
                const selected = selectedIngredients.includes(ing.name);
                const recipeCount = ingredientRecipeCounts[ing.name] ?? 0;
                const fallbackImage = fallbackIngredientImage;
                const imageUrl = ing.image ?? fallbackImage;
                const secondaryImage = ing.secondaryImage && ing.secondaryImage !== imageUrl ? ing.secondaryImage : undefined;
                const imageKey = ing.name.trim().toLowerCase();
                const showPlaceholder = !imageUrl || failedImages[imageKey];
                const placeholderEmoji = getIngredientPlaceholderEmoji(ing.name, ing.category);
                return (
                <button
                  key={ing.name}
                  onClick={() => toggleIngredient(ing.name)}
                  aria-pressed={selected}
                  className={`relative overflow-hidden rounded-[26px] border px-0 text-left bg-card transition-all duration-200 btn-press focus-visible:ring-2 focus-visible:ring-primary/40 aspect-[4/3] sm:aspect-[3/2] ${
                    selected
                      ? "border-emerald-200 shadow-[0_20px_60px_-30px_rgba(16,185,129,0.85)] ring-2 ring-emerald-400/70 bg-gradient-to-br from-emerald-50/80 to-emerald-200/60 scale-[1.005]"
                      : "border-border shadow-md hover:-translate-y-0.5 hover:shadow-lg"
                  }`}
                  style={{ animationDelay: `${i * 0.03}s` }}
                >
                  <div className="absolute inset-0">
                    {!showPlaceholder && (
                        <img
                          src={imageUrl}
                          alt={`${ing.name} ingredient`}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          style={{ objectPosition: "center" }}
                          onError={(event) => {
                            const target = event.currentTarget;
                            const stage = target.dataset.retryStage;
                            const applyFallback = () => {
                              if (fallbackImage) {
                                target.src = fallbackImage;
                                return;
                              }
                              setFailedImages((prev) => (prev[imageKey] ? prev : { ...prev, [imageKey]: true }));
                            };
                            if (stage === "secondary") {
                              applyFallback();
                              return;
                            }
                            if (secondaryImage && stage !== "secondary") {
                              target.dataset.retryStage = "secondary";
                              target.src = secondaryImage;
                              return;
                            }
                            if (stage !== "fallback") {
                              target.dataset.retryStage = "fallback";
                              applyFallback();
                            }
                          }}
                        />
                    )}
                    {showPlaceholder && (
                      <div className={`absolute inset-0 bg-gradient-to-br ${placeholderAccents[ing.category]}`}>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),transparent_42%)]" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/70 text-5xl shadow-[0_18px_40px_-24px_rgba(15,23,42,0.45)] backdrop-blur-sm">
                            <span aria-hidden="true">{placeholderEmoji}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/65 via-black/25 to-transparent" />
                    {selected && (
                      <>
                        <div className="absolute inset-0 bg-emerald-500/20 mix-blend-screen" />
                        <span className="absolute right-3 top-3 rounded-full bg-emerald-500/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white flex items-center gap-1 shadow-lg shadow-emerald-900/25">
                          <Check className="w-3 h-3" />
                          Selected
                        </span>
                      </>
                    )}
                  </div>
                  <div className="relative z-10 flex h-full flex-col justify-between p-3 text-white">
                    <div className="flex items-start justify-between gap-2">
                      <span className="rounded-full bg-black/45 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.32em] text-white shadow-sm backdrop-blur-sm">
                        {recipeCount} recipes
                      </span>
                    </div>
                    <div className="mt-2">
                      <h4 className="text-lg font-semibold leading-tight drop-shadow-sm">{ing.name}</h4>
                    </div>
                  </div>
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
