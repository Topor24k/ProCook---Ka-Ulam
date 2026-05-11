# MongoDB Setup for ProCook

Your Filipino recipes CSV dataset has been successfully imported into MongoDB! Here's what was set up:

## 📊 Database Details

- **Database Name:** `procook`
- **Collection Name:** `recipes`
- **Total Recipes:** 104 Filipino recipes
- **Connection:** MongoDB Atlas (Cloud)

## 🔐 Connection String

```
mongodb+srv://kayeencampana_db_user:Topor24kKayeen@cluster0.qcofcw0.mongodb.net/?appName=Cluster0
```

## 📁 Project Structure

```
scripts/
├── importRecipes.js          # Import CSV to MongoDB
├── queryRecipes.js           # Query and display recipes
└── Dataset 1 PROCOOK RECIPE.csv  # Source data

src/
└── lib/
    └── mongodb.js            # MongoDB connection & query helper
```

## 🚀 Quick Commands

```bash
# Re-import recipes from CSV (clears existing data)
npm run db:import

# Query and display all recipes
npm run db:query

# Run development server
npm run dev

# Build for production
npm run build
```

## 📖 Recipe Data Structure

Each recipe document contains:

```json
{
  "_id": "ObjectId",
  "owner": "string",
  "name": "string",
  "description": "string (Filipino)",
  "ingredients": "string (comma-separated)",
  "steps": "string (numbered steps)",
  "category": "string",
  "flavorProfile": ["string", "..."],
  "nutritionLabels": "string",
  "prepTime": number,
  "cookTime": number,
  "servings": number,
  "difficulty": "Easy|Moderate|Hard",
  "estimatedCost": "string",
  "tags": ["string", "..."],
  "mealType": ["string", "..."],
  "mood": ["string", "..."],
  "ratings": number,
  "createdAt": "ISO Date",
  "updatedAt": "ISO Date"
}
```

## 💡 Using MongoDB in Your App

### Backend (Node.js/Express)

```javascript
import { 
  getRecipes, 
  searchRecipes, 
  getRecipesByCategory,
  getRecipesByDifficulty,
  getRecipesByTag 
} from './src/lib/mongodb.js';

// Get all recipes
const recipes = await getRecipes();

// Search recipes
const results = await searchRecipes('chicken');

// Filter by category
const ulams = await getRecipesByCategory('Ulam');

// Filter by difficulty
const easyRecipes = await getRecipesByDifficulty('Easy');

// Filter by tag
const chickenRecipes = await getRecipesByTag('Manok');
```

### Available Collections & Queries

The following indexes have been created for optimal performance:
- `name` (for recipe name searches)
- `category` (for category filtering)
- `tags` (for tag-based queries)
- `difficulty` (for difficulty filtering)

### Example API Endpoints (if building Express backend)

```javascript
// GET /api/recipes
// GET /api/recipes/:id
// GET /api/recipes/search?q=adobo
// GET /api/recipes/category/Ulam
// GET /api/recipes/difficulty/Easy
// GET /api/recipes/tag/Manok
```

## 🧪 Test Queries

Here are some useful queries to try:

1. **All Easy Recipes**: `db.recipes.find({ difficulty: "Easy" })`
2. **Chicken Recipes**: `db.recipes.find({ tags: "Manok" })`
3. **Quick Meals**: `db.recipes.find({ prepTime: { $lt: 15 }, cookTime: { $lt: 30 } })`
4. **Categories**: `db.recipes.distinct("category")`
5. **All Tags**: `db.recipes.distinct("tags")`
6. **Search by Name**: `db.recipes.find({ name: /adobo/i })`

## 🔄 Re-importing Data

If you need to re-import the recipes (will clear existing data):

```bash
npm run db:import
```

Or manually run:

```bash
node scripts/importRecipes.js
```

## 📝 Notes

- The CSV file has been copied to `scripts/Dataset 1 PROCOOK RECIPE.csv` for future imports
- All recipe data is in Filipino (Tagalog)
- The connection uses MongoDB Atlas (cloud-hosted)
- Connection pool is cached for better performance
- All recipes include full ingredients lists, step-by-step instructions, and metadata

## 🐛 Troubleshooting

If you encounter connection issues:

1. Verify your internet connection
2. Check if your IP is whitelisted in MongoDB Atlas
3. Verify the connection string is correct
4. Try running `npm run db:query` to test the connection

---

**Last Updated:** May 7, 2026
