import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/context/AppContext";
import BottomNav from "@/components/BottomNav";
import Index from "./pages/Index";
import Ingredients from "./pages/Ingredients";
import FiltersPage from "./pages/FiltersPage";
import Results from "./pages/Results";
import RecipeDetail from "./pages/RecipeDetail";
import SavedRecipes from "./pages/SavedRecipes";
import RandomPicker from "./pages/RandomPicker";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppProvider>
          <div className="max-w-lg mx-auto min-h-screen relative">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/ingredients" element={<Ingredients />} />
              <Route path="/filters" element={<FiltersPage />} />
              <Route path="/results" element={<Results />} />
              <Route path="/recipe/:id" element={<RecipeDetail />} />
              <Route path="/saved" element={<SavedRecipes />} />
              <Route path="/random" element={<RandomPicker />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNav />
          </div>
        </AppProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
