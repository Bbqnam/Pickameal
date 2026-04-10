export type Cuisine =
  | "Asian"
  | "Vietnamese"
  | "Korean"
  | "Chinese"
  | "Thai"
  | "Japanese"
  | "Western"
  | "Mexican"
  | "Italian"
  | "Middle Eastern"
  | "Mediterranean";
export type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snack";
export type Difficulty = "Easy" | "Medium" | "Hard";
export type CookingTime = "Under 15 min" | "Under 30 min" | "Under 60 min";
export type IngredientCategory = "Protein" | "Vegetables" | "Carbs" | "Extras";

export interface Ingredient {
  name: string;
  category: IngredientCategory;
  image?: string;
  secondaryImage?: string;
}

export interface Recipe {
  id: string;
  title: string;
  cuisine: Cuisine;
  mealType: MealType;
  cookingTime: number; // minutes
  difficulty: Difficulty;
  ingredients: string[];
  instructions: string[];
  image: string;
  tags: string[];
}

export interface Filters {
  cuisine: Cuisine | null;
  cookingTime: CookingTime | null;
  difficulty: Difficulty | null;
  mealType: MealType | null;
  useMostlyMyIngredients: boolean;
}
