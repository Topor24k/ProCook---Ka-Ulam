import { Quote, Search, Brain, Gauge, Settings2, Database, LayoutGrid } from 'lucide-react';
import { Step, Recipe } from './types';

export const steps: Step[] = [
  {
    icon: <Brain className="w-6 h-6" />,
    title: "Step 01: Qwen 2.5 7B Integration",
    description: "We integrate Qwen 2.5 7B as our base engine, leveraging its advanced instruction-following capabilities and agent harnesses to drive the Ka-ulam Chatbot's reasoning.",
    color: "bg-pro-red"
  },
  {
    icon: <Settings2 className="w-6 h-6" />,
    title: "Step 02: Culinary Fine-Tuning",
    description: "The model is fine-tuned on our specialized Filipino recipe database, learning regional nuances, 'Taglish' semantics, and localized ingredient substitutions.",
    color: "bg-blue-600"
  },
  {
    icon: <Gauge className="w-6 h-6" />,
    title: "Step 03: Agentic Reasoning",
    description: "We apply Qwen's system-level reasoning to correlate user mood, budget, and time constraints, conducting trace analysis to suggest the perfect dish.",
    color: "bg-purple-600"
  },
  {
    icon: <LayoutGrid className="w-6 h-6" />,
    title: "Step 04: Native Chat Experience",
    description: "Leveraging Qwen's stable role identity, our chatbot provides a human-like culinary guide experience with autonomous decision-making for meal planning.",
    color: "bg-amber-600"
  }
];

export const recipes: Recipe[] = [
  {
    id: '1',
    owner: 'CHEF ANTON',
    name: "KARE-KARE",
    description: "A rich stew of oxtail and vegetables in a thick, savory peanut sauce. A true celebration dish.",
    ingredients: ['500g Oxtail', '1/2 cup Peanut Butter', '1/4 cup Ground Rice', 'Banana blossom', 'Eggplant', 'String beans'],
    steps: ['Boil oxtail until tender.', 'Add peanut butter and toasted ground rice.', 'Stir until sauce thickens.', 'Blanch vegetables separately and serve on top.'],
    category: 'TRADITIONAL STEW',
    flavorProfile: 'SAVORY & NUTTY',
    nutritionLabels: ['HIGH PROTEIN', 'IRON RICH'],
    prepMin: 20,
    cookMin: 90,
    servings: 4,
    difficulty: 'HARD',
    costLevel: '₱₱₱',
    tags: ['CELEBRATION', 'CLASSIC', 'FAMILY'],
    mealType: 'DINNER',
    mood: 'CELEBRATORY',
    image: "https://images.unsplash.com/photo-1625244724123-1ee30d5c926c?auto=format&fit=crop&q=80&w=800",
    rating: "4.7"
  },
  {
    id: '2',
    owner: 'CHEF FELIX',
    name: "ADOBONG MANOK",
    description: "Chicken simmered in soy sauce, vinegar, garlic, and spices, creating a savory and tangy Filipino classic.",
    ingredients: ['1kg Chicken pieces', '1/2 cup Soy Sauce', '1/4 cup Vinegar', '1 head Garlic', 'Peppercorns', 'Bay leaves'],
    steps: ['Marinate chicken in soy sauce and garlic.', 'Sauté garlic then add chicken.', 'Pour in marinade and simmer.', 'Add vinegar and let it cook without stirring.'],
    category: 'STAPLE DISH',
    flavorProfile: 'SAVORY & TANGY',
    nutritionLabels: ['PROTEIN RICH', 'LOW CALORIE'],
    prepMin: 15,
    cookMin: 30,
    servings: 5,
    difficulty: 'EASY',
    costLevel: '₱',
    tags: ['EVERYDAY', 'SIMPLE', 'QUICK'],
    mealType: 'LUNCH',
    mood: 'COMFORTING',
    image: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&q=80&w=800",
    rating: "4.5"
  },
  {
    id: '3',
    owner: 'CHEF ANTON',
    name: "PORK SISIG",
    description: "Chopped pork belly and ears seasoned with calamansi, chili, and onions, served sizzling hot on a plate.",
    ingredients: ['500g Pork Mask', '100g Chicken Liver', '2 pcs Onions', '5 pcs Calamansi', '3 pcs Thai Chili'],
    steps: ['Boil pork until tender, then grill until crisp.', 'Chop into small pieces.', 'Sauté with onions and liver.', 'Season with calamansi, soy sauce, and chili.'],
    category: 'PULUTAN / MAIN',
    flavorProfile: 'SPICY & SOUR',
    nutritionLabels: ['KETO FRIENDLY', 'HIGH FAT'],
    prepMin: 30,
    cookMin: 45,
    servings: 4,
    difficulty: 'PRO',
    costLevel: '₱₱',
    tags: ['SINFUL', 'PARTY', 'SIGNATURE'],
    mealType: 'APPETIZER',
    mood: 'ENERGETIC',
    image: "https://images.unsplash.com/photo-1633504581786-316c8002b1b9?auto=format&fit=crop&q=80&w=800",
    rating: "4.3"
  },
  {
    id: '4',
    owner: 'CHEF LIZA',
    name: "SINIGANG",
    description: "A comforting sour soup made with tamarind broth, vegetables, and your choice of pork, shrimp, or fish.",
    ingredients: ['500g Pork belly', '1 pack Tamarind base', '1 pc Radish', '1 bunch Water spinach', '2 pcs Tomatoes'],
    steps: ['Boil pork in water with tomatoes and onions.', 'Add radish and eggplant.', 'Pour in sinigang mix.', 'Add green leafy vegetables at the end.'],
    category: 'SOUP BASE',
    flavorProfile: 'SOUR & REFRESHING',
    nutritionLabels: ['HYDRATING', 'VITAMIN C+'],
    prepMin: 15,
    cookMin: 40,
    servings: 6,
    difficulty: 'MEDIUM',
    costLevel: '₱₱',
    tags: ['CLASSIC', 'RAINY DAY', 'FAMILY SIZE'],
    mealType: 'DINNER',
    mood: 'SOARING',
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800",
    rating: "4.8"
  }
];
