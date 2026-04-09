import { ArrowRight, Shuffle, Zap, Leaf, Sofa } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import type { Filters } from "@/types/recipe";

const moodChips = [
  { label: "Quick meal", icon: Zap, filter: { cookingTime: "Under 15 min" as const } },
  { label: "Healthy", icon: Leaf, filter: { difficulty: "Easy" as const } },
  { label: "Comfort food", icon: Sofa, filter: { mealType: "Dinner" as const } },
];

const heroActions = [
  {
    label: "PickaMeal",
    icon: ArrowRight,
    emoji: "🥗",
    path: "/ingredients",
    gradient: "from-emerald-500 to-emerald-600",
    description: "Turn pantry staples into a chef-worthy plate.",
  },
  {
    label: "RollaMeal",
    icon: Shuffle,
    emoji: "🎲",
    path: "/rollameal",
    gradient: "from-orange-500 to-rose-500",
    description: "Shake up a surprise menu in seconds.",
  },
];

const floatingSprites = [
  { emoji: "🥑", className: "left-[6%] top-[9%] text-[2.6rem]", delay: "0s", duration: "7.2s" },
  { emoji: "🍕", className: "right-[5%] top-[7%] text-[2.8rem]", delay: "0.8s", duration: "6.6s" },
  { emoji: "🌮", className: "left-[7%] bottom-[18%] text-[2.1rem]", delay: "0.4s", duration: "7s" },
  { emoji: "🍜", className: "right-[8%] bottom-[16%] text-[2.15rem]", delay: "1.7s", duration: "7.4s" },
];

const baseFilters: Filters = {
  cuisine: null,
  cookingTime: null,
  difficulty: null,
  mealType: null,
  useMostlyMyIngredients: false,
};

const Index = () => {
  const navigate = useNavigate();
  const { setFilters } = useApp();

  const handleMood = (chip: typeof moodChips[0]) => {
    if (chip.filter === null) {
      navigate("/rollameal");
    } else {
      setFilters({ ...baseFilters, ...chip.filter });
      navigate("/results");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdfcf8] via-[#fffdef] to-[#eefef2] text-foreground">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-[40px] bg-gradient-to-b from-[#f7fff6] to-[#fff5ef] shadow-[0_30px_60px_-35px_rgba(15,23,42,0.6)]">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#d6ffe3] to-transparent blur-3xl" />
          {floatingSprites.map((sprite) => (
            <span
              key={sprite.emoji}
              className={`pointer-events-none absolute select-none leading-none drop-shadow-[0_10px_18px_rgba(15,23,42,0.18)] animate-hero-sprite ${sprite.className}`}
              style={{ animationDelay: sprite.delay, animationDuration: sprite.duration }}
            >
              {sprite.emoji}
            </span>
          ))}

          <div className="relative flex flex-col items-center gap-3 text-center px-5 py-6">
            <div className="relative w-full">
              <div className="pointer-events-none absolute inset-x-[16%] bottom-[8%] top-[18%] rounded-full bg-white/30 blur-3xl" />
              <img
                src="/logo.png"
                alt="PickaMeal logo"
                className="animate-hero-logo relative mx-auto w-full max-w-[360px] object-contain drop-shadow-[0_14px_22px_rgba(15,23,42,0.14)]"
              />
            </div>
            <div className="space-y-1 px-4">
              <p className="text-xs font-semibold uppercase tracking-[0.5em] text-foreground/60">Meals in minutes</p>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold text-foreground">Quick starts</p>
            <button
              type="button"
              onClick={() => {
                setFilters({ ...baseFilters });
                navigate("/results");
              }}
              className="rounded-full border border-border/50 bg-white/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/70 transition hover:border-foreground hover:text-foreground"
            >
              All recipes
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {moodChips.map((chip) => {
              const Icon = chip.icon;
              return (
                <button
                  key={chip.label}
                  onClick={() => handleMood(chip)}
                  className="flex items-center gap-2 rounded-full border border-border/40 bg-white/85 px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:border-foreground"
                >
                  <Icon className="h-4 w-4" />
                  {chip.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-3 pb-24">
          <div className="grid gap-3 sm:grid-cols-2">
            {heroActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  type="button"
                  className={`group flex min-h-[152px] flex-col gap-2 rounded-[30px] border border-transparent bg-gradient-to-br ${action.gradient} px-5 py-4 text-left text-white shadow-[0_25px_50px_-30px_rgba(15,23,42,0.75)] transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70`}
                >
                  <div className="flex items-center gap-3 text-lg font-semibold">
                    <span className="text-2xl">{action.emoji}</span>
                    <span>{action.label}</span>
                  </div>
                  <p className="text-sm leading-6 text-white/90">{action.description}</p>
                  <span className="ml-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 transition group-hover:bg-white/40">
                    <Icon className="h-5 w-5" />
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
