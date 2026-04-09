import type { Ingredient, Recipe, Cuisine, MealType, Difficulty, IngredientCategory } from "@/types/recipe";
import { localIngredientImages } from "./localIngredientImages.ts";

const MEALDB_BASE = "https://www.themealdb.com/api/json/v1/1";
const LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");

const categoryHints: Record<IngredientCategory, string[]> = {
  Protein: ["chicken", "beef", "pork", "lamb", "shrimp", "salmon", "tuna", "tofu", "tempeh", "egg", "lentil", "chickpea"],
  Vegetables: ["tomato", "pepper", "onion", "garlic", "carrot", "broccoli", "spinach", "kale", "zucchini", "cabbage", "mushroom", "celery", "cucumber", "eggplant", "pak", "basil"],
  Carbs: ["rice", "noodle", "pasta", "bread", "potato", "quinoa", "couscous", "polenta", "tortilla"],
  Extras: ["cheese", "butter", "cream", "coconut", "lime", "lemon", "oil", "sauce", "honey", "parsley", "cilantro", "pepper", "salt"],
};

export const mealDbIngredientImageBase = "https://www.themealdb.com/images/ingredients";
export const fallbackIngredientImage: string | undefined = undefined;

interface MealDbMeal {
  idMeal: string;
  strMeal: string;
  strMealThumb?: string;
  strArea?: string;
  strCategory?: string;
  strInstructions?: string;
  strTags?: string | null;
  [key: string]: string | null | undefined;
}

interface MealDbResponse {
  meals: MealDbMeal[] | null;
}

async function safeFetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch (error) {
    console.error("API fetch failed", url, error);
    return null;
  }
}

const sanitizeText = (value?: string) => value?.trim().toLowerCase() ?? "";

export const sanitizeIngredientName = (name: string) =>
  name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

interface IngredientImageResolution {
  image: string;
  secondaryImage?: string;
}

