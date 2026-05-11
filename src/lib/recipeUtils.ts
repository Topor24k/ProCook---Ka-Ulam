import { Recipe } from '../types';

function parseTextList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(/\n|\r|\.|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function toCostLevel(estimatedCost: unknown): Recipe['costLevel'] {
  const normalized = String(estimatedCost ?? '').toLowerCase();
  if (normalized.includes('high') || normalized.includes('mahal')) return '₱₱₱';
  if (normalized.includes('mid') || normalized.includes('moderate') || normalized.includes('medium')) return '₱₱';
  return '₱';
}

export function normalizeRecipe(recipe: any, index: number): Recipe {
  const mealType = Array.isArray(recipe.mealType) ? recipe.mealType[0] : recipe.mealType;
  const mood = Array.isArray(recipe.mood) ? recipe.mood[0] : recipe.mood;

  return {
    id: String(recipe._id ?? recipe.id ?? index),
    owner: String(recipe.owner ?? 'PROCOOK MEMBER').toUpperCase(),
    name: String(recipe.name ?? 'Untitled Recipe'),
    description: String(recipe.description ?? 'No description available.'),
    ingredients: parseTextList(recipe.ingredients),
    steps: parseTextList(recipe.steps),
    category: String(recipe.category ?? 'FILIPINO DISH').toUpperCase(),
    flavorProfile: String(recipe.flavorProfile ?? ''),
    nutritionLabels: parseTextList(recipe.nutritionLabels),
    prepMin: Number(recipe.prepTime ?? recipe.prepMin ?? 0),
    cookMin: Number(recipe.cookTime ?? recipe.cookMin ?? 0),
    servings: Number(recipe.servings ?? 1),
    difficulty: 'MEDIUM',
    costLevel: toCostLevel(recipe.estimatedCost),
    tags: Array.isArray(recipe.tags) ? recipe.tags : parseTextList(recipe.tags),
    mealType: String(mealType ?? 'MEAL').toUpperCase(),
    mood: String(mood ?? 'COMFORTING').toUpperCase(),
    image: `https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&q=80&w=800&sig=${index + 1}`,
    rating: String(recipe.ratings ?? recipe.rating ?? 0)
  };
}
