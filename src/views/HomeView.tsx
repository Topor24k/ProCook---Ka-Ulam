import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Search, Heart, Clock, DollarSign, ChefHat, Star } from 'lucide-react';
import { recipes as fallbackRecipes, steps } from '../constants';
import { View, Recipe } from '../types';
import { getAllRecipes } from '../lib/recipeApi.js';
import { normalizeRecipe } from '../lib/recipeUtils';

interface HomeViewProps {
  setActiveView: (view: View) => void;
}

export default function HomeView({ setActiveView }: HomeViewProps) {
  const [dbRecipes, setDbRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const data = await getAllRecipes();
        const normalized = data.map((recipe: any, index: number) => normalizeRecipe(recipe, index));
        setDbRecipes(normalized);
      } catch (error) {
        console.warn('Database unavailable, using fallback recipes:', error);
        setDbRecipes(fallbackRecipes);
      }
    };

    loadRecipes();
  }, []);

  const topRatedRecipes = [...dbRecipes].sort(
    (a, b) => Number(b.rating ?? 0) - Number(a.rating ?? 0)
  );
  const trendingRecipes = topRatedRecipes.slice(0, 5);
  const curatedRecipes = topRatedRecipes.slice(0, 4);

  return (
    <motion.div
      key="home-view"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Main Content (Hero) */}
      <section id="home" className="hero-section">
        <div className="hero-bg-wrap">
          <img 
            src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=1611" 
            alt="Hero" 
            className="hero-img"
          />
          <div className="hero-overlay" />
        </div>
        
        <div className="hero-content">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="hero-label">
            <div className="hero-label-line" />
            <span className="hero-label-text">HOME</span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }}
            className="hero-heading-wrap"
          >
            <h2 className="text-hero text-white">SHARE,</h2>
            <h2 className="text-hero text-pro-red underline decoration-white/20 underline-offset-8">DISCOVER,</h2>
            <h2 className="text-hero text-white">& SEARCH WITH AI</h2>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.3 }}
            className="hero-description"
          >
            Join our community of food lovers. Share your Filipino culinary creations and discover amazing recipes from across the Philippines.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.4 }}
            className="hero-actions"
          >
            <button className="btn-secondary text-white border-white/40 hover:bg-white hover:text-black group">
              Browse Recipes <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="btn-primary bg-pro-brown hover:bg-black">
              Share Your Recipes
            </button>
          </motion.div>
        </div>
      </section>

      {/* Ka-Ulam AI Search Section */}
      <section id="ask-ka-ulam" className="ai-search-section">
        <div className="ai-search-grid">
          <div className="lg:col-span-7 flex flex-col gap-10">
            <div className="search-label-wrap">
              <div className="search-label-line" />
              <span className="search-label-text">ASK KA-ULAM</span>
            </div>
            <div className="search-heading-wrap">
              <h3 className="text-display-heading text-black">ANONG</h3>
              <h3 className="text-display-heading text-pro-red">ULAM</h3>
              <h3 className="text-display-heading text-black font-black">TODAY?</h3>
            </div>
            <p className="search-description">
              Our context-aware AI system that understands your <span className="text-black font-semibold">mood, budget, time, and ingredients.</span>
            </p>
            <div className="group relative w-full overflow-hidden">
               <div className="input-wrapper">
                  <Search className="w-6 h-6 text-pro-red" />
                  <input 
                    type="text" 
                    placeholder="Ask me: “What’s a cheap lunch with pork?”" 
                    className="input-field text-[22px] text-black placeholder:text-stone-300"
                  />
               </div>
            </div>
          </div>
          
          <div className="lg:col-span-5 relative">
            <div className="search-image-wrap group">
              <img 
                src="https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&q=80&w=800" 
                alt="Cooking" 
                className="search-image"
              />
              <div className="search-image-overlay">
                 <h4 className="text-[22px] font-display font-black text-white uppercase mb-2">Creative Community</h4>
                 <p className="text-white/70 font-sans text-sm">Discover and contribute to the largest knowledge base of localized Filipino home cooking.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Trending Section */}
      <div className="trending-strip">
        <div className="trending-track">
          {[1, 2].map((set) => (
            <div key={set} className="trending-group">
              {trendingRecipes.map((recipe, index) => (
                <div key={`${set}-${recipe.id}`} className="contents">
                  <span className="trending-label">TRENDING NOW</span>
                  <span className={`trending-value ${index % 2 === 1 ? 'accent' : ''}`}>{recipe.name}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Recipes Explorer */}
      <section id="recipes" className="explorer-section">
        <div className="pro-container">
          <div className="explorer-header mb-16">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-[2px] bg-pro-red" />
                <span className="text-[14px] font-display font-bold text-pro-red tracking-[0.2em] uppercase">CURATED SELECTION</span>
              </div>
              <h3 className="text-[48px] md:text-[56px] font-expanded text-black leading-[1.05] uppercase">
                 Curious what others <span className="text-pro-red">shared?</span>
              </h3>
            </div>
            <p className="text-body text-[16px] text-stone-500 max-w-xs leading-relaxed">
               Explore authentic recipes shared by our diverse community of home cooks.
            </p>
          </div>

          <div className="recipe-grid !grid-cols-1 md:!grid-cols-2 lg:!grid-cols-4 gap-10 auto-rows-fr">
            {curatedRecipes.map((recipe, index) => (
              <motion.div 
                key={index} 
                onClick={() => setActiveView('login')}
                className="group cursor-pointer bg-white rounded-[50px] p-6 border border-black/[0.03] hover:shadow-2xl transition-all duration-700 h-full flex flex-col overflow-hidden"
              >
                <div className="relative aspect-[4/3] rounded-[36px] overflow-hidden border border-black/[0.03] shrink-0">
                  <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" />
                  <div className="absolute top-5 right-5 p-2.5 bg-white/15 backdrop-blur-xl rounded-full text-white hover:bg-pro-red transition-all">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-3">
                    <span className="h-7 px-4 flex items-center bg-black/65 backdrop-blur-xl text-white text-[8px] font-display font-black rounded-full uppercase tracking-widest">{recipe.mealType}</span>
                    <span className="h-7 px-4 flex items-center bg-pro-red text-white text-[8px] font-display font-black rounded-full uppercase tracking-widest">{recipe.mood}</span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-between gap-5 pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-[9px] font-display font-black text-pro-red tracking-[0.3em] uppercase leading-none">{recipe.category}</span>
                      <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-amber-600 shrink-0">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span className="text-[10px] font-display font-black tracking-[0.16em] uppercase">{recipe.rating}</span>
                      </div>
                    </div>

                    <h4 className="text-[22px] font-expanded tracking-tight leading-[1.05] group-hover:text-pro-red transition-all text-stone-800 line-clamp-2 min-h-[56px]">
                      {recipe.name}
                    </h4>
                    
                    <p className="text-[13px] text-stone-400 font-medium leading-relaxed line-clamp-3 min-h-[72px]">
                      {recipe.description}
                    </p>
                  </div>

                  <div className="space-y-4 pt-5 border-t border-black/[0.04]">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2 min-w-0">
                        <Clock className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                        <p className="text-[9px] text-stone-500 font-display font-black uppercase tracking-widest whitespace-nowrap">{recipe.prepMin + recipe.cookMin} MIN</p>
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        <DollarSign className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                        <p className="text-[9px] text-stone-500 font-display font-black uppercase tracking-widest whitespace-nowrap">{recipe.costLevel}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[9px] font-display font-black text-black/20 tracking-[0.3em] uppercase truncate">BY {recipe.owner}</span>
                      <span className="text-[9px] font-display font-black text-black/20 tracking-[0.3em] uppercase truncate">{recipe.mealType}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </section>

      {/* How It Works Layered Section */}
      <section id="how-it-works" className="how-works-section">
        <div className="how-works-grid">
          <div className="space-y-12">
            <div className="how-works-header">
              <div className="flex items-center gap-3">
                <div className="w-8 h-[2px] bg-[#F54A00]" />
                <span className="text-[14px] font-display font-bold text-[#F54A00] tracking-[0.2em]">INTELLIGENCE LAYER</span>
              </div>
              <h3 className="text-[48px] md:text-[64px] font-expanded text-black leading-[1.05] tracking-tight">
                 Applying <span className="text-pro-red">Qwen 2.5 7B</span>
              </h3>
              <p className="how-works-desc">
                 We are fine-tuning Qwen 2.5 7B to power the Ka-ulam Chatbot, combining localized culinary expertise with advanced agentic reasoning for every Filipino kitchen.
              </p>
            </div>
            
            <div className="how-works-step-list">
              {steps.map((step, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="step-card"
                >
                  <div className={`w-12 h-12 rounded-2xl ${step.color} text-white flex-center flex-shrink-0 shadow-lg`}>
                    {step.icon}
                  </div>
                  <div>
                    <h4 className="text-lg font-display font-bold text-black mb-1">{step.title}</h4>
                    <p className="text-sm text-body">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="hidden lg:block sticky top-32 h-fit">
            <div className="pipeline-card">
               <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-pro-red blur-[150px] opacity-[0.08] -translate-y-1/2 translate-x-1/2" />
               <ChefHat className="w-20 h-20 text-pro-red mb-10" />
               <h4 className="text-[32px] font-expanded mb-10 tracking-tight">Qwen 2.5 Logic Pipeline</h4>
               
               <div className="pipeline-list">
                 <div className="pipeline-connector" />
                 {[
                   { s: "Step 01", t: "Fine-Tuning", d: "Context injection with localized Filipino culinary datasets and Taglish semantics." },
                   { s: "Step 02", t: "Agentic Logic", d: "Applying Qwen system reasoning to correlate budget, mood, and ingredients." },
                   { s: "Step 03", t: "Chat Inference", d: "Native multi-agent collaboration for stable, helpful culinary guidance." }
                 ].map((feat, i) => (
                   <div key={i} className="pipeline-item">
                     <div className={`pipeline-badge ${i === 0 ? 'active' : ''}`}>
                        {feat.s.split(' ')[1]}
                     </div>
                     <div className="space-y-1">
                        <p className="pipeline-step-title">{feat.t}</p>
                        <p className="pipeline-step-desc">{feat.d}</p>
                     </div>
                   </div>
                 ))}
               </div>
               
               <div className="pipeline-footer">
                  <div className="space-y-1">
                     <p className="text-[10px] font-display font-black text-white/30 uppercase tracking-[0.2em]">Deployment</p>
                     <p className="font-sans font-bold text-white/90">Qwen-2.5-7B-Engine</p>
                  </div>
                  <div className="pipeline-status-wrap">
                     <div className="pipeline-status-dot bg-green-500 animate-pulse" />
                     <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Live System</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