const ingredientImageAliases: Record<string, string[]> = {
  sausage: ["sausages", "sausage"],
  "rice-noodle": ["rice_noodles", "noodles"],
  "ramen-noodle": ["ramen_noodles", "noodles"],
  "sweet-potato": ["sweet_potato", "potato"],
  "sweet-potatoes": ["sweet_potato", "potato"],
  "green-bean": ["green_beans", "beans"],
  potato: ["potatoes", "potato"],
  potatoes: ["potatoes", "potato"],
  potatoe: ["potatoes", "potato"],
  tomatoes: ["tomato", "tomatoes"],
  tomatoe: ["tomato", "tomatoes"],
  mushrooms: ["mushroom", "mushrooms"],
  "chicken-breast": ["chicken_breast", "chicken"],
  "chicken-thigh": ["chicken_thighs", "chicken"],
  "ground-beef": ["minced_beef", "beef"],
  "beef-slices": ["beef", "minced_beef"],
  tuna: ["tuna", "salmon"],
  shrimp: ["prawns", "shrimp"],
  mussels: ["mussels", "clams"],
  egg: ["egg", "eggs"],
  chickpeas: ["chickpeas", "peas"],
  "black-beans": ["black_beans", "kidney_beans"],
  "pak-choi": ["pak_choi", "bok_choi"],
  zucchini: ["courgettes", "zucchini"],
  eggplant: ["aubergine", "eggplant"],
  avocado: ["avocado", "olive_oil"],
  peas: ["peas", "mangetout"],
  "pickled-cucumber": ["gherkin", "cucumber"],
  dill: ["dill", "parsley"],
  "bean-sprouts": ["beansprouts", "sprouts"],
  lemongrass: ["lemongrass", "lemon"],
  cilantro: ["coriander", "parsley"],
  mint: ["mint", "parsley"],
  spaghetti: ["spaghetti", "pasta"],
  noodles: ["noodles"],
  bread: ["bread", "bread_roll"],
  tortilla: ["tortilla", "flour_tortilla"],
  baguette: ["baguette", "bread"],
  "rice-paper": ["rice_paper", "rice"],
  "rice-flour": ["rice_flour", "flour"],
  "soy-sauce": ["soy_sauce"],
  "oyster-sauce": ["oyster_sauce"],
  "fish-sauce": ["fish_sauce"],
  "teriyaki-sauce": ["teriyaki_sauce", "soy_sauce"],
  "tomato-sauce": ["tomato_sauce", "tomato"],
  pesto: ["pesto", "basil"],
  "curry-paste": ["curry_paste", "curry_powder"],
  "coconut-milk": ["coconut_milk", "coconut_cream"],
  cream: ["double_cream", "cream"],
  cheese: ["cheese", "cheddar_cheese"],
  butter: ["butter"],
  "black-pepper": ["black_pepper", "pepper"],
  paprika: ["paprika"],
  "smoked-paprika": ["smoked_paprika", "paprika"],
  "chili-flakes": ["chili_flakes", "red_chilli"],
  cumin: ["cumin"],
  "curry-powder": ["curry_powder"],
  turmeric: ["turmeric"],
  oregano: ["oregano"],
  basil: ["basil"],
  thyme: ["thyme"],
  rosemary: ["rosemary"],
  "garlic-powder": ["garlic", "garlic_powder"],
  "onion-powder": ["onion", "onion_powder"],
  breadcrumbs: ["breadcrumbs", "bread"],
  nutmeg: ["nutmeg"],
  "beef-broth": ["beef_stock", "beef"],
  "chicken-broth": ["chicken_stock", "chicken"],
  sugar: ["sugar"],
  salt: ["salt"],
  lemon: ["lemon"],
  mustard: ["mustard"],
  honey: ["honey"],
  "lingonberry-jam": ["jam", "strawberries"],
  ginger: ["ginger"],
  "star-anise": ["star_anise"],
  cloves: ["cloves"],
  "chinese-cinnamon": ["cinnamon", "cassia"],
  vinegar: ["vinegar"],
  herbs: ["mixed_herbs", "parsley"],
  "peanut-sauce": ["peanut_butter", "peanuts"],
  oil: ["olive_oil", "vegetable_oil"],
};

const toMealDbImageSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const dedupeStrings = (items: Array<string | undefined>) => {
  const seen = new Set<string>();
  return items.filter((item): item is string => {
    if (!item || seen.has(item)) return false;
    seen.add(item);
    return true;
  });
};

const getMealDbImageCandidates = (name: string) => {
  const slug = sanitizeIngredientName(name);
  const aliasCandidates = ingredientImageAliases[slug] ?? [];
  const fallbackCandidates = slug
    ? [
        toMealDbImageSlug(name),
        toMealDbImageSlug(slug.replace(/-/g, " ")),
        toMealDbImageSlug(name.split(" ").slice(-1).join(" ")),
      ]
    : [];

  return dedupeStrings([...aliasCandidates, ...fallbackCandidates]).map(
    (candidate) => `${mealDbIngredientImageBase}/${candidate}.png`
  );
};

export function resolveIngredientImage(name: string): IngredientImageResolution {
  const slug = sanitizeIngredientName(name);
  const localLookupKeys = dedupeStrings([slug, ...(slug ? ingredientImageAliases[slug]?.map((value) => value.replace(/_/g, "-")) ?? [] : [])]);
  const localImage = localLookupKeys.map((key) => localIngredientImages[key]).find(Boolean);
  const mealDbImages = getMealDbImageCandidates(name);
  const unsplashImage = slug
    ? `https://source.unsplash.com/900x900/?${encodeURIComponent(name)}`
    : undefined;
  const fallbackImage = mealDbImages[0] ?? unsplashImage ?? fallbackIngredientImage;
  const primaryImage = localImage ?? fallbackImage;
  const secondaryImage = localImage
    ? mealDbImages[0] ?? unsplashImage ?? fallbackIngredientImage
    : mealDbImages[1] ?? unsplashImage ?? fallbackIngredientImage;
  return { image: primaryImage, secondaryImage };
}

