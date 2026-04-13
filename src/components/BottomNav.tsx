import { Home, Search, Heart, Dice3, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const navItems = [
  {
    icon: Home,
    label: "Home",
    path: "/",
    activeClasses: "text-emerald-600 bg-emerald-500/14 ring-1 ring-emerald-500/20",
    inactiveClasses: "text-emerald-500 bg-emerald-500/10",
  },
  {
    icon: Search,
    label: "Pick",
    path: "/ingredients",
    activeClasses: "text-sky-600 bg-sky-500/14 ring-1 ring-sky-500/20",
    inactiveClasses: "text-sky-500 bg-sky-500/10",
  },
  {
    icon: Dice3,
    label: "RollaMeal",
    path: "/rollameal",
    activeClasses: "text-orange-600 bg-orange-500/14 ring-1 ring-orange-500/20",
    inactiveClasses: "text-orange-500 bg-orange-500/10",
  },
  {
    icon: Heart,
    label: "Saved",
    path: "/saved",
    activeClasses: "text-rose-600 bg-rose-500/14 ring-1 ring-rose-500/20",
    inactiveClasses: "text-rose-500 bg-rose-500/10",
  },
  {
    icon: User,
    label: "Profile",
    path: "/profile",
    activeClasses: "text-violet-600 bg-violet-500/14 ring-1 ring-violet-500/20",
    inactiveClasses: "text-violet-500 bg-violet-500/10",
  },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border pb-[env(safe-area-inset-bottom,0px)]">
      <div className="mx-auto flex max-w-2xl items-center justify-around px-4 py-2 lg:max-w-4xl">
        {navItems.map(({ icon: Icon, label, path, activeClasses, inactiveClasses }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`relative flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-xl transition-all duration-200 btn-press ${
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {active && (
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full bg-primary" />
              )}
              <span
                className={`mb-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-200 ${
                  active ? activeClasses : inactiveClasses
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-200 ${active ? "scale-110" : ""}`} />
              </span>
              <span className={`text-[10px] font-medium ${active ? "text-foreground" : "text-muted-foreground"}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
