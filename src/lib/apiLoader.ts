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

const instructionPrefixPattern = /^\s*(?:step\s*)?\d+\s*[\).:-]?\s*/i;

function normalizeInstructionStep(step: string): string {
  return step
    .replace(instructionPrefixPattern, "")
    .replace(/^\s*[-•]\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeInstructions(instructions?: string | string[]): string[] {
  const raw = Array.isArray(instructions) ? instructions.join("\n") : instructions ?? "";

  return raw
    .replace(/\r\n?/g, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/([.!?])\s+(?=step\s*\d+\s*[\).:-]?\s*)/gi, "$1\n")
    .replace(/([.!?])\s+(?=\d+\s*[\).:-]\s+[A-Z])/g, "$1\n")
    .replace(/\n+\s*(?=step\s*\d+\s*[\).:-]?\s*)/gi, "\n")
    .split(/\n+/)
    .map(normalizeInstructionStep)
    .filter((step) => step.length > 0);
}

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

const vietnameseKeywords = ["viet", "vietnamese"];
const koreanKeywords = ["korean"];
const chineseKeywords = ["chinese", "china", "sichuan", "szechuan", "cantonese"];
const thaiKeywords = ["thai"];
const japaneseKeywords = ["japanese", "japan"];
const extraAsianKeywords = ["asian", "malaysian", "indonesian", "filipino", "singaporean"];
const mediterraneanKeywords = ["greek", "turkish", "moroccan", "tunisian", "spanish", "portuguese", "croatian"];

