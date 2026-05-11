import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  LayoutGrid,
  MessageSquare, 
  ChefHat, 
  Heart, 
  Settings, 
  LogOut, 
  Search, 
  Bell, 
  Plus, 
  ArrowRight, 
  Utensils, 
  UtensilsCrossed,
  Clock, 
  DollarSign,
  Send,
  User,
  Zap,
  TrendingUp,
  Bookmark,
  Star,
  Sparkles,
  Paperclip,
  Globe,
  PlusCircle,
  Database,
  ChevronDown,
  ChevronLeft,
  ArrowUpCircle
} from 'lucide-react';
import { View, Recipe } from '../types';
import { getAllRecipes, getCategories, getRecipeFeed, prefetchRecipeFeed } from '../lib/recipeApi.js';
import { getAuthToken, getUserProfile } from '../lib/authApi.js';
import { normalizeRecipe } from '../lib/recipeUtils';
import { buildApiUrl } from '../lib/apiBase';
 
interface DashboardViewProps {
  setActiveView: (view: View) => void;
}
 
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  isThinking?: boolean;
}
 
interface AuthUser {
   _id: string;
   fullName: string;
   email: string;
}
 
interface DashboardUser extends AuthUser {
   recipes?: string[];
   favorites?: string[];
}
 
export default function DashboardView({ setActiveView }: DashboardViewProps) {
  const RECIPES_PAGE_SIZE = 16;
  const [activeTab, setActiveTab] = useState<'overview' | 'chat' | 'recipes' | 'saved'>('overview');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAddingRecipe, setIsAddingRecipe] = useState(false);
  const [activeFormStep, setActiveFormStep] = useState(1);
  const [dashboardName, setDashboardName] = useState('CHEF');
  const [dbRecipes, setDbRecipes] = useState<Recipe[]>([]);
  const [suggestedRecipes, setSuggestedRecipes] = useState<Recipe[]>([]);
  const [curatedPages, setCuratedPages] = useState<Recipe[][]>([]);
  const [curatedPageIndex, setCuratedPageIndex] = useState(0);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [userRecipes, setUserRecipes] = useState<Recipe[]>([]);
  const [recipeHubRecipes, setRecipeHubRecipes] = useState<Recipe[]>([]);
  const [recipeHubPage, setRecipeHubPage] = useState(0);
  const [recipeHubHasMore, setRecipeHubHasMore] = useState(true);
  const [recipeHubLoading, setRecipeHubLoading] = useState(false);
  const [recipeHubError, setRecipeHubError] = useState('');
  const [recipeHubTotal, setRecipeHubTotal] = useState(0);
  const [recipeHubQuery, setRecipeHubQuery] = useState('');
  const [debouncedRecipeHubQuery, setDebouncedRecipeHubQuery] = useState('');
  const [recipeHubCategories, setRecipeHubCategories] = useState<string[]>([]);
  const [recipeHubCategory, setRecipeHubCategory] = useState('ALL');
  const [newRecipe, setNewRecipe] = useState<Partial<Recipe>>({
    name: '',
    description: '',
    ingredients: [''],
    steps: [''],
    category: '',
    flavorProfile: '',
    nutritionLabels: [''],
    prepMin: 0,
    cookMin: 0,
    servings: 0,
    difficulty: 'EASY',
    costLevel: '₱',
    tags: [''],
    mealType: '',
    mood: '',
    localSourcing: '',
    wasteReduction: '',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600'
  });
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Magandang araw! Ako si Ka-ulam. Ang iyong personal culinary agent. Ano ang iluluto natin ngayon? Mayroon ka bang specific budget o sahog na gustong gamitin?', model: 'Ka-Ulam' }
  ]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState<'english' | 'tagalog' | 'taglish'>('taglish');
  const [isChatbotThinking, setIsChatbotThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recipeHubSkeletons = Array.from({ length: 8 });
 
  // ─── Derived: total pages ────────────────────────────────────────────────────
  const recipeHubTotalPages = Math.max(1, Math.ceil(recipeHubTotal / RECIPES_PAGE_SIZE));
 
  // ─── Load initial dashboard data ────────────────────────────────────────────
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [recipesData, authUser] = await Promise.all([
          getAllRecipes(),
          Promise.resolve(getAuthToken() as AuthUser | null)
        ]);
 
        const normalizedRecipes = recipesData.map((recipe: any, index: number) => normalizeRecipe(recipe, index));
        const curatedCategoryMap = normalizedRecipes.reduce((acc: any, recipe: Recipe) => {
          const key = recipe.category || 'UNSPECIFIED';
          if (!acc.has(key)) acc.set(key, []);
          acc.get(key).push(recipe);
          return acc;
        }, new Map());
 
        const curatedPool = Array.from(curatedCategoryMap.values()).flatMap((recipes: any) =>
          recipes
            .slice()
            .sort((a: Recipe, b: Recipe) => Number(b.rating ?? 0) - Number(a.rating ?? 0))
            .slice(0, 1)
        );
 
        const sortedCuratedPool = (curatedPool as Recipe[])
          .slice()
          .sort((a, b) => Number(b.rating ?? 0) - Number(a.rating ?? 0));
 
        const curatedChunks: Recipe[][] = [];
        for (let i = 0; i < sortedCuratedPool.length; i += 4) {
          curatedChunks.push(sortedCuratedPool.slice(i, i + 4));
        }
 
        setDbRecipes(normalizedRecipes);
        setCuratedPages(curatedChunks);
        setCuratedPageIndex(0);
        setSuggestedRecipes(curatedChunks[0] || []);
 
        const activeUser = authUser?._id ? (await getUserProfile(authUser._id)) as DashboardUser : null;
        const displayName = activeUser?.fullName || authUser?.fullName || 'CHEF';
        setDashboardName(String(displayName).toUpperCase());
 
        const recipeMap = new Map(normalizedRecipes.map((recipe: Recipe) => [recipe.id, recipe]));
        const userRecipeIds = activeUser?.recipes || [];
        const favoriteIds = activeUser?.favorites || [];
 
        setUserRecipes(
          userRecipeIds
            .map((recipeId: string) => recipeMap.get(String(recipeId)))
            .filter((recipe: Recipe | undefined): recipe is Recipe => Boolean(recipe))
        );
 
        setSavedRecipes(
          favoriteIds
            .map((recipeId: string) => recipeMap.get(String(recipeId)))
            .filter((recipe: Recipe | undefined): recipe is Recipe => Boolean(recipe))
        );
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        setDbRecipes([]);
        setSuggestedRecipes([]);
        setUserRecipes([]);
        setSavedRecipes([]);
        setCuratedPages([]);
        setCuratedPageIndex(0);
      }
    };
 
    loadDashboardData();
  }, []);
 
  // ─── Rotate curated suggestions ─────────────────────────────────────────────
  useEffect(() => {
    if (curatedPages.length === 0) return;
    setSuggestedRecipes(curatedPages[0]);
    setCuratedPageIndex(0);
 
    const rotationId = setInterval(() => {
      setCuratedPageIndex((prev) => {
        const next = (prev + 1) % curatedPages.length;
        setSuggestedRecipes(curatedPages[next]);
        return next;
      });
    }, 50000);
 
    return () => clearInterval(rotationId);
  }, [curatedPages]);
 
  // ─── Load categories ─────────────────────────────────────────────────────────
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();
        const sorted = data.slice().sort((a: string, b: string) => a.localeCompare(b));
        setRecipeHubCategories(sorted);
      } catch (error) {
        console.error('Failed to load categories:', error);
        setRecipeHubCategories([]);
      }
    };
 
    loadCategories();
  }, []);
 
  // ─── Debounce search query ───────────────────────────────────────────────────
  useEffect(() => {
    const debounceId = setTimeout(() => {
      setDebouncedRecipeHubQuery(recipeHubQuery.trim());
    }, 350);
 
    return () => clearTimeout(debounceId);
  }, [recipeHubQuery]);
 
  // ─── Reset pagination when search query changes ──────────────────────────────
  useEffect(() => {
    setRecipeHubRecipes([]);
    setRecipeHubPage(0);
    setRecipeHubHasMore(true);
    setRecipeHubError('');
    setRecipeHubTotal(0);
  }, [debouncedRecipeHubQuery]);
 
  // ─── Reset pagination when category changes ──────────────────────────────────
  useEffect(() => {
    setRecipeHubRecipes([]);
    setRecipeHubPage(0);
    setRecipeHubHasMore(true);
    setRecipeHubError('');
    setRecipeHubTotal(0);
  }, [recipeHubCategory]);
 
  // ─── FIX: Load Recipe Hub page ───────────────────────────────────────────────
  // Removed `recipeHubHasMore` from deps — it was causing double-fetches.
  // Pages now load purely based on page number, query, and category.
  useEffect(() => {
    let isActive = true;
 
    if (activeTab !== 'recipes') return () => { isActive = false; };
 
    const loadRecipeHubPage = async () => {
      setRecipeHubLoading(true);
      setRecipeHubError('');
 
      try {
        const payload = await getRecipeFeed({
          q: debouncedRecipeHubQuery,
          category: recipeHubCategory === 'ALL' ? '' : recipeHubCategory,
          limit: RECIPES_PAGE_SIZE,
          skip: recipeHubPage * RECIPES_PAGE_SIZE
        });
 
        console.log('[RecipeHub] API response:', {
          query: debouncedRecipeHubQuery,
          category: recipeHubCategory,
          page: recipeHubPage,
          recipesReturned: payload.data?.length,
          total: payload.total,
          hasMore: payload.hasMore,
        });
 
        if (!isActive) return;
 
        const normalized = (payload.data ?? []).map((recipe: any, index: number) =>
          normalizeRecipe(recipe, index + recipeHubPage * RECIPES_PAGE_SIZE)
        );
 
        // FIX: Use payload.total so pagination calculates correctly.
        // If your backend doesn't return total yet, this will fall back to
        // estimating based on whether a full page was returned.
        const total = payload.total != null
          ? Number(payload.total)
          : normalized.length === RECIPES_PAGE_SIZE
            ? (recipeHubPage + 2) * RECIPES_PAGE_SIZE  // at least one more page
            : recipeHubPage * RECIPES_PAGE_SIZE + normalized.length;
 
        setRecipeHubRecipes(normalized);
        setRecipeHubHasMore(Boolean(payload.hasMore ?? normalized.length === RECIPES_PAGE_SIZE));
        setRecipeHubTotal(total);
 
        console.log('[RecipeHub] State updated:', {
          recipesCount: normalized.length,
          total,
          totalPages: Math.ceil(total / RECIPES_PAGE_SIZE),
        });
 
        // Prefetch next page in background
        if (payload.hasMore ?? normalized.length === RECIPES_PAGE_SIZE) {
          prefetchRecipeFeed({
            q: debouncedRecipeHubQuery,
            category: recipeHubCategory === 'ALL' ? '' : recipeHubCategory,
            limit: RECIPES_PAGE_SIZE,
            skip: (recipeHubPage + 1) * RECIPES_PAGE_SIZE
          });
        }
      } catch (error) {
        if (!isActive) return;
        console.error('[RecipeHub] Failed to load:', error);
        setRecipeHubError('Failed to load recipes. Please try again.');
      } finally {
        if (isActive) setRecipeHubLoading(false);
      }
    };
 
    loadRecipeHubPage();
 
    return () => { isActive = false; };
 
  // FIX: `recipeHubHasMore` removed from deps — it caused an extra fetch
  // every time hasMore changed, doubling requests on first load.
  }, [activeTab, debouncedRecipeHubQuery, recipeHubPage, recipeHubCategory]);
 
  // ─── Chat scroll ─────────────────────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
 
  // ─── Dictionary ──────────────────────────────────────────────────────────────
  const dictionary = {
    english: {
      history: "HISTORY",
      upgrade: "Upgrade to Pro",
      engine: "ENGINE",
      live: "Live via OpenRouter",
      newThread: "New Chat",
      heroDesc: "I'm Ka-Ulam, your ethical culinary AI. Ask me for budget-friendly recipes, market hacks, or regional secrets.",
      placeholder: "What are we cooking today?",
      status: "POWER & INTERNET: ACTIVE | LOCAL FOOD: ANALYZING",
      createRecipe: "Create New Recipe",
      createRecipeSub: "Add a new culinary masterpiece to the Ka-Ulam library.",
      basicMetadata: "BASIC_METADATA",
      recipeName: "RECIPE_NAME",
      imageUrl: "IMAGE_URL",
      description: "DESCRIPTION",
      ingredients: "INGREDIENTS",
      steps: "STEPS",
      classification: "DNA & CLASSIFICATION",
      category: "CATEGORY",
      flavorProfile: "FLAVOR_PROFILE",
      mood: "MOOD",
      mealType: "MEAL_TYPE",
      difficulty: "DIFFICULTY",
      costLevel: "COST_LEVEL",
      quantitativeData: "QUANTITATIVE_DATA",
      prepMin: "PREP_MIN",
      cookMin: "COOK_MIN",
      servings: "SERVINGS",
      tags: "TAGS",
      nutrition: "NUTRITION",
      sustainability: "SUSTAINABILITY & ETHICS",
      localSourcing: "LOCAL_SOURCING_TIP",
      wasteReduction: "WASTE_REDUCTION",
      discard: "Discard Draft",
      deploy: "DEPLOY_INITIALIZATION",
      newEntries: "NEW ENTRIES",
      suggestedRecipes: "SUGGESTED RECIPES",
      search: "SEARCH INTELLIGENCE...",
      newRecipeBtn: "NEW RECIPE",
      examplePrompts: [
        { title: "Budget Lunch", desc: "Suggest a lunch menu for 3 pax under ₱200.", icon: <DollarSign className="w-4 h-4" /> },
        { title: "Market Hack", desc: "How to tell if Bangus is fresh in 3 steps?", icon: <Zap className="w-4 h-4" /> },
        { title: "Mood Cooking", desc: "Feeling lazy but want something nutritious.", icon: <Heart className="w-4 h-4" /> },
        { title: "Regional Logic", desc: "Why is Davao Sinigang different from Manila?", icon: <Globe className="w-4 h-4" /> },
      ]
    },
    tagalog: {
      history: "KASAYSAYAN NG CHAT",
      upgrade: "Mag-upgrade sa Pro",
      engine: "ENGINE",
      live: "Live gamit ang OpenRouter",
      newThread: "Bagong Chat",
      heroDesc: "Ako si Ka-Ulam, ang iyong ethical culinary AI. Magtanong tungkol sa murang recipes, diskarte sa palengke, at sikreto ng rehiyon.",
      placeholder: "Anong lulutuin natin ngayon?",
      createRecipe: "Gumawa ng Bagong Recipe",
      createRecipeSub: "Magdagdag ng bagong obra maestra sa kusina sa library ng Ka-Ulam.",
      basicMetadata: "BATAYANG_IMPORMASYON",
      recipeName: "PANGALAN_NG_RECIPE",
      imageUrl: "URL_NG_LARAWAN",
      description: "PAGLALARAWAN",
      ingredients: "MGA_SANGKAP",
      steps: "MGA_HAKBANG",
      classification: "DNA_AT_KLASIPIKASYON",
      category: "KATEGORYA",
      flavorProfile: "LASA_AT_PROPAYL",
      mood: "MOOD",
      mealType: "URI_NG_PAGKAIN",
      difficulty: "KAHIRAPAN",
      costLevel: "ANTAS_NG_GASTOS",
      quantitativeData: "KWANTITATIBONG_DATOS",
      prepMin: "ORAS_NG_PAGHAHANDA",
      cookMin: "ORAS_NG_PAGLULUTO",
      servings: "MGA_SILBI",
      tags: "MGA_TAG",
      nutrition: "NUTRISYON",
      sustainability: "SUSTAINABILITY AT ETIKA",
      localSourcing: "TIP_SA_LOKAL_NA_PAGBILI",
      wasteReduction: "PAGBAWAS_NG_SAYANG",
      discard: "I-discard ang Draft",
      deploy: "I-DEPLOY_ANG_ENGINE",
      newEntries: "BAGONG RESIPE",
      suggestedRecipes: "MGA REKOMENDADONG RECIPE",
      search: "MAG-SEARCH...",
      newRecipeBtn: "BAGONG RECIPE",
      examplePrompts: [
        { title: "Murang Tanghalian", desc: "Magmungkahi ng menu para sa 3 tao sa ilalim ng ₱200.", icon: <DollarSign className="w-4 h-4" /> },
        { title: "Market Hack", desc: "Paano malalaman kung sariwa ang Bangus sa 3 hakbang?", icon: <Zap className="w-4 h-4" /> },
        { title: "Mood Cooking", desc: "Tinatamad pero gustong kumain ng masustansya.", icon: <Heart className="w-4 h-4" /> },
        { title: "Regional Logic", desc: "Bakit iba ang Sinigang sa Davao kaysa sa Maynila?", icon: <Globe className="w-4 h-4" /> },
      ]
    },
    taglish: {
      history: "HISTORY",
      upgrade: "Upgrade to Pro",
      engine: "ENGINE",
      live: "Live via OpenRouter",
      newThread: "New Chat",
      heroDesc: "I'm Ka-Ulam, your ethical culinary AI. Ask me for budget-friendly recipes, market hacks, or regional secrets.",
      placeholder: "Anong lulutuin natin ngayon?",
      createRecipe: "Create New Recipe",
      createRecipeSub: "Add a new culinary masterpiece to the Ka-Ulam library.",
      basicMetadata: "BASIC_METADATA",
      recipeName: "RECIPE_NAME",
      imageUrl: "IMAGE_URL",
      description: "DESCRIPTION",
      ingredients: "INGREDIENTS",
      steps: "STEPS",
      classification: "DNA & CLASSIFICATION",
      category: "CATEGORY",
      flavorProfile: "FLAVOR_PROFILE",
      mood: "MOOD",
      mealType: "MEAL_TYPE",
      difficulty: "DIFFICULTY",
      costLevel: "COST_LEVEL",
      quantitativeData: "QUANTITATIVE_DATA",
      prepMin: "PREP_MIN",
      cookMin: "COOK_MIN",
      servings: "SERVINGS",
      tags: "TAGS",
      nutrition: "NUTRITION",
      sustainability: "SUSTAINABILITY & ETHICS",
      localSourcing: "LOCAL_SOURCING_TIP",
      wasteReduction: "WASTE_REDUCTION",
      discard: "Discard Draft",
      deploy: "DEPLOY_INITIALIZATION",
      newEntries: "NEW ENTRIES",
      suggestedRecipes: "SUGGESTED RECIPES",
      search: "ANONG PAGKAIN HINAHANAP MO?...",
      newRecipeBtn: "MAG-ADD NG RECIPE",
      examplePrompts: [
        { title: "Budget Lunch", desc: "Suggest a lunch menu for 3 pax under ₱200.", icon: <DollarSign className="w-4 h-4" /> },
        { title: "Market Hack", desc: "How to tell if Bangus is fresh in 3 steps?", icon: <Zap className="w-4 h-4" /> },
        { title: "Mood Cooking", desc: "Feeling lazy but want something nutritious.", icon: <Heart className="w-4 h-4" /> },
        { title: "Regional Logic", desc: "Why is Davao Sinigang different from Manila?", icon: <Globe className="w-4 h-4" /> },
      ]
    }
  };
 
  const d = dictionary[language];

  const stats = [
    { label: 'RECIPES COOKED', value: String(userRecipes.length), icon: <Utensils className="w-4 h-4" /> },
    { label: 'FAVORITES', value: String(savedRecipes.length), icon: <Bookmark className="w-4 h-4" /> },
    { label: 'LIBRARY SIZE', value: String(dbRecipes.length), icon: <Database className="w-4 h-4" /> },
  ];
 
  const activeAssistantModel = messages.slice().reverse().find((message: Message) => message.role === 'assistant' && message.model)?.model;

  const formatChatResponse = (raw: string | null | undefined) => {
    if (!raw) return '';

    let sanitized = raw.replace(/<[^>]+>/g, ' ');
    sanitized = sanitized.replace(/^#+\s*/gm, '');
    sanitized = sanitized.replace(/\*\*|__|\*|_|`/g, '');
    sanitized = sanitized.replace(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\uFE0F]/gu, '');

    const lines = sanitized
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/^[-*•\d\.\)\s]+/, '').trim())
      .filter(line => line.length > 0);

    if (lines.length === 0) return '';

    const paragraph = lines
      .map(line => (/[.!?]$/.test(line) ? line : `${line}.`))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    return paragraph;
  };

  // ─── Send Chat Message ────────────────────────────────────────────────────────
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
 
    const timestamp = Date.now();
    const userMessageId = timestamp.toString();
    const assistantMessageId = (timestamp + 1).toString();
    const currentInput = input;
 
    const userMessage: Message = { id: userMessageId, role: 'user', content: currentInput };
    const thinkingMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: 'Thinking...',
      isThinking: true,
      model: 'OpenRouter free model pool'
    };
 
    setMessages(prev => [...prev, userMessage, thinkingMessage]);
    setIsChatbotThinking(true);
    setInput('');
 
    try {
      // Call backend endpoint instead of OpenRouter directly
      // This uses the secure 3-layer filtering system
      const response = await fetch(buildApiUrl('/chatbot/ask'), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: currentInput
        })
      });
 
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Chatbot API Error:", errorData);
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
      }
 
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Chatbot request failed');
      }
      
      const reply = formatChatResponse(data.message);
      const model = data.model || data.layer?.match(/\((.+)\)/)?.[1] || 'OpenRouter free model';
 
      setMessages(prev => prev.map(message => (
        message.id === assistantMessageId
          ? {
              ...message,
              content: reply,
              model,
              isThinking: false
            }
          : message
      )));
    } catch (error) {
      console.error('Chat Error:', error);
      setMessages(prev => prev.map(message => (
        message.id === assistantMessageId
          ? {
              ...message,
              content: `Paumanhin, nagkaroon ng error: ${error instanceof Error ? error.message : 'Unknown error'}. Pakisuyong subukan ulit.`,
              isThinking: false,
              model: 'OpenRouter'
            }
          : message
      )));
    } finally {
      setIsChatbotThinking(false);
    }
  };
 
  return (
    <div className="flex bg-white min-h-screen text-black font-sans selection:bg-pro-red selection:text-white">
 
      {/* ── Sidebar ─────────────────────────────────────────────────────────────── */}
      <motion.aside
        animate={{ width: isSidebarCollapsed ? 100 : 260 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-pro-dark flex flex-col h-screen sticky top-0 border-r border-white/5 z-20 shrink-0 overflow-hidden"
      >
        <div className={`flex flex-col items-center ${isSidebarCollapsed ? 'p-5' : 'p-8'} lg:items-start shrink-0`}>
          <div className="flex items-center justify-between w-full mb-12">
            <div className={`flex items-center gap-3 ${isSidebarCollapsed ? 'w-full justify-center' : ''}`}>
              <motion.div
                layout
                className={`${isSidebarCollapsed ? 'w-14 h-14' : 'w-10 h-10'} bg-pro-red rounded-full flex items-center justify-center shrink-0 shadow-xl shadow-pro-red/20`}
              >
                <ChefHat className={`${isSidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5'} text-white transition-all duration-500`} />
              </motion.div>
              <AnimatePresence mode="wait">
                {!isSidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="text-xl font-expanded tracking-tighter text-white hidden lg:block whitespace-nowrap"
                  >
                    PRO<span className="text-pro-red">COOK</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <AnimatePresence>
              {!isSidebarCollapsed && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsSidebarCollapsed(true)}
                  className="hidden lg:flex p-2 text-white/20 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
 
          <nav className={`w-full flex flex-col ${isSidebarCollapsed ? 'items-center gap-4' : 'gap-4'}`}>
            {[
              { id: 'overview', icon: <LayoutGrid className={isSidebarCollapsed ? "w-5 h-5" : "w-5 h-5 lg:w-4 lg:h-4"} />, label: 'OVERVIEW' },
              { id: 'chat', icon: <MessageSquare className={isSidebarCollapsed ? "w-5 h-5" : "w-5 h-5 lg:w-4 lg:h-4"} />, label: 'KA-ULAM AI' },
              { id: 'recipes', icon: <UtensilsCrossed className={isSidebarCollapsed ? "w-5 h-5" : "w-5 h-5 lg:w-4 lg:h-4"} />, label: 'RECIPE HUB' },
              { id: 'saved', icon: <Bookmark className={isSidebarCollapsed ? "w-5 h-5" : "w-5 h-5 lg:w-4 lg:h-4"} />, label: 'FAVORITES' },
            ].map((item) => (
              <div key={item.id} className="relative w-full flex justify-center">
                <button
                  onClick={() => setActiveTab(item.id as any)}
                  className={`relative z-10 flex items-center transition-all duration-500 text-[10px] font-display font-black tracking-[0.3em] ${
                    activeTab === item.id
                      ? 'text-white'
                      : 'text-white/20 hover:text-white hover:bg-white/5'
                  } ${isSidebarCollapsed ? 'w-14 h-14 justify-center rounded-full' : 'w-full lg:px-6 py-4 rounded-full justify-start gap-4'} ${activeTab === item.id && !isSidebarCollapsed ? 'bg-pro-red' : ''}`}
                >
                  {activeTab === item.id && isSidebarCollapsed && (
                    <motion.div
                      layoutId="sidebarActiveCircle"
                      className="absolute inset-0 bg-pro-red rounded-full -z-10 shadow-lg shadow-pro-red/30"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  {item.icon}
                  <AnimatePresence mode="wait">
                    {!isSidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="hidden lg:block whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            ))}
 
            {isSidebarCollapsed && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setIsSidebarCollapsed(false)}
                className="mt-2 p-4 text-white/10 hover:text-white/40 transition-colors"
                title="Expand Navigation"
              >
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            )}
          </nav>
        </div>
 
        <div className={`mt-auto w-full border-t border-white/5 flex flex-col items-center shrink-0 ${isSidebarCollapsed ? 'p-4 pb-8 pt-8' : 'p-8 pt-8'}`}>
          <motion.div
            layout
            className={`flex items-center justify-center ${isSidebarCollapsed ? 'mb-8' : 'lg:justify-start gap-4 mb-8'} group cursor-pointer w-full`}
          >
            <div className={`${isSidebarCollapsed ? 'w-14 h-14 border-2' : 'w-10 h-10 lg:w-12 lg:h-12 border'} rounded-full border-white/10 overflow-hidden group-hover:border-pro-red transition-all duration-500 shrink-0`}>
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
            </div>
            <AnimatePresence mode="wait">
              {!isSidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="overflow-hidden hidden lg:block"
                >
                  <p className="text-sm font-expanded text-white truncate group-hover:text-pro-red transition-colors">{dashboardName}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          <button
            onClick={() => setActiveView('home')}
            className={`flex items-center justify-center transition-all duration-300 ${
              isSidebarCollapsed
                ? 'text-white/20 hover:text-pro-red w-12 h-12'
                : 'w-full gap-4 px-6 h-12 text-white/20 hover:text-pro-red text-[10px] font-display font-black tracking-[0.3em] lg:justify-start'
            }`}
          >
            <LogOut className={isSidebarCollapsed ? "w-5 h-5" : "w-4 h-4"} />
            <AnimatePresence mode="wait">
              {!isSidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="hidden lg:block whitespace-nowrap"
                >
                  SIGN OUT
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>
 
      {/* ── Main Content ─────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FAF9F6]">
 
        {/* Header */}
        <header className="h-[80px] bg-white border-b border-black/[0.03] px-6 lg:px-10 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4 bg-stone-50 px-6 h-[46px] rounded-full w-full max-w-[400px]">
            <Search className="w-3.5 h-3.5 text-stone-400" />
            <input
              type="text"
              value={recipeHubQuery}
              onChange={(e) => setRecipeHubQuery(e.target.value)}
              onFocus={() => setActiveTab('recipes')}
              placeholder="Search recipes"
              className="bg-transparent border-none focus:outline-none text-[10px] font-display font-black tracking-widest w-full"
            />
          </div>
          <div className="flex items-center gap-4 lg:gap-8 ml-4">
            <button className="relative text-stone-400 hover:text-pro-red transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-pro-red rounded-full" />
            </button>
            <button
              onClick={() => setIsAddingRecipe(true)}
              className="h-[46px] px-6 lg:px-8 bg-black text-white text-[10px] font-display font-black tracking-[0.2em] rounded-full hover:bg-pro-red transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" /> <span className="hidden sm:inline uppercase">{d.newRecipeBtn}</span>
            </button>
          </div>
        </header>
 
        {/* Tab Content */}
        <div className="flex-1 relative overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">
 
            {/* ── OVERVIEW ──────────────────────────────────────────────────────── */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1 overflow-y-auto p-6 lg:p-12 custom-scrollbar space-y-12 max-w-[1500px] mx-auto w-full"
              >
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-black/[0.03] pb-12">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-6 h-[1.5px] bg-pro-red" />
                      <span className="text-[11px] font-display font-black text-pro-red tracking-[0.4em] uppercase">Dashboard Overview</span>
                    </div>
                    <h1 className="text-[40px] lg:text-[56px] font-expanded tracking-tight leading-[1] mb-6">
                      MABUHAY, <span className="text-pro-red uppercase">{dashboardName}.</span>
                    </h1>
                    <p className="text-[16px] text-stone-400 max-w-md font-medium leading-relaxed">System status: All culinary layers are active. We've detected 3 new regional trends matching your flavor profile.</p>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {stats.map((stat, i) => (
                      <div key={i} className="bg-white p-6 rounded-[32px] border border-black/[0.02] min-w-[160px] lg:min-w-[180px] flex-1">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-9 h-9 bg-stone-50 rounded-full flex items-center justify-center text-pro-red">
                            {stat.icon}
                          </div>
                        </div>
                        <p className="text-3xl font-expanded tracking-tighter leading-none mb-2">{stat.value}</p>
                        <p className="text-[9px] text-stone-300 font-display font-black uppercase tracking-[0.3em]">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
 
                {/* Ka-ulam Quick Access */}
                <div className="grid grid-cols-12 gap-8">
                  <div className="col-span-8 bg-pro-dark rounded-[60px] p-16 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-pro-red blur-[200px] opacity-[0.12] translate-x-1/4 -translate-y-1/4" />
                    <div className="relative z-10 flex flex-col h-full justify-between min-h-[350px]">
                      <div>
                        <div className="flex items-center gap-3 mb-10">
                          <span className="text-[10px] font-display font-black text-pro-red tracking-[0.4em] uppercase border border-pro-red/30 px-4 py-1.5 rounded-full">AI Assistant Active</span>
                        </div>
                        <h2 className="text-[48px] font-expanded leading-[1] tracking-tight mb-10 max-w-2xl">
                          "Synthesizing <span className="text-pro-red">Bicol Express</span> recipes tailored for Davao city pantry dynamics."
                        </h2>
                      </div>
                      <div className="flex">
                        <button onClick={() => setActiveTab('chat')} className="h-[70px] px-12 bg-pro-red text-white rounded-full font-display font-black text-[11px] tracking-[0.3em] hover:bg-white hover:text-black transition-all flex items-center gap-4">
                          ENGAGE CONVERSATION <ArrowRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
 
                  <div className="col-span-4 bg-white rounded-[60px] p-12 border border-black/[0.04] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-12">
                        <h3 className="font-expanded tracking-tight text-[24px]">ProTip</h3>
                        <TrendingUp className="text-pro-red w-4 h-4 opacity-50" />
                      </div>
                      <div className="space-y-6">
                        <div className="bg-[#FAF9F6] p-10 rounded-[45px] border border-black/[0.02]">
                          <Zap className="w-8 h-8 text-pro-red mb-8" />
                          <p className="font-expanded text-xl mb-4 leading-tight tracking-tight uppercase">SALINE GINGER PRESERVATION</p>
                          <p className="text-[14px] text-stone-400 leading-relaxed font-medium">Inject rock salt into ginger storage to anchor moisture levels, effectively doubling life cycles in regional humidity.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
 
                {/* Popular Recipes */}
                <div>
                  <div className="flex items-center justify-between mb-16">
                    <div className="flex items-center gap-6">
                      <h2 className="text-[40px] font-expanded tracking-tight uppercase">Popular Recipes</h2>
                      <span className="text-[10px] font-display font-black text-white px-4 py-1.5 bg-black rounded-full tracking-[0.3em]">4 NEW ENTRIES</span>
                    </div>
                    <button className="text-stone-300 hover:text-pro-red font-display font-black text-[10px] tracking-[0.4em] transition-all uppercase">View All Recipes</button>
                  </div>
 
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-12">
                    {suggestedRecipes.map((recipe, i) => (
                      <div
                        key={i}
                        onClick={() => setActiveView('login')}
                        className="group cursor-pointer bg-white rounded-[60px] p-8 border border-black/[0.03] hover:shadow-2xl transition-all duration-700 h-fit"
                      >
                        <div className="relative aspect-[16/11] rounded-[45px] overflow-hidden mb-8 border border-black/[0.03]">
                          <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" />
                          <div className="absolute top-6 right-6 p-4 bg-white/10 backdrop-blur-xl rounded-full text-white hover:bg-pro-red transition-all">
                            <Heart className="w-4 h-4" />
                          </div>
                          <div className="absolute bottom-6 left-6 flex gap-2">
                            <span className="h-8 px-4 flex items-center bg-black/60 backdrop-blur-xl text-white text-[8px] font-display font-black rounded-full uppercase tracking-widest">{recipe.mealType}</span>
                            <span className="h-8 px-4 flex items-center bg-pro-red text-white text-[8px] font-display font-black rounded-full uppercase tracking-widest">{recipe.mood}</span>
                          </div>
                        </div>
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-display font-black text-pro-red tracking-[0.3em] uppercase">{recipe.category}</span>
                            <span className="text-[9px] font-display font-black text-black/20 tracking-[0.3em] uppercase">BY {recipe.owner}</span>
                          </div>
                          <h4 className="text-[28px] font-expanded tracking-tight leading-none group-hover:text-pro-red transition-all text-stone-800">{recipe.name}</h4>
                          <p className="text-[13px] text-stone-400 font-medium leading-relaxed line-clamp-2">{recipe.description}</p>
                          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-black/[0.03]">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-stone-300" />
                              <p className="text-[9px] text-stone-500 font-display font-black uppercase tracking-widest">{recipe.prepMin + recipe.cookMin} MIN</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-3.5 h-3.5 text-stone-300" />
                              <p className="text-[9px] text-stone-500 font-display font-black uppercase tracking-widest">COST: {recipe.costLevel}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 pt-2">
                            {recipe.tags.slice(0, 2).map((tag, idx) => (
                              <span key={idx} className="px-3 py-1 bg-stone-50 border border-black/[0.03] text-[8px] font-display font-black text-stone-400 rounded-full tracking-widest">#{tag}</span>
                            ))}
                            {recipe.tags.length > 2 && <span className="text-[8px] font-display font-black text-stone-300 self-center">+{recipe.tags.length - 2} MORE</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
 
                {/* Modals */}
                <AnimatePresence>
                  {isAddingRecipe && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-12 bg-black/60 backdrop-blur-md"
                      onClick={() => setIsAddingRecipe(false)}
                    >
                      <motion.div
                        initial={{ scale: 0.9, y: 30 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 30 }}
                        className="bg-white w-full max-w-5xl h-[90vh] rounded-[40px] lg:rounded-[60px] overflow-hidden flex flex-col shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="p-8 lg:p-10 border-b border-black/[0.05] flex items-center justify-between sticky top-0 bg-white z-10 shrink-0">
                          <div className="flex items-center gap-6">
                            <div>
                              <h2 className="text-[24px] font-expanded tracking-tight uppercase leading-none mb-2">{d.createRecipe}</h2>
                              <p className="text-[10px] font-display font-black text-pro-red tracking-widest uppercase">STEP_0{activeFormStep} / DASHBOARD_SYNC</p>
                            </div>
                            <div className="hidden md:flex items-center gap-2 h-8">
                              {[1, 2, 3, 4].map(s => (
                                <div key={s} className={`w-12 h-1 rounded-full transition-all duration-500 ${activeFormStep >= s ? 'bg-pro-red' : 'bg-stone-100'}`} />
                              ))}
                            </div>
                          </div>
                          <button
                            onClick={() => setIsAddingRecipe(false)}
                            className="w-12 h-12 rounded-full bg-stone-50 border border-black/[0.05] flex items-center justify-center hover:bg-pro-red hover:text-white transition-all"
                          >
                            <Plus className="w-6 h-6 rotate-45" />
                          </button>
                        </div>
 
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:p-12 bg-[#FAF9F6]">
                          <AnimatePresence mode="wait">
                            {activeFormStep === 1 && (
                              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                                <section className="bg-white p-8 lg:p-12 rounded-[45px] border border-black/[0.03] space-y-8">
                                  <div className="flex items-center gap-3">
                                    <div className="w-6 h-[2px] bg-pro-red" />
                                    <Sparkles className="w-4 h-4 text-pro-red" />
                                    <span className="text-[10px] font-display font-black text-pro-red tracking-[0.4em] uppercase">{d.basicMetadata}</span>
                                  </div>
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                      <label className="text-[9px] font-display font-black text-stone-400 tracking-widest uppercase">{d.recipeName}</label>
                                      <input type="text" value={newRecipe.name} onChange={(e) => setNewRecipe({...newRecipe, name: e.target.value})} placeholder="e.g. Garlic Butter Shrimp" className="w-full h-14 px-6 bg-stone-50 border border-black/[0.05] rounded-2xl focus:outline-none focus:border-pro-red transition-colors text-sm font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-[9px] font-display font-black text-stone-400 tracking-widest uppercase">{d.imageUrl}</label>
                                      <input type="text" value={newRecipe.image} onChange={(e) => setNewRecipe({...newRecipe, image: e.target.value})} placeholder="https://images.unsplash.com/..." className="w-full h-14 px-6 bg-stone-50 border border-black/[0.05] rounded-2xl focus:outline-none focus:border-pro-red transition-colors text-sm font-medium" />
                                    </div>
                                    <div className="lg:col-span-2 space-y-2">
                                      <label className="text-[9px] font-display font-black text-stone-400 tracking-widest uppercase">{d.description}</label>
                                      <textarea value={newRecipe.description} onChange={(e) => setNewRecipe({...newRecipe, description: e.target.value})} placeholder="Briefly describe the soul of this dish..." className="w-full h-32 p-6 bg-stone-50 border border-black/[0.05] rounded-3xl focus:outline-none focus:border-pro-red transition-colors text-sm font-medium resize-none" />
                                    </div>
                                  </div>
                                </section>
                              </motion.div>
                            )}
 
                            {activeFormStep === 2 && (
                              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <section className="bg-white p-8 lg:p-12 rounded-[45px] border border-black/[0.03] space-y-8">
                                  <div className="flex items-center gap-3">
                                    <div className="w-6 h-[2px] bg-pro-red" />
                                    <LayoutGrid className="w-4 h-4 text-pro-red" />
                                    <span className="text-[10px] font-display font-black text-pro-red tracking-[0.4em] uppercase">{d.classification}</span>
                                  </div>
                                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="space-y-2">
                                      <label className="text-[9px] font-display font-black text-stone-400 tracking-widest uppercase">{d.category}</label>
                                      <input type="text" value={newRecipe.category} onChange={(e) => setNewRecipe({...newRecipe, category: e.target.value})} placeholder="e.g. MAIN DISH" className="w-full h-12 px-5 bg-stone-50 border border-black/[0.05] rounded-xl focus:outline-none focus:border-pro-red transition-colors text-xs font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-[9px] font-display font-black text-stone-400 tracking-widest uppercase">{d.flavorProfile}</label>
                                      <input type="text" value={newRecipe.flavorProfile} onChange={(e) => setNewRecipe({...newRecipe, flavorProfile: e.target.value})} placeholder="e.g. SAVORY / SPICY" className="w-full h-12 px-5 bg-stone-50 border border-black/[0.05] rounded-xl focus:outline-none focus:border-pro-red transition-colors text-xs font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-[9px] font-display font-black text-stone-400 tracking-widest uppercase">{d.mood}</label>
                                      <input type="text" value={newRecipe.mood} onChange={(e) => setNewRecipe({...newRecipe, mood: e.target.value})} placeholder="e.g. ENERGETIC" className="w-full h-12 px-5 bg-stone-50 border border-black/[0.05] rounded-xl focus:outline-none focus:border-pro-red transition-colors text-xs font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-[9px] font-display font-black text-stone-400 tracking-widest uppercase">{d.mealType}</label>
                                      <input type="text" value={newRecipe.mealType} onChange={(e) => setNewRecipe({...newRecipe, mealType: e.target.value})} placeholder="e.g. LUNCH" className="w-full h-12 px-5 bg-stone-50 border border-black/[0.05] rounded-xl focus:outline-none focus:border-pro-red transition-colors text-xs font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-[9px] font-display font-black text-stone-400 tracking-widest uppercase">{d.difficulty}</label>
                                      <select value={newRecipe.difficulty} onChange={(e) => setNewRecipe({...newRecipe, difficulty: e.target.value as any})} className="w-full h-12 px-5 bg-stone-50 border border-black/[0.05] rounded-xl focus:outline-none focus:border-pro-red transition-colors text-xs font-medium appearance-none">
                                        <option value="EASY">EASY</option>
                                        <option value="MEDIUM">MEDIUM</option>
                                        <option value="HARD">HARD</option>
                                        <option value="PRO">PRO</option>
                                      </select>
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-[9px] font-display font-black text-stone-400 tracking-widest uppercase">{d.costLevel}</label>
                                      <select value={newRecipe.costLevel} onChange={(e) => setNewRecipe({...newRecipe, costLevel: e.target.value as any})} className="w-full h-12 px-5 bg-stone-50 border border-black/[0.05] rounded-xl focus:outline-none focus:border-pro-red transition-colors text-xs font-medium appearance-none">
                                        <option value="₱">₱ (BUDGET)</option>
                                        <option value="₱₱">₱₱ (MID-RANGE)</option>
                                        <option value="₱₱₱">₱₱₱ (PREMIUM)</option>
                                      </select>
                                    </div>
                                  </div>
                                </section>
 
                                <section className="bg-white p-8 lg:p-12 rounded-[45px] border border-black/[0.03] space-y-8">
                                  <div className="flex items-center gap-3">
                                    <div className="w-6 h-[2px] bg-pro-red" />
                                    <Database className="w-4 h-4 text-pro-red" />
                                    <span className="text-[10px] font-display font-black text-pro-red tracking-[0.4em] uppercase">{d.quantitativeData}</span>
                                  </div>
                                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="space-y-2">
                                      <label className="text-[9px] font-display font-black text-stone-400 tracking-widest uppercase">{d.prepMin}</label>
                                      <input type="number" value={newRecipe.prepMin} onChange={(e) => setNewRecipe({...newRecipe, prepMin: parseInt(e.target.value)})} className="w-full h-12 px-5 bg-stone-50 border border-black/[0.05] rounded-xl focus:outline-none focus:border-pro-red transition-colors text-xs font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-[9px] font-display font-black text-stone-400 tracking-widest uppercase">{d.cookMin}</label>
                                      <input type="number" value={newRecipe.cookMin} onChange={(e) => setNewRecipe({...newRecipe, cookMin: parseInt(e.target.value)})} className="w-full h-12 px-5 bg-stone-50 border border-black/[0.05] rounded-xl focus:outline-none focus:border-pro-red transition-colors text-xs font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-[9px] font-display font-black text-stone-400 tracking-widest uppercase">{d.servings}</label>
                                      <input type="number" value={newRecipe.servings} onChange={(e) => setNewRecipe({...newRecipe, servings: parseInt(e.target.value)})} className="w-full h-12 px-5 bg-stone-50 border border-black/[0.05] rounded-xl focus:outline-none focus:border-pro-red transition-colors text-xs font-medium" />
                                    </div>
                                  </div>
                                </section>
                              </motion.div>
                            )}
 
                            {activeFormStep === 3 && (
                              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <section className="bg-white p-8 lg:p-12 rounded-[45px] border border-black/[0.03] space-y-8">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="w-6 h-[2px] bg-pro-red" />
                                      <Utensils className="w-4 h-4 text-pro-red" />
                                      <span className="text-[10px] font-display font-black text-pro-red tracking-[0.4em] uppercase">{d.ingredients}</span>
                                    </div>
                                    <button onClick={() => setNewRecipe({...newRecipe, ingredients: [...(newRecipe.ingredients || []), '']})} className="text-pro-red bg-pro-red/10 p-2 rounded-lg hover:bg-pro-red hover:text-white transition-all">
                                      <PlusCircle className="w-4 h-4" />
                                    </button>
                                  </div>
                                  <div className="space-y-4">
                                    {newRecipe.ingredients?.map((ing, idx) => (
                                      <div key={idx} className="flex gap-2">
                                        <input type="text" value={ing} onChange={(e) => { const updated = [...(newRecipe.ingredients || [])]; updated[idx] = e.target.value; setNewRecipe({...newRecipe, ingredients: updated}); }} placeholder={`${d.ingredients} #${idx + 1}`} className="flex-1 h-12 px-5 bg-stone-50 border border-black/[0.05] rounded-xl focus:outline-none focus:border-pro-red transition-colors text-xs font-medium" />
                                        {idx > 0 && (
                                          <button onClick={() => { const updated = [...(newRecipe.ingredients || [])]; updated.splice(idx, 1); setNewRecipe({...newRecipe, ingredients: updated}); }} className="w-12 h-12 flex items-center justify-center text-stone-300 hover:text-red-500 transition-colors">
                                            <Plus className="w-5 h-5 rotate-45" />
                                          </button>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </section>
 
                                <section className="bg-white p-8 lg:p-12 rounded-[45px] border border-black/[0.03] space-y-8">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="w-6 h-[2px] bg-pro-red" />
                                      <Zap className="w-4 h-4 text-pro-red" />
                                      <span className="text-[10px] font-display font-black text-pro-red tracking-[0.4em] uppercase">{d.steps}</span>
                                    </div>
                                    <button onClick={() => setNewRecipe({...newRecipe, steps: [...(newRecipe.steps || []), '']})} className="text-pro-red bg-pro-red/10 p-2 rounded-lg hover:bg-pro-red hover:text-white transition-all">
                                      <PlusCircle className="w-4 h-4" />
                                    </button>
                                  </div>
                                  <div className="space-y-4">
                                    {newRecipe.steps?.map((step, idx) => (
                                      <div key={idx} className="flex gap-2">
                                        <textarea value={step} onChange={(e) => { const updated = [...(newRecipe.steps || [])]; updated[idx] = e.target.value; setNewRecipe({...newRecipe, steps: updated}); }} placeholder={`${d.steps} #${idx + 1}`} className="flex-1 h-20 p-5 bg-stone-50 border border-black/[0.05] rounded-xl focus:outline-none focus:border-pro-red transition-colors text-xs font-medium resize-none" />
                                        {idx > 0 && (
                                          <button onClick={() => { const updated = [...(newRecipe.steps || [])]; updated.splice(idx, 1); setNewRecipe({...newRecipe, steps: updated}); }} className="w-12 h-20 flex items-center justify-center text-stone-300 hover:text-red-500 transition-colors">
                                            <Plus className="w-5 h-5 rotate-45" />
                                          </button>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </section>
                              </motion.div>
                            )}
 
                            {activeFormStep === 4 && (
                              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                                <section className="bg-white p-8 lg:p-12 rounded-[45px] border border-black/[0.03] space-y-8">
                                  <div className="flex items-center gap-3">
                                    <div className="w-6 h-[2px] bg-[#10b981]" />
                                    <Globe className="w-4 h-4 text-[#10b981]" />
                                    <span className="text-[10px] font-display font-black text-[#10b981] tracking-[0.4em] uppercase">{d.sustainability}</span>
                                  </div>
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                      <label className="text-[9px] font-display font-black text-stone-400 tracking-widest uppercase flex items-center gap-2"><Globe className="w-3 h-3" /> {d.localSourcing}</label>
                                      <input type="text" value={newRecipe.localSourcing} onChange={(e) => setNewRecipe({...newRecipe, localSourcing: e.target.value})} placeholder="e.g. Community markets..." className="w-full h-14 px-6 bg-stone-50 border border-black/[0.05] rounded-2xl focus:outline-none focus:border-[#10b981] transition-colors text-sm font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-[9px] font-display font-black text-stone-400 tracking-widest uppercase flex items-center gap-2"><Zap className="w-3 h-3" /> {d.wasteReduction}</label>
                                      <input type="text" value={newRecipe.wasteReduction} onChange={(e) => setNewRecipe({...newRecipe, wasteReduction: e.target.value})} placeholder="e.g. Finely chop stems..." className="w-full h-14 px-6 bg-stone-50 border border-black/[0.05] rounded-2xl focus:outline-none focus:border-[#10b981] transition-colors text-sm font-medium" />
                                    </div>
                                  </div>
                                </section>
 
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                  <section className="bg-white p-8 lg:p-12 rounded-[45px] border border-black/[0.03] space-y-8">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <div className="w-6 h-[2px] bg-pro-red" />
                                        <Bookmark className="w-4 h-4 text-pro-red" />
                                        <span className="text-[10px] font-display font-black text-pro-red tracking-[0.4em] uppercase">{d.tags}</span>
                                      </div>
                                      <button onClick={() => setNewRecipe({...newRecipe, tags: [...(newRecipe.tags || []), '']})} className="text-pro-red bg-pro-red/10 p-2 rounded-lg hover:bg-pro-red hover:text-white transition-all">
                                        <PlusCircle className="w-4 h-4" />
                                      </button>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                      {newRecipe.tags?.map((tag, idx) => (
                                        <input key={idx} type="text" value={tag} onChange={(e) => { const updated = [...(newRecipe.tags || [])]; updated[idx] = e.target.value; setNewRecipe({...newRecipe, tags: updated}); }} placeholder={d.tags} className="w-24 h-10 px-4 bg-stone-50 border border-black/[0.05] rounded-full focus:outline-none focus:border-pro-red transition-colors text-[10px] font-medium" />
                                      ))}
                                    </div>
                                  </section>
 
                                  <section className="bg-white p-8 lg:p-12 rounded-[45px] border border-black/[0.03] space-y-8">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <div className="w-6 h-[2px] bg-pro-red" />
                                        <Heart className="w-4 h-4 text-pro-red" />
                                        <span className="text-[10px] font-display font-black text-pro-red tracking-[0.4em] uppercase">{d.nutrition}</span>
                                      </div>
                                      <button onClick={() => setNewRecipe({...newRecipe, nutritionLabels: [...(newRecipe.nutritionLabels || []), '']})} className="text-pro-red bg-pro-red/10 p-2 rounded-lg hover:bg-pro-red hover:text-white transition-all">
                                        <PlusCircle className="w-4 h-4" />
                                      </button>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                      {newRecipe.nutritionLabels?.map((label, idx) => (
                                        <input key={idx} type="text" value={label} onChange={(e) => { const updated = [...(newRecipe.nutritionLabels || [])]; updated[idx] = e.target.value; setNewRecipe({...newRecipe, nutritionLabels: updated}); }} placeholder="Label" className="w-28 h-10 px-4 bg-stone-50 border border-black/[0.05] rounded-full focus:outline-none focus:border-pro-red transition-colors text-[10px] font-medium" />
                                      ))}
                                    </div>
                                  </section>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
 
                        <div className="p-8 lg:p-10 border-t border-black/[0.05] bg-white flex items-center justify-between shrink-0">
                          <div className="flex gap-4">
                            {activeFormStep > 1 && (
                              <button onClick={() => setActiveFormStep(prev => prev - 1)} className="px-10 h-14 border border-black/[0.05] rounded-full text-[11px] font-display font-black tracking-widest text-stone-400 hover:text-black transition-colors uppercase">Back</button>
                            )}
                            <button onClick={() => { setIsAddingRecipe(false); setActiveFormStep(1); }} className="px-10 h-14 text-[11px] font-display font-black tracking-widest text-stone-400 hover:text-black transition-colors uppercase">{d.discard}</button>
                          </div>
                          {activeFormStep < 4 ? (
                            <button onClick={() => setActiveFormStep(prev => prev + 1)} className="px-12 h-14 bg-black text-white rounded-full text-[11px] font-display font-black tracking-widest hover:bg-pro-red transition-all shadow-xl shadow-black/10 flex items-center gap-3">
                              PROCEED_ENGAGEMENT <ArrowRight className="w-5 h-5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                if (!newRecipe.name) return;
                                setIsAddingRecipe(false);
                                setActiveFormStep(1);
                                setNewRecipe({ name: '', description: '', ingredients: [''], steps: [''], category: '', flavorProfile: '', nutritionLabels: [''], prepMin: 0, cookMin: 0, servings: 0, difficulty: 'EASY', costLevel: '₱', tags: [''], mealType: '', mood: '', localSourcing: '', wasteReduction: '', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600' });
                              }}
                              className="px-12 h-14 bg-pro-red text-white rounded-full text-[11px] font-display font-black tracking-widest hover:bg-black transition-all shadow-xl shadow-pro-red/20 flex items-center gap-3"
                            >
                              {d.deploy} <ArrowUpCircle className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
 
                  {selectedRecipe && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-[100] flex items-center justify-center p-12 bg-black/40 backdrop-blur-md"
                      onClick={() => setSelectedRecipe(null)}
                    >
                      <motion.div
                        initial={{ scale: 0.9, y: 30 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 30 }}
                        className="bg-white w-full max-w-6xl max-h-[90vh] rounded-[80px] overflow-hidden flex shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="w-[45%] relative">
                          <img src={selectedRecipe.image} alt={selectedRecipe.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          <div className="absolute bottom-16 left-16 right-16 text-white space-y-6">
                            <div className="flex items-center gap-3">
                              <span className="px-4 py-1.5 bg-pro-red text-[10px] font-display font-black rounded-full tracking-[0.2em]">{selectedRecipe.category}</span>
                              <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md text-[10px] font-display font-black rounded-full tracking-[0.2em]">{selectedRecipe.flavorProfile}</span>
                            </div>
                            <h2 className="text-[52px] font-expanded tracking-tight leading-[0.9]">{selectedRecipe.name}</h2>
                            <div className="flex gap-10 pt-4">
                              <div><p className="text-[9px] font-display font-black opacity-40 uppercase tracking-[0.3em] mb-2">PREP TIME</p><p className="text-xl font-expanded">{selectedRecipe.prepMin} MIN</p></div>
                              <div><p className="text-[9px] font-display font-black opacity-40 uppercase tracking-[0.3em] mb-2">COOK TIME</p><p className="text-xl font-expanded">{selectedRecipe.cookMin} MIN</p></div>
                              <div><p className="text-[9px] font-display font-black opacity-40 uppercase tracking-[0.3em] mb-2">SERVINGS</p><p className="text-xl font-expanded">{selectedRecipe.servings} PAX</p></div>
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 p-20 overflow-y-auto custom-scrollbar bg-[#FAF9F6]">
                          <div className="space-y-16">
                            <section>
                              <div className="flex items-center gap-3 mb-6">
                                <div className="w-6 h-[2px] bg-pro-red" />
                                <span className="text-[10px] font-display font-black text-pro-red tracking-[0.4em] uppercase">COLLECTIVE INTELLIGENCE</span>
                              </div>
                              <p className="text-[20px] font-medium text-stone-500 leading-relaxed mb-8">{selectedRecipe.description}</p>
                              <div className="flex flex-wrap gap-3">
                                {selectedRecipe.nutritionLabels.map((tag, i) => (
                                  <div key={i} className="px-5 py-2 bg-white border border-black/[0.03] rounded-full flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                    <span className="text-[10px] font-display font-black uppercase tracking-widest">{tag}</span>
                                  </div>
                                ))}
                                <div className="px-5 py-2 bg-stone-800 text-white rounded-full flex items-center gap-2">
                                  <span className="text-[10px] font-display font-black uppercase tracking-widest">DIFFICULTY: {selectedRecipe.difficulty}</span>
                                </div>
                              </div>
                            </section>
                            <div className="grid grid-cols-2 gap-20">
                              <section>
                                <h3 className="text-xl font-expanded tracking-tight mb-8 border-b border-black/[0.05] pb-4 uppercase">Ingredients</h3>
                                <ul className="space-y-4">
                                  {selectedRecipe.ingredients.map((ing, i) => (
                                    <li key={i} className="flex items-center gap-4 group">
                                      <div className="w-2 h-2 rounded-full border border-pro-red group-hover:bg-pro-red transition-all" />
                                      <span className="text-[14px] font-medium text-stone-600">{ing}</span>
                                    </li>
                                  ))}
                                </ul>
                              </section>
                              <section>
                                <h3 className="text-xl font-expanded tracking-tight mb-8 border-b border-black/[0.05] pb-4 uppercase">Process</h3>
                                <ul className="space-y-8">
                                  {selectedRecipe.steps.map((step, i) => (
                                    <li key={i} className="flex gap-6 relative">
                                      <span className="text-[11px] font-display font-black text-pro-red/30 pt-1">0{i+1}</span>
                                      <p className="text-[14px] font-medium text-stone-600 leading-relaxed">{step}</p>
                                    </li>
                                  ))}
                                </ul>
                              </section>
                            </div>
                            <footer className="pt-16 border-t border-black/[0.05] grid grid-cols-3 gap-10">
                              <div>
                                <p className="text-[9px] font-display font-black text-stone-300 uppercase tracking-[0.3em] mb-4">OWNER_CREDIT</p>
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-stone-200" />
                                  <p className="text-[13px] font-expanded">{selectedRecipe.owner}</p>
                                </div>
                              </div>
                              <div>
                                <p className="text-[9px] font-display font-black text-stone-300 uppercase tracking-[0.3em] mb-4">IDEAL_MOOD</p>
                                <p className="text-[13px] font-expanded">{selectedRecipe.mood.toUpperCase()}</p>
                              </div>
                              <div>
                                <p className="text-[9px] font-display font-black text-stone-300 uppercase tracking-[0.3em] mb-4">MEAL_ORIENTATION</p>
                                <p className="text-[13px] font-expanded">{selectedRecipe.mealType.toUpperCase()}</p>
                              </div>
                            </footer>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
 
            {/* ── CHAT ──────────────────────────────────────────────────────────── */}
            {activeTab === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex h-full w-full bg-white relative overflow-hidden"
              >
                <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-white">
                  <div className="flex-1 overflow-y-auto custom-scrollbar-hidden lg:custom-scrollbar flex flex-col pt-4">
                    <div className="w-full max-w-[95%] lg:max-w-5xl mx-auto px-4 lg:px-10 py-4 lg:py-6 flex flex-col h-full">
                      <div className="flex flex-wrap items-center justify-between mb-8 gap-4 px-2">
                        <div className="flex items-center gap-3">
                          <button className="flex items-center gap-2 px-4 py-2 bg-stone-50 border border-black/[0.05] rounded-full text-[10px] font-display font-black tracking-widest hover:border-pro-red/20 transition-all shadow-sm group">
                            <Sparkles className="w-3.5 h-3.5 text-pro-red group-hover:animate-spin" />
                            {d.engine}: Qwen3_next-80b-a3b
                            <ChevronDown className="w-3 h-3 text-stone-300" />
                          </button>
                          <div className="flex items-center bg-stone-100 p-1 rounded-full border border-black/[0.05]">
                            {(['english', 'tagalog', 'taglish'] as const).map((lang) => (
                              <button key={lang} onClick={() => setLanguage(lang)} className={`px-3 py-1.5 rounded-full text-[8px] font-display font-black tracking-widest transition-all ${language === lang ? 'bg-white text-pro-red shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}>
                                {lang.toUpperCase()}
                              </button>
                            ))}
                          </div>
                          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-50 text-[8px] font-display font-black text-green-600 rounded-full tracking-widest uppercase">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            {d.live}
                          </div>
                        </div>
                        <button className="text-[10px] font-display font-black text-stone-400 hover:text-black tracking-widest uppercase flex items-center gap-2 transition-colors">
                          <PlusCircle className="w-4 h-4" /> {d.newThread}
                        </button>
                      </div>
 
                      {messages.length <= 1 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                          <div className="relative mb-10">
                            <div className="w-32 h-32 bg-pro-red rounded-full blur-[60px] opacity-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            <div className="w-24 h-24 bg-gradient-to-tr from-pro-red to-[#FF8A65] rounded-[40px] shadow-[0_20px_60px_rgba(245,74,0,0.4)] relative z-10 flex items-center justify-center rotate-12 hover:rotate-0 transition-transform duration-700">
                              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30" />
                            </div>
                          </div>
                          <h1 className="text-[36px] lg:text-[64px] font-expanded tracking-tight leading-none mb-6 px-4 uppercase">
                            {language === 'english' ? (<>What's on your <span className="text-pro-red italic">mind?</span></>) : (<>Anong <span className="text-pro-red italic">nasa isip mo?</span></>)}
                          </h1>
                          <p className="text-[15px] lg:text-[18px] text-stone-400 font-medium max-w-lg mx-auto mb-12">{d.heroDesc}</p>
                          <div className="w-full max-w-5xl">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 lg:px-0">
                              {d.examplePrompts.map((p, i) => (
                                <button key={i} onClick={() => setInput(p.desc)} className="p-8 bg-white border border-black/[0.04] rounded-[40px] text-left hover:border-pro-red/30 hover:shadow-[0_30px_70px_-20px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all group shadow-sm flex flex-col justify-between h-full min-h-[180px]">
                                  <div className="p-4 bg-stone-50 rounded-2xl w-fit mb-4 group-hover:bg-pro-red group-hover:text-white transition-all">{p.icon}</div>
                                  <div>
                                    <p className="text-[11px] font-display font-black mb-2 uppercase tracking-[0.2em] group-hover:text-pro-red transition-colors">{p.title}</p>
                                    <p className="text-[14px] text-stone-400 font-medium leading-relaxed line-clamp-2">{p.desc}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 space-y-12 pb-12">
                          {messages.map((m) => (
                            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[90%] lg:max-w-[80%] ${m.role === 'user' ? 'bg-pro-red text-white p-6 lg:p-10 rounded-[45px] rounded-tr-none shadow-2xl' : 'text-stone-800'}`}>
                                {m.role === 'assistant' && !m.isThinking && (
                                  <div className="flex items-center gap-3 mb-6">
                                    <div className="w-7 h-7 bg-pro-red rounded-full flex items-center justify-center">
                                      <ChefHat className="text-white w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                      <span className="text-[10px] font-display font-black text-stone-300 tracking-[0.3em] uppercase">Ka-Ulam</span>
                                      <span className="text-[9px] font-display font-black text-stone-400 tracking-[0.35em] uppercase">{m.model || activeAssistantModel || 'OpenRouter free model'}</span>
                                    </div>
                                  </div>
                                )}
                                {m.role === 'assistant' && m.isThinking && (
                                  <div className="flex items-center gap-3 mb-6">
                                    <div className="w-7 h-7 bg-pro-red rounded-full flex items-center justify-center">
                                      <Clock className="text-white w-4 h-4 animate-pulse" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                      <span className="text-[10px] font-display font-black text-stone-300 tracking-[0.3em] uppercase">Ka-Ulam is thinking</span>
                                      <span className="text-[9px] font-display font-black text-stone-400 tracking-[0.35em] uppercase">{m.model || 'OpenRouter free model pool'}</span>
                                    </div>
                                  </div>
                                )}
                                {m.role === 'assistant' && m.isThinking ? (
                                  <div className="flex items-center gap-2 px-1 py-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-pro-red animate-bounce [animation-delay:-0.2s]" />
                                    <span className="w-2.5 h-2.5 rounded-full bg-pro-red animate-bounce [animation-delay:-0.1s]" />
                                    <span className="w-2.5 h-2.5 rounded-full bg-pro-red animate-bounce" />
                                    <span className="ml-2 text-[12px] font-medium text-stone-400">Thinking...</span>
                                  </div>
                                ) : (
                                  <p className={`text-[17px] lg:text-[18px] leading-relaxed font-medium ${m.role === 'user' ? 'font-sans' : 'text-[22px] lg:text-[26px] font-expanded tracking-tight leading-tight'}`}>
                                    {m.role === 'assistant' ? formatChatResponse(m.content) : m.content}
                                  </p>
                                )}
                              </div>
                            </motion.div>
                          ))}
                          <div ref={chatEndRef} />
                        </div>
                      )}
                    </div>
                  </div>
 
                  <div className="w-full max-w-5xl mx-auto px-4 lg:px-10 pb-4 lg:pb-6 pt-2 bg-gradient-to-t from-white via-white/95 to-transparent">
                    <div className="bg-white border border-black/[0.1] rounded-[32px] lg:rounded-[50px] p-2 lg:p-4 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] relative">
                      <form onSubmit={handleSendMessage}>
                        <textarea
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder={d.placeholder}
                          className="w-full h-14 lg:h-16 px-6 lg:px-8 py-4 lg:py-5 bg-transparent resize-none border-none focus:outline-none text-[17px] font-medium custom-scrollbar-hidden items-center"
                          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e as any); } }}
                        />
                        <div className="flex flex-wrap items-center justify-end p-2 pt-0 gap-4">
                          <button type="submit" disabled={!input.trim()} className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-all duration-500 ${input.trim() ? 'bg-pro-red text-white shadow-[0_15px_30px_rgba(245,74,0,0.3)] hover:scale-110 active:scale-95' : 'bg-stone-50 text-stone-200'}`}>
                            <ArrowUpCircle className="w-8 h-8" />
                          </button>
                        </div>
                      </form>
                    </div>
                    <p className="text-center text-[8px] text-stone-300 mt-4 font-display font-black uppercase tracking-[0.5em]">{'status' in d ? (d as any).status : ''}</p>
                  </div>
                </div>
              </motion.div>
            )}
 
            {/* ── RECIPE HUB ────────────────────────────────────────────────────── */}
            {activeTab === 'recipes' && (
              <motion.div
                key="recipes"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="flex-1 overflow-y-auto p-6 lg:p-12 custom-scrollbar max-w-[1500px] mx-auto w-full"
              >
                <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-8">
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-8 h-[1.5px] bg-pro-red" />
                      <span className="text-[11px] font-display font-black text-pro-red tracking-[0.4em] uppercase">Recipe Hub</span>
                    </div>
                    <h2 className="text-[40px] lg:text-[56px] font-expanded tracking-tight leading-[0.9] mb-6 whitespace-nowrap">RECIPE HUB.</h2>
                    <p className="text-[17px] text-stone-400 font-medium">Explore every recipe in the community database. Search by name, tag, or category.</p>
                  </div>
                </div>
 
                {/* Category Filter */}
                <div className="mb-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-6 h-[1.5px] bg-pro-red" />
                    <span className="text-[10px] font-display font-black text-pro-red tracking-[0.4em] uppercase">FILTER BY CATEGORY</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {['ALL', ...recipeHubCategories].map((category) => (
                      <button
                        key={category}
                        onClick={() => setRecipeHubCategory(category)}
                        className={`px-5 py-2 rounded-full text-[9px] font-display font-black tracking-widest border transition-all uppercase ${recipeHubCategory === category ? 'bg-black text-white border-black' : 'bg-white border-black/[0.05] text-stone-400 hover:border-pro-red/20'}`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
 
                {recipeHubError && (
                  <div className="mb-8 rounded-[24px] border border-pro-red/20 bg-pro-red/10 px-6 py-4 text-[12px] font-medium text-pro-red">{recipeHubError}</div>
                )}
 
                {/* Recipe Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {recipeHubRecipes.map((recipe) => (
                    <div key={recipe.id} onClick={() => setActiveView('login')} className="group cursor-pointer bg-white rounded-[40px] p-6 border border-black/[0.03] hover:shadow-2xl transition-all duration-700 h-full flex flex-col">
                      <div className="relative aspect-[4/3] rounded-[30px] overflow-hidden mb-6 border border-black/[0.03]">
                        <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover" />
                        <div className="absolute top-4 right-4 p-3 bg-white/10 backdrop-blur-xl rounded-full text-white hover:bg-pro-red transition-all">
                          <Heart className="w-4 h-4" />
                        </div>
                        <div className="absolute bottom-4 left-4 flex gap-2">
                          <span className="h-7 px-3 flex items-center bg-black/60 backdrop-blur-xl text-white text-[8px] font-display font-black rounded-full uppercase tracking-widest">{recipe.mealType}</span>
                          <span className="h-7 px-3 flex items-center bg-pro-red text-white text-[8px] font-display font-black rounded-full uppercase tracking-widest">{recipe.mood}</span>
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] font-display font-black text-pro-red tracking-[0.2em] uppercase">{recipe.category}</span>
                          <span className="text-[8px] font-display font-black text-black/20 tracking-[0.2em] uppercase">BY {recipe.owner}</span>
                        </div>
                        <h4 className="text-[20px] font-expanded tracking-tight leading-none group-hover:text-pro-red transition-all text-stone-800 line-clamp-2 min-h-[48px]">{recipe.name}</h4>
                        <p className="text-[12px] text-stone-400 leading-relaxed line-clamp-2">{recipe.description}</p>
                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-black/[0.03]">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3 text-stone-300" />
                            <p className="text-[8px] text-stone-500 font-display font-black uppercase tracking-widest leading-none">{recipe.prepMin + recipe.cookMin} MIN</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-3 h-3 text-stone-300" />
                            <p className="text-[8px] text-stone-500 font-display font-black uppercase tracking-widest leading-none">{recipe.costLevel}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
 
                  {/* Initial skeleton */}
                  {recipeHubLoading && recipeHubRecipes.length === 0 && recipeHubSkeletons.map((_, index) => (
                    <div key={`skeleton-${index}`} className="bg-white rounded-[40px] p-6 border border-black/[0.03]">
                      <div className="relative aspect-[4/3] rounded-[30px] overflow-hidden mb-6 border border-black/[0.03] bg-stone-100 animate-pulse" />
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="h-2.5 w-24 bg-stone-100 rounded-full animate-pulse" />
                          <div className="h-2.5 w-16 bg-stone-100 rounded-full animate-pulse" />
                        </div>
                        <div className="h-4 w-3/4 bg-stone-100 rounded-full animate-pulse" />
                        <div className="h-3 w-full bg-stone-100 rounded-full animate-pulse" />
                        <div className="h-3 w-2/3 bg-stone-100 rounded-full animate-pulse" />
                        <div className="pt-4 border-t border-black/[0.03] flex justify-between">
                          <div className="h-2.5 w-16 bg-stone-100 rounded-full animate-pulse" />
                          <div className="h-2.5 w-12 bg-stone-100 rounded-full animate-pulse" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
 
                {/* Page-change loading overlay */}
                {recipeHubLoading && recipeHubRecipes.length > 0 && (
                  <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {recipeHubSkeletons.slice(0, 4).map((_, index) => (
                      <div key={`skeleton-more-${index}`} className="bg-white rounded-[40px] p-6 border border-black/[0.03]">
                        <div className="relative aspect-[4/3] rounded-[30px] overflow-hidden mb-6 border border-black/[0.03] bg-stone-100 animate-pulse" />
                        <div className="space-y-4">
                          <div className="h-3 w-2/3 bg-stone-100 rounded-full animate-pulse" />
                          <div className="h-3 w-full bg-stone-100 rounded-full animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
 
                {/* Empty state */}
                {!recipeHubLoading && recipeHubRecipes.length === 0 && !recipeHubError && (
                  <div className="mt-16 flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 bg-white border border-black/[0.03] rounded-[32px] flex items-center justify-center mb-10 shadow-sm">
                      <Search className="w-8 h-8 text-stone-200" />
                    </div>
                    <h3 className="text-[24px] font-expanded tracking-tight mb-4 text-stone-800">NO MATCHES</h3>
                    <p className="text-[14px] text-stone-400 font-medium max-w-[320px]">Try a different keyword, category, or tag to discover more recipes.</p>
                  </div>
                )}
 
                {/* ── PAGINATION ─────────────────────────────────────────────────────
                     This now renders as long as we have recipes AND totalPages > 1.
                     The key fix: recipeHubTotal is now correctly set from payload.total,
                     so recipeHubTotalPages will be 11-12 for 178 recipes at 16/page.
                ────────────────────────────────────────────────────────────────────── */}
                {recipeHubRecipes.length > 0 && (
                  <div className="mt-12 flex flex-col items-center gap-6">
                    <div className="flex flex-col items-center gap-3">
                      <p className="text-[11px] font-display font-black text-stone-300 tracking-[0.3em] uppercase">
                        SHOWING {recipeHubPage * RECIPES_PAGE_SIZE + 1}–{Math.min((recipeHubPage + 1) * RECIPES_PAGE_SIZE, recipeHubTotal)} OF {recipeHubTotal} RECIPES
                      </p>
                      {recipeHubCategory !== 'ALL' && (
                        <p className="text-[10px] font-display font-black text-pro-red tracking-[0.3em] uppercase">
                          ◆ FILTERED BY: {recipeHubCategory}
                        </p>
                      )}
                    </div>
 
                    {recipeHubTotalPages > 1 && (
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <button
                          onClick={() => setRecipeHubPage((prev) => Math.max(prev - 1, 0))}
                          disabled={recipeHubPage === 0 || recipeHubLoading}
                          className="px-5 py-2.5 rounded-full text-[9px] font-display font-black tracking-widest border uppercase transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-white border-black/[0.05] text-stone-400 hover:border-pro-red/20 hover:text-pro-red"
                        >
                          ← PREV
                        </button>
 
                        {(() => {
                          const pageButtons = [];
                          const maxButtons = 5;
                          let start = Math.max(0, recipeHubPage - Math.floor(maxButtons / 2));
                          let end = Math.min(recipeHubTotalPages, start + maxButtons);
                          if (end - start < maxButtons) start = Math.max(0, end - maxButtons);
 
                          if (start > 0) {
                            pageButtons.push(
                              <button key="page-1" onClick={() => setRecipeHubPage(0)} disabled={recipeHubLoading} className="w-9 h-9 rounded-full text-[9px] font-display font-black tracking-widest border bg-white border-black/[0.05] text-stone-400 hover:border-pro-red/20 transition-all">1</button>
                            );
                            if (start > 1) pageButtons.push(<span key="dots-start" className="text-stone-300 font-display text-[9px]">•••</span>);
                          }
 
                          for (let i = start; i < end; i++) {
                            pageButtons.push(
                              <button
                                key={`page-${i}`}
                                onClick={() => setRecipeHubPage(i)}
                                disabled={recipeHubLoading}
                                className={`w-9 h-9 rounded-full text-[9px] font-display font-black tracking-widest border transition-all ${recipeHubPage === i ? 'bg-black text-white border-black' : 'bg-white border-black/[0.05] text-stone-400 hover:border-pro-red/20'} ${recipeHubLoading ? 'opacity-60' : ''}`}
                              >
                                {i + 1}
                              </button>
                            );
                          }
 
                          if (end < recipeHubTotalPages) {
                            if (end < recipeHubTotalPages - 1) pageButtons.push(<span key="dots-end" className="text-stone-300 font-display text-[9px]">•••</span>);
                            pageButtons.push(
                              <button key={`page-${recipeHubTotalPages - 1}`} onClick={() => setRecipeHubPage(recipeHubTotalPages - 1)} disabled={recipeHubLoading} className="w-9 h-9 rounded-full text-[9px] font-display font-black tracking-widest border bg-white border-black/[0.05] text-stone-400 hover:border-pro-red/20 transition-all">
                                {recipeHubTotalPages}
                              </button>
                            );
                          }
 
                          return pageButtons;
                        })()}
 
                        <button
                          onClick={() => setRecipeHubPage((prev) => Math.min(prev + 1, recipeHubTotalPages - 1))}
                          disabled={recipeHubPage >= recipeHubTotalPages - 1 || recipeHubLoading}
                          className="px-5 py-2.5 rounded-full text-[9px] font-display font-black tracking-widest border uppercase transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-white border-black/[0.05] text-stone-400 hover:border-pro-red/20 hover:text-pro-red"
                        >
                          NEXT →
                        </button>
                      </div>
                    )}
 
                    <p className="text-[10px] font-display font-black text-stone-400 tracking-[0.3em] uppercase">
                      PAGE {recipeHubPage + 1} OF {recipeHubTotalPages}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
 
            {/* ── SAVED ─────────────────────────────────────────────────────────── */}
            {activeTab === 'saved' && (
              <motion.div
                key="saved"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 overflow-y-auto p-6 lg:p-12 custom-scrollbar max-w-[1500px] mx-auto w-full"
              >
                <div className="border-b border-black/[0.03] pb-12">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-8 h-[1.5px] bg-pro-red" />
                    <span className="text-[11px] font-display font-black text-pro-red tracking-[0.4em] uppercase">Saved Recipes</span>
                  </div>
                  <h2 className="text-[28px] lg:text-[56px] font-expanded tracking-tight leading-[0.9] mb-6 uppercase">SAVED GEMS.</h2>
                  <p className="text-[17px] text-stone-400 font-medium">Your personal collection of culinary masterpieces and market hacks.</p>
                </div>
 
                {savedRecipes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pt-10">
                    {savedRecipes.map((recipe) => (
                      <div key={recipe.id} className="bg-white rounded-[40px] p-6 border border-black/[0.03] shadow-sm">
                        <div className="relative aspect-[4/3] rounded-[32px] overflow-hidden mb-6">
                          <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[9px] font-display font-black text-pro-red tracking-[0.3em] uppercase">{recipe.category}</span>
                          <span className="text-[9px] font-display font-black text-black/20 tracking-[0.3em] uppercase">{recipe.costLevel}</span>
                        </div>
                        <h3 className="text-[22px] font-expanded tracking-tight leading-tight mb-3">{recipe.name}</h3>
                        <p className="text-[13px] text-stone-400 leading-relaxed line-clamp-3">{recipe.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-24 h-24 bg-white border border-black/[0.03] rounded-[32px] flex items-center justify-center mb-10 shadow-sm">
                      <Bookmark className="w-8 h-8 text-stone-200" />
                    </div>
                    <h3 className="text-[24px] font-expanded tracking-tight mb-4 text-stone-800">EMPTY VAULT</h3>
                    <p className="text-[14px] text-stone-400 font-medium max-w-[280px] mx-auto mb-10">You haven't saved any recipes yet. Head over to the Recipe Hub to start your collection.</p>
                    <button onClick={() => setActiveTab('recipes')} className="px-8 py-4 bg-black text-white rounded-full text-[10px] font-display font-black tracking-widest hover:bg-pro-red transition-all">
                      EXPLORE RECIPE HUB
                    </button>
                  </div>
                )}
              </motion.div>
            )}
 
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}