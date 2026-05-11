import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://kayeencampana_db_user:Topor24kKayeen@cluster0.qcofcw0.mongodb.net/?appName=Cluster0';
const DATABASE_NAME = 'procook';
const COLLECTION_NAME = 'recipes';

const CATEGORY_RULES = [
  {
    label: 'Main Dish / Ulam',
    keywords: [
      'pininyahang manok',
      'sinampalukang manok',
      'sinigang na baboy',
      'pinangat na isda',
      'mechado',
      'paksiw na isda',
      'humba',
      'kare-kare',
      'menudo',
      'lechon kawali',
      'lengua estofada',
      'kaldereta',
      'adobong dilaw',
      'beef pochero',
      'bicol express',
      'callos',
      'bopis',
      'chicken curry',
      'dinuguan',
      'chicken inasal',
      'stuffed squid',
      'tinolang manok',
      'sisig',
      'adobong pusit',
      'buttered chicken',
      'morcon',
      'pork estofado',
      'tortang talong',
      'pork tapa',
      'tuna salpicao',
      'pork steak',
      'adobong atay at balunbalunan',
      'sweet and sour fish',
      'pork hamonado',
      'chicken pastel',
      'beef pares',
      'adobong kambing',
      'beef caldereta',
      'estofadong manok',
      'pork pata hamonado',
      'chicken binakol',
      'pork igado',
      'bagnet',
      'arroz a la cubana',
      'pork binababaan',
      'beef kansi',
      'adobong pula',
      'chicken piaparan'
    ]
  },
  {
    label: 'Soup / Sopas',
    keywords: [
      'hototay soup',
      'bulalo',
      'batchoy',
      'goto',
      'egg drop soup',
      'arroz caldo',
      'beef kansi',
      'tiyula itum'
    ]
  },
  {
    label: 'Noodle Dish / Pansit',
    keywords: [
      'pancit bihon',
      'pancit malabon',
      'pancit palabok',
      'mami-style miki',
      'carbonara',
      'filipino spaghetti',
      'baked spaghetti',
      'baked mac and cheese'
    ]
  },
  {
    label: 'Snack / Meryenda',
    keywords: [
      'siopao',
      'banana chips',
      'baked potatoes',
      'binatog',
      'tokneneng',
      'pancakes',
      'homemade taho',
      'fried donuts',
      'chicken popcorn',
      'kwek-kwek',
      'vigan empanada'
    ]
  },
  {
    label: 'Dessert / Panghimagas',
    keywords: [
      'halo-halo',
      'buko pandan',
      'cheesecake',
      'brownies',
      'cassava cake',
      'buko pie',
      'leche flan',
      'maja blanca',
      'ginataang bilo-bilo',
      'espasol',
      'kutsinta',
      'sapin-sapin',
      'bibingka',
      'pichi-pichi',
      'ube halaya',
      'kalamay hati',
      'tupig',
      'binignit',
      'buko salad'
    ]
  },
  {
    label: 'Drinks / Inumin',
    keywords: [
      "sago't gulaman",
      'milk tea',
      'iced tea',
      'sikwate',
      'kapeng barako',
      'calamansi juice',
      'samalamig'
    ]
  },
  {
    label: 'Vegetable Dish / Gulay',
    keywords: [
      'rellenong talong',
      'bulanglang',
      'dinengdeng',
      'ginataang langka',
      'ginataang munggo',
      'garlic sesame spinach',
      'broccoli stir fry with ginger and sesame',
      'ginataang kalabasa at sitaw',
      'adobong sitaw',
      'laing',
      'pinakbet tagalog'
    ]
  },
  {
    label: 'Seafood Dish / Lamang-Dagat',
    keywords: [
      'sarsiadong isda',
      'kinilaw na dulong',
      'pesang isda',
      'fish pinipig',
      'stuffed squid',
      'tuna salpicao',
      'ginataang pusit',
      'ginataang alimasag',
      'tortang alimasag',
      'ginataang tilapia',
      'sinanglay na tilapia',
      'ginataang hito',
      'ginataang suso',
      'kilawin na tanigue'
    ]
  },
  {
    label: 'Appetizer / Pampagana',
    keywords: [
      'lumpia shanghai',
      'buffalo chicken wings',
      'potato salad',
      'coleslaw',
      'chicken macaroni salad',
      'avocado salad with tomatoes',
      'asparagus salad with shrimp',
      "tokwa't baboy",
      'saucy hotdog cocktails',
      'sinuglaw',
      'ukoy'
    ]
  },
  {
    label: 'Street Food / Pagkaing Kalye',
    keywords: [
      'kwek-kwek',
      'tokneneng',
      'carioca',
      'fishball',
      'corn dogs',
      'turon with langka',
      'kropeck from shrimp heads'
    ]
  },
  {
    label: 'Bread / Tinapay',
    keywords: [
      'pandesal',
      'banana bread',
      'carrot loaf',
      'ensaymada',
      'muffins',
      'waffles with filling'
    ]
  },
  {
    label: 'Baked Goods / Inihurnong Pagkain',
    keywords: [
      'vanilla cupcakes',
      'brownies',
      'cassava cake',
      'apple pie',
      'banana bread',
      'carrot loaf',
      'muffins',
      'basic butter cake',
      'chocolate chip cookies'
    ]
  },
  {
    label: 'Filipino Rice Cakes / Kakanin',
    keywords: [
      'puto maya',
      'kutsinta',
      'sapin-sapin',
      'bibingka',
      'puto bumbong',
      'suman malagkit',
      'espasol',
      'pichi-pichi',
      'tupig'
    ]
  },
  {
    label: 'Candy / Sweets / Kendi',
    keywords: [
      'peanut brittle',
      'ginger candy',
      'kamias candy',
      'tamarind balls',
      'turkish delight'
    ]
  },
  {
    label: 'Grilled Dish / Inihaw',
    keywords: [
      'chicken inasal',
      'pork barbecue',
      'basic grilled pizza dough'
    ]
  },
  {
    label: 'Rice Dish / Putaheng Kanin',
    keywords: [
      'champorado',
      'arroz caldo',
      'arroz a la cubana',
      'bringhe'
    ]
  },
  {
    label: 'Breakfast / Almusal',
    keywords: [
      'champorado',
      'pandesal',
      'pork tapa',
      'pancakes',
      'arroz caldo'
    ]
  },
  {
    label: 'Dipping Sauce / Sawsawan',
    keywords: [
      'special siopao sauce',
      'chicken gravy'
    ]
  },
  {
    label: 'Processed Food / Pagkaing Pinroseso',
    keywords: [
      'tuyo',
      'daing',
      'tinapa',
      'homemade dried mangoes',
      'vigan longganisa'
    ]
  },
  {
    label: 'Pasta / Pasta',
    keywords: [
      'carbonara',
      'filipino spaghetti',
      'baked spaghetti',
      'baked mac and cheese'
    ]
  },
  {
    label: 'Bar Chow / Pulutan',
    keywords: [
      'sisig',
      'dinakdakan',
      'pork barbecue',
      'buffalo chicken wings',
      'bopis',
      'sinuglaw'
    ]
  }
];