function mapCuisine(cuisines: string[] = [], area?: string): Cuisine {
  const candidate = cuisines[0] || area || "Western";
  const normalized = sanitizeText(candidate);
  if (vietnameseKeywords.some((keyword) => normalized.includes(keyword))) return "Vietnamese";
  if (koreanKeywords.some((keyword) => normalized.includes(keyword))) return "Korean";
  if (chineseKeywords.some((keyword) => normalized.includes(keyword))) return "Chinese";
  if (thaiKeywords.some((keyword) => normalized.includes(keyword))) return "Thai";
  if (japaneseKeywords.some((keyword) => normalized.includes(keyword))) return "Japanese";
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
        instructions: normalizeInstructions(meal.strInstructions),
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
    cuisine: "Vietnamese",
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
    cuisine: "Vietnamese",
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
    cuisine: "Vietnamese",
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
    cuisine: "Vietnamese",
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
    cuisine: "Vietnamese",
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
    cuisine: "Vietnamese",
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
  {
    id: "local-creamy-chicken-thigh-pasta-bake",
    title: "Creamy Chicken Thigh Pasta Bake",
    cuisine: "Western",
    mealType: "Dinner",
    cookingTime: 45,
    difficulty: "Easy",
    ingredients: [
      "Chicken thigh",
      "Pasta",
      "Tomato sauce",
      "Cherry tomato",
      "Bell pepper",
      "Cheese",
      "Oregano",
      "Chili flakes",
      "Onion powder",
      "Black pepper",
    ],
    instructions: [
      "Brown seasoned chicken thigh pieces in a skillet and set aside.",
      "Cook pasta until just shy of al dente, then toss with tomato sauce, sliced peppers, and halved cherry tomatoes.",
      "Stir in oregano, chili flakes, onion powder, black pepper, and grated cheese.",
      "Nestle chicken back in, bake until bubbling, and finish with extra cheese on top.",
    ],
    image: "https://images.unsplash.com/photo-1515516969-d4008cc6241a?auto=format&fit=crop&w=1000&q=80",
    tags: ["baked", "comfort"],
  },
  {
    id: "local-paprika-chicken-breast-tray-bake",
    title: "Paprika Chicken Breast Tray Bake",
    cuisine: "Western",
    mealType: "Dinner",
    cookingTime: 40,
    difficulty: "Easy",
    ingredients: [
      "Chicken breast",
      "Potatoes",
      "Carrot",
      "Broccoli",
      "Cauliflower",
      "Paprika",
      "Thyme",
      "Garlic powder",
      "Onion powder",
    ],
    instructions: [
      "Cut potatoes and carrots into chunks and toss with paprika, thyme, garlic powder, and onion powder.",
      "Spread vegetables on a tray and roast until they start to soften.",
      "Add chicken breast and broccoli florets, then roast until the chicken is cooked through.",
      "Rest briefly and serve straight from the tray for an easy weeknight dinner.",
    ],
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1000&q=80",
    tags: ["traybake", "family"],
  },
  {
    id: "local-teriyaki-tofu-ramen-stir-fry",
    title: "Teriyaki Tofu Ramen Stir-Fry",
    cuisine: "Japanese",
    mealType: "Dinner",
    cookingTime: 25,
    difficulty: "Easy",
    ingredients: [
      "Tofu",
      "Ramen noodles",
      "Pak choi",
      "Mushroom",
      "Green beans",
      "Teriyaki sauce",
      "Oyster sauce",
      "Chili",
      "Cabbage",
    ],
    instructions: [
      "Crisp tofu cubes in a hot pan until golden on all sides.",
      "Cook ramen noodles and set them aside while you stir-fry mushrooms, green beans, cabbage, and pak choi.",
      "Add tofu back with teriyaki sauce, oyster sauce, and sliced chili.",
      "Toss through the noodles and serve immediately while glossy and hot.",
    ],
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=80",
    tags: ["stir-fry", "quick"],
  },
  {
    id: "local-halloumi-pesto-veggie-wraps",
    title: "Halloumi Pesto Veggie Wraps",
    cuisine: "Mediterranean",
    mealType: "Lunch",
    cookingTime: 20,
    difficulty: "Easy",
    ingredients: [
      "Halloumi",
      "Tortilla",
      "Pesto",
      "Spinach",
      "Zucchini",
      "Avocado",
      "Tomato",
      "Cherry tomato",
    ],
    instructions: [
      "Pan-fry halloumi slices until golden and lightly crisp on the edges.",
      "Warm tortillas and spread each one with pesto.",
      "Layer spinach, ribbons of zucchini, avocado, tomato, cherry tomatoes, and halloumi.",
      "Roll tightly and slice in half for an easy lunch wrap.",
    ],
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=1000&q=80",
    tags: ["wrap", "fresh"],
  },
  {
    id: "local-smoky-sausage-bacon-hash",
    title: "Smoky Sausage and Bacon Hash",
    cuisine: "Western",
    mealType: "Dinner",
    cookingTime: 35,
    difficulty: "Easy",
    ingredients: [
      "Sausage",
      "Bacon",
      "Sweet potato",
      "Kale",
      "Corn",
      "Smoked paprika",
      "Black pepper",
    ],
    instructions: [
      "Crisp bacon in a skillet, then brown sliced sausage in the rendered fat.",
      "Add diced sweet potato and cook until caramelized and tender.",
      "Fold in corn, chopped kale, smoked paprika, and black pepper.",
      "Cook until the greens wilt and the pan is sizzling, then serve straight away.",
    ],
    image: "https://images.unsplash.com/photo-1512179726328-8695ff4b7397?auto=format&fit=crop&w=1000&q=80",
    tags: ["skillet", "smoky"],
  },
  {
    id: "local-tuna-sweetcorn-spaghetti",
    title: "Tuna Sweetcorn Spaghetti",
    cuisine: "Western",
    mealType: "Dinner",
    cookingTime: 20,
    difficulty: "Easy",
    ingredients: [
      "Tuna",
      "Spaghetti",
      "Corn",
      "Peas",
      "Tomato sauce",
      "Chili flakes",
      "Black pepper",
    ],
    instructions: [
      "Boil spaghetti until tender while warming tomato sauce in a separate pan.",
      "Flake in tuna and stir through corn and peas until heated through.",
      "Season the sauce with chili flakes and black pepper.",
      "Toss with spaghetti and serve with extra pepper on top.",
    ],
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=1000&q=80",
    tags: ["pasta", "pantry"],
  },
  {
    id: "local-coconut-curry-white-fish-noodles",
    title: "Coconut Curry White Fish Noodles",
    cuisine: "Thai",
    mealType: "Dinner",
    cookingTime: 30,
    difficulty: "Medium",
    ingredients: [
      "White fish",
      "Noodles",
      "Curry paste",
      "Coconut milk",
      "Curry powder",
      "Cumin",
      "Eggplant",
      "Bell pepper",
    ],
    instructions: [
      "Simmer curry paste, curry powder, and cumin in a splash of oil until fragrant.",
      "Pour in coconut milk and add sliced eggplant and bell pepper.",
      "Poach chunks of white fish in the sauce until just cooked through.",
      "Serve over noodles with plenty of curry broth spooned on top.",
    ],
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80",
    tags: ["curry", "seafood"],
  },
  {
    id: "local-mussels-rice-skillet",
    title: "Mussels Rice Skillet",
    cuisine: "Mediterranean",
    mealType: "Dinner",
    cookingTime: 35,
    difficulty: "Medium",
    ingredients: [
      "Mussels",
      "Rice",
      "Shallot",
      "Tomato",
      "Chili",
      "Bell pepper",
      "Green beans",
    ],
    instructions: [
      "Saute chopped shallot, chili, tomato, and bell pepper until softened.",
      "Stir in rice and a splash of stock or water, then simmer until nearly tender.",
      "Add mussels and green beans, cover, and cook until the mussels open.",
      "Serve straight from the pan while the rice is still glossy and hot.",
    ],
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1000&q=80",
    tags: ["one-pan", "seafood"],
  },
  {
    id: "local-tempeh-lentil-black-bean-chili",
    title: "Tempeh Lentil Black Bean Chili",
    cuisine: "Western",
    mealType: "Dinner",
    cookingTime: 40,
    difficulty: "Easy",
    ingredients: [
      "Tempeh",
      "Lentils",
      "Black beans",
      "Tomato sauce",
      "Chili",
      "Cumin",
      "Paprika",
    ],
    instructions: [
      "Crumble tempeh into a pot and brown it until slightly crisp.",
      "Add lentils, black beans, tomato sauce, chili, cumin, and paprika.",
      "Simmer gently until the lentils are tender and the chili has thickened.",
      "Serve hot with herbs or a spoonful of yogurt if you like.",
    ],
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=80",
    tags: ["plant-based", "hearty"],
  },
  {
    id: "local-loaded-sweet-potatoes-chickpeas",
    title: "Loaded Sweet Potatoes with Chickpeas",
    cuisine: "Mediterranean",
    mealType: "Lunch",
    cookingTime: 40,
    difficulty: "Easy",
    ingredients: [
      "Sweet potatoes",
      "Chickpeas",
      "Cheese",
      "Chili",
      "Oregano",
    ],
    instructions: [
      "Bake sweet potatoes until soft all the way through.",
      "Warm chickpeas with chili and oregano in a small pan.",
      "Split the baked potatoes and pile in the chickpeas.",
      "Finish with cheese on top and return to the oven briefly to melt.",
    ],
    image: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1000&q=80",
    tags: ["vegetarian", "baked"],
  },
  {
    id: "local-plant-based-stuffed-peppers",
    title: "Plant-Based Stuffed Peppers",
    cuisine: "Western",
    mealType: "Dinner",
    cookingTime: 50,
    difficulty: "Medium",
    ingredients: [
      "Minced plant based meat",
      "Bell pepper",
      "Rice",
      "Tomato sauce",
      "Cheese",
      "Onion powder",
    ],
    instructions: [
      "Cook rice until tender and brown the plant-based mince in a pan.",
      "Mix the mince with tomato sauce, onion powder, cooked rice, and a handful of cheese.",
      "Fill halved bell peppers with the mixture and bake until the peppers soften.",
      "Top with more cheese for the final few minutes until bubbling.",
    ],
    image: "https://images.unsplash.com/photo-1604909052743-94e838986d24?auto=format&fit=crop&w=1000&q=80",
    tags: ["stuffed", "weeknight"],
  },
  {
    id: "local-avocado-cheese-toast",
    title: "Avocado Cheese Toast",
    cuisine: "Western",
    mealType: "Lunch",
    cookingTime: 10,
    difficulty: "Easy",
    ingredients: [
      "Bread",
      "Avocado",
      "Tomato",
      "Cheese",
      "Black pepper",
    ],
    instructions: [
      "Toast the bread until crisp and golden.",
      "Mash avocado with a pinch of black pepper and spread it over the toast.",
      "Top with sliced tomato and grated cheese.",
      "Serve open-faced while the toast is still warm.",
    ],
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1000&q=80",
    tags: ["toast", "quick"],
  },
  {
    id: "local-vietnamese-lemongrass-chicken-rice-bowl",
    title: "Vietnamese Lemongrass Chicken Rice Bowl",
    cuisine: "Vietnamese",
    mealType: "Dinner",
    cookingTime: 35,
    difficulty: "Easy",
    ingredients: [
      "Chicken thigh",
      "Rice",
      "Lemongrass",
      "Fish sauce",
      "Sugar",
      "Cucumber",
      "Pickled carrots",
      "Cilantro",
    ],
    instructions: [
      "Marinate chicken thigh with finely chopped lemongrass, fish sauce, sugar, and garlic.",
      "Cook rice while the chicken rests in the marinade.",
      "Pan-sear the chicken until caramelized and cooked through, then slice it thinly.",
      "Serve over rice with cucumber, pickled carrots, and cilantro.",
    ],
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1000&q=80",
    tags: ["rice-bowl", "fresh"],
  },
  {
    id: "local-vietnamese-caramelized-tofu-noodle-bowl",
    title: "Vietnamese Caramelized Tofu Noodle Bowl",
    cuisine: "Vietnamese",
    mealType: "Lunch",
    cookingTime: 25,
    difficulty: "Easy",
    ingredients: [
      "Tofu",
      "Rice Noodle",
      "Soy sauce",
      "Sugar",
      "Bean sprouts",
      "Cucumber",
      "Mint",
      "Pickled carrots",
    ],
    instructions: [
      "Crisp tofu in a pan and glaze it with soy sauce and a little sugar until lightly caramelized.",
      "Cook rice noodles and rinse briefly to keep them springy.",
      "Layer noodles in bowls with bean sprouts, cucumber, mint, and pickled carrots.",
      "Top with the tofu and spoon over any remaining glaze from the pan.",
    ],
    image: "https://images.unsplash.com/photo-1518131678677-a3c3f015d8e9?auto=format&fit=crop&w=1000&q=80",
    tags: ["noodle-bowl", "light"],
  },
  {
    id: "local-korean-bulgogi-style-beef-bowl",
    title: "Korean Bulgogi-Style Beef Bowl",
    cuisine: "Korean",
    mealType: "Dinner",
    cookingTime: 25,
    difficulty: "Easy",
    ingredients: [
      "Beef slices",
      "Rice",
      "Soy sauce",
      "Honey",
      "Garlic",
      "Onion",
      "Cucumber",
      "Pickled carrots",
    ],
    instructions: [
      "Marinate beef slices in soy sauce, honey, garlic, and thinly sliced onion.",
      "Cook rice while the beef marinates.",
      "Sear the beef quickly in a very hot pan so the edges caramelize.",
      "Serve over rice with cucumber and pickled carrots on the side.",
    ],
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80",
    tags: ["rice-bowl", "savory"],
  },
  {
    id: "local-korean-soy-garlic-chicken",
    title: "Korean Soy Garlic Chicken",
    cuisine: "Korean",
    mealType: "Dinner",
    cookingTime: 30,
    difficulty: "Easy",
    ingredients: [
      "Chicken breast",
      "Rice",
      "Soy sauce",
      "Honey",
      "Garlic",
      "Chili flakes",
      "Cucumber",
      "Lettuce",
    ],
    instructions: [
      "Slice chicken breast and cook it in a hot pan until browned.",
      "Add soy sauce, honey, garlic, and chili flakes to create a glossy coating.",
      "Steam or reheat rice while the sauce thickens around the chicken.",
      "Serve with lettuce and cucumber for a fresh, crisp contrast.",
    ],
    image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=1000&q=80",
    tags: ["glazed", "weeknight"],
  },
  {
    id: "local-korean-tempeh-rice-bowl",
    title: "Korean Tempeh Rice Bowl",
    cuisine: "Korean",
    mealType: "Lunch",
    cookingTime: 25,
    difficulty: "Easy",
    ingredients: [
      "Tempeh",
      "Rice",
      "Soy sauce",
      "Honey",
      "Chili",
      "Spinach",
      "Carrot",
      "Egg",
    ],
    instructions: [
      "Pan-fry slices of tempeh until deeply golden on both sides.",
      "Glaze them with soy sauce, honey, and chopped chili.",
      "Serve over rice with wilted spinach, shredded carrot, and a fried egg.",
      "Mix everything together in the bowl before eating.",
    ],
    image: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1000&q=80",
    tags: ["bowl", "hearty"],
  },
  {
    id: "local-chinese-beef-broccoli-oyster-noodles",
    title: "Chinese Beef and Broccoli Oyster Noodles",
    cuisine: "Chinese",
    mealType: "Dinner",
    cookingTime: 20,
    difficulty: "Easy",
    ingredients: [
      "Beef slices",
      "Noodles",
      "Broccoli",
      "Oyster sauce",
      "Soy sauce",
      "Garlic",
      "Onion",
    ],
    instructions: [
      "Cook noodles and reserve them while you stir-fry the beef quickly in a hot pan.",
      "Add broccoli, onion, and garlic and cook until bright and just tender.",
      "Stir in oyster sauce and soy sauce to make a glossy stir-fry sauce.",
      "Toss the noodles through the pan and serve immediately.",
    ],
    image: "https://images.unsplash.com/photo-1617622141573-2d5fa2f2fc6d?auto=format&fit=crop&w=1000&q=80",
    tags: ["stir-fry", "noodles"],
  },
  {
    id: "local-chinese-tomato-egg-rice",
    title: "Chinese Tomato Egg Rice",
    cuisine: "Chinese",
    mealType: "Lunch",
    cookingTime: 15,
    difficulty: "Easy",
    ingredients: [
      "Egg",
      "Tomato",
      "Rice",
      "Onion",
      "Soy sauce",
      "Sugar",
    ],
    instructions: [
      "Scramble eggs gently and set them aside while still soft.",
      "Cook tomato and onion in a pan until saucy and lightly sweetened with a pinch of sugar.",
      "Fold the eggs back into the tomato mixture and season with a dash of soy sauce.",
      "Serve over hot rice for a simple comforting meal.",
    ],
    image: "https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=1000&q=80",
    tags: ["comfort", "quick"],
  },
  {
    id: "local-chinese-kung-pao-style-chicken",
    title: "Kung Pao-Style Chicken",
    cuisine: "Chinese",
    mealType: "Dinner",
    cookingTime: 25,
    difficulty: "Medium",
    ingredients: [
      "Chicken thigh",
      "Bell pepper",
      "Chili",
      "Soy sauce",
      "Vinegar",
      "Peanut sauce",
      "Rice",
    ],
    instructions: [
      "Brown chicken thigh pieces in a hot pan until lightly crisp.",
      "Add bell pepper and chopped chili and stir-fry briefly.",
      "Whisk soy sauce, vinegar, and peanut sauce into a punchy glaze and coat the chicken.",
      "Serve over rice while the sauce is still sticky and glossy.",
    ],
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=1000&q=80",
    tags: ["spicy", "stir-fry"],
  },
  {
    id: "local-thai-basil-beef-rice",
    title: "Thai Basil Beef Rice",
    cuisine: "Thai",
    mealType: "Dinner",
    cookingTime: 20,
    difficulty: "Easy",
    ingredients: [
      "Ground beef",
      "Rice",
      "Basil",
      "Chili",
      "Garlic",
      "Fish sauce",
      "Soy sauce",
    ],
    instructions: [
      "Brown ground beef in a hot skillet until deeply caramelized.",
      "Add chili and garlic, then season with fish sauce and soy sauce.",
      "Fold in torn basil leaves right at the end so they stay fragrant.",
      "Serve spooned over hot rice.",
    ],
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1000&q=80",
    tags: ["spicy", "fast"],
  },
  {
    id: "local-thai-red-curry-shrimp",
    title: "Thai Red Curry Shrimp",
    cuisine: "Thai",
    mealType: "Dinner",
    cookingTime: 25,
    difficulty: "Easy",
    ingredients: [
      "Shrimp",
      "Curry paste",
      "Coconut milk",
      "Bell pepper",
      "Green beans",
      "Rice",
      "Basil",
    ],
    instructions: [
      "Fry curry paste briefly until fragrant, then pour in coconut milk.",
      "Add bell pepper and green beans and simmer until just tender.",
      "Poach shrimp in the curry until pink and cooked through.",
      "Serve with rice and basil scattered over the top.",
    ],
    image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=1000&q=80",
    tags: ["curry", "seafood"],
  },
  {
    id: "local-thai-peanut-tofu-noodles",
    title: "Thai Peanut Tofu Noodles",
    cuisine: "Thai",
    mealType: "Lunch",
    cookingTime: 20,
    difficulty: "Easy",
    ingredients: [
      "Tofu",
      "Rice Noodle",
      "Peanut sauce",
      "Bean sprouts",
      "Carrot",
      "Cucumber",
      "Chili",
    ],
    instructions: [
      "Cook rice noodles and rinse briefly so they stay springy.",
      "Sear tofu cubes until golden and crisp.",
      "Toss noodles with peanut sauce, then add bean sprouts, carrot, cucumber, and chili.",
      "Top with the tofu and serve immediately.",
    ],
    image: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=1000&q=80",
    tags: ["noodles", "nutty"],
  },
  {
    id: "local-japanese-teriyaki-salmon-bowl",
    title: "Japanese Teriyaki Salmon Bowl",
    cuisine: "Japanese",
    mealType: "Dinner",
    cookingTime: 25,
    difficulty: "Easy",
    ingredients: [
      "Salmon",
      "Rice",
      "Teriyaki sauce",
      "Cucumber",
      "Avocado",
      "Pickled cucumber",
    ],
    instructions: [
      "Roast or pan-sear salmon until just cooked through and flaky.",
      "Glaze it with teriyaki sauce in the final minute of cooking.",
      "Serve over rice with cucumber, avocado, and pickled cucumber.",
      "Spoon any extra teriyaki from the pan over the bowl before serving.",
    ],
    image: "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1000&q=80",
    tags: ["rice-bowl", "glazed"],
  },
  {
    id: "local-japanese-chicken-katsu-curry",
    title: "Japanese Chicken Katsu Curry",
    cuisine: "Japanese",
    mealType: "Dinner",
    cookingTime: 45,
    difficulty: "Medium",
    ingredients: [
      "Chicken breast",
      "Breadcrumbs",
      "Egg",
      "Rice",
      "Curry powder",
      "Onion",
      "Carrot",
      "Potatoes",
    ],
    instructions: [
      "Bread chicken breast with egg and breadcrumbs, then fry or bake until crisp.",
      "Cook onion, carrot, and potatoes until soft, then season with curry powder and simmer into a smooth sauce.",
      "Slice the crispy chicken into strips.",
      "Serve the katsu over rice with the curry sauce spooned alongside.",
    ],
    image: "https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=1000&q=80",
    tags: ["crispy", "curry"],
  },
  {
    id: "local-japanese-shrimp-rice-paper-rolls",
    title: "Japanese-Style Shrimp Rice Paper Rolls",
    cuisine: "Japanese",
    mealType: "Snack",
    cookingTime: 20,
    difficulty: "Easy",
    ingredients: [
      "Shrimp",
      "Rice paper",
      "Rice",
      "Cucumber",
      "Avocado",
      "Soy sauce",
    ],
    instructions: [
      "Cook the shrimp and cool them slightly before assembling the rolls.",
      "Soften rice paper sheets one at a time in warm water.",
      "Add a small layer of rice, cucumber, avocado, and shrimp, then roll tightly.",
      "Slice and serve with soy sauce for dipping.",
    ],
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1000&q=80",
    tags: ["fresh", "rolls"],
  },
];

export async function loadRecipes(): Promise<Recipe[]> {
  const mealDb = await fetchMealDbRecipes();
  return dedupe(
    [...curatedRecipes, ...mealDb],
    (recipe) => recipe.title.toLowerCase()
  ).map((recipe) => ({
    ...recipe,
    instructions: normalizeInstructions(recipe.instructions),
  }));
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
