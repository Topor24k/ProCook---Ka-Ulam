import { motion } from 'motion/react';
import { Quote } from 'lucide-react';

export default function AboutView() {
  return (
    <motion.div
      key="about-view"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      {/* Research & About Section */}
      <section id="about-us" className="section-wrapper">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-pro-red/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4" />

        <div className="pro-container space-y-32 relative z-10">
          
          {/* ================= MAIN + STATS ================= */}
          <div className="grid-responsive items-start">
            
            {/* LEFT CONTENT */}
            <div className="lg:col-span-7 space-y-12">
              <div className="flex items-center gap-3">
                <div className="w-8 h-[2px] bg-[#F54A00]" />
                <span className="text-[14px] font-display font-bold text-[#F54A00] tracking-[0.2em] uppercase">
                  Academic Research & Mission
                </span>
              </div>

              <h3 className="text-[clamp(48px,6vw,72px)] font-expanded text-black leading-[1.05] tracking-tight">
                Fine-tuned for the{" "}
                <span className="text-pro-red">Filipino Plate.</span>
              </h3>

              <p className="text-[22px] text-body max-w-2xl">
                ProCook is a specialized AI initiative that fine-tunes cutting-edge large language models like 
                <strong> Qwen 2.5 7B</strong> to power the <strong>Ka-ulam Chatbot</strong>. We bridge the gap 
                between global AI capabilities and the unique, vibrant reality of the Filipino kitchen—mastering 
                Taglish, regional nuances, and budget-conscious cooking.
              </p>

              {/* STATS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 pt-8">
                {[
                  {
                    n: "42.7%",
                    l: "Food Spending",
                    d: "of Filipino household spending (PSA 2023)",
                  },
                  {
                    n: "10h 14m",
                    l: "Daily Online",
                    d: "highest global average (DataReportal 2024)",
                  },
                  {
                    n: "70%",
                    l: "Smartphones",
                    d: "penetration across the Philippines",
                  },
                ].map((stat, i) => (
                  <div key={i} className="stat-card">
                    <p className="text-3xl font-expanded text-black tracking-tight">
                      {stat.n}
                    </p>
                    <div className="space-y-1">
                      <p className="text-[10px] font-display font-black text-[#F54A00] uppercase tracking-widest">
                        {stat.l}
                      </p>
                      <p className="text-[11px] text-stone-400 font-sans leading-tight">
                        {stat.d}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT CARD */}
            <div className="lg:col-span-5">
              <div className="bg-pro-dark rounded-[50px] p-12 border border-white/5 shadow-2xl relative overflow-hidden group h-full flex flex-col justify-between gap-10">
                
                <div className="absolute inset-0 bg-pro-red/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                <Quote className="w-12 h-12 text-pro-red" />

                <h4 className="text-2xl md:text-3xl font-display font-bold text-white/90 leading-tight italic tracking-tight">
                  "Every Filipino deserves a smart kitchen guide that understands
                  their budget, their pantry, their mood — and speaks their
                  language."
                </h4>

                <div className="flex items-center gap-6">
                  <div className="h-px flex-grow bg-white/10" />
                  <span className="font-display font-black text-xs uppercase tracking-widest text-white/30">
                    Founder's Note
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= PROBLEM ================= */}
          <div className="problem-section">
            <div className="problem-header">
              <h4 className="problem-label">
                The Challenge
              </h4>
              <h2 className="problem-title">
                The <span className="text-pro-red">Problem</span> we solve
              </h2>
              <div className="problem-accent" />
              <p className="problem-quote">
                "Generative AI can answer food questions, but it cannot replace a community. It can't surface a recipe that your neighbor in Davao has cooked 40 times and rated 4.8 stars."
              </p>
            </div>

            <div className="problem-grid">
              {[
                { n: "01", t: "The Reasoning Gap", d: "Standard AI models struggle with the non-linear logic of the Filipino kitchen—where budget, available pantry items, and regional mood all shift simultaneously." },
                { n: "02", t: "Taglish Complexity", d: "Effective culinary guidance requires deep understanding of Taglish semantics and localized 'dirty' ingredients that global datasets simply don't capture." },
                { n: "03", t: "Authentic Sourcing", d: "We solve the lack of authentic Filipino recipes from real home cooks by fine-tuning models on community-verified datasets instead of generic internet scrapes." },
                { n: "04", t: "Agentic Decision Making", d: "Moving beyond simple Q&A, we use Qwen 2.5 7B to build autonomous agentic workflows for meal planning and budget-linked recipe generation." }
              ].map((prob, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -8 }}
                  className="problem-card group"
                >
                  <span className="problem-number group-hover:text-pro-red/20">
                    {prob.n}
                  </span>
                  <div className="space-y-3">
                    <h5 className="problem-card-title">
                      {prob.t}
                    </h5>
                    <p className="problem-card-desc">
                      {prob.d}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ================= AUDIENCE + TECH ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            
            {/* AUDIENCE */}
            <div className="p-12 bg-pro-ivory rounded-[50px] border border-black/5 space-y-10">
              <h4 className="text-2xl font-expanded text-black uppercase">
                Who <span className="text-pro-red">ProCook</span> is for
              </h4>

              <div className="space-y-8">
                {[
                  {
                    t: "Busy Home Cooks",
                    d: "Chat naturally in Taglish to get meal suggestions based on current mood and budget.",
                  },
                  {
                    t: "Karitherya Owners",
                    d: "Leverage agentic reasoning for menu planning and intelligent ingredient substitutions.",
                  },
                  {
                    t: "Budget-Conscious Students",
                    d: "Interact with our AI guide to find recipes that maximize limited ingredients and funds.",
                  },
                  {
                    t: "Culinary Researchers",
                    d: "Explore how we fine-tuned Qwen 2.5 7B for specialized regional culinary datasets.",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-pro-red mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-display font-black text-black">
                        {(item as any).t || (item as any).l}
                      </p>
                      <p className="text-sm font-sans text-stone-500 mt-1">
                        {item.d}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TECH STACK */}
            <div className="p-12 bg-pro-dark rounded-[50px] text-white space-y-10">
              <h4 className="text-2xl font-expanded uppercase">
                Built with <span className="text-pro-red">Intelligence</span>
              </h4>

              <div className="flex flex-wrap gap-3">
                {[
                  "Qwen 2.5 7B (Base Model)",
                  "LoRA Fine-tuning",
                  "Agentic Reasoning Harness",
                  "Taglish Semantic Layer",
                  "Context Injection (RAG)",
                  "Multi-Agent Teams",
                  "Role-Identity Steering",
                  "System-Level Debugging",
                ].map((tech, i) => (
                  <span
                    key={i}
                    className="px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-display font-medium tracking-wide hover:bg-pro-red hover:border-pro-red transition-colors cursor-default"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <div className="pt-8 opacity-40 border-t border-white/5 flex items-center justify-between">
                <p className="text-[10px] font-display font-black uppercase tracking-[0.4em]">
                  Intelligent Agent v3.0
                </p>

                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                  <div className="w-2 h-2 rounded-full bg-pro-red" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    </motion.div>
  );
}