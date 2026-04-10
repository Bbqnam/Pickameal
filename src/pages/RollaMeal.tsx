import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Dice3, Sparkles, Repeat, Heart, Compass, Flame, Clock, Gauge, XCircle, X, ChefHat } from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { Cuisine, Difficulty, Recipe } from "@/types/recipe";
import RecipeProgressBar from "@/components/RecipeProgressBar";

const cuisineOptions: Cuisine[] = [
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
const proteinOptions = ["Chicken", "Beef", "Pork", "Salmon", "Shrimp", "Tofu", "Lentil", "Mushroom", "Egg"];
const difficultyOptions: Difficulty[] = ["Easy", "Medium", "Hard"];
const styleOptions = ["Quick meal", "Healthy", "Comfort food"] as const;
const spiceLevelOptions = ["Mild", "Medium", "Spicy"] as const;
const timeOptions = [
  { label: "Under 30 min", value: 30 },
  { label: "Under 60 min", value: 60 },
];

const humanize = (value: string) => value.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
const cuisineIcons: Record<Cuisine, string> = {
  Vietnamese: "🍲",
  Korean: "🔥",
  Chinese: "🥢",
  Thai: "🍛",
  Japanese: "🍙",
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
const styleIcons: Record<(typeof styleOptions)[number], string> = {
  "Quick meal": "⚡",
  Healthy: "🌿",
  "Comfort food": "🛋️",
};
const spiceLevelIcons: Record<(typeof spiceLevelOptions)[number], string> = {
  Mild: "🍃",
  Medium: "🌶️",
  Spicy: "🔥",
};
const SLOT_COUNT = 5;
const SLOT_CENTER_INDEX = Math.floor(SLOT_COUNT / 2);
const HOLD_TO_ROLL_DELAY_MS = 220;
const TAP_ROLL_DURATION_MS = 1500;
const LIVE_SPIN_INTERVAL_MS = 100;
const RELEASE_SLOWDOWN_MIN_STEPS = 5;
const RELEASE_SLOWDOWN_MAX_STEPS = 10;
const RELEASE_SLOWDOWN_BASE_DELAY_MS = 100;
const RELEASE_SLOWDOWN_STEP_DELAY_MS = 45;
const RELEASE_FINAL_HOLD_MS = 900;
const hiddenScrollbarClassName = "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";
const cappedFilterGridClassName = `mt-2 grid h-[88px] grid-cols-3 gap-1.5 overflow-y-auto pr-1 ${hiddenScrollbarClassName}`;
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

const pickRandomRecipe = (pool: Recipe[], excludeIds: Array<Recipe["id"]> = []) => {
  const candidates = pool.filter((recipe) => !excludeIds.includes(recipe.id));
  const source = candidates.length ? candidates : pool;
  return source[Math.floor(Math.random() * source.length)];
};

const cookingTimeToMax = (value: "Under 15 min" | "Under 30 min" | "Under 60 min" | null) => {
  if (value === "Under 15 min") return 30;
  if (value === "Under 30 min") return 30;
  if (value === "Under 60 min") return 60;
  return null;
};

const recipeMatchesStyle = (recipe: Recipe, style: (typeof styleOptions)[number]) => {
  const tags = recipe.tags.map((tag) => tag.toLowerCase());
  const ingredients = recipe.ingredients.map((ingredient) => ingredient.toLowerCase());

  if (style === "Quick meal") {
    return recipe.cookingTime <= 30 || tags.some((tag) => ["quick", "fast", "weeknight"].includes(tag));
  }

  if (style === "Healthy") {
    const healthyTags = ["light", "fresh", "vegetarian", "plant-based", "seafood", "herbs"];
    const richIngredients = ["bacon", "cream", "butter", "cheese", "sausage"];
    return (
      tags.some((tag) => healthyTags.includes(tag)) ||
      (ingredients.some((ingredient) => ["cucumber", "lettuce", "spinach", "bean sprouts", "tomato", "broccoli"].some((needle) => ingredient.includes(needle))) &&
        !ingredients.some((ingredient) => richIngredients.some((needle) => ingredient.includes(needle))))
    );
  }

  return (
    tags.some((tag) => ["comfort", "hearty", "baked", "curry", "soup", "one-pan", "skillet"].includes(tag)) ||
    recipe.cookingTime > 40
  );
};

const getRecipeSpiceLevel = (recipe: Recipe) => {
  const tags = recipe.tags.map((tag) => tag.toLowerCase());
  const ingredients = recipe.ingredients.map((ingredient) => ingredient.toLowerCase());

  if (
    tags.includes("spicy") ||
    ingredients.some((ingredient) =>
      ["chili", "chilli", "chili flakes", "curry paste"].some((needle) => ingredient.includes(needle))
    )
  ) {
    return "Spicy" as const;
  }

  if (
    ingredients.some((ingredient) =>
      ["paprika", "smoked paprika", "curry powder", "ginger", "mustard"].some((needle) => ingredient.includes(needle))
    )
  ) {
    return "Medium" as const;
  }

  return "Mild" as const;
};

const RollaMeal = () => {
  const {
    filters,
    getFilteredRecipes,
    scoreRecipe,
    toggleSaved,
    isSaved,
  } = useApp();
  const navigate = useNavigate();

  const [selectedCuisine, setSelectedCuisine] = useState<Cuisine | "">(() => filters.cuisine ?? "");
  const [selectedProtein, setSelectedProtein] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | "">(() => filters.difficulty ?? "");
  const [selectedStyle, setSelectedStyle] = useState<(typeof styleOptions)[number] | "">("");
  const [selectedSpiceLevel, setSelectedSpiceLevel] = useState<(typeof spiceLevelOptions)[number] | "">("");
  const [maxTime, setMaxTime] = useState<number | null>(() => cookingTimeToMax(filters.cookingTime));
  const [rollDialogOpen, setRollDialogOpen] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [slotRecipes, setSlotRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [slotWinnerId, setSlotWinnerId] = useState<Recipe["id"] | null>(null);
  const [slotSettled, setSlotSettled] = useState(false);
  const spinIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdDelayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tapStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdRollingRef = useRef(false);
  const rollingRef = useRef(false);
  const basePool = useMemo(() => getFilteredRecipes(), [getFilteredRecipes]);

  const filteredPool = useMemo(() => {
    if (!basePool.length) return [];
    return basePool.filter((recipe) => {
      if (selectedCuisine && recipe.cuisine !== selectedCuisine) return false;
      if (selectedDifficulty && recipe.difficulty !== selectedDifficulty) return false;
      if (maxTime && recipe.cookingTime > maxTime) return false;
      if (selectedStyle && !recipeMatchesStyle(recipe, selectedStyle)) return false;
      if (selectedSpiceLevel && getRecipeSpiceLevel(recipe) !== selectedSpiceLevel) return false;
      if (selectedProtein) {
        const matchers = proteinKeywords[selectedProtein] ?? [new RegExp(`\\b${selectedProtein}\\b`, "i")];
        if (!recipe.ingredients.some((ingredient) => matchers.some((matcher) => matcher.test(ingredient)))) return false;
      }
      return true;
    });
  }, [basePool, selectedCuisine, selectedDifficulty, maxTime, selectedStyle, selectedSpiceLevel, selectedProtein]);
  const matchPercent = basePool.length > 0 ? (filteredPool.length / basePool.length) * 100 : 0;

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

  const clearRollTimers = useCallback(() => {
    if (spinIntervalRef.current) {
      clearInterval(spinIntervalRef.current);
      spinIntervalRef.current = null;
    }
    if (settleTimerRef.current) {
      clearTimeout(settleTimerRef.current);
      settleTimerRef.current = null;
    }
    if (holdDelayTimerRef.current) {
      clearTimeout(holdDelayTimerRef.current);
      holdDelayTimerRef.current = null;
    }
    if (tapStopTimerRef.current) {
      clearTimeout(tapStopTimerRef.current);
      tapStopTimerRef.current = null;
    }
    holdRollingRef.current = false;
  }, []);

  const buildSlotFrame = useCallback((pool: Recipe[], centerRecipe?: Recipe) => {
    if (!pool.length) return [];
    const frame: Recipe[] = [];
    const usedIds: Array<Recipe["id"]> = centerRecipe ? [centerRecipe.id] : [];

    for (let index = 0; index < SLOT_COUNT; index += 1) {
      if (centerRecipe && index === SLOT_CENTER_INDEX) {
        frame.push(centerRecipe);
        continue;
      }
      const recipe = pickRandomRecipe(pool, usedIds);
      frame.push(recipe);
      if (!usedIds.includes(recipe.id)) {
        usedIds.push(recipe.id);
      }
    }

    return frame;
  }, []);

  const closeRollDialog = useCallback(() => {
    clearRollTimers();
    setRolling(false);
    setSlotSettled(false);
    setSlotWinnerId(null);
    setRollDialogOpen(false);
  }, [clearRollTimers]);

  const openRollDialog = useCallback(() => {
    if (!filteredPool.length) {
      setErrorMessage("No recipes match these preferences—try easing a filter or removing an exclusion.");
      return;
    }
    setErrorMessage(null);
    clearRollTimers();
    setRollDialogOpen(true);
    setSelectedRecipe(null);
    setSlotWinnerId(null);
    setSlotSettled(false);
    setSlotRecipes(buildSlotFrame(filteredPool));
  }, [buildSlotFrame, clearRollTimers, filteredPool]);

  const stopRolling = useCallback(() => {
    if (!rolling) return;
    clearRollTimers();
    const winner = pickWeightedRecipe(filteredPool);
    const slowdownSteps =
      RELEASE_SLOWDOWN_MIN_STEPS +
      Math.floor(Math.random() * (RELEASE_SLOWDOWN_MAX_STEPS - RELEASE_SLOWDOWN_MIN_STEPS + 1));
    const teaser = pickRandomRecipe(filteredPool, [winner.id]);
    const frames = Array.from({ length: slowdownSteps }, (_, index) => {
      if (index === slowdownSteps - 1) return buildSlotFrame(filteredPool, winner);
      if (index === slowdownSteps - 2) return buildSlotFrame(filteredPool, teaser);
      return buildSlotFrame(filteredPool);
    });

    setRolling(false);
    setSlotSettled(false);
    setSlotWinnerId(winner.id);
    setSlotRecipes(frames[0]);

    let frameIndex = 0;
    const runSlowdown = () => {
      setSlotRecipes(frames[frameIndex]);

      if (frameIndex === frames.length - 1) {
        setSlotSettled(true);
        settleTimerRef.current = setTimeout(() => {
          setSelectedRecipe(winner);
          setRollDialogOpen(false);
          setSlotSettled(false);
        }, RELEASE_FINAL_HOLD_MS);
        return;
      }

      frameIndex += 1;
      settleTimerRef.current = setTimeout(
        runSlowdown,
        RELEASE_SLOWDOWN_BASE_DELAY_MS + frameIndex * RELEASE_SLOWDOWN_STEP_DELAY_MS
      );
    };

    settleTimerRef.current = setTimeout(runSlowdown, RELEASE_SLOWDOWN_BASE_DELAY_MS);
  }, [buildSlotFrame, clearRollTimers, filteredPool, pickWeightedRecipe, rolling]);

  const startRolling = useCallback(() => {
    if (rolling || !rollDialogOpen || !filteredPool.length) return;
    if (settleTimerRef.current) {
      clearTimeout(settleTimerRef.current);
      settleTimerRef.current = null;
    }
    if (tapStopTimerRef.current) {
      clearTimeout(tapStopTimerRef.current);
      tapStopTimerRef.current = null;
    }
    setRolling(true);
    setSlotSettled(false);
    setSlotWinnerId(null);
    setSlotRecipes(buildSlotFrame(filteredPool));
    spinIntervalRef.current = setInterval(() => {
      setSlotRecipes(buildSlotFrame(filteredPool));
    }, LIVE_SPIN_INTERVAL_MS);
  }, [buildSlotFrame, filteredPool, rollDialogOpen, rolling]);

  const handleRollPressStart = useCallback(() => {
    if (rolling || !rollDialogOpen || !filteredPool.length) return;
    clearRollTimers();
    holdDelayTimerRef.current = setTimeout(() => {
      holdRollingRef.current = true;
      startRolling();
    }, HOLD_TO_ROLL_DELAY_MS);
  }, [clearRollTimers, filteredPool.length, rollDialogOpen, rolling, startRolling]);

  const handleRollPressEnd = useCallback(() => {
    if (holdDelayTimerRef.current) {
      clearTimeout(holdDelayTimerRef.current);
      holdDelayTimerRef.current = null;
    }

    if (holdRollingRef.current) {
      stopRolling();
      return;
    }

    if (rolling || !rollDialogOpen || !filteredPool.length) return;

    startRolling();
    tapStopTimerRef.current = setTimeout(() => {
      stopRolling();
    }, TAP_ROLL_DURATION_MS);
  }, [filteredPool.length, rollDialogOpen, rolling, startRolling, stopRolling]);

  const handleRollPressCancel = useCallback(() => {
    if (holdDelayTimerRef.current) {
      clearTimeout(holdDelayTimerRef.current);
      holdDelayTimerRef.current = null;
    }
    if (holdRollingRef.current) {
      stopRolling();
    }
  }, [stopRolling]);

  useEffect(() => {
    return () => {
      clearRollTimers();
    };
  }, [clearRollTimers]);

  useEffect(() => {
    if (!rollDialogOpen && !selectedRecipe) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [rollDialogOpen, selectedRecipe]);

  const slotPreview = slotRecipes.slice(0, SLOT_COUNT);

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
              <div className={cappedFilterGridClassName}>
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
              <div className={cappedFilterGridClassName}>
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

            <div className="rounded-[20px] border border-border/50 bg-white/35 p-2.5">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                <Sparkles className="w-3.5 h-3.5" />
                Style
              </div>
              <div className="mt-2 grid grid-cols-1 gap-1.5">
                {styleOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => setSelectedStyle((prev) => (prev === option ? "" : option))}
                    className={getFilterCardClassName(selectedStyle === option, true)}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-[14px]">{styleIcons[option]}</span>
                      <span className="text-[12px] font-semibold">{option}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[20px] border border-border/50 bg-white/35 p-2.5">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                <Flame className="w-3.5 h-3.5" />
                Spice
              </div>
              <div className="mt-2 grid grid-cols-1 gap-1.5">
                {spiceLevelOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => setSelectedSpiceLevel((prev) => (prev === option ? "" : option))}
                    className={getFilterCardClassName(selectedSpiceLevel === option, true)}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-[14px]">{spiceLevelIcons[option]}</span>
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
          onClick={openRollDialog}
          className="w-full rounded-3xl bg-gradient-to-r from-primary to-accent px-5 py-4 text-sm font-bold uppercase tracking-[0.3em] text-primary-foreground shadow-lg transition hover:shadow-2xl disabled:opacity-60 btn-press flex items-center justify-center gap-3"
        >
          <Dice3 className="w-5 h-5" />
          Roll a meal
        </button>
        <div className="rounded-[20px] border border-border/60 bg-card/70 px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between gap-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Matches
            </span>
            <span className="text-foreground">{filteredPool.length} / {basePool.length || filteredPool.length}</span>
          </div>
          <RecipeProgressBar percent={matchPercent} />
        </div>

      </div>

      {rollDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/45 px-5 backdrop-blur-md"
          onClick={() => {
            if (!rolling) closeRollDialog();
          }}
        >
          <div
            className="animate-roll-pop relative w-full max-w-sm overflow-hidden rounded-[34px] border border-white/50 bg-[linear-gradient(160deg,rgba(255,255,255,0.88),rgba(255,249,240,0.82))] p-5 shadow-[0_30px_90px_-20px_rgba(15,23,42,0.45)]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close roller"
              onClick={closeRollDialog}
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/10 text-foreground backdrop-blur-sm btn-press"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="pointer-events-none absolute inset-x-10 top-4 h-24 rounded-full bg-primary/15 blur-3xl" />
            <div className="relative text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg animate-roll-glow">
                <Dice3 className={`h-7 w-7 ${rolling ? "animate-spin [animation-duration:1.15s]" : ""}`} />
              </div>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.34em] text-primary/80">
                {rolling ? "Shuffling picks" : "Lucky hold"}
              </p>
              <h2 className="mt-2 text-2xl font-bold text-foreground">Rolling your next meal</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {rolling
                  ? `Checking ${filteredPool.length} matches and surfacing a tasty fit for you.`
                  : "Tap for an automatic spin, or hold and release when you want to stop it yourself."}
              </p>
            </div>

            <div className="relative mt-5 overflow-hidden rounded-[28px] border border-border/50 bg-white/60 p-3 shadow-inner">
              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-white via-white/85 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20 bg-gradient-to-t from-white via-white/85 to-transparent" />
              <div className={`pointer-events-none absolute inset-x-3 top-1/2 z-10 h-[66px] -translate-y-1/2 rounded-[24px] border border-primary/25 bg-primary/5 transition-all duration-300 ${slotSettled ? "shadow-[0_0_0_1px_rgba(34,197,94,0.18),0_0_32px_rgba(34,197,94,0.18)]" : ""}`} />
              <div className="space-y-2.5">
                {(slotPreview.length ? slotPreview : buildSlotFrame(filteredPool)).map((recipe, index) => (
                  <div
                    key={`${recipe.id}-${index}-${rolling ? "rolling" : "idle"}`}
                    className={`animate-roll-slot flex items-center gap-3 rounded-[22px] border px-3 py-2.5 transition-all duration-200 ${
                      index === SLOT_CENTER_INDEX || (slotPreview.length < SLOT_COUNT && index === Math.floor(slotPreview.length / 2))
                        ? "border-primary/40 bg-primary/8 shadow-[0_14px_28px_-20px_rgba(34,197,94,0.9)]"
                        : "border-border/40 bg-background/60"
                    } ${
                      slotSettled && index === SLOT_CENTER_INDEX && slotWinnerId === recipe.id
                        ? "animate-roll-win scale-[1.02] border-primary/60 bg-gradient-to-r from-primary/12 via-white/85 to-accent/12"
                        : ""
                    }`}
                  >
                    <img src={recipe.image} alt={recipe.title} className="h-12 w-12 rounded-2xl object-cover shadow-sm" />
                    <div className="min-w-0 flex-1 text-left">
                      <p className="truncate text-sm font-semibold text-foreground">{recipe.title}</p>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                        {recipe.cuisine} · {recipe.difficulty}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onPointerDown={handleRollPressStart}
              onPointerUp={handleRollPressEnd}
              onPointerLeave={handleRollPressCancel}
              onPointerCancel={handleRollPressCancel}
              className={`mt-5 w-full rounded-3xl px-5 py-4 text-sm font-bold uppercase tracking-[0.3em] text-primary-foreground shadow-lg transition btn-press flex items-center justify-center gap-3 ${
                rolling ? "bg-gradient-to-r from-emerald-600 to-primary shadow-2xl" : "bg-gradient-to-r from-primary to-accent"
              }`}
            >
              <Dice3 className={`w-5 h-5 ${rolling ? "animate-spin [animation-duration:1.1s]" : ""}`} />
              {rolling ? "Release to stop" : "Hold or tap to roll"}
            </button>

            <div className="mt-4 flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              {slotSettled ? (
                <span className="text-primary">Locked in</span>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span className="h-2 w-2 rounded-full bg-primary/70 animate-pulse [animation-delay:180ms]" />
                  <span className="h-2 w-2 rounded-full bg-primary/50 animate-pulse [animation-delay:360ms]" />
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedRecipe && !rolling && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/45 px-5 py-6 backdrop-blur-md"
          onClick={() => setSelectedRecipe(null)}
        >
          <div
            className="animate-roll-pop relative w-full max-w-md overflow-hidden rounded-[34px] border border-white/50 bg-card shadow-[0_30px_90px_-20px_rgba(15,23,42,0.45)]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close result"
              onClick={() => setSelectedRecipe(null)}
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/22 text-white backdrop-blur-sm btn-press"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="relative overflow-hidden">
              <img src={selectedRecipe.image} alt={selectedRecipe.title} className="h-64 w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
            </div>
            <div className="p-5 space-y-4">
              <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                <span className="rounded-full border border-border px-3 py-1">{selectedRecipe.cuisine}</span>
                <span className="rounded-full border border-border px-3 py-1">{selectedRecipe.difficulty}</span>
                <span className="rounded-full border border-border px-3 py-1">{selectedRecipe.cookingTime} min</span>
              </div>
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/80">Your pick is in</p>
                <h2 className="text-2xl font-bold text-foreground">{selectedRecipe.title}</h2>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {selectedRecipe.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-primary/10 px-3 py-1 font-semibold tracking-[0.2em] text-primary">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <button
                  onClick={() => {
                    setSelectedRecipe(null);
                    openRollDialog();
                  }}
                  className="rounded-[24px] border border-primary/80 bg-primary/5 px-4 py-3.5 text-sm font-semibold text-primary btn-press inline-flex min-h-[58px] items-center justify-center gap-2 whitespace-nowrap shadow-sm"
                >
                  <Repeat className="w-4 h-4" />
                  Roll again
                </button>
                <button
                  onClick={() => toggleSaved(selectedRecipe.id)}
                  className="rounded-[24px] border border-border/70 bg-white/70 px-4 py-3.5 text-sm font-semibold text-foreground btn-press inline-flex min-h-[58px] items-center justify-center gap-2 whitespace-nowrap shadow-sm"
                >
                  <Heart className={`w-4 h-4 ${isSaved(selectedRecipe.id) ? "fill-current text-accent" : ""}`} />
                  {isSaved(selectedRecipe.id) ? "Saved" : "Save"}
                </button>
                <button
                  onClick={() => navigate(`/recipe/${selectedRecipe.id}`)}
                  className="rounded-[24px] bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground btn-press inline-flex min-h-[58px] items-center justify-center gap-2 whitespace-nowrap shadow-[0_16px_36px_-22px_rgba(34,197,94,0.95)]"
                >
                  <ChefHat className="h-4 w-4" />
                  Cook this
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RollaMeal;
