import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { chatWithKaulam } from './src/lib/chatbotApi.js';
import {
  getRecipes,
  getRecipeById,
  searchRecipes,
  getRecipesFeed,
  getRecipesFeedCount,
  getRecipesByCategory,
  getRecipesByDifficulty,
  getRecipesByTag,
  getCategories,
  getTags,
  getRecipesCount,
  registerUser,
  loginUser,
  getUserById,
  getUserByEmail,
  updateUserProfile,
  addRecipeToUser,
  addRecipeToFavorites,
  removeRecipeFromFavorites,
  getUserRecipes,
  getUserFavorites,
  disconnectDatabase
} from './src/lib/mongodb.js';


const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'ProCook API is running' });
});

// ==================== AUTHENTICATION ====================

// Sign up
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Full name, email, and password are required'
      });
    }
    
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    
    const user = await registerUser({
      fullName,
      email,
      passwordHash
    });
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }
    
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    
    const user = await loginUser(email, passwordHash);
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profile: user.profile
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error.message
    });
  }
});

// Get user profile
app.get('/api/auth/user/:userId', async (req, res) => {
  try {
    const user = await getUserById(req.params.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    res.json({
      success: true,
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profile: user.profile,
        recipes: user.recipes || [],
        favorites: user.favorites || []
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update user profile
app.put('/api/auth/user/:userId', async (req, res) => {
  try {
    const { fullName, bio, location, avatar } = req.body;
    
    const user = await updateUserProfile(req.params.userId, {
      fullName,
      bio,
      location,
      avatar
    });
    
    res.json({
      success: true,
      message: 'Profile updated',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== RECIPES ====================

// Get all recipes with optional limit
app.get('/api/recipes', async (req, res) => {
  try {
    const hasPaging = typeof req.query.limit !== 'undefined' || typeof req.query.skip !== 'undefined' || typeof req.query.q !== 'undefined';
    const limit = req.query.limit ? parseInt(req.query.limit) : null;
    const skip = req.query.skip ? parseInt(req.query.skip) : 0;
    const searchText = typeof req.query.q === 'string' ? req.query.q : '';
    const category = typeof req.query.category === 'string' ? req.query.category : '';

    console.log('[API /recipes] Query params:', {
      hasPaging,
      limit,
      skip,
      searchText,
      category,
      allQueryParams: req.query
    });

    if (!hasPaging) {
      const recipes = await getRecipes({}, limit);
      return res.json({
        success: true,
        count: recipes.length,
        data: recipes
      });
    }

    const [recipes, total] = await Promise.all([
      getRecipesFeed({ searchText, category, limit: limit ?? 16, skip }),
      getRecipesFeedCount(searchText, category)
    ]);

    console.log('[API /recipes] Response:', {
      searchText,
      category,
      skip,
      limit,
      recipesReturned: recipes.length,
      total,
      hasMore: skip + recipes.length < total
    });

    return res.json({
      success: true,
      count: recipes.length,
      total,
      hasMore: skip + recipes.length < total,
      data: recipes
    });
  } catch (error) {
    console.error('[API /recipes] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get recipe by ID
app.get('/api/recipes/:id', async (req, res) => {
  try {
    const recipe = await getRecipeById(req.params.id);
    if (!recipe) {
      return res.status(404).json({
        success: false,
        error: 'Recipe not found'
      });
    }
    res.json({
      success: true,
      data: recipe
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Search recipes
app.get('/api/recipes/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query (q) is required'
      });
    }
    const results = await searchRecipes(q);
    res.json({
      success: true,
      query: q,
      count: results.length,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Filter by category
app.get('/api/recipes/category/:category', async (req, res) => {
  try {
    const recipes = await getRecipesByCategory(req.params.category);
    res.json({
      success: true,
      category: req.params.category,
      count: recipes.length,
      data: recipes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Filter by difficulty
app.get('/api/recipes/difficulty/:difficulty', async (req, res) => {
  try {
    const recipes = await getRecipesByDifficulty(req.params.difficulty);
    res.json({
      success: true,
      difficulty: req.params.difficulty,
      count: recipes.length,
      data: recipes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Filter by tag
app.get('/api/recipes/tag/:tag', async (req, res) => {
  try {
    const recipes = await getRecipesByTag(req.params.tag);
    res.json({
      success: true,
      tag: req.params.tag,
      count: recipes.length,
      data: recipes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await getCategories();
    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all tags
app.get('/api/tags', async (req, res) => {
  try {
    const tags = await getTags();
    res.json({
      success: true,
      count: tags.length,
      data: tags
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get recipe count
app.get('/api/recipes/count', async (req, res) => {
  try {
    const count = await getRecipesCount();
    res.json({
      success: true,
      count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Debug endpoint - shows total recipe count and category breakdown
app.get('/api/debug/recipes-info', async (req, res) => {
  try {
    const totalCount = await getRecipesCount();
    const categories = await getCategories();
    
    // Get count for each category
    const categoryCounts = {};
    for (const category of categories) {
      const count = await getRecipesByCategory(category);
      categoryCounts[category] = count.length;
    }

    console.log('[DEBUG] Recipes Info:', { totalCount, categories, categoryCounts });

    res.json({
      success: true,
      totalCount,
      categories,
      categoryCounts,
      categoryCount: categories.length
    });
  } catch (error) {
    console.error('[DEBUG] Error getting recipes info:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== CHATBOT KAULAM ====================

// Chat endpoint - 3-layer filtering for food-related questions only
app.post('/api/chatbot/ask', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    console.log('📝 User message:', message);

    let recipeSuggestions = [];

    if (message.trim().length >= 3) {
      const recipeMatches = await searchRecipes(message);
      recipeSuggestions = recipeMatches
        .filter(recipe => typeof recipe?.name === 'string')
        .slice(0, 3)
        .map(recipe => recipe.name);
    }

    // Call chatbot with 3-layer filtering
    const result = await chatWithKaulam(message, history);

    // Return filtered response
    res.json({
      success: result.success,
      message: result.message,
      model: result.model,
      layer: result.layer,
      recipeSuggestions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Chatbot endpoint error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'An error occurred while processing your request'
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 ProCook API server running on http://localhost:${PORT}`);
  console.log(`📖 Visit http://localhost:${PORT}/api/health to check status`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  await disconnectDatabase();
  process.exit(0);
});