function mapMealType(dishTypes: string[] = []): MealType {
  const normalized = dishTypes.map((value) => sanitizeText(value));
  if (normalized.some((v) => v.includes("breakfast"))) return "Breakfast";
  if (normalized.some((v) => v.includes("lunch"))) return "Lunch";
  return "Dinner";
}

const extraAsianKeywords = ["asian", "thai", "chinese", "china", "sichuan", "szechuan", "viet", "vietnamese", "korean", "japanese", "malaysian", "indonesian"];
const mediterraneanKeywords = ["greek", "turkish", "moroccan", "tunisian", "spanish", "portuguese", "croatian"];

function mapCuisine(cuisines: string[] = [], area?: string): Cuisine {
  const candidate = cuisines[0] || area || "Western";
  const normalized = sanitizeText(candidate);
  if (normalized.includes("italian")) return "Italian";
  if (normalized.includes("mexican")) return "Mexican";
  if (normalized.includes("middle eastern")) return "Middle Eastern";
  if (mediterraneanKeywords.some((keyword) => normalized.includes(keyword))) return "Mediterranean";
  if (extraAsianKeywords.some((keyword) => normalized.includes(keyword))) return "Asian";
  return "Western";
}

export const getIngredientImageUrl = (name: string) => {
  return getMealDbImageCandidates(name)[0];
};

export const getSecondaryIngredientImageUrl = (name: string) => {
  return getMealDbImageCandidates(name)[1] ?? "";
};
function guessCategory(name: string): IngredientCategory {
  const lower = sanitizeText(name);
  for (const [category, hints] of Object.entries(categoryHints) as Array<[IngredientCategory, string[]]>) {
    if (hints.some((hint) => lower.includes(hint))) return category;
  }
  return "Extras";
}

async function fetchMealDbRecipes(): Promise<Recipe[]> {
  const recipes: Recipe[] = [];
  for (const letter of LETTERS) {
    const url = `${MEALDB_BASE}/search.php?f=${letter}`;
    const data = await safeFetchJson<MealDbResponse>(url);
    if (!data?.meals) continue;
    data.meals.forEach((meal) => {
      if (!meal.strMealThumb) return;
      const ingredients: string[] = [];
      for (let i = 1; i <= 20; i += 1) {
        const value = meal[`strIngredient${i}`];
        if (value) ingredients.push(value);
      }
      recipes.push({
        id: `mealdb-${meal.idMeal}`,
        title: meal.strMeal,
        cuisine: mapCuisine([meal.strArea], meal.strArea),
        mealType: mapMealType([meal.strCategory]),
        cookingTime: 30,
        difficulty: "Medium",
        ingredients,
        instructions: (meal.strInstructions || "").split(/\n+/).filter(Boolean),
        image: meal.strMealThumb,
        tags: (meal.strTags || "").split(",").map((tag: string) => tag.trim()).filter(Boolean),
      });
    });
  }
  return recipes;
}

function dedupe<T>(items: T[], keyFn: (item: T) => string): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  items.forEach((item) => {
    const key = keyFn(item);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  });
  return result;
}

