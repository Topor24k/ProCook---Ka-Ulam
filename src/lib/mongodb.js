import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://kayeencampana_db_user:Topor24kKayeen@cluster0.qcofcw0.mongodb.net/?appName=Cluster0';
const DATABASE_NAME = 'procook';
const RECIPES_COLLECTION = 'recipes';
const USERS_COLLECTION = 'users';

let cachedClient = null;

export async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }
  
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

export async function getRecipesCollection() {
  const client = await connectToDatabase();
  const db = client.db(DATABASE_NAME);
  return db.collection(RECIPES_COLLECTION);
}

export async function getUsersCollection() {
  const client = await connectToDatabase();
  const db = client.db(DATABASE_NAME);
  return db.collection(USERS_COLLECTION);
}

// ==================== RECIPES ====================

export async function getRecipes(query = {}, limit = null) {
  const collection = await getRecipesCollection();
  let cursor = collection.find(query);
  if (limit) cursor = cursor.limit(limit);
  const results = await cursor.toArray();
  console.log('[MongoDB] getRecipes:', { query, limit, resultsCount: results.length });
  return results;
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildRecipeSearchQuery(searchText, category) {
  const safeText = String(searchText ?? '').trim();
  const safeCategory = String(category ?? '').trim();
  const hasText = Boolean(safeText);
  const hasCategory = Boolean(safeCategory) && safeCategory.toLowerCase() !== 'all';

  if (!hasText && !hasCategory) return {};

  // When only category is specified, use exact match (case-insensitive)
  if (hasCategory && !hasText) {
    const query = {
      category: { $regex: `^${escapeRegex(safeCategory)}$`, $options: 'i' }
    };
    console.log(`[Recipe Query] Category filter: "${safeCategory}"`);
    return query;
  }

  // When only search text is specified
  if (!hasCategory && hasText) {
    console.log(`[Recipe Query] Full-text search: "${safeText}"`);
    return {
      $or: [
        { name: { $regex: safeText, $options: 'i' } },
        { description: { $regex: safeText, $options: 'i' } },
        { tags: { $regex: safeText, $options: 'i' } },
        { category: { $regex: safeText, $options: 'i' } },
        { mealType: { $regex: safeText, $options: 'i' } },
        { mood: { $regex: safeText, $options: 'i' } }
      ]
    };
  }

  // When both category and search text are specified, apply both filters
  console.log(`[Recipe Query] Category: "${safeCategory}" + Search: "${safeText}"`);
  return {
    $and: [
      { category: { $regex: `^${escapeRegex(safeCategory)}$`, $options: 'i' } },
      {
        $or: [
          { name: { $regex: safeText, $options: 'i' } },
          { description: { $regex: safeText, $options: 'i' } },
          { tags: { $regex: safeText, $options: 'i' } },
          { mealType: { $regex: safeText, $options: 'i' } },
          { mood: { $regex: safeText, $options: 'i' } }
        ]
      }
    ]
  };
}

function getRecipeCardProjection() {
  return {
    owner: 1,
    name: 1,
    description: 1,
    category: 1,
    flavorProfile: 1,
    nutritionLabels: 1,
    prepTime: 1,
    cookTime: 1,
    servings: 1,
    difficulty: 1,
    estimatedCost: 1,
    tags: 1,
    mealType: 1,
    mood: 1,
    ratings: 1
  };
}

export async function getRecipeById(id) {
  const collection = await getRecipesCollection();
  return collection.findOne({ _id: new ObjectId(id) });
}

export async function searchRecipes(searchText) {
  const collection = await getRecipesCollection();
  return collection.find({
    $or: [
      { name: { $regex: searchText, $options: 'i' } },
      { description: { $regex: searchText, $options: 'i' } },
      { tags: { $regex: searchText, $options: 'i' } },
      { category: { $regex: searchText, $options: 'i' } }
    ]
  }).toArray();
}

export async function getRecipesFeed({ searchText = '', category = '', limit = 16, skip = 0 } = {}) {
  const collection = await getRecipesCollection();
  const query = buildRecipeSearchQuery(searchText, category);

  console.log('[MongoDB] getRecipesFeed query:', query);

  return collection
    .find(query, { projection: getRecipeCardProjection() })
    .sort({ ratings: -1, name: 1 })
    .skip(Number(skip) || 0)
    .limit(Number(limit) || 16)
    .toArray();
}

export async function getRecipesFeedCount(searchText = '', category = '') {
  const collection = await getRecipesCollection();
  const query = buildRecipeSearchQuery(searchText, category);
  const count = await collection.countDocuments(query);
  
  console.log('[MongoDB] getRecipesFeedCount:', { query, count });
  
  return count;
}

export async function getRecipesByCategory(category) {
  const collection = await getRecipesCollection();
  return collection.find({ category: { $regex: category, $options: 'i' } }).toArray();
}

export async function getRecipesByDifficulty(difficulty) {
  const collection = await getRecipesCollection();
  return collection.find({ difficulty }).toArray();
}

export async function getRecipesByTag(tag) {
  const collection = await getRecipesCollection();
  return collection.find({ tags: tag }).toArray();
}

export async function getCategories() {
  const collection = await getRecipesCollection();
  return collection.distinct('category');
}

export async function getTags() {
  const collection = await getRecipesCollection();
  return collection.distinct('tags');
}

export async function getRecipesCount(query = {}) {
  const collection = await getRecipesCollection();
  const count = await collection.countDocuments(query);
  console.log('[MongoDB] getRecipesCount:', { query, count });
  return count;
}

// ==================== USERS/AUTH ====================

export async function registerUser(userData) {
  const collection = await getUsersCollection();
  
  // Check if email already exists
  const existingUser = await collection.findOne({ email: userData.email.toLowerCase() });
  if (existingUser) {
    throw new Error('Email already registered');
  }
  
  const user = {
    fullName: userData.fullName,
    email: userData.email.toLowerCase(),
    passwordHash: userData.passwordHash, // Should be hashed on server
    createdAt: new Date(),
    updatedAt: new Date(),
    recipes: [],
    favorites: [],
    profile: {
      bio: '',
      location: '',
      avatar: ''
    }
  };
  
  const result = await collection.insertOne(user);
  return { _id: result.insertedId, ...user };
}

export async function loginUser(email, passwordHash) {
  const collection = await getUsersCollection();
  
  const user = await collection.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new Error('User not found');
  }
  
  if (user.passwordHash !== passwordHash) {
    throw new Error('Invalid password');
  }
  
  return user;
}

