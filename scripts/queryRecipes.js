import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://kayeencampana_db_user:Topor24kKayeen@cluster0.qcofcw0.mongodb.net/?appName=Cluster0';
const DATABASE_NAME = 'procook';
const COLLECTION_NAME = 'recipes';

async function queryRecipes() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // Count total recipes
    const count = await collection.countDocuments();
    console.log(`📊 Total recipes: ${count}\n`);
    
    // List all recipes with basic info
    console.log('📖 All Recipes:');
    console.log('─'.repeat(80));
    
    const recipes = await collection.find({}).toArray();
    recipes.forEach((recipe, index) => {
      console.log(`\n${index + 1}. ${recipe.name}`);
      console.log(`   Category: ${recipe.category}`);
      console.log(`   Difficulty: ${recipe.difficulty}`);
      console.log(`   Prep: ${recipe.prepTime}min | Cook: ${recipe.cookTime}min | Servings: ${recipe.servings}`);
      console.log(`   Tags: ${recipe.tags.join(', ')}`);
    });
    
    // Query examples
    console.log('\n\n' + '='.repeat(80));
    console.log('📌 EXAMPLE QUERIES YOU CAN USE:');
    console.log('='.repeat(80) + '\n');
    
    // Example 1: Easy recipes
    const easyRecipes = await collection.find({ difficulty: 'Easy' }).toArray();
    console.log(`1. Easy recipes: ${easyRecipes.length} found`);
    easyRecipes.forEach(r => console.log(`   - ${r.name}`));
    
    // Example 2: Filter by tag
    const chickenRecipes = await collection.find({ tags: 'Manok' }).toArray();
    console.log(`\n2. Chicken recipes: ${chickenRecipes.length} found`);
    chickenRecipes.forEach(r => console.log(`   - ${r.name}`));
    
    // Example 3: Search by category
    const mealCount = await collection.countDocuments({ category: { $exists: true } });
    console.log(`\n3. Recipes by category: ${mealCount} total\n`);
    
    const categories = await collection.distinct('category');
    categories.forEach(cat => {
      console.log(`   - ${cat}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

queryRecipes();
