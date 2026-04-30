/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ArrowLeft, Zap, CreditCard, ShieldCheck, Loader2, X } from 'lucide-react';
import { Screen, AppSettings } from '../types';

interface PricingProps {
  onNavigate: (screen: Screen) => void;
  onUpdate: (settings: Partial<AppSettings>) => void;
  isDark: boolean;
}

export default function Pricing({ onNavigate, onUpdate, isDark }: PricingProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [trxId, setTrxId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePaymentSubmit = async () => {
    setIsVerifying(true);
    // Simulated cloud processing delay for Stripe validation
    setTimeout(() => {
      setIsVerifying(false);
      setIsSuccess(true);
      
      setTimeout(() => {
        const tier = selectedPlan === 'Pro Matrix' ? 'Pro' : (selectedPlan === 'Hobby Node' ? 'Hobby' : 'Enterprise');
        onUpdate({ subscriptionTier: tier as any });
        onNavigate(Screen.DASHBOARD);
      }, 2000);
    }, 2500);
  };

  const plans = [
    { 
      name: "Hobby Node", 
      price: "৳0", 
      features: ["10 Leads / Month", "Standard Latency", "Meta Integration Only", "Basic System Access"],
      desc: "Ideal for micro-businesses starting their AI journey."
    },
    { 
      name: "Pro Matrix", 
      price: "৳3,000", 
      features: ["Unlimited Leads", "Omni-channel (WA/Insta)", "Custom Prompt Injection", "0-Downtime Guarantee", "Advanced Analytics"], 
      popular: true,
      desc: "Maximum efficiency for high-volume Dhaka commerce."
    },
    { 
      name: "Enterprise Cluster", 
      price: "Custom", 
      features: ["Dedicated GPU Cluster", "Whitelabel Protocols", "On-Premise Local LLM", "System Architect Support", "SLA: 99.999%"],
      desc: "Tailored infrastructure for massive corporations."
    }
  ];

  return (
    <div className={`min-h-screen font-sans p-8 relative overflow-hidden transition-colors ${isDark ? 'bg-[#050505] text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.05),transparent)] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto">
        <button 
          onClick={() => onNavigate(Screen.LANDING)}
          className={`flex items-center gap-2 transition-colors mb-12 uppercase text-[10px] font-bold tracking-widest ${isDark ? 'text-slate-500 hover:text-emerald-400' : 'text-slate-400 hover:text-emerald-600'}`}
        >
          <ArrowLeft size={14} /> Back to Home
        </button>

        <div className="text-center mb-24">
          <span className={`px-4 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-[0.4em] mb-6 inline-block ${isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
            Pricing Plans
          </span>
          <h1 className={`text-5xl md:text-7xl font-bold tracking-tighter uppercase mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Upgrade Your <span className="text-emerald-500">Sales</span>
          </h1>
          <p className={`text-sm max-w-xl mx-auto ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Choose the right plan for your business growth. From local shops to enterprise clusters.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-10 rounded-2xl border transition-all relative ${
                plan.popular 
                ? (isDark ? 'border-emerald-500 bg-slate-900 shadow-[0_0_40px_rgba(16,185,129,0.15)] scale-105 z-10' : 'border-emerald-500 bg-white shadow-xl scale-105 z-10') 
                : (isDark ? 'border-slate-800 bg-[#0a0a0b]/50' : 'border-slate-100 bg-white shadow-sm')
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-emerald-500 text-black text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1">
                  <Zap size={10} fill="currentColor" /> Most Popular
                </div>
              )}
              
              <h3 className="text-xs font-bold uppercase tracking-widest mb-2 text-slate-400">{plan.name}</h3>
              <p className="text-[11px] text-slate-500 mb-6">{plan.desc}</p>
              
              <div className={`text-5xl font-bold mb-8 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {plan.price}
                <span className={`text-[10px] uppercase font-bold block mt-2 tracking-widest opacity-50 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>{plan.price === 'Custom' ? 'Tailored Quote' : 'Per Month'}</span>
              </div>

              <div className={`h-px w-full mb-8 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}></div>

              <ul className="space-y-4 mb-12">
                {plan.features.map((f, j) => (
                  <li key={j} className={`flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> {f}
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => plan.price === 'Custom' ? window.location.href = 'mailto:support@smart-sales.ai' : setSelectedPlan(plan.name)}
                className={`w-full py-4 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                  plan.popular 
                  ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg' 
                  : (isDark ? 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800' : 'bg-slate-50 text-slate-500 border border-slate-100 hover:bg-slate-100')
                }`}
              >
                {plan.price === 'Custom' ? 'Contact Sales' : `Subscribe to ${plan.name}`}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Stripe-style Payment Modal */}
        <AnimatePresence>
          {selectedPlan && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !isVerifying && !isSuccess && setSelectedPlan(null)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className={`relative w-full max-w-lg border rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-colors ${isDark ? 'bg-[#0a0a0b] border-slate-800' : 'bg-white border-slate-200'}`}
              >
                <div className="flex">
                  {/* Left Sidebar: Plan Intro */}
                  <div className={`hidden sm:flex flex-col w-48 p-8 transition-colors ${isDark ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                    <div className="mb-auto">
                       <Zap className="text-emerald-500 mb-4" size={24} />
                       <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Plan Summary</h4>
                       <p className={`text-lg font-bold uppercase leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedPlan}</p>
                    </div>
                    <div className="text-[9px] font-bold text-slate-500 uppercase">
                      SECURE CHECKOUT
                    </div>
                  </div>

                  {/* Right: Payment Fields */}
                  <div className="flex-1 p-8 space-y-6">
                    {!isSuccess ? (
                      <>
                        <div className="flex justify-between items-center">
                          <h3 className={`text-sm font-bold uppercase tracking-widest flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            Stripe Checkout
                          </h3>
                          <button onClick={() => setSelectedPlan(null)} className="text-slate-500 hover:text-emerald-500">
                             <X size={18} />
                          </button>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cardholder Name</label>
                            <input 
                              type="text" 
                              placeholder="John Doe"
                              className={`w-full px-4 py-3 border rounded-lg text-sm ${isDark ? 'bg-black border-slate-800 text-white' : 'bg-slate-50 border-slate-200'}`}
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Card Number</label>
                            <div className="relative">
                              <input 
                                type="text" 
                                placeholder="4242 4242 4242 4242"
                                className={`w-full px-10 py-3 border rounded-lg text-sm ${isDark ? 'bg-black border-slate-800 text-white' : 'bg-slate-50 border-slate-200'}`}
                              />
                               <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Expiry Date</label>
                              <input 
                                type="text" 
                                placeholder="MM / YY"
                                className={`w-full px-4 py-3 border rounded-lg text-sm text-center ${isDark ? 'bg-black border-slate-800 text-white' : 'bg-slate-50 border-slate-200'}`}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">CVC</label>
                              <input 
                                type="password" 
                                placeholder="CVV"
                                className={`w-full px-4 py-3 border rounded-lg text-sm text-center ${isDark ? 'bg-black border-slate-800 text-white' : 'bg-slate-50 border-slate-200'}`}
                              />
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={handlePaymentSubmit}
                          disabled={isVerifying}
                          className="w-full py-4 bg-emerald-500 text-black rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-400 disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-md shadow-emerald-500/20"
                        >
                          {isVerifying ? (
                            <>
                              <Loader2 className="animate-spin" size={14} /> Contacting Stripe...
                            </>
                          ) : (
                            <>Confirm Payment</>
                          )}
                        </button>

                        <div className="flex items-center justify-center gap-4 pt-2">
                           <ShieldCheck size={14} className="text-emerald-500/50" />
                           <span className="text-[9px] font-bold text-slate-500 uppercase">Secured by Stripe</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8 space-y-6">
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(16,185,129,0.3)]"
                        >
                           <ShieldCheck size={40} className="text-black" />
                        </motion.div>
                        <div>
                          <h3 className={`text-2xl font-bold uppercase tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Subscription Active</h3>
                          <p className="text-xs text-slate-500 leading-relaxed font-medium">
                            Payment verified successfully. Your {selectedPlan} plan is now active. <br /> Redirecting to dashboard...
                          </p>
                        </div>
                        <div className="flex justify-center gap-1">
                           <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                           <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                           <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className={`mt-32 p-8 border rounded-2xl text-center transition-colors ${isDark ? 'border-slate-800 bg-slate-900/20' : 'border-slate-100 bg-white shadow-sm'}`}>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Enterprise Custom Solutions</h4>
            <p className={`text-sm max-w-2xl mx-auto mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Need a custom solution for your large-scale platform? Contact our team for a tailored enterprise cluster setup.
            </p>
            <button className="text-emerald-500 text-xs font-bold uppercase tracking-widest hover:underline">
                Contact Our Team &gt;
            </button>
        </div>
      </div>

      <footer className={`mt-32 text-center text-[10px] font-bold uppercase tracking-[0.3em] pb-12 transition-colors ${isDark ? 'text-slate-800' : 'text-slate-400'}`}>
        Secure Payment Infrastructure • Multi-Channel Sales AI
      </footer>
    </div>
  );
}
