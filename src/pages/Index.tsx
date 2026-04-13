import { ArrowRight, Shuffle, Zap, Leaf, Sofa } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import PageShell from "@/components/PageShell";
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
    <PageShell noPadding className="bg-gradient-to-b from-[hsl(var(--background))] via-[hsl(48,100%,97%)] to-[hsl(140,100%,96%)]">
      <div className="flex flex-col gap-4 px-4 sm:px-6 lg:px-8">
        <section className="relative -mx-4 overflow-hidden sm:-mx-6 lg:-mx-8">
          <div className="relative min-h-[300px] sm:min-h-[360px]">
            <img
              src="/hero-food.jpg"
              alt="Delicious food spread"
              className="absolute inset-0 h-full w-full object-cover"
              width={1024}
              height={768}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-[#fdfcf8]" />
            <div className="relative flex h-full min-h-[300px] flex-col items-center justify-end gap-1 px-5 pb-6 text-center sm:min-h-[360px] sm:px-8 sm:pb-8">
              <img
                src="/logo.png"
                alt="PickaMeal logo"
                className="animate-hero-logo mx-auto w-full max-w-[260px] object-contain drop-shadow-[0_14px_22px_rgba(15,23,42,0.3)] sm:max-w-[300px]"
              />
              <p className="text-[13px] font-semibold uppercase tracking-[0.28em] text-white/90 drop-shadow-sm sm:text-[14px] sm:tracking-[0.32em]">
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
    </PageShell>
  );
};

export default Index;
