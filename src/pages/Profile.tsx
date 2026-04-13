import { useState } from "react";
import type { SVGProps } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Settings, ArrowRight, Heart, Ban, Tags, Layers3, Flame, ScanSearch } from "lucide-react";
import type { PreferenceHighlights } from "@/types/preferences";
import { useApp } from "@/context/AppContext";
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import PageShell from "@/components/PageShell";

const SwipeIcon = ({ className = "", ...props }: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" className={`h-5 w-5 ${className}`} {...props}>
    <path
      d="M6 12a6 6 0 0 1 6-6h1l-2 2 4 4 4-4-2-2h1a8 8 0 1 1-8 8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const groupAccents = {
  Cuisines: "from-emerald-100 via-white to-lime-50 text-emerald-700",
  Avoid: "from-rose-100 via-white to-orange-50 text-rose-700",
  Tags: "from-amber-100 via-white to-yellow-50 text-amber-700",
  Shifts: "from-sky-100 via-white to-cyan-50 text-sky-700",
} as const;

const groupIcons = {
  Cuisines: Heart,
  Avoid: Ban,
  Tags,
  Shifts: Layers3,
} as const;

const cuisineItemIcons: Record<string, string> = {
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

const tagItemIcons: Array<{ matcher: RegExp; icon: string }> = [
  { matcher: /soup/i, icon: "🍲" },
  { matcher: /seafood|shellfish/i, icon: "🦐" },
  { matcher: /speciality|specialty/i, icon: "⭐" },
  { matcher: /easter/i, icon: "🌷" },
  { matcher: /cheap/i, icon: "💸" },
  { matcher: /alcohol/i, icon: "🍷" },
  { matcher: /calorific/i, icon: "🔥" },
  { matcher: /cardamom/i, icon: "🌿" },
  { matcher: /green chilli|green chili|chili|chilli/i, icon: "🌶" },
  { matcher: /oil/i, icon: "🫗" },
  { matcher: /flour/i, icon: "🌾" },
];

const highlightGroups = [
  { title: "Cuisines", field: "likedCuisines" },
  { title: "Avoid", field: "dislikedIngredients" },
  { title: "Tags", field: "favoriteTags" },
  { title: "Shifts", field: "avoidedTags" },
] as const satisfies ReadonlyArray<{
  title: keyof typeof groupAccents;
  field: keyof PreferenceHighlights;
}>;

const TasteChip = ({ label, tone }: { label: string; tone: string }) => (
  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>
    {label}
  </span>
);

const getItemIcon = (group: keyof typeof groupIcons, item: string) => {
  if (group === "Cuisines") {
    return cuisineItemIcons[item] ?? "🍴";
  }

  const matched = tagItemIcons.find(({ matcher }) => matcher.test(item));
  if (matched) return matched.icon;

  if (group === "Avoid") return "🚫";
  if (group === "Tags") return "✨";
  return "🌀";
};

const Profile = () => {
  const navigate = useNavigate();
  const { preferenceHighlights, clearTasteProfile } = useApp();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dietaryFilters, setDietaryFilters] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [activePanel, setActivePanel] = useState<"profile" | "swipe" | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const topSignals = [
    ...preferenceHighlights.likedCuisines,
    ...preferenceHighlights.favoriteTags,
    ...preferenceHighlights.likedIngredients,
  ].slice(0, 4);
  const avoidSignals = [
    ...preferenceHighlights.dislikedIngredients,
    ...preferenceHighlights.avoidedTags,
  ].slice(0, 4);
  const totalSignals =
    preferenceHighlights.likedCuisines.length +
    preferenceHighlights.dislikedIngredients.length +
    preferenceHighlights.favoriteTags.length +
    preferenceHighlights.avoidedTags.length;
  const statTiles = [
    { icon: ScanSearch, value: totalSignals || 0, tone: "text-foreground", bg: "bg-white/80" },
    { icon: Flame, value: topSignals.length || 0, tone: "text-emerald-700", bg: "bg-emerald-50" },
    { icon: Ban, value: avoidSignals.length || 0, tone: "text-rose-700", bg: "bg-rose-50" },
  ];

  return (
    <PageShell noPadding className="bg-background">
      <div className="sticky top-0 z-30 border-b border-border bg-background/95 px-5 py-4 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Profile</p>
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-400" />
              <h1 className="text-2xl font-bold text-foreground">Taste Profile</h1>
            </div>
          </div>
          <button
            onClick={() => setSettingsOpen(true)}
            aria-label="Open app settings"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-card text-foreground shadow-sm btn-press"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-4 rounded-[26px] border border-border/60 bg-card/70 p-1.5 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setActivePanel((prev) => (prev === "profile" ? null : "profile"))}
              className={`flex items-center justify-center gap-2 rounded-[20px] px-4 py-3 text-sm font-semibold transition ${
                activePanel === "profile"
                  ? "bg-gradient-to-r from-emerald-500/15 to-lime-500/10 text-foreground shadow-sm ring-1 ring-emerald-500/30"
                  : "text-muted-foreground"
              }`}
            >
              <Sparkles className="h-4 w-4 text-amber-400" />
              Taste
            </button>
            <button
              onClick={() => setActivePanel((prev) => (prev === "swipe" ? null : "swipe"))}
              className={`flex items-center justify-center gap-2 rounded-[20px] px-4 py-3 text-sm font-semibold transition ${
                activePanel === "swipe"
                  ? "bg-gradient-to-r from-orange-500/15 to-rose-500/10 text-foreground shadow-sm ring-1 ring-orange-500/30"
                  : "text-muted-foreground"
              }`}
            >
              <SwipeIcon className="text-amber-400" />
              Swipe
            </button>
          </div>
        </div>
      </div>

      <div className="px-5 pt-6 space-y-6">
        {activePanel === "profile" && (
          <div className="space-y-4 rounded-[32px] border border-border/60 bg-card/80 p-5 shadow-sm">
            <div className="overflow-hidden rounded-[28px] bg-gradient-to-br from-[#f7fff6] via-white to-[#fff6ea] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Taste profile</p>
                  <h2 className="mt-2 flex items-center gap-2 text-2xl font-bold text-foreground">
                    <Sparkles className="h-5 w-5 text-amber-400" />
                    Flavor map
                  </h2>
                </div>
                <span className="rounded-full border border-emerald-500/30 bg-white/75 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-emerald-700">
                  Live
                </span>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                {statTiles.map(({ icon: Icon, value, tone, bg }) => (
                  <div key={`${Icon.displayName ?? Icon.name}-${value}`} className={`rounded-2xl p-3 shadow-sm ${bg}`}>
                    <Icon className={`h-4 w-4 ${tone}`} />
                    <p className={`mt-3 text-2xl font-bold ${tone}`}>{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {topSignals.length ? (
                  topSignals.map((item) => (
                    <TasteChip
                      key={item}
                      label={item}
                      tone="bg-emerald-500/12 text-emerald-700 ring-1 ring-emerald-500/10"
                    />
                  ))
                ) : (
                  <TasteChip
                    label="Still learning"
                    tone="bg-white/80 text-muted-foreground ring-1 ring-border/60"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {highlightGroups.map(({ title, field }) => {
                const items = preferenceHighlights[field];
                const Icon = groupIcons[title];
                return (
                  <div
                    key={title}
                    className={`rounded-[28px] border border-border/50 bg-gradient-to-br p-4 shadow-sm ${groupAccents[title]}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/80 shadow-sm">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{title}</p>
                        <p className="text-sm font-semibold text-foreground">{items.length || 0}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {items.length ? (
                        items.map((item) => (
                          <TasteChip
                            key={item}
                            label={`${getItemIcon(title, item)} ${item}`}
                            tone="bg-white/85 text-foreground ring-1 ring-black/5"
                          />
                        ))
                      ) : (
                        <TasteChip
                          label="Still learning..."
                          tone="bg-white/80 text-muted-foreground ring-1 ring-border/60"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="pt-2">
              <button
                onClick={() => navigate("/onboarding")}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-white px-4 py-3 text-sm font-semibold text-foreground transition hover:border-foreground btn-press"
              >
                <SwipeIcon className="text-amber-400" />
                <Sparkles className="w-4 h-4 text-amber-400" />
                Update taste profile
              </button>
            </div>
          </div>
        )}

        {activePanel === "swipe" && (
          <div className="space-y-4 rounded-[32px] border border-border/60 bg-card/80 p-5 shadow-sm">
            <div className="overflow-hidden rounded-[28px] bg-gradient-to-br from-[#fff7ef] via-white to-[#f5fff8] p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Swipe game</p>
                  <h2 className="mt-2 text-2xl font-bold text-foreground">Teach it with motion</h2>
                </div>
                <span className="rounded-full border border-orange-500/30 bg-white/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-orange-600">
                  RollaMeal
                </span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Revisit the swipe deck anytime to refresh what you love and tell us when your tastes shift.
              </p>

              <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-[24px] border border-white/70 bg-white/70 p-4 shadow-sm">
                <div className="rounded-[24px] bg-gradient-to-br from-rose-50 to-orange-50 p-4 text-center">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-rose-600">Swipe left</p>
                  <p className="mt-2 text-lg font-bold text-foreground">Pass</p>
                </div>
                <div className="animate-swipe-hint flex flex-col items-center gap-2 px-1 text-amber-500">
                  <SwipeIcon className="h-7 w-7" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">Swipe</span>
                </div>
                <div className="rounded-[24px] bg-gradient-to-br from-emerald-50 to-lime-50 p-4 text-center">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-600">Swipe right</p>
                  <p className="mt-2 text-lg font-bold text-foreground">Keep</p>
                </div>
              </div>

            </div>
            <button
              onClick={() => navigate("/onboarding")}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 btn-press"
            >
              Continue swiping
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <Drawer open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DrawerContent className="max-h-[78vh] rounded-t-[28px]">
          <DrawerHeader className="px-5 pb-2 pt-4 text-left">
            <DrawerTitle className="flex items-center gap-2 text-xl text-foreground">
              <Settings className="h-5 w-5" />
              App settings
            </DrawerTitle>
            <DrawerDescription>
              Quick controls for the app without crowding your profile page.
            </DrawerDescription>
          </DrawerHeader>

          <div className="space-y-3 px-5 pb-2">
            {[
              {
                label: "Notifications",
                value: notificationsEnabled,
                toggle: () => setNotificationsEnabled((prev) => !prev),
              },
              {
                label: "Dietary filters",
                value: dietaryFilters,
                toggle: () => setDietaryFilters((prev) => !prev),
              },
              {
                label: "Dark mode (preview)",
                value: darkMode,
                toggle: () => setDarkMode((prev) => !prev),
              },
            ].map(({ label, value, toggle }) => (
              <button
                key={label}
                onClick={toggle}
                className={`flex w-full items-center justify-between rounded-[22px] border px-4 py-3 text-left text-sm font-semibold transition ${
                  value
                    ? "border-primary/60 bg-primary/10 text-foreground"
                    : "border-border bg-card text-muted-foreground"
                }`}
              >
                <span>{label}</span>
                <span className="text-xs uppercase tracking-[0.3em]">{value ? "On" : "Off"}</span>
              </button>
            ))}
          </div>

          <DrawerFooter className="px-5 pb-5">
            <button
              onClick={() => {
                clearTasteProfile();
                setSettingsOpen(false);
              }}
              className="w-full rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 btn-press"
            >
              Clear preferences
            </button>
            <button
              onClick={() => setSettingsOpen(false)}
              className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground btn-press"
            >
              Done
            </button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </PageShell>
  );
};

export default Profile;
