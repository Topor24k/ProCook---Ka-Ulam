import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://kayeencampana_db_user:Topor24kKayeen@cluster0.qcofcw0.mongodb.net/?appName=Cluster0';
const DATABASE_NAME = 'procook';
const COLLECTION_NAME = 'recipes';

function randomRating() {
  // Generate a realistic rating between 3.0 and 5.0 (1 decimal place)
  return Number((3 + Math.random() * 2).toFixed(1));
}

async function updateRecipeRatings() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const recipes = await collection.find({}, { projection: { _id: 1 } }).toArray();

    if (recipes.length === 0) {
      console.log('No recipes found to update.');
      return;
    }

    const updatedAt = new Date();
    const operations = recipes.map((recipe) => ({
      updateOne: {
        filter: { _id: recipe._id },
        update: {
          $set: {
            ratings: randomRating(),
            updatedAt
          }
        }
      }
    }));

    const result = await collection.bulkWrite(operations, { ordered: false });

    console.log(`Recipes found: ${recipes.length}`);
    console.log(`Recipes modified: ${result.modifiedCount}`);

    const sample = await collection
      .find({}, { projection: { name: 1, ratings: 1 } })
      .limit(5)
      .toArray();

    console.log('Sample updated ratings:');
    sample.forEach((recipe, index) => {
      console.log(`${index + 1}. ${recipe.name} -> ${recipe.ratings}`);
    });
  } catch (error) {
    console.error('Error updating ratings:', error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

updateRecipeRatings();
