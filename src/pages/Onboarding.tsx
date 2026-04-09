import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Heart, ArrowRight } from "lucide-react";
import { useApp, PreferenceDecision } from "@/context/AppContext";
import type { Recipe } from "@/types/recipe";

const MAX_ONBOARDING_CARDS = 18;
const SWIPE_COMMIT_DELAY = 230;

const shuffleRecipes = (items: Recipe[]): Recipe[] => {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const OverviewList = ({ title, items }: { title: string; items: string[] }) => (
  <div className="rounded-2xl border border-border/60 bg-card/70 p-4 shadow-sm">
    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
    <div className="mt-2 space-y-1">
      {items.length ? (
        items.map((item) => (
          <span key={item} className="text-sm font-semibold text-foreground block truncate">
            {item}
          </span>
        ))
      ) : (
        <p className="text-sm text-muted-foreground">Still learning your taste...</p>
      )}
    </div>
  </div>
);

const Onboarding = () => {
  const { recipes, recordTasteDecision, preferenceHighlights, completeOnboarding } = useApp();
  const navigate = useNavigate();
  const [deck, setDeck] = useState<Recipe[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [swipeDecision, setSwipeDecision] = useState<PreferenceDecision | null>(null);
  const startX = useRef(0);
  const choiceTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!recipes.length) return;
    setDeck((prev) => {
      if (prev.length) return prev;
      return shuffleRecipes(recipes).slice(0, Math.min(MAX_ONBOARDING_CARDS, recipes.length));
    });
  }, [recipes]);

  const finished = activeIndex >= deck.length && deck.length > 0;

  useEffect(() => {
    if (finished) {
      completeOnboarding();
    }
  }, [finished, completeOnboarding]);

  useEffect(() => {
    return () => {
      if (choiceTimer.current !== null) {
        window.clearTimeout(choiceTimer.current);
      }
    };
  }, []);

  const commitChoice = (outcome: PreferenceDecision) => {
    if (!deck[activeIndex]) return;
    recordTasteDecision(deck[activeIndex], outcome);
    setActiveIndex((prev) => prev + 1);
    setDragX(0);
    setSwipeDecision(null);
  };

  const handleChoice = (outcome: PreferenceDecision) => {
    if (!deck[activeIndex] || swipeDecision) return;
    setDragging(false);
    setSwipeDecision(outcome);
    if (outcome === "like") {
      setDragX(220);
    } else if (outcome === "dislike") {
      setDragX(-220);
    }
    choiceTimer.current = window.setTimeout(() => commitChoice(outcome), SWIPE_COMMIT_DELAY);
  };

  const upcoming = deck.slice(activeIndex, activeIndex + 3).reverse();
  const progress = deck.length ? Math.min(activeIndex, deck.length) / deck.length : 0;
  const statusLabel = dragX > 50 ? "Keep" : dragX < -50 ? "Pass" : null;
  const likeIntensity = Math.min(Math.max(dragX / 150, 0), 1);
  const dislikeIntensity = Math.min(Math.max(-dragX / 150, 0), 1);

  const startSwipe = (clientX: number) => {
    if (swipeDecision) return;
    startX.current = clientX;
    setDragging(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setDragX(event.clientX - startX.current);
  };

  const handlePointerUp = () => {
    setDragging(false);
    if (dragX > 90) {
      handleChoice("like");
    } else if (dragX < -90) {
      handleChoice("dislike");
    } else {
      setDragX(0);
    }
  };

  const finishedView = useMemo(() => (
    <div className="space-y-6 text-center">
      <p className="text-sm text-muted-foreground">Tastes saved to your profile</p>
      <h2 className="text-2xl font-bold text-foreground">RollaMeal knows you better now</h2>
      <p className="text-sm text-muted-foreground max-w-xl mx-auto">
        We saved the cues you like and steer future picks toward what makes you excited.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <OverviewList title="Favorite cuisines" items={preferenceHighlights.likedCuisines} />
        <OverviewList title="Ingredients to avoid" items={preferenceHighlights.dislikedIngredients} />
        <OverviewList title="Loved tags" items={preferenceHighlights.favoriteTags} />
        <OverviewList title="Mood shifts" items={preferenceHighlights.avoidedTags} />
      </div>
      <button
        onClick={() => navigate("/rollameal")}
        className="inline-flex items-center justify-center gap-2 w-full max-w-sm mx-auto px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold btn-press"
      >
        Explore RollaMeal
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  ), [preferenceHighlights, navigate]);

  const skipOnboarding = () => {
      completeOnboarding();
    navigate("/rollameal");
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Taste test</p>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-400" />
              Build your profile
            </h1>
          </div>
          <button
            onClick={skipOnboarding}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip for now
          </button>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Swipe right to keep, left to pass. We use your answers to make RollaMeal more personal.
        </p>
        <div className="mt-3 h-1.5 rounded-full bg-border/30 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <p className="text-[11px] uppercase tracking-[0.3em] mt-2 text-muted-foreground">
          {deck.length ? `${Math.min(activeIndex, deck.length)}/${deck.length} cards` : "Gathering dishes..."}
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center px-5 pt-8">
        {deck.length === 0 ? (
          <div className="w-full max-w-md border border-border/70 rounded-[32px] p-8 text-center bg-card shadow-lg">
            <p className="text-sm text-muted-foreground">Loading vibrant dishes to learn from...</p>
          </div>
        ) : finished ? (
          finishedView
        ) : (
          <div className="relative h-[540px] w-full max-w-md">
            <div className="pointer-events-none absolute inset-x-8 top-4 h-40 rounded-full bg-amber-200/35 blur-3xl" />
            {upcoming.map((recipe, layerIndex) => {
              const isTop = layerIndex === 0;
              const topTransform =
                swipeDecision === "like"
                  ? "translateX(140%) translateY(-3%) rotate(18deg)"
                  : swipeDecision === "dislike"
                  ? "translateX(-140%) translateY(-3%) rotate(-18deg)"
                  : swipeDecision === "skip"
                  ? "translateY(14%) scale(0.92)"
                  : `translateX(${dragX}px) rotate(${dragX / 18}deg)`;
              const style = isTop
                ? {
                    transform: topTransform,
                    opacity: swipeDecision === "skip" ? 0 : 1,
                    transition: dragging ? "none" : "transform 0.26s ease, opacity 0.22s ease",
                  }
                : {
                    transform: `scale(${1 - layerIndex * 0.04}) translateY(${layerIndex * 10}px)`,
                    opacity: 1 - layerIndex * 0.12,
                  };
              return (
                <div
                  key={recipe.id}
                  className="absolute inset-0 overflow-hidden rounded-[36px] border border-border/50 bg-card shadow-[0_20px_60px_rgba(15,23,42,0.25)]"
                  style={style}
                  onPointerDown={isTop ? (event) => startSwipe(event.clientX) : undefined}
                  onPointerMove={isTop ? handlePointerMove : undefined}
                  onPointerUp={isTop ? handlePointerUp : undefined}
                  onPointerLeave={isTop ? handlePointerUp : undefined}
                  onPointerCancel={isTop ? handlePointerUp : undefined}
                >
                  <img src={recipe.image} alt={recipe.title} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/60" />
                  <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/20 to-transparent" />
                  <div
                    className="absolute inset-0 bg-emerald-500/18 transition-opacity"
                    style={{ opacity: isTop ? likeIntensity : 0 }}
                  />
                  <div
                    className="absolute inset-0 bg-rose-500/16 transition-opacity"
                    style={{ opacity: isTop ? dislikeIntensity : 0 }}
                  />
                  <div className="absolute left-5 top-5 flex gap-2">
                    <div
                      className="rounded-full border border-white/25 bg-emerald-500/95 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-lg transition-opacity"
                      style={{ opacity: isTop ? Math.max(likeIntensity, swipeDecision === "like" ? 1 : 0) : 0 }}
                    >
                      Keep
                    </div>
                    <div
                      className="rounded-full border border-white/25 bg-rose-500/95 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-lg transition-opacity"
                      style={{ opacity: isTop ? Math.max(dislikeIntensity, swipeDecision === "dislike" ? 1 : 0) : 0 }}
                    >
                      Pass
                    </div>
                  </div>
                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <p className="mb-2 text-sm uppercase tracking-[0.3em] text-white/70">{recipe.cuisine}</p>
                    <h2 className="text-3xl font-bold leading-tight">{recipe.title}</h2>
                    <div className="mt-3 flex w-fit items-center gap-2 rounded-full bg-black/25 px-3 py-1.5 text-xs backdrop-blur-sm">
                      <Heart className="w-4 h-4 text-rose-200" />
                      {recipe.cookingTime} min · {recipe.difficulty}
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3 rounded-[24px] border border-white/12 bg-black/18 px-4 py-3 backdrop-blur-sm">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.28em] text-white/65">Swipe verdict</p>
                        <p className="mt-1 text-lg font-semibold text-white">{statusLabel ?? "Move left or right"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-[0.28em] text-white/65">Card</p>
                        <p className="mt-1 text-lg font-semibold text-white">{Math.min(activeIndex + 1, deck.length)}/{deck.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {!finished && deck.length > 0 && (
        <div className="px-5 pb-8 space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Swipe or tap buttons below</span>
            <span className="font-medium text-foreground">{statusLabel ?? "Decide"}</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleChoice("skip")}
              disabled={swipeDecision !== null}
              className="flex-1 rounded-2xl border border-border/70 px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-[0.3em] btn-press"
            >
              Skip dish
            </button>
            <button
              onClick={() => handleChoice("dislike")}
              disabled={swipeDecision !== null}
              className="flex-1 rounded-2xl border border-red-300 bg-red-50 text-xs font-semibold text-red-600 uppercase tracking-[0.3em] btn-press"
            >
              Pass
            </button>
            <button
              onClick={() => handleChoice("like")}
              disabled={swipeDecision !== null}
              className="flex-1 rounded-2xl bg-primary text-primary-foreground font-semibold px-4 py-3 btn-press uppercase tracking-[0.3em] text-xs"
            >
              Keep
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
