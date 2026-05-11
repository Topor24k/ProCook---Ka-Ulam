import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://kayeencampana_db_user:Topor24kKayeen@cluster0.qcofcw0.mongodb.net/?appName=Cluster0';
const DATABASE_NAME = 'procook';
const COLLECTION_NAME = 'recipes';

// Filipino names for recipe owners
const PHILIPPINE_NAMES = [
  'Maria Santos', 'Juan dela Cruz', 'Rosa Garcia', 'Pedro Reyes',
  'Anna Mercado', 'Carlos Fernandez', 'Lucia Villanueva', 'Miguel Rodriguez',
  'Elena Ramos', 'Diego Morales', 'Sofia Ortega', 'Rafael Gutierrez',
  'Carmen Flores', 'Andres Navarro', 'Angelica Torres', 'Enrique Medina',
  'Isabel Corona', 'Fernando Romero', 'Margarita Espinoza', 'Alejandro Vargas',
  'Catalina Ruiz', 'Ricardo Herrera', 'Dolores Mejia', 'Guillermo Castro',
  'Francisca Olivares', 'Roberto Vega', 'Adelaida Soto', 'Manuel Cisneros',
  'Josefa Salazar', 'Arturo Munoz', 'Refugio Rojas', 'Marcelino Figueroa',
  'Juana Salas', 'Silvestre Palma', 'Aurelio Quintero', 'Benita Cortez',
  'Leandro Bravo', 'Petrona Heredia', 'Constantino Molina', 'Rufina Burgos',
  'Paulino Tirado', 'Serafina Gimenez', 'Saturnino Cano', 'Teodora Rosales',
  'Venancio Munilla', 'Trifonia Colina', 'Vasilio Tafolla', 'Ubaldina Renteria',
  'Wenceslao Armijo', 'Valentina Gonzales', 'Xavier Casas', 'Viviana Serna',
  'Ygnacio Barrera', 'Ysidora Macias', 'Zacariah Galarza', 'Zoila Villaseñor',
  'Acasio Padilla', 'Aracelia Covarrubias', 'Basilio Alcala', 'Benilda Zambrano',
  'Camilo Campos', 'Celestina Ponce', 'Deodoro Lucero', 'Delfina Lovato',
  'Estanislao Chaves', 'Evarista Oliva', 'Fausto Romaldo', 'Felicidad Najar',
  'Gavino Salcido', 'Genoveva Lozada', 'Hermenegildo Duarte', 'Herminia Mares',
  'Ildefonso Siller', 'Imelda Robledo', 'Jacinto Farfan', 'Jacinta Esquivel',
  'Kalimero Santos', 'Katrina Reyes', 'Leonardo Cabrera', 'Leonor Arellano',
  'Macedonio Delia', 'Magdalena Tobar', 'Nazario Estrada', 'Narcisa Parra',
  'Olegario Zamora', 'Olimpia Madero', 'Primitivo Moya', 'Prudencia Vallejo',
  'Quintin Valdez', 'Quintina Velarde', 'Romualdo Verdugo', 'Romualtia Velasco',
  'Segundo Valverde'
];

function getRandomName() {
  return PHILIPPINE_NAMES[Math.floor(Math.random() * PHILIPPINE_NAMES.length)];
}

async function importRecipes() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // Clear existing recipes (optional - comment out if you want to keep existing data)
    await collection.deleteMany({});
    console.log('🗑️  Cleared existing recipes');
    
    const recipes = [];
    const csvPath = path.join(process.cwd(), 'scripts', 'Dataset 1 PROCOOK FILIPINO RECIPES.csv');
    
    // Read and parse CSV
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => {
          // Parse numeric fields
          const recipe = {
            owner: row.Owner?.trim() || getRandomName(),
            name: row.Recipe?.trim() || '',
            description: row.Description?.trim() || '',
            ingredients: row.Ingredients
              ?.split('\n')
              .map(i => i.trim())
              .filter(Boolean) || [],
            steps: row.Steps
              ?.split('\n')
              .map(s => s.trim())
              .filter(Boolean) || [],
            category: row.Category?.trim() || '',
            flavorProfile: row['Flavor Profile']
              ?.split(',')
              .map(s => s.trim())
              .filter(Boolean) || [],
            nutritionLabels: row['Nutrition Labels']
              ?.split(',')
              .map(s => s.trim())
              .filter(Boolean) || [],
            prepTime: Number(row['Prep (min)']) || 0,
            cookTime: Number(row['Cook (min)']) || 0,
            servings: Number(row.Servings) || 1,
            difficulty: row.Difficulty?.trim() || 'Easy',
            estimatedCost: row['Estimated Cost']?.trim() || '',
            tags: row.Tags
              ?.split(',')
              .map(s => s.trim())
              .filter(Boolean) || [],
            mealType: row['Meal Type']
              ?.split(',')
              .map(s => s.trim())
              .filter(Boolean) || [],
            mood: row.Mood
              ?.split(',')
              .map(s => s.trim())
              .filter(Boolean) || [],
            ratings: Number(row.Ratings) || 0,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          recipes.push(recipe);
        })
        .on('end', resolve)
        .on('error', reject);
    });
    
    if (recipes.length === 0) {
      console.log('⚠️  No recipes found in CSV');
      return;
    }
    
    // Insert recipes
    const result = await collection.insertMany(recipes);
    console.log(`✅ Successfully imported ${recipes.length} recipes`);
    
    // Create indexes for better query performance
    await collection.createIndex({ name: 1 });
    await collection.createIndex({ category: 1 });
    await collection.createIndex({ tags: 1 });
    await collection.createIndex({ difficulty: 1 });
    console.log('📑 Created indexes');
    
    // Display sample recipe
    const sample = await collection.findOne();
    console.log('\n📖 Sample recipe:');
    console.log(JSON.stringify(sample, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

importRecipes();
