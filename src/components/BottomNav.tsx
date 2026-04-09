import { Home, Search, Heart, Shuffle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Search, label: "Pick", path: "/ingredients" },
  { icon: Heart, label: "Saved", path: "/saved" },
  { icon: Shuffle, label: "Random", path: "/random" },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-4">
        {navItems.map(({ icon: Icon, label, path }) => {
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
              <Icon className={`w-5 h-5 transition-transform duration-200 ${active ? 'scale-110' : ''}`} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