export async function getUserById(id) {
  const collection = await getUsersCollection();
  return collection.findOne({ _id: new ObjectId(id) });
}

export async function getUserByEmail(email) {
  const collection = await getUsersCollection();
  return collection.findOne({ email: email.toLowerCase() });
}

export async function updateUserProfile(userId, profileData) {
  const collection = await getUsersCollection();
  
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(userId) },
    {
      $set: {
        fullName: profileData.fullName || undefined,
        'profile.bio': profileData.bio || undefined,
        'profile.location': profileData.location || undefined,
        'profile.avatar': profileData.avatar || undefined,
        updatedAt: new Date()
      },
      $unset: {
        'fullName': profileData.fullName ? undefined : 1,
        'profile.bio': profileData.bio ? undefined : 1,
        'profile.location': profileData.location ? undefined : 1,
        'profile.avatar': profileData.avatar ? undefined : 1
      }
    },
    { returnDocument: 'after' }
  );
  
  return result.value;
}

export async function addRecipeToUser(userId, recipeId) {
  const collection = await getUsersCollection();
  
  await collection.updateOne(
    { _id: new ObjectId(userId) },
    { $addToSet: { recipes: new ObjectId(recipeId) } }
  );
}

export async function addRecipeToFavorites(userId, recipeId) {
  const collection = await getUsersCollection();
  
  await collection.updateOne(
    { _id: new ObjectId(userId) },
    { $addToSet: { favorites: new ObjectId(recipeId) } }
  );
}

export async function removeRecipeFromFavorites(userId, recipeId) {
  const collection = await getUsersCollection();
  
  await collection.updateOne(
    { _id: new ObjectId(userId) },
    { $pull: { favorites: new ObjectId(recipeId) } }
  );
}

export async function getUserRecipes(userId) {
  const collection = await getRecipesCollection();
  const user = await getUserById(userId);
  
  if (!user || !user.recipes) return [];
  
  return collection.find({
    _id: { $in: user.recipes }
  }).toArray();
}

export async function getUserFavorites(userId) {
  const collection = await getRecipesCollection();
  const user = await getUserById(userId);
  
  if (!user || !user.favorites) return [];
  
  return collection.find({
    _id: { $in: user.favorites }
  }).toArray();
}

export async function disconnectDatabase() {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
  }
}
