import { useNavigate } from "react-router-dom";
import { ChefHat, Shuffle, Heart, ArrowRight, Zap, Leaf, Sofa, Sparkles } from "lucide-react";

const moodChips = [
  { label: "Quick meal", icon: Zap, filter: { cookingTime: "Under 15 min" as const } },
  { label: "Healthy", icon: Leaf, filter: { difficulty: "Easy" as const } },
  { label: "Comfort food", icon: Sofa, filter: { mealType: "Dinner" as const } },
  { label: "Surprise me", icon: Sparkles, filter: null },
];

const Index = () => {
  const navigate = useNavigate();

  const handleMood = (chip: typeof moodChips[0]) => {
    if (chip.filter === null) {
      navigate("/random");
    } else {
      navigate("/results");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      {/* Hero section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-accent/5 to-background" />
        <div className="absolute top-6 right-6 text-6xl animate-float opacity-80">🍳</div>
        <div className="absolute top-20 left-8 text-4xl animate-float" style={{ animationDelay: '1s' }}>🥑</div>
        <div className="absolute top-8 left-1/2 text-3xl animate-float" style={{ animationDelay: '0.5s' }}>🍕</div>
        
        <div className="relative flex flex-col items-center pt-16 pb-8 px-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 mb-5 animate-bounce-in">
            <ChefHat className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight animate-fade-in">
            PickaMeal
          </h1>
          <p className="mt-3 text-muted-foreground text-lg max-w-xs mx-auto leading-relaxed text-center animate-fade-in opacity-0 stagger-2">
            Pick what you have. Find what to cook.
          </p>
        </div>
      </div>

      {/* Mood chips */}
      <div className="px-6 mb-8 animate-fade-in-up opacity-0 stagger-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">How are you feeling?</p>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {moodChips.map((chip) => {
            const Icon = chip.icon;
            return (
              <button
                key={chip.label}
                onClick={() => handleMood(chip)}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium border border-border/50 btn-press hover:bg-primary/10 hover:border-primary/30 transition-colors"
              >
                <Icon className="w-4 h-4" />
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main actions */}
      <div className="px-6 flex-1">
        <div className="w-full max-w-sm mx-auto flex flex-col gap-3">
          <button
            onClick={() => navigate("/ingredients")}
            className="w-full flex items-center justify-between px-6 py-5 rounded-2xl bg-primary text-primary-foreground font-semibold text-base shadow-md btn-press group animate-fade-in-up opacity-0 stagger-3"
          >
            <span className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                <ArrowRight className="w-5 h-5" />
              </span>
              Start Picking
            </span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>

          <button
            onClick={() => navigate("/random")}
            className="w-full flex items-center justify-between px-6 py-5 rounded-2xl bg-accent text-accent-foreground font-semibold text-base shadow-md btn-press group animate-fade-in-up opacity-0 stagger-4"
          >
            <span className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-accent-foreground/20 flex items-center justify-center">
                <Shuffle className="w-5 h-5" />
              </span>
              Random Meal
            </span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>

          <button
            onClick={() => navigate("/saved")}
            className="w-full flex items-center justify-between px-6 py-5 rounded-2xl bg-card text-foreground font-semibold text-base shadow-sm border border-border btn-press group animate-fade-in-up opacity-0 stagger-5"
          >
            <span className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <Heart className="w-5 h-5 text-accent" />
              </span>
              Saved Recipes
            </span>
            <ArrowRight className="w-5 h-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* Food illustration strip */}
      <div className="mt-8 px-6 animate-fade-in opacity-0 stagger-6">
        <div className="flex justify-center gap-3 text-3xl">
          <span className="animate-float" style={{ animationDelay: '0s' }}>🥘</span>
          <span className="animate-float" style={{ animationDelay: '0.3s' }}>🍜</span>
          <span className="animate-float" style={{ animationDelay: '0.6s' }}>🥗</span>
          <span className="animate-float" style={{ animationDelay: '0.9s' }}>🌮</span>
          <span className="animate-float" style={{ animationDelay: '1.2s' }}>🍝</span>
        </div>
      </div>
    </div>
  );
};

export default Index;
