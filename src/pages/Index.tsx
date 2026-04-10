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
    description: "Cook from what you have.",
  },
  {
    label: "RollaMeal",
    icon: Shuffle,
    emoji: "🎲",
    path: "/rollameal",
    gradient: "from-orange-500 to-rose-500",
    description: "Get a surprise dish fast.",
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
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8">
        <section className="relative -mx-4 overflow-hidden bg-gradient-to-b from-[#f7fff6] via-[#fbfff8] to-[#fff7ef] sm:-mx-6 lg:-mx-8">
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

          <div className="relative flex min-h-[300px] flex-col items-center gap-1 px-5 pt-7 pb-4 text-center sm:min-h-[360px] sm:px-8 sm:pt-8 sm:pb-5">
            <div className="relative w-full">
              <div className="pointer-events-none absolute inset-x-[12%] bottom-[10%] top-[16%] rounded-full bg-white/25 blur-3xl" />
              <img
                src="/logo.png"
                alt="PickaMeal logo"
                className="animate-hero-logo relative mx-auto w-full max-w-[330px] object-contain drop-shadow-[0_14px_22px_rgba(15,23,42,0.14)] sm:max-w-[380px]"
              />
            </div>
            <div className="space-y-1 px-4 -mt-10 sm:-mt-12">
              <p className="text-[13px] font-semibold uppercase tracking-[0.28em] text-foreground/55 sm:text-[14px] sm:tracking-[0.32em]">
                Meals in minutes
              </p>
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
              className="rounded-full border border-border/50 bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-foreground/70 shadow-sm transition hover:border-foreground hover:text-foreground"
            >
              All recipes
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {moodChips.map((chip) => {
              const Icon = chip.icon;
              return (
                <button
                  key={chip.label}
                  onClick={() => handleMood(chip)}
                  className="flex min-h-11 w-full min-w-0 items-center justify-center gap-1.5 rounded-full border border-border/40 bg-white/85 px-2 py-2 text-center text-[13px] font-semibold whitespace-nowrap text-foreground shadow-sm transition hover:border-foreground sm:gap-2 sm:px-4 sm:text-sm"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {chip.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mx-auto w-full max-w-4xl space-y-3 pt-6 pb-24 sm:pt-8">
          <div className="grid gap-3 sm:grid-cols-2">
            {heroActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  type="button"
                  className={`group flex flex-col gap-1.5 rounded-[38px] border border-transparent bg-gradient-to-br ${action.gradient} px-5 py-4 text-left text-white shadow-[0_25px_50px_-30px_rgba(15,23,42,0.75)] transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70`}
                >
                  <div className="flex items-center justify-between gap-3 text-lg font-semibold">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{action.emoji}</span>
                      <span>{action.label}</span>
                    </div>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/14 transition group-hover:bg-white/24">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <p className="text-sm leading-5 text-white/90">{action.description}</p>
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