function normalizeText(value) {
  return String(value ?? '').toLowerCase();
}

function buildSearchText(recipe) {
  const parts = [
    recipe.name,
    recipe.description,
    recipe.category,
    Array.isArray(recipe.tags) ? recipe.tags.join(' ') : recipe.tags,
    Array.isArray(recipe.mealType) ? recipe.mealType.join(' ') : recipe.mealType
  ];

  return normalizeText(parts.filter(Boolean).join(' '));
}

function hasMatch(searchText) {
  return CATEGORY_RULES.some((rule) => rule.keywords.some((keyword) => searchText.includes(keyword)));
}

async function deleteUncovered() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const recipes = await collection
      .find({}, { projection: { _id: 1, name: 1, category: 1, description: 1, tags: 1, mealType: 1 } })
      .toArray();

    if (recipes.length === 0) {
      console.log('⚠️  No recipes found.');
      return;
    }

    const uncovered = recipes.filter((recipe) => !hasMatch(buildSearchText(recipe)));

    if (uncovered.length === 0) {
      console.log('✅ No uncovered recipes to delete.');
      return;
    }

    const ids = uncovered.map((recipe) => recipe._id);
    const result = await collection.deleteMany({ _id: { $in: ids } });

    console.log(`🗑️  Deleted recipes: ${result.deletedCount}`);
    uncovered.slice(0, 20).forEach((recipe, index) => {
      console.log(`${index + 1}. ${recipe.name} (${recipe._id})`);
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

deleteUncovered();