const curatedRecipes: Recipe[] = [
  {
    id: "local-swedish-meatballs",
    title: "Swedish Meatballs",
    cuisine: "Western",
    mealType: "Dinner",
    cookingTime: 40,
    difficulty: "Medium",
    ingredients: [
      "Ground beef",
      "Onion",
      "Breadcrumbs",
      "Egg",
      "Nutmeg",
      "Butter",
      "Beef broth",
      "Cream",
      "Pickled cucumber",
    ],
    instructions: [
      "Mix beef, finely chopped onion, breadcrumbs, egg, nutmeg, salt, and pepper; shape into small balls.",
      "Brown meatballs in butter then set aside.",
      "Whisk flour into the pan drippings, add beef broth and cream, and simmer until thickened.",
      "Return meatballs to the gravy, simmer until cooked through, and serve with pickled cucumber and lingonberry jam.",
    ],
    image: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=900&q=80",
    tags: ["comfort", "meat"],
  },
  {
    id: "local-swedish-gravlax",
    title: "Gravlax with Dill Mustard Sauce",
    cuisine: "Western",
    mealType: "Lunch",
    cookingTime: 240,
    difficulty: "Easy",
    ingredients: ["Salmon", "Dill", "Sugar", "Salt", "Lemon", "Mustard", "Honey"],
    instructions: [
      "Coat salmon with a cure made from sugar, salt, and chopped dill; let rest in the fridge for 4 hours.",
      "Rinse and pat dry, then slice thinly.",
      "Serve with a sauce whisked from mustard, honey, lemon juice, and dill.",
      "Accompany with crispbread or rye toast.",
    ],
    image: "https://images.unsplash.com/photo-1481391129140-0d0b54586d8a?auto=format&fit=crop&w=1000&q=80",
    tags: ["seafood", "scandinavia"],
  },
  {
    id: "local-swedish-lingonberry-steak",
    title: "Lingonberry Glazed Steak",
    cuisine: "Western",
    mealType: "Dinner",
    cookingTime: 30,
    difficulty: "Medium",
    ingredients: ["Beef", "Garlic", "Rosemary", "Butter", "Lingonberry jam", "Cream"],
    instructions: [
      "Season steak and sear in butter with garlic and rosemary.",
      "Whisk lingonberry jam with cream and a splash of broth while steaks rest.",
      "Drizzle sauce over sliced steak and serve with potato mash.",
      "Garnish with extra lingonberries and thyme.",
    ],
    image: "https://images.unsplash.com/photo-1603078867209-8ddd7b7b3c47?auto=format&fit=crop&w=1000&q=80",
    tags: ["steak", "scandinavian"],
  },
  {
    id: "local-vietnamese-pho-bo",
    title: "Pho Bo (Vietnamese Beef Noodle Soup)",
    cuisine: "Asian",
    mealType: "Dinner",
    cookingTime: 90,
    difficulty: "Medium",
    ingredients: [
      "Beef broth",
      "Rice Noodle",
      "Onion",
      "Ginger",
      "Star anise",
      "Cloves",
      "Chinese cinnamon",
      "Beef slices",
      "Basil",
      "Bean sprouts",
    ],
    instructions: [
      "Char onion and ginger, then simmer with spices in beef broth for 45 minutes.",
      "Blanch rice noodles, portion into bowls, and top with thin beef slices.",
      "Ladle hot broth over the meat to cook through.",
      "Serve with basil, bean sprouts, lime wedges, and chili slices.",
    ],
    image: "https://images.unsplash.com/photo-1447078806655-40579c2520d6?auto=format&fit=crop&w=1000&q=80",
    tags: ["soup", "comfort"],
  },
  {
    id: "local-vietnamese-pho-ga",
    title: "Pho Ga (Vietnamese Chicken Noodle Soup)",
    cuisine: "Asian",
    mealType: "Dinner",
    cookingTime: 75,
    difficulty: "Medium",
    ingredients: [
      "Chicken",
      "Chicken broth",
      "Rice Noodle",
      "Onion",
      "Ginger",
      "Star anise",
      "Lemongrass",
      "Bean sprouts",
      "Cilantro",
    ],
    instructions: [
      "Simmer chicken with onion, ginger, star anise, and lemongrass to make broth.",
      "Shred cooked chicken and set aside.",
      "Cook noodles and top with chicken shreds.",
      "Pour broth over and add herbs, bean sprouts, and lime.",
    ],
    image: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=1000&q=80",
    tags: ["soup", "light"],
  },
  {
    id: "local-vietnamese-banh-mi-pork",
    title: "Bánh mì Thịt Nướng",
    cuisine: "Asian",
    mealType: "Lunch",
    cookingTime: 35,
    difficulty: "Medium",
    ingredients: [
      "Pork",
      "Fish sauce",
      "Soy sauce",
      "Sugar",
      "Pickled carrots",
      "Cucumber",
      "Baguette",
      "Cilantro",
    ],
    instructions: [
      "Marinate pork slices in fish sauce, soy, sugar, and garlic then grill until caramelized.",
      "Slice baguette, spread mayo, layer with pickled vegetables, cucumber, and grilled pork.",
      "Top with fresh cilantro, sliced chili, and a dash of soy.",
      "Serve immediately while bread is crispy.",
    ],
    image: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=1000&q=80",
    tags: ["sandwich", "streetfood"],
  },
  {
    id: "local-vietnamese-bun-cha",
    title: "Bún Chả Hanoi",
    cuisine: "Asian",
    mealType: "Dinner",
    cookingTime: 50,
    difficulty: "Medium",
    ingredients: [
      "Ground beef",
      "Pork",
      "Fish sauce",
      "Sugar",
      "Vinegar",
      "Rice Noodle",
      "Lettuce",
      "Herbs",
      "Pickled carrot",
    ],
    instructions: [
      "Combine ground meats with spices, form into patties, and grill.",
      "Make dipping sauce from fish sauce, lime, sugar, and chili.",
      "Serve grilled meat with rice noodles, herbs, pickled veggies, and sauce.",
      "Wrap everything in lettuce leaves and dip before eating.",
    ],
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80",
    tags: ["grill", "herbs"],
  },
  {
    id: "local-vietnamese-goi-cuon",
    title: "Gỏi Cuốn (Vietnamese Summer Rolls)",
    cuisine: "Asian",
    mealType: "Snack",
    cookingTime: 25,
    difficulty: "Easy",
    ingredients: [
      "Rice paper",
      "Shrimp",
      "Rice Noodle",
      "Lettuce",
      "Mint",
      "Cilantro",
      "Peanut sauce",
    ],
    instructions: [
      "Soak rice paper until pliable.",
      "Layer lettuce, herbs, cooked shrimp, and noodles, then roll tightly.",
      "Serve with hoisin-peanut dipping sauce.",
      "Repeat with remaining ingredients.",
    ],
    image: "https://images.unsplash.com/photo-1523986371872-9d3ba2e2a3b2?auto=format&fit=crop&w=900&q=80",
    tags: ["fresh", "appetizer"],
  },
  {
    id: "local-vietnamese-banh-xeo",
    title: "Bánh Xèo (Vietnamese Crispy Pancakes)",
    cuisine: "Asian",
    mealType: "Dinner",
    cookingTime: 40,
    difficulty: "Medium",
    ingredients: [
      "Rice flour",
      "Turmeric",
      "Shrimp",
      "Pork",
      "Bean sprouts",
      "Coconut milk",
      "Lettuce",
    ],
    instructions: [
      "Whisk rice flour, coconut milk, water, and turmeric into batter.",
      "Pour thin layer into hot oiled skillet, add pork, shrimp, and sprouts, fold when crispy.",
      "Serve with herbs, lettuce, and dipping sauce.",
      "Break into pieces and wrap with lettuce before dipping.",
    ],
    image: "https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=900&q=80",
    tags: ["crispy", "streetfood"],
  },
];

export async function loadRecipes(): Promise<Recipe[]> {
  const mealDb = await fetchMealDbRecipes();
  return dedupe(
    [...curatedRecipes, ...mealDb],
    (recipe) => recipe.title.toLowerCase()
  );
}

export async function loadIngredients(): Promise<Ingredient[]> {
  const recipes = await loadRecipes();
  const map = new Map<string, Ingredient>();
  recipes.forEach((recipe) => {
    recipe.ingredients.forEach((name) => {
      const normalized = sanitizeText(name);
      if (!normalized) return;
      if (map.has(normalized)) return;
      const { image, secondaryImage } = resolveIngredientImage(name);
      map.set(normalized, {
        name,
        category: guessCategory(name),
        image,
        secondaryImage,
      });
    });
  });
  return Array.from(map.values());
}
