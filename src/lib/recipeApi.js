// MongoDB Query Functions
// Use these functions in your React components to fetch recipe data

const API_BASE = 'http://localhost:3001/api';
const recipeFeedCache = new Map();

async function readApiError(response, fallbackMessage) {
  try {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const payload = await response.json();
      if (payload?.error) {
        return `${fallbackMessage}: ${payload.error}`;
      }
    } else {
      const text = await response.text();
      if (text) {
        return `${fallbackMessage}: ${text}`;
      }
    }
  } catch {
    // Ignore response parsing errors and fall back to status information.
  }

  return `${fallbackMessage} (HTTP ${response.status})`;
}

/**
 * Fetch all recipes
 * @param {number} limit - Optional limit on number of recipes
 * @returns {Promise<Array>} Array of recipe objects
 */
export async function getAllRecipes(limit = null) {
  const url = limit ? `${API_BASE}/recipes?limit=${limit}` : `${API_BASE}/recipes`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(await readApiError(response, 'Failed to fetch recipes'));
  }
  const payload = await response.json();
  return payload.data;
}

function buildFeedUrl({ q = '', category = '', limit = 16, skip = 0 } = {}) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (category) params.set('category', category);
  if (limit != null) params.set('limit', String(limit));
  if (skip != null) params.set('skip', String(skip));
  const queryString = params.toString();
  return `${API_BASE}/recipes${queryString ? `?${queryString}` : ''}`;
}

export async function getRecipeFeed({ q = '', category = '', limit = 16, skip = 0 } = {}) {
  const url = buildFeedUrl({ q, category, limit, skip });
  if (recipeFeedCache.has(url)) {
    return recipeFeedCache.get(url);
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(await readApiError(response, 'Failed to fetch recipe feed'));
  }
  const payload = await response.json();
  recipeFeedCache.set(url, payload);
  return payload;
}

export async function prefetchRecipeFeed({ q = '', category = '', limit = 16, skip = 0 } = {}) {
  const url = buildFeedUrl({ q, category, limit, skip });
  if (recipeFeedCache.has(url)) {
    return;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) return;
    const payload = await response.json();
    recipeFeedCache.set(url, payload);
  } catch {
    // Ignore prefetch errors to avoid blocking UI.
  }
}

/**
 * Fetch a single recipe by ID
 * @param {string} id - MongoDB ObjectId
 * @returns {Promise<Object>} Recipe object
 */
export async function getRecipeById(id) {
  const response = await fetch(`${API_BASE}/recipes/${id}`);
  if (!response.ok) throw new Error('Failed to fetch recipe');
  const { data } = await response.json();
  return data;
}

/**
 * Search recipes by text
 * @param {string} query - Search term
 * @returns {Promise<Array>} Array of matching recipes
 */
export async function searchRecipes(query) {
  const response = await fetch(`${API_BASE}/recipes/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error('Failed to search recipes');
  const { data } = await response.json();
  return data;
}

/**
 * Get recipes by category
 * @param {string} category - Category name (e.g., "Ulam (Main Dish)")
 * @returns {Promise<Array>} Array of recipes in category
 */
export async function getRecipesByCategory(category) {
  const response = await fetch(`${API_BASE}/recipes/category/${encodeURIComponent(category)}`);
  if (!response.ok) throw new Error('Failed to fetch recipes');
  const { data } = await response.json();
  return data;
}

/**
 * Get recipes by difficulty level
 * @param {string} difficulty - "Easy", "Moderate", or "Hard"
 * @returns {Promise<Array>} Array of recipes at difficulty level
 */
export async function getRecipesByDifficulty(difficulty) {
  const response = await fetch(`${API_BASE}/recipes/difficulty/${encodeURIComponent(difficulty)}`);
  if (!response.ok) throw new Error('Failed to fetch recipes');
  const { data } = await response.json();
  return data;
}

/**
 * Get recipes by tag
 * @param {string} tag - Tag name (e.g., "Manok", "Filipino")
 * @returns {Promise<Array>} Array of recipes with tag
 */
export async function getRecipesByTag(tag) {
  const response = await fetch(`${API_BASE}/recipes/tag/${encodeURIComponent(tag)}`);
  if (!response.ok) throw new Error('Failed to fetch recipes');
  const { data } = await response.json();
  return data;
}

/**
 * Get all available categories
 * @returns {Promise<Array>} Array of category names
 */
export async function getCategories() {
  const response = await fetch(`${API_BASE}/categories`);
  if (!response.ok) throw new Error('Failed to fetch categories');
  const { data } = await response.json();
  return data;
}

/**
 * Get all available tags
 * @returns {Promise<Array>} Array of tag names
 */
export async function getTags() {
  const response = await fetch(`${API_BASE}/tags`);
  if (!response.ok) throw new Error('Failed to fetch tags');
  const { data } = await response.json();
  return data;
}

/**
 * Get total recipe count
 * @returns {Promise<number>} Total number of recipes
 */
export async function getRecipesCount() {
  const response = await fetch(`${API_BASE}/recipes/count`);
  if (!response.ok) throw new Error('Failed to fetch count');
  const { count } = await response.json();
  return count;
}

/**
 * Get quick recipe suggestions (Easy recipes under 30 minutes)
 * @returns {Promise<Array>} Array of quick recipes
 */
export async function getQuickRecipes() {
  const easyRecipes = await getRecipesByDifficulty('Easy');
  return easyRecipes.filter(r => r.prepTime + r.cookTime <= 30);
}

/**
 * Get recipes by mood/occasion
 * @param {string} mood - Mood name (e.g., "Family bonding", "Comforted")
 * @returns {Promise<Array>} Array of recipes matching mood
 */
export async function getRecipesByMood(mood) {
  const allRecipes = await getAllRecipes();
  return allRecipes.filter(r => r.mood.includes(mood));
}

/**
 * Example React Hook to fetch recipes
 * Usage: const recipes = useFetchRecipes('getAllRecipes', []);
 */
export function useFetchRecipes(type = 'getAllRecipes', params = []) {
  const [recipes, setRecipes] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    async function fetch() {
      try {
        setLoading(true);
        const queryFn = {
          getAllRecipes,
          searchRecipes,
          getRecipesByCategory,
          getRecipesByDifficulty,
          getRecipesByTag,
          getQuickRecipes
        }[type];

        if (!queryFn) throw new Error(`Unknown query type: ${type}`);
        
        const data = params.length > 0 
          ? await queryFn(...params)
          : await queryFn();
        
        setRecipes(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetch();
  }, [type, JSON.stringify(params)]);

  return { recipes, loading, error };
}

/**
 * Debug function to check database info
 * Call this from browser console: window.debugRecipes()
 */
export async function getDebugRecipesInfo() {
  try {
    const response = await fetch(`${API_BASE}/debug/recipes-info`);
    if (!response.ok) {
      throw new Error('Failed to fetch debug info');
    }
    const data = await response.json();
    console.log('📊 Recipe Database Debug Info:');
    console.log(`   Total Recipes: ${data.totalCount}`);
    console.log(`   Categories: ${data.categoryCount}`);
    console.table(data.categoryCounts);
    return data;
  } catch (error) {
    console.error('❌ Debug error:', error);
    throw error;
  }
}
