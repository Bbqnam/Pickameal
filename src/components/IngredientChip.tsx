import { Check } from "lucide-react";

interface IngredientChipProps {
  name: string;
  selected: boolean;
  onToggle: () => void;
}

const IngredientChip = ({ name, selected, onToggle }: IngredientChipProps) => {
  return (
    <button
      onClick={onToggle}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
        selected
          ? "bg-primary text-primary-foreground border-primary shadow-sm"
          : "bg-card text-foreground border-border hover:border-primary/40"
      }`}
    >
      {selected && <Check className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />}
      {name}
    </button>
  );
};

export default IngredientChip;
