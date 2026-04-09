import { Recipe } from "@/types/recipe";

export const recipes: Recipe[] = [
  {
    id: "1",
    title: "Chicken Stir Fry",
    cuisine: "Asian",
    mealType: "Dinner",
    cookingTime: 20,
    difficulty: "Easy",
    ingredients: ["Chicken", "Bell Pepper", "Onion", "Garlic", "Soy Sauce", "Rice", "Carrot"],
    instructions: [
      "Slice chicken breast into thin strips and season with salt and pepper.",
      "Heat oil in a wok over high heat.",
      "Stir fry chicken until golden, about 4 minutes. Set aside.",
      "Add sliced vegetables and stir fry for 3 minutes.",
      "Return chicken, add soy sauce, and toss together.",
      "Serve over steamed rice."
    ],
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&h=400&fit=crop",
    tags: ["quick", "healthy", "high-protein"]
  },
  {
    id: "2",
    title: "Classic Pasta Carbonara",
    cuisine: "Italian",
    mealType: "Dinner",
    cookingTime: 25,
    difficulty: "Medium",
    ingredients: ["Pasta", "Egg", "Cheese", "Garlic", "Cream", "Onion"],
    instructions: [
      "Cook pasta in salted boiling water until al dente.",
      "Whisk eggs with grated cheese and cream.",
      "Sauté diced onion and garlic in olive oil.",
      "Drain pasta, reserving some pasta water.",
      "Toss hot pasta with egg mixture off heat, stirring quickly.",
      "Add pasta water as needed for silky sauce. Serve immediately."
    ],
    image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&h=400&fit=crop",
    tags: ["comfort-food", "classic", "creamy"]
  },
  {
    id: "3",
    title: "Beef Tacos",
    cuisine: "Mexican",
    mealType: "Dinner",
    cookingTime: 30,
    difficulty: "Easy",
    ingredients: ["Beef", "Onion", "Tomato", "Chili", "Cheese", "Lime", "Garlic"],
    instructions: [
      "Brown ground beef with diced onion and garlic.",
      "Add chili powder, cumin, and salt.",
      "Dice tomato for fresh salsa, mix with lime juice.",
      "Warm tortillas in a dry pan.",
      "Assemble tacos with beef, salsa, and cheese.",
      "Squeeze lime over top and serve."
    ],
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop",
    tags: ["mexican", "quick", "crowd-pleaser"]
  },
  {
    id: "4",
    title: "Salmon Teriyaki Bowl",
    cuisine: "Asian",
    mealType: "Dinner",
    cookingTime: 25,
    difficulty: "Medium",
    ingredients: ["Salmon", "Rice", "Soy Sauce", "Broccoli", "Carrot", "Garlic"],
    instructions: [
      "Make teriyaki glaze: mix soy sauce, honey, garlic, and ginger.",
      "Cook rice according to package instructions.",
      "Pan-sear salmon fillets skin-side down for 4 minutes.",
      "Flip, brush with teriyaki glaze, cook 3 more minutes.",
      "Steam broccoli and julienne carrots.",
      "Assemble bowl with rice, salmon, and vegetables. Drizzle glaze."
    ],
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&h=400&fit=crop",
    tags: ["healthy", "bowl", "omega-3"]
  },
  {
    id: "5",
    title: "Mushroom Risotto",
    cuisine: "Italian",
    mealType: "Dinner",
    cookingTime: 40,
    difficulty: "Medium",
    ingredients: ["Rice", "Mushroom", "Onion", "Garlic", "Cheese", "Butter", "Cream"],
    instructions: [
      "Sauté sliced mushrooms in butter until golden. Set aside.",
      "Cook diced onion and garlic in the same pan.",
      "Add arborio rice, stir to coat in butter.",
      "Add warm broth one ladle at a time, stirring constantly.",
      "Continue for 18-20 minutes until rice is creamy.",
      "Fold in mushrooms, cheese, and cream. Season and serve."
    ],
    image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600&h=400&fit=crop",
    tags: ["vegetarian", "comfort-food", "creamy"]
  },
  {
    id: "6",
    title: "Egg Fried Rice",
    cuisine: "Asian",
    mealType: "Lunch",
    cookingTime: 15,
    difficulty: "Easy",
    ingredients: ["Egg", "Rice", "Onion", "Garlic", "Soy Sauce", "Carrot", "Pak Choi"],
    instructions: [
      "Use day-old cold rice for best results.",
      "Scramble eggs in a hot wok, break into pieces. Set aside.",
      "Stir fry diced carrot, pak choi, and onion.",
      "Add rice, breaking up clumps. Toss on high heat.",
      "Add soy sauce and return eggs to the wok.",
      "Toss everything together and serve hot."
    ],
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&h=400&fit=crop",
    tags: ["quick", "budget", "leftover-friendly"]
  },
  {
    id: "7",
    title: "Chicken Fajitas",
    cuisine: "Mexican",
    mealType: "Dinner",
    cookingTime: 25,
    difficulty: "Easy",
    ingredients: ["Chicken", "Bell Pepper", "Onion", "Chili", "Lime", "Tomato", "Cheese"],
    instructions: [
      "Slice chicken and marinate with chili, lime, and cumin.",
      "Slice bell peppers and onions into strips.",
      "Cook chicken in a hot skillet until charred.",
      "Add peppers and onions, cook until softened.",
      "Warm tortillas and prepare toppings.",
      "Serve with cheese, salsa, and lime wedges."
    ],
    image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&h=400&fit=crop",
    tags: ["mexican", "fun", "family"]
  },
  {
    id: "8",
    title: "Tofu Pad Thai",
    cuisine: "Asian",
    mealType: "Dinner",
    cookingTime: 30,
    difficulty: "Medium",
    ingredients: ["Tofu", "Noodles", "Egg", "Garlic", "Lime", "Carrot", "Onion", "Chili"],
    instructions: [
      "Soak rice noodles in warm water for 20 minutes.",
      "Press and cube tofu, fry until golden.",
      "Make pad thai sauce with tamarind, sugar, and fish sauce.",
      "Stir fry garlic, then push aside and scramble egg.",
      "Add drained noodles and sauce, toss with tofu.",
      "Garnish with lime, crushed peanuts, and chili flakes."
    ],
    image: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600&h=400&fit=crop",
    tags: ["vegetarian", "noodles", "thai"]
  },
  {
    id: "9",
    title: "Shakshuka",
    cuisine: "Middle Eastern",
    mealType: "Breakfast",
    cookingTime: 25,
    difficulty: "Easy",
    ingredients: ["Egg", "Tomato", "Onion", "Garlic", "Chili", "Bell Pepper"],
    instructions: [
      "Sauté diced onion, garlic, and bell pepper in olive oil.",
      "Add canned tomatoes, chili, cumin, and paprika.",
      "Simmer sauce for 10 minutes until thickened.",
      "Make wells in the sauce and crack eggs into them.",
      "Cover and cook until eggs are set, about 5 minutes.",
      "Garnish with herbs and serve with crusty bread."
    ],
    image: "https://images.unsplash.com/photo-1590412200988-a436970781fa?w=600&h=400&fit=crop",
    tags: ["breakfast", "one-pan", "healthy"]
  },
  {
    id: "10",
    title: "Creamy Tomato Pasta",
    cuisine: "Italian",
    mealType: "Lunch",
    cookingTime: 20,
    difficulty: "Easy",
    ingredients: ["Pasta", "Tomato", "Garlic", "Cream", "Onion", "Cheese", "Spinach"],
    instructions: [
      "Cook pasta until al dente.",
      "Sauté garlic and onion in olive oil.",
      "Add crushed tomatoes and simmer 8 minutes.",
      "Stir in cream and wilted spinach.",
      "Toss in drained pasta and mix well.",
      "Top with grated cheese and serve."
    ],
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&h=400&fit=crop",
    tags: ["quick", "vegetarian", "creamy"]
  },
  {
    id: "11",
    title: "Beef & Broccoli",
    cuisine: "Asian",
    mealType: "Dinner",
    cookingTime: 25,
    difficulty: "Easy",
    ingredients: ["Beef", "Broccoli", "Garlic", "Soy Sauce", "Rice", "Onion"],
    instructions: [
      "Slice beef thinly against the grain.",
      "Marinate in soy sauce, cornstarch, and sesame oil.",
      "Blanch broccoli florets for 2 minutes.",
      "Sear beef in a hot wok in batches.",
      "Add garlic, broccoli, and sauce. Toss to coat.",
      "Serve over steamed rice."
    ],
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop",
    tags: ["high-protein", "classic", "stir-fry"]
  },
  {
    id: "12",
    title: "Potato & Egg Scramble",
    cuisine: "Western",
    mealType: "Breakfast",
    cookingTime: 15,
    difficulty: "Easy",
    ingredients: ["Potato", "Egg", "Onion", "Cheese", "Bell Pepper", "Butter"],
    instructions: [
      "Dice potatoes small and parboil for 5 minutes.",
      "Fry potatoes in butter until crispy and golden.",
      "Add diced bell pepper and onion, cook 2 minutes.",
      "Beat eggs and pour over potatoes.",
      "Gently scramble until eggs are just set.",
      "Top with cheese and serve warm."
    ],
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&h=400&fit=crop",
    tags: ["breakfast", "hearty", "budget"]
  },
  {
    id: "13",
    title: "Thai Green Curry",
    cuisine: "Asian",
    mealType: "Dinner",
    cookingTime: 35,
    difficulty: "Medium",
    ingredients: ["Chicken", "Coconut Milk", "Broccoli", "Bell Pepper", "Rice", "Garlic", "Chili"],
    instructions: [
      "Fry green curry paste in oil for 1 minute.",
      "Add coconut milk and bring to a gentle simmer.",
      "Add sliced chicken and cook for 8 minutes.",
      "Add broccoli and bell pepper, simmer 5 more minutes.",
      "Season with fish sauce, sugar, and lime.",
      "Serve over jasmine rice."
    ],
    image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&h=400&fit=crop",
    tags: ["curry", "spicy", "coconut"]
  },
  {
    id: "14",
    title: "Caprese Bruschetta",
    cuisine: "Italian",
    mealType: "Snack",
    cookingTime: 10,
    difficulty: "Easy",
    ingredients: ["Tomato", "Cheese", "Bread", "Garlic"],
    instructions: [
      "Slice bread and toast until golden.",
      "Rub each slice with a cut garlic clove.",
      "Dice fresh tomatoes and mix with olive oil, salt, basil.",
      "Slice fresh mozzarella.",
      "Top bread with cheese and tomato mixture.",
      "Drizzle with balsamic glaze and serve."
    ],
    image: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=600&h=400&fit=crop",
    tags: ["snack", "appetizer", "fresh"]
  },
  {
    id: "15",
    title: "Shrimp Garlic Noodles",
    cuisine: "Asian",
    mealType: "Dinner",
    cookingTime: 20,
    difficulty: "Easy",
    ingredients: ["Shrimp", "Noodles", "Garlic", "Butter", "Soy Sauce", "Chili"],
    instructions: [
      "Cook noodles according to package. Drain.",
      "Sauté shrimp in butter with lots of minced garlic.",
      "Add soy sauce and a pinch of chili flakes.",
      "Toss in noodles, coating well with garlic butter.",
      "Cook for 1 more minute to let flavors meld.",
      "Serve with a squeeze of lemon."
    ],
    image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=600&h=400&fit=crop",
    tags: ["quick", "garlic", "seafood"]
  },
  {
    id: "16",
    title: "Hummus Bowl",
    cuisine: "Middle Eastern",
    mealType: "Lunch",
    cookingTime: 10,
    difficulty: "Easy",
    ingredients: ["Garlic", "Tomato", "Onion", "Carrot", "Spinach", "Bread"],
    instructions: [
      "Blend chickpeas, garlic, tahini, lemon juice, and olive oil.",
      "Prepare toppings: dice tomato, slice onion, shred carrot.",
      "Spread hummus generously in a bowl.",
      "Arrange vegetables and spinach on top.",
      "Drizzle with olive oil and sprinkle with paprika.",
      "Serve with warm pita bread."
    ],
    image: "https://images.unsplash.com/photo-1540914124281-342587941389?w=600&h=400&fit=crop",
    tags: ["vegan", "healthy", "snack"]
  },
  {
    id: "17",
    title: "Chicken Caesar Wrap",
    cuisine: "Western",
    mealType: "Lunch",
    cookingTime: 15,
    difficulty: "Easy",
    ingredients: ["Chicken", "Bread", "Cheese", "Garlic", "Egg"],
    instructions: [
      "Grill seasoned chicken breast and slice.",
      "Make dressing: whisk egg yolk, garlic, lemon, and oil.",
      "Chop romaine lettuce and toss with dressing.",
      "Shave parmesan cheese.",
      "Layer chicken, dressed lettuce, cheese in a wrap.",
      "Roll tightly and slice in half to serve."
    ],
    image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&h=400&fit=crop",
    tags: ["wrap", "lunch", "high-protein"]
  },
  {
    id: "18",
    title: "Spicy Cabbage Stir Fry",
    cuisine: "Asian",
    mealType: "Dinner",
    cookingTime: 15,
    difficulty: "Easy",
    ingredients: ["Cabbage", "Chili", "Garlic", "Soy Sauce", "Onion", "Carrot"],
    instructions: [
      "Shred cabbage and julienne carrots.",
      "Heat oil in a wok until smoking.",
      "Add dried chilies and garlic, fry 30 seconds.",
      "Add cabbage and carrot, stir fry on high heat.",
      "Season with soy sauce and vinegar.",
      "Toss until cabbage is wilted but still crunchy. Serve."
    ],
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&h=400&fit=crop",
    tags: ["vegan", "quick", "spicy"]
  },
  {
    id: "19",
    title: "Salmon Poke Bowl",
    cuisine: "Asian",
    mealType: "Lunch",
    cookingTime: 15,
    difficulty: "Easy",
    ingredients: ["Salmon", "Rice", "Soy Sauce", "Onion", "Carrot", "Lime"],
    instructions: [
      "Cook sushi rice and season with rice vinegar.",
      "Cube fresh salmon into bite-sized pieces.",
      "Marinate salmon in soy sauce, sesame oil, and lime.",
      "Prepare toppings: slice onion, julienne carrot.",
      "Assemble bowl with rice, marinated salmon, and toppings.",
      "Garnish with sesame seeds and sliced nori."
    ],
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop",
    tags: ["raw", "healthy", "bowl"]
  },
  {
    id: "20",
    title: "Mushroom & Spinach Quesadilla",
    cuisine: "Mexican",
    mealType: "Snack",
    cookingTime: 15,
    difficulty: "Easy",
    ingredients: ["Mushroom", "Spinach", "Cheese", "Onion", "Garlic", "Chili"],
    instructions: [
      "Sauté sliced mushrooms and garlic until golden.",
      "Add spinach and cook until wilted.",
      "Season with salt, pepper, and chili flakes.",
      "Place a tortilla in a dry pan, add cheese on half.",
      "Add mushroom-spinach filling and fold tortilla.",
      "Cook each side until golden and cheese melts. Slice and serve."
    ],
    image: "https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=600&h=400&fit=crop",
    tags: ["vegetarian", "quick", "cheesy"]
  },
];
