import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import RecipeCard from "@/components/RecipeCard";
import { Shuffle, ArrowLeft, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import PageShell from "@/components/PageShell";

const RECIPES_PER_PAGE = 12;

const Results = () => {
  const { getFilteredRecipes } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recipes = getFilteredRecipes();
  const deferredSearch = useDeferredValue(search);

  const filteredRecipes = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    if (!query) return recipes;

    return recipes.filter((recipe) => {
      const haystack = [
        recipe.title,
        recipe.cuisine,
        recipe.mealType,
        recipe.difficulty,
        ...recipe.ingredients,
        ...recipe.tags,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [recipes, deferredSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredRecipes.length / RECIPES_PER_PAGE));
  const currentPageRecipes = useMemo(() => {
    const start = (currentPage - 1) * RECIPES_PER_PAGE;
    return filteredRecipes.slice(start, start + RECIPES_PER_PAGE);
  }, [currentPage, filteredRecipes]);
  const showingFrom = filteredRecipes.length === 0 ? 0 : (currentPage - 1) * RECIPES_PER_PAGE + 1;
  const showingTo = Math.min(currentPage * RECIPES_PER_PAGE, filteredRecipes.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [deferredSearch, recipes.length]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleRandom = () => {
    const recipe = filteredRecipes[Math.floor(Math.random() * filteredRecipes.length)];
    if (recipe) navigate(`/recipe/${recipe.id}`);
  };

  return (
    <PageShell noPadding className="bg-background">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(-1)} className="text-muted-foreground btn-press">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Recipes</h1>
          <span className="ml-auto text-sm text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
            {filteredRecipes.length} found
          </span>
        </div>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search recipes..."
            className="w-full rounded-xl border border-border bg-secondary py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground btn-press"
              aria-label="Clear recipe search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {filteredRecipes.length > 0 && (
          <button
            onClick={handleRandom}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-accent text-accent-foreground font-semibold text-sm shadow-sm btn-press group"
          >
            <Shuffle className="w-4 h-4 group-hover:animate-wiggle" />
            Random Pick
          </button>
        )}
      </div>

      {filteredRecipes.length > 0 && (
        <div className="px-4 pt-4">
          <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {showingFrom}-{showingTo} of {filteredRecipes.length}
            </span>
            {totalPages > 1 && (
              <span>
                Page {currentPage} of {totalPages}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="px-4 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {currentPageRecipes.map((recipe, i) => (
          <RecipeCard key={recipe.id} recipe={recipe} index={i} />
        ))}
      </div>

      {filteredRecipes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-in">
          <span className="text-5xl mb-4">{search ? "🔎" : "🍽️"}</span>
          <p className="text-lg font-medium text-foreground">
            {search ? "No recipes match that search" : "No recipes found"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {search ? "Try a different recipe name or keyword." : "Try adjusting your ingredients or filters"}
          </p>
          {search ? (
            <button
              onClick={() => setSearch("")}
              className="mt-4 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium btn-press"
            >
              Clear Search
            </button>
          ) : (
            <button
              onClick={() => navigate("/ingredients")}
              className="mt-4 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium btn-press"
            >
              Back to Ingredients
            </button>
          )}
        </div>
      )}

      {totalPages > 1 && filteredRecipes.length > 0 && (
        <div className="px-4 pt-6">
          <div className="mx-auto flex max-w-md items-center justify-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3 shadow-sm">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm font-medium text-foreground transition disabled:cursor-not-allowed disabled:opacity-40 btn-press"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>
            <span className="min-w-[6.5rem] text-center text-sm font-semibold text-foreground">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm font-medium text-foreground transition disabled:cursor-not-allowed disabled:opacity-40 btn-press"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default Results;
