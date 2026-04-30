/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { ShoppingCart, Brain, Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import { Screen } from '../types';

interface LandingProps {
  onNavigate: (screen: Screen) => void;
  isDark: boolean;
}

export default function Landing({ onNavigate, isDark }: LandingProps) {
  return (
    <div className={`min-h-screen font-sans selection:bg-emerald-500 selection:text-black transition-colors ${isDark ? 'bg-[#050505] text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-emerald-500">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-black" fill="currentColor" />
          </div>
          Mun's Smart-Sales AI
        </div>
        <div className={`flex items-center gap-8 text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          <a href="#features" className="hover:text-emerald-500 transition-colors">Features</a>
          <button 
            onClick={() => onNavigate(Screen.PRICING)}
            className="hover:text-emerald-500 transition-colors uppercase cursor-pointer"
          >
            Pricing
          </button>
          <button 
            onClick={() => onNavigate(Screen.DASHBOARD)}
            className="px-5 py-2.5 bg-emerald-500 text-black rounded-lg hover:bg-emerald-400 transition-all flex items-center gap-2"
          >
            Launch_App <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-8 pt-24 pb-32 max-w-7xl mx-auto text-center relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),transparent)] pointer-events-none"></div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className={`px-4 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-[0.2em] mb-6 inline-block ${isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
            Universal_Business_Automation_Engine
          </span>
          <h1 className={`text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] mb-8 uppercase italic ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Automate Your <br />
            <span className="text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">E-commerce</span>
          </h1>
          <p className={`text-lg max-w-2xl mx-auto mb-12 leading-relaxed font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            &gt; Re-engineering sales with Banglish-speaking AI components. 
            &gt; Google Sheets Integration: CONNECTED_STABLE
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => onNavigate(Screen.DASHBOARD)}
              className="w-full sm:w-auto px-10 py-5 bg-emerald-500 text-black font-black uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] text-xs"
            >
              Start_Automation_Sequence
            </button>
            <button 
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className={`w-full sm:w-auto px-10 py-5 bg-transparent border font-bold uppercase tracking-widest rounded-xl transition-all text-xs ${isDark ? 'border-slate-800 text-slate-300 hover:bg-slate-900' : 'border-slate-200 text-slate-500 hover:bg-slate-100'}`}
            >
              View_System_Specs
            </button>
          </div>
        </motion.div>
      </section>

      {/* 3-Pillar Model */}
      <section id="features" className={`px-8 py-32 border-y transition-colors ${isDark ? 'bg-[#0a0a0b] border-slate-900' : 'bg-white border-slate-100'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 text-left">
            {[
              { 
                icon: <ShoppingCart className="w-6 h-6" />, 
                title: "Input_Layer", 
                desc: "Zero-latency synchronization with Google Sheets product databases." 
              },
              { 
                icon: <Brain className="w-6 h-6" />, 
                title: "Inference_Core", 
                desc: "Gemini 1.5 Flash processing Banglish negotiation protocols in real-time." 
              },
              { 
                icon: <Zap className="w-6 h-6" />, 
                title: "Action_Executor", 
                desc: "Automated extraction of Name, Phone, and Address for courier injection." 
              }
            ].map((pillar, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className={`p-8 rounded-2xl border transition-all group ${isDark ? 'bg-[#050505] border-slate-800 hover:border-emerald-500/50' : 'bg-slate-50 border-slate-200 hover:border-emerald-300 shadow-sm'}`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-6 border transition-all group-hover:bg-emerald-500 group-hover:text-black ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                  {pillar.icon}
                </div>
                <h3 className={`text-sm font-black uppercase tracking-widest mb-4 group-hover:text-emerald-500 transition-colors font-mono ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{pillar.title}</h3>
                <p className={`text-xs leading-relaxed font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{pillar.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-8 py-32 max-w-7xl mx-auto">
        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 text-center mb-16 underline underline-offset-8">Resource_Tiers</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { name: "Silver", price: "৳2,500", features: ["1 Node_Link", "500 AI_Cycles", "Sheet_Sync"] },
            { name: "Gold", price: "৳5,000", features: ["3 Node_Links", "Multi_User_AI", "Bargain_Protocol", "Priority_Link"], popular: true },
            { name: "Platinum", price: "৳12,000", features: ["10 Node_Links", "Lead_Control_Center", "API_Injection", "Custom_Prompts"] }
          ].map((plan, i) => (
            <div key={i} className={`p-10 rounded-2xl border transition-all ${
              plan.popular 
                ? (isDark ? 'border-emerald-500 bg-[#0a0a0b] shadow-[0_0_30px_rgba(16,185,129,0.1)] scale-105 z-10' : 'border-emerald-500 bg-white shadow-xl scale-105 z-10') 
                : (isDark ? 'border-slate-800 bg-[#0a0a0b]/50' : 'border-slate-100 bg-white shadow-sm')
            }`}>
              {plan.popular && <span className="px-3 py-1 bg-emerald-500 text-black text-[8px] font-black uppercase tracking-[0.2em] rounded-full mb-6 inline-block">Recommended</span>}
              <h3 className={`text-xs font-black uppercase tracking-[0.3em] mb-2 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{plan.name}</h3>
              <div className={`text-4xl font-mono font-black mb-8 ${isDark ? 'text-white' : 'text-slate-900'}`}>{plan.price}<span className={`text-[10px] uppercase font-bold block mt-1 tracking-widest ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>_per_month</span></div>
              <ul className="space-y-4 mb-10">
                {plan.features.map((f, j) => (
                  <li key={j} className={`flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {f}
                  </li>
                ))}
              </ul>
              <button className={`w-full py-4 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${plan.popular ? 'bg-emerald-500 text-black hover:bg-emerald-400' : (isDark ? 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800' : 'bg-slate-50 text-slate-500 border border-slate-100 hover:bg-slate-100')}`}>
                Initialize_{plan.name}
              </button>
            </div>
          ))}
        </div>
      </section>

      <footer className={`px-8 py-12 border-t text-center text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${isDark ? 'border-slate-900 text-slate-700' : 'border-slate-100 text-slate-300'}`}>
        SYSTEM_ID: MUN_ARCHITECT // SECURED_BY_SMART_SALES_AI_©_2026
      </footer>
    </div>
  );
}
