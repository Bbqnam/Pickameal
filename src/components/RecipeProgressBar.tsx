const clampPercent = (value: number) => Math.min(100, Math.max(0, value));

const RecipeProgressBar = ({ percent }: { percent: number }) => (
  <div className="mt-1 h-1.5 w-full rounded-full bg-muted/80 dark:bg-muted/30">
    <div
      className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-200"
      style={{ width: `${clampPercent(percent)}%` }}
    />
  </div>
);

export default RecipeProgressBar;
