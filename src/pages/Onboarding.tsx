import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Heart, ArrowRight, Check, SkipForward, X } from "lucide-react";
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

  const activeRecipe = deck[activeIndex];
  const queuedCards = Math.max(Math.min(deck.length - activeIndex - 1, 2), 0);
  const progress = deck.length ? Math.min(activeIndex, deck.length) / deck.length : 0;
  const statusLabel =
    swipeDecision === "skip"
      ? "Skipping"
      : swipeDecision === "like"
      ? "Keep"
      : swipeDecision === "dislike"
      ? "Pass"
      : dragX > 50
      ? "Keep"
      : dragX < -50
      ? "Pass"
      : null;
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
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
            <Check className="h-3.5 w-3.5" />
            Right = keep
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-rose-700">
            <X className="h-3.5 w-3.5" />
            Left = pass
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-amber-700">
            <SkipForward className="h-3.5 w-3.5" />
            Skip anytime
          </span>
        </div>
        <div className="mt-3 h-1.5 rounded-full bg-border/30 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            {deck.length ? `${Math.min(activeIndex, deck.length)}/${deck.length} cards` : "Gathering dishes..."}
          </p>
          {deck.length > 0 && !finished && (
            <span className="rounded-full border border-border/60 bg-card/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              {Math.max(deck.length - activeIndex, 0)} left
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center px-5 pt-8">
        {deck.length === 0 ? (
          <div className="w-full max-w-md border border-border/70 rounded-[32px] p-8 text-center bg-card shadow-lg">
            <p className="text-sm text-muted-foreground">Loading vibrant dishes to learn from...</p>
          </div>
        ) : finished ? (
          finishedView
        ) : (
          <div className="w-full max-w-md">
            <div className="relative h-[620px] w-full">
              <div className="pointer-events-none absolute inset-x-10 top-8 h-44 rounded-full bg-amber-200/35 blur-3xl" />

              {Array.from({ length: queuedCards }).map((_, index) => {
                const layer = queuedCards - index;
                return (
                  <div
                    key={`preview-${activeIndex + index}`}
                    className="pointer-events-none absolute inset-x-4 rounded-[36px] border border-border/45 bg-gradient-to-br from-white/90 via-card/92 to-amber-50/70 shadow-[0_16px_40px_rgba(15,23,42,0.14)] backdrop-blur-sm"
                    style={{
                      top: `${18 + index * 12}px`,
                      bottom: `${18 - index * 4}px`,
                      transform: `scale(${1 - layer * 0.035})`,
                      opacity: 0.82 - index * 0.18,
                    }}
                  >
                    <div className="absolute inset-x-8 top-6 h-24 rounded-full bg-gradient-to-r from-emerald-100/60 via-transparent to-amber-100/60 blur-2xl" />
                    <div className="absolute left-6 right-6 bottom-6 flex items-center justify-between rounded-full border border-border/40 bg-background/70 px-4 py-3 text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                      <span>Up next</span>
                      <span>{activeIndex + index + 2}/{deck.length}</span>
                    </div>
                  </div>
                );
              })}

              {activeRecipe && (
                <div
                  className="absolute inset-0 overflow-hidden rounded-[38px] border border-border/50 bg-card shadow-[0_24px_70px_rgba(15,23,42,0.28)] touch-none"
                  style={{
                    transform:
                      swipeDecision === "like"
                        ? "translateX(140%) translateY(-3%) rotate(18deg)"
                        : swipeDecision === "dislike"
                        ? "translateX(-140%) translateY(-3%) rotate(-18deg)"
                        : swipeDecision === "skip"
                        ? "translateY(8%) scale(0.94)"
                        : `translateX(${dragX}px) rotate(${dragX / 18}deg)`,
                    opacity: swipeDecision === "skip" ? 0 : 1,
                    transition: dragging ? "none" : "transform 0.26s ease, opacity 0.22s ease",
                  }}
                  onPointerDown={(event) => startSwipe(event.clientX)}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                >
                  <img src={activeRecipe.image} alt={activeRecipe.title} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/12 via-transparent via-45% to-black/82" />
                  <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/22 to-transparent" />
                  <div
                    className="absolute inset-0 bg-emerald-500/18 transition-opacity"
                    style={{ opacity: likeIntensity }}
                  />
                  <div
                    className="absolute inset-0 bg-rose-500/18 transition-opacity"
                    style={{ opacity: dislikeIntensity }}
                  />

                  <div className="absolute left-5 top-5 flex items-center gap-2">
                    <div
                      className="rounded-full border border-white/20 bg-emerald-500/95 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-lg transition-opacity"
                      style={{ opacity: Math.max(likeIntensity, swipeDecision === "like" ? 1 : 0) }}
                    >
                      Keep
                    </div>
                    <div
                      className="rounded-full border border-white/20 bg-rose-500/95 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-lg transition-opacity"
                      style={{ opacity: Math.max(dislikeIntensity, swipeDecision === "dislike" ? 1 : 0) }}
                    >
                      Pass
                    </div>
                  </div>

                  <div className="absolute right-5 top-5 rounded-full border border-white/15 bg-black/20 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-white backdrop-blur-sm">
                    {Math.min(activeIndex + 1, deck.length)}/{deck.length}
                  </div>

                  <div className="pointer-events-none absolute inset-x-10 bottom-8 h-24 rounded-[28px] bg-black/22 blur-3xl" />
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-white/15 bg-black/22 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/90 backdrop-blur-sm">
                        {activeRecipe.cuisine}
                      </span>
                      <span className="rounded-full border border-white/15 bg-black/22 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/90 backdrop-blur-sm">
                        {activeRecipe.difficulty}
                      </span>
                    </div>
                    <div className="mt-4 inline-block max-w-[85%] rounded-[22px] border border-white/12 bg-black/22 px-4 py-3 backdrop-blur-sm">
                      <h2
                        className="text-[1.55rem] font-bold leading-tight sm:text-[1.7rem]"
                        style={{ textShadow: "0 6px 24px rgba(0, 0, 0, 0.5)" }}
                      >
                        {activeRecipe.title}
                      </h2>
                    </div>
                    <div className="mt-3 flex items-center justify-start gap-3">
                      <div
                        className="flex items-center gap-2 rounded-full bg-black/24 px-3 py-2 text-sm text-white/95 backdrop-blur-sm"
                        style={{ textShadow: "0 2px 14px rgba(0, 0, 0, 0.4)" }}
                      >
                        <Heart className="h-4 w-4 text-rose-200" />
                        {activeRecipe.cookingTime} min
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {!finished && deck.length > 0 && (
        <div className="px-5 pb-8 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleChoice("dislike")}
              disabled={swipeDecision !== null}
              className="rounded-[28px] border border-rose-200/80 bg-rose-50/85 px-5 py-4 text-left shadow-sm btn-press disabled:opacity-60"
            >
              <p className="text-[10px] uppercase tracking-[0.28em] text-rose-700/80">Pass</p>
              <div className="mt-2 flex items-center gap-2 text-base font-semibold text-rose-800">
                <X className="h-5 w-5" />
                Swipe left
              </div>
            </button>
            <button
              onClick={() => handleChoice("like")}
              disabled={swipeDecision !== null}
              className="rounded-[28px] border border-emerald-200/80 bg-emerald-50/85 px-5 py-4 text-left shadow-sm btn-press disabled:opacity-60"
            >
              <p className="text-[10px] uppercase tracking-[0.28em] text-emerald-700/80">Keep</p>
              <div className="mt-2 flex items-center gap-2 text-base font-semibold text-emerald-800">
                <Check className="h-5 w-5" />
                Swipe right
              </div>
            </button>
          </div>
          <div className="flex justify-center pt-1">
            <button
              onClick={() => handleChoice("skip")}
              disabled={swipeDecision !== null}
              className="rounded-full border border-border/60 bg-card/85 px-4 py-2 text-xs font-semibold text-muted-foreground btn-press inline-flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
            >
              <SkipForward className="h-3.5 w-3.5" />
              Skip this dish
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
