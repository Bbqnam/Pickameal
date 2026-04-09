import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Dice3, Sparkles, Repeat, Heart, Compass, Flame, Clock, Gauge, XCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { Cuisine, Difficulty, Recipe } from "@/types/recipe";

const cuisineOptions: Cuisine[] = ["Asian", "Western", "Mexican", "Italian", "Middle Eastern", "Mediterranean"];
const proteinOptions = ["Chicken", "Beef", "Pork", "Salmon", "Shrimp", "Tofu", "Lentil", "Mushroom", "Egg"];
const difficultyOptions: Difficulty[] = ["Easy", "Medium", "Hard"];
const timeOptions = [
  { label: "Under 15 min", value: 15 },
  { label: "Under 30 min", value: 30 },
  { label: "Under 45 min", value: 45 },
  { label: "Under 60 min", value: 60 },
];
const moodOptions = ["Comfort", "Fresh", "Spicy", "Bright", "Cozy", "Herbal"];

const humanize = (value: string) => value.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
const cuisineIcons: Record<Cuisine, string> = {
  Asian: "🍜",
  Western: "🍽",
  Mexican: "🌮",
  Italian: "🍝",
  "Middle Eastern": "🫓",
  Mediterranean: "🫒",
};
const proteinIcons: Record<string, string> = {
  Chicken: "🍗",
  Beef: "🥩",
  Pork: "🥓",
  Salmon: "🐟",
  Shrimp: "🦐",
  Tofu: "🧊",
  Lentil: "🫘",
  Mushroom: "🍄",
  Egg: "🥚",
};

const proteinKeywords: Record<string, RegExp[]> = {
  Chicken: [/\bchicken\b/i],
  Beef: [/\bbeef\b/i],
  Pork: [/\bpork\b/i],
  Salmon: [/\bsalmon\b/i],
  Shrimp: [/\bshrimp\b/i],
  Tofu: [/\btofu\b/i],
  Lentil: [/\blentil\b/i],
  Mushroom: [/\bmushroom\b/i],
  Egg: [/\begg\b/i],
};
const moodIcons: Record<string, string> = {
  Comfort: "🛋",
  Fresh: "🥬",
  Spicy: "🌶",
  Bright: "🍋",
  Cozy: "🫶",
  Herbal: "🌿",
};
const getFilterCardClassName = (active: boolean, compact = false) =>
  [
    "rounded-[20px] border text-left transition-all duration-200 btn-press",
    compact ? "px-2.5 py-2 min-w-[78px]" : "px-2.5 py-2 min-w-[88px]",
    active
      ? "border-primary/70 bg-gradient-to-br from-primary/18 via-primary/10 to-accent/10 text-foreground shadow-[0_14px_30px_-20px_rgba(34,197,94,0.8)]"
      : "border-border/60 bg-white/55 text-foreground hover:border-primary/30 hover:bg-white/80",
  ].join(" ");

const difficultyAccent: Record<Difficulty, string> = {
  Easy: "bg-emerald-500",
  Medium: "bg-amber-400",
  Hard: "bg-rose-500",
};

