import { useNavigate } from "react-router-dom";
import { ChefHat, Shuffle, Heart, ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-24 pt-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 mb-6">
            <ChefHat className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight">
            PickaMeal
          </h1>
          <p className="mt-3 text-muted-foreground text-lg max-w-xs mx-auto leading-relaxed">
            Pick what you have. Find what to cook.
          </p>
        </div>

        <div className="w-full max-w-sm flex flex-col gap-3">
          <button
            onClick={() => navigate("/ingredients")}
            className="w-full flex items-center justify-between px-6 py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-base shadow-sm transition-opacity hover:opacity-90"
          >
            <span className="flex items-center gap-3">
              <ArrowRight className="w-5 h-5" />
              Start Picking
            </span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => navigate("/random")}
            className="w-full flex items-center justify-between px-6 py-4 rounded-2xl bg-accent text-accent-foreground font-semibold text-base shadow-sm transition-opacity hover:opacity-90"
          >
            <span className="flex items-center gap-3">
              <Shuffle className="w-5 h-5" />
              Random Meal
            </span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => navigate("/saved")}
            className="w-full flex items-center justify-between px-6 py-4 rounded-2xl bg-secondary text-secondary-foreground font-semibold text-base border border-border transition-opacity hover:opacity-90"
          >
            <span className="flex items-center gap-3">
              <Heart className="w-5 h-5" />
              Saved Recipes
            </span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;