const RollaMeal = () => {
  const {
    recipes,
    scoreRecipe,
    toggleSaved,
    isSaved,
  } = useApp();
  const navigate = useNavigate();

  const [selectedCuisine, setSelectedCuisine] = useState<Cuisine | "">("");
  const [selectedProtein, setSelectedProtein] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | "">("");
  const [maxTime, setMaxTime] = useState<number | null>(null);
  const [selectedMood, setSelectedMood] = useState("");
  const [rolling, setRolling] = useState(false);
  const [slotRecipes, setSlotRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const slotTimer = useRef<NodeJS.Timeout | null>(null);

  const filteredPool = useMemo(() => {
    if (!recipes.length) return [];
    return recipes.filter((recipe) => {
      if (selectedCuisine && recipe.cuisine !== selectedCuisine) return false;
      if (selectedDifficulty && recipe.difficulty !== selectedDifficulty) return false;
      if (maxTime && recipe.cookingTime > maxTime) return false;
      if (selectedProtein) {
        const matchers = proteinKeywords[selectedProtein] ?? [new RegExp(`\\b${selectedProtein}\\b`, "i")];
        if (!recipe.ingredients.some((ingredient) => matchers.some((matcher) => matcher.test(ingredient)))) return false;
      }
      if (selectedMood) {
        const moodNeedle = selectedMood.toLowerCase();
        if (!recipe.tags.some((tag) => tag.toLowerCase().includes(moodNeedle))) return false;
      }
      return true;
    });
  }, [recipes, selectedCuisine, selectedDifficulty, maxTime, selectedProtein, selectedMood]);

  const computeWeight = useCallback(
    (recipe: Recipe) => Math.max(scoreRecipe(recipe) + 2.2, 0.5),
    [scoreRecipe],
  );

  const pickWeightedRecipe = useCallback(
    (pool: Recipe[]) => {
      const weights = pool.map(computeWeight);
      const total = weights.reduce((sum, weight) => sum + weight, 0);
      let roll = Math.random() * total;
      for (let i = 0; i < pool.length; i += 1) {
        roll -= weights[i];
        if (roll <= 0) return pool[i];
      }
      return pool[pool.length - 1];
    },
    [computeWeight],
  );

  const rollMeal = useCallback(() => {
    if (rolling) return;
    if (!filteredPool.length) {
      setErrorMessage("No recipes match these preferences—try easing a filter or removing an exclusion.");
      return;
    }
    setErrorMessage(null);
    setRolling(true);
    setSelectedRecipe(null);
    setSlotRecipes([]);
    let spins = 0;
    if (slotTimer.current) {
      clearInterval(slotTimer.current);
      slotTimer.current = null;
    }
    slotTimer.current = setInterval(() => {
      const random = filteredPool[Math.floor(Math.random() * filteredPool.length)];
      setSlotRecipes((prev) => [random, ...prev].slice(0, 3));
      spins += 1;
      if (spins >= 20) {
        if (slotTimer.current) {
          clearInterval(slotTimer.current);
          slotTimer.current = null;
        }
        setTimeout(() => {
          const winner = pickWeightedRecipe(filteredPool);
          setSelectedRecipe(winner);
          setRolling(false);
        }, 400);
      }
    }, 80);
  }, [filteredPool, pickWeightedRecipe, rolling]);

  useEffect(() => {
    return () => {
      if (slotTimer.current) {
        clearInterval(slotTimer.current);
      }
    };
  }, []);

  const slotPreview = slotRecipes.slice(0, 3);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Dice3 className="w-5 h-5 text-primary" />
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">RollaMeal</p>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              Surprise with style
            </h1>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-primary">
          <Sparkles className="w-4 h-4" />
          Personalized · Playful · Premium
        </div>
      </div>

      <div className="px-4 pt-3 space-y-3">
        <div className="rounded-[26px] border border-border/70 bg-gradient-to-br from-primary/10 to-accent/5 p-2.5">
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2 rounded-[20px] border border-border/50 bg-white/35 p-2.5">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                <Compass className="w-3.5 h-3.5" />
                Cuisine
              </div>
              <div className="mt-2 grid grid-cols-3 gap-1.5">
                {cuisineOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => setSelectedCuisine((prev) => (prev === option ? "" : option))}
                    className={getFilterCardClassName(selectedCuisine === option, true)}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-2xl bg-white/80 text-sm shadow-sm">
                        {cuisineIcons[option]}
                      </span>
                      <span className="text-[12px] font-semibold leading-tight">{option}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="col-span-2 rounded-[20px] border border-border/50 bg-white/35 p-2.5">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                <Flame className="w-3.5 h-3.5" />
                Protein
              </div>
              <div className="mt-2 grid grid-cols-3 gap-1.5">
                {proteinOptions.map((protein) => (
                  <button
                    key={protein}
                    onClick={() => setSelectedProtein((prev) => (prev === protein ? "" : protein))}
                    className={getFilterCardClassName(selectedProtein === protein, true)}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-2xl bg-white/80 text-sm shadow-sm">
                        <span aria-hidden="true">{proteinIcons[protein]}</span>
                      </span>
                      <span className="text-[12px] font-semibold leading-tight">{protein}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[20px] border border-border/50 bg-white/35 p-2.5">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                Time
              </div>
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                {timeOptions.map((option) => (
                  <button
                    key={option.label}
                    onClick={() => setMaxTime((prev) => (prev === option.value ? null : option.value))}
                    className={getFilterCardClassName(maxTime === option.value, true)}
                  >
                    <span className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-2xl bg-white/80 shadow-sm">
                        <Clock className="w-3 h-3" />
                      </span>
                      <span className="text-[13px] font-semibold">{option.value}m</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[20px] border border-border/50 bg-white/35 p-2.5">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                <Gauge className="w-3.5 h-3.5" />
                Difficulty
              </div>
              <div className="mt-2 grid grid-cols-3 gap-1.5">
                {difficultyOptions.map((option) => {
                  const active = selectedDifficulty === option;
                  return (
                    <button
                      type="button"
                      key={option}
                      onClick={() => setSelectedDifficulty((prev) => (prev === option ? "" : option))}
                      aria-label={option}
                      className={`rounded-[18px] border px-2 py-2 transition-all duration-200 btn-press ${
                        active
                          ? "border-primary/70 bg-gradient-to-br from-primary/18 via-primary/10 to-accent/10 shadow-[0_14px_30px_-20px_rgba(34,197,94,0.8)]"
                          : "border-border/60 bg-white/55 hover:border-primary/30 hover:bg-white/80"
                      }`}
                    >
                      <div className="flex h-full items-end justify-center gap-1 pt-3">
                        {[0, 1, 2].map((bar) => (
                          <span
                            key={`${option}-${bar}`}
                            className={`w-2 rounded-full ${
                              bar <= difficultyOptions.indexOf(option)
                                ? `${difficultyAccent[option]} ${active ? "" : "opacity-45"}`
                                : "bg-border"
                            }`}
                            style={{ height: `${8 + bar * 5}px` }}
                          />
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="col-span-2 rounded-[20px] border border-border/50 bg-white/35 p-2.5">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                <Sparkles className="w-3.5 h-3.5" />
                Mood
              </div>
              <div className="mt-2 grid grid-cols-3 gap-1.5">
                {moodOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => setSelectedMood((prev) => (prev === option ? "" : option))}
                    className={getFilterCardClassName(selectedMood === option, true)}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-[14px]">{moodIcons[option]}</span>
                      <span className="text-[12px] font-semibold">{option}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-xs text-red-700 flex items-center gap-2">
              <XCircle className="w-4 h-4" />
            {errorMessage}
          </div>
        )}

        <button
          onClick={rollMeal}
          disabled={rolling}
          className="w-full rounded-3xl bg-gradient-to-r from-primary to-accent px-5 py-4 text-sm font-bold uppercase tracking-[0.3em] text-primary-foreground shadow-lg transition hover:shadow-2xl disabled:opacity-60 btn-press flex items-center justify-center gap-3"
        >
          <Dice3 className="w-5 h-5" />
          {rolling ? "Rolling..." : "Roll a meal"}
        </button>
        <p className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
          <Sparkles className="w-4 h-4 text-primary" />
          {filteredPool.length} matches
        </p>

        {rolling && (
          <div className="mt-4 space-y-2">
            <div className="rounded-[28px] border border-border/60 bg-card p-3">
              <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Rolling bar</p>
              <div className="mt-2 space-y-2">
                {slotPreview.map((recipe, index) => (
                  <div key={`${recipe.id}-${index}`} className={`flex items-center gap-3 rounded-2xl bg-background/40 px-3 py-2 ${index === 0 ? "border border-primary/60" : ""}`}>
                    <img src={recipe.image} alt={recipe.title} className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{recipe.title}</p>
                      <p className="text-[11px] text-muted-foreground">{recipe.cuisine} · {recipe.difficulty}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedRecipe && (
          <div className="mt-6 w-full space-y-4">
            <div className="relative overflow-hidden rounded-[32px] border border-border/60 bg-card shadow-xl">
              <img src={selectedRecipe.image} alt={selectedRecipe.title} className="h-64 w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
              <div className="relative p-5 space-y-3">
                <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  <span className="rounded-full border border-border px-3 py-1">{selectedRecipe.cuisine}</span>
                  <span className="rounded-full border border-border px-3 py-1">{selectedRecipe.difficulty}</span>
                  <span className="rounded-full border border-border px-3 py-1">{selectedRecipe.cookingTime} min</span>
                </div>
                <h2 className="text-2xl font-bold text-foreground">{selectedRecipe.title}</h2>
                <div className="flex flex-wrap gap-2 text-xs">
                  {selectedRecipe.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-primary/10 px-3 py-1 font-semibold tracking-[0.2em] text-primary">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate(`/recipe/${selectedRecipe.id}`)}
                    className="flex-1 rounded-2xl bg-primary px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-primary-foreground btn-press"
                  >
                    Cook this
                  </button>
                  <button
                    onClick={() => toggleSaved(selectedRecipe.id)}
                    className="flex-1 rounded-2xl border border-border/70 px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-foreground btn-press"
                  >
                    <Heart className={`w-4 h-4 ${isSaved(selectedRecipe.id) ? "text-accent" : ""}`} />
                    {isSaved(selectedRecipe.id) ? "Saved" : "Save"}
                  </button>
                  <button
                    onClick={rollMeal}
                    className="flex-1 rounded-2xl border border-primary/80 px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-primary btn-press"
                  >
                    <Repeat className="w-4 h-4" />
                    Roll again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RollaMeal;
