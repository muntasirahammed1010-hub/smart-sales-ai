/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Store, MessageCircle, Camera, Database, CheckCircle2, ChevronRight, Zap, Globe, Github } from 'lucide-react';
import { AppSettings } from '../types';

interface OnboardingProps {
  onUpdate: (settings: Partial<AppSettings>) => void;
  onComplete: () => void;
  isDark: boolean;
}

export default function Onboarding({ onUpdate, onComplete, isDark }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [storeName, setStoreName] = useState('');
  const [facebookToken, setFacebookToken] = useState('');
  const [whatsAppToken, setWhatsAppToken] = useState('');
  const [instagramToken, setInstagramToken] = useState('');
  const [sheetId, setSheetId] = useState('');

  const handleNext = () => {
    if (step === 1 && !storeName) return;
    if (step === 3) {
      onUpdate({
        sheetId,
        metaPageToken: facebookToken,
        whatsAppToken,
        instagramToken,
        config: { Store_Name: storeName }
      });
      onComplete();
    } else {
      setStep(step + 1);
    }
  };

  const steps = [
    { title: "Define Store", icon: <Store className="w-5 h-5" /> },
    { title: "Connect Platforms", icon: <Globe className="w-5 h-5" /> },
    { title: "Sync Data", icon: <Database className="w-5 h-5" /> }
  ];

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 transition-colors ${isDark ? 'bg-[#050505]' : 'bg-slate-50'}`}>
      <div className="absolute inset-x-0 top-0 h-[30vh] bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none"></div>
      
      <div className="max-w-2xl w-full space-y-12 relative z-10">
        {/* Progress Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <Zap className="text-black" fill="currentColor" size={20} />
             </div>
             <div>
                <h2 className={`text-lg font-black uppercase tracking-tighter italic ${isDark ? 'text-white' : 'text-slate-900'}`}>Onboarding_Protocol</h2>
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">v1.5 Enterprise Initializer</p>
             </div>
          </div>
          <div className="flex gap-2">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`h-1 rounded-full transition-all duration-500 ${
                  i + 1 <= step ? 'w-12 bg-emerald-500' : 'w-4 bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        <motion.div 
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className={`p-10 rounded-2xl border transition-all ${
            isDark ? 'bg-slate-900 border-slate-800 shadow-2xl' : 'bg-white border-slate-200 shadow-lg'
          }`}
        >
          {step === 1 && (
            <div className="space-y-8">
              <div className="flex items-center gap-4 text-emerald-500">
                <Store size={28} />
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Store Name</h3>
              </div>
              <p className="text-sm text-slate-500">Give your AI assistant a name or use your store name for customer interaction.</p>
              
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-600 block pl-1">Store / Business Name</label>
                <input 
                  autoFocus
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. Dhaka Elite Fashion"
                  className={`w-full px-6 py-4 border rounded-xl text-lg focus:ring-1 focus:ring-emerald-500/50 transition-all ${
                    isDark ? 'bg-black border-slate-800 text-emerald-100 placeholder:text-slate-800' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-300'
                  }`}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div className="flex items-center gap-4 text-emerald-500">
                <Globe size={28} />
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Social Integrations</h3>
              </div>
              <p className="text-sm text-slate-500">Connect your social platforms to enable automated customer replies on Messenger, WhatsApp, and Instagram.</p>
              
              <div className="grid gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 pl-1">
                    <MessageCircle size={14} className="text-blue-500" />
                    <label className="text-xs font-bold text-slate-600">Facebook Page Token</label>
                  </div>
                  <input 
                    value={facebookToken}
                    onChange={(e) => setFacebookToken(e.target.value)}
                    placeholder="EAAGz..."
                    className={`w-full px-4 py-3 border rounded-xl text-xs font-mono focus:ring-1 focus:ring-emerald-500/50 transition-all ${
                        isDark ? 'bg-black/50 border-slate-800 text-emerald-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 pl-1">
                    <MessageCircle size={14} className="text-emerald-500" />
                    <label className="text-xs font-bold text-slate-600">WhatsApp API Token</label>
                  </div>
                  <input 
                    value={whatsAppToken}
                    onChange={(e) => setWhatsAppToken(e.target.value)}
                    placeholder="WA_TOKEN_..."
                    className={`w-full px-4 py-3 border rounded-xl text-xs font-mono focus:ring-1 focus:ring-emerald-500/50 transition-all ${
                        isDark ? 'bg-black/50 border-slate-800 text-emerald-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 pl-1">
                    <Camera size={14} className="text-pink-500" />
                    <label className="text-xs font-bold text-slate-600">Instagram Graph API</label>
                  </div>
                  <input 
                    value={instagramToken}
                    onChange={(e) => setInstagramToken(e.target.value)}
                    placeholder="IG_LINK_..."
                    className={`w-full px-4 py-3 border rounded-xl text-xs font-mono focus:ring-1 focus:ring-emerald-500/50 transition-all ${
                        isDark ? 'bg-black/50 border-slate-800 text-emerald-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <div className="flex items-center gap-4 text-emerald-500">
                <Database size={28} />
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Connect Database</h3>
              </div>
              <p className="text-sm text-slate-500">Sync your product catalog and orders with Google Sheets for live data updates.</p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 block pl-1">Google Sheet ID</label>
                  <input 
                    value={sheetId}
                    onChange={(e) => setSheetId(e.target.value)}
                    placeholder="1x-p98K_..."
                    className={`w-full px-4 py-4 border rounded-xl text-sm font-mono focus:ring-1 focus:ring-emerald-500/50 transition-all ${
                        isDark ? 'bg-black border-slate-800 text-emerald-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div className={`p-4 rounded-lg flex items-center gap-3 transition-colors ${isDark ? 'bg-emerald-500/5' : 'bg-emerald-50'}`}>
                   <CheckCircle2 size={16} className="text-emerald-500" />
                   <span className="text-xs font-bold text-emerald-600/80">AI-Ready: Your smart sales agent will link automatically.</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-12 pt-8 border-t border-slate-800/50">
            <button 
              onClick={() => step > 1 && setStep(step - 1)}
              className={`text-xs font-bold transition-colors ${
                step === 1 ? 'opacity-0' : 'text-slate-500 hover:text-white'
              }`}
            >
              PREVIOUS
            </button>
            <div className="flex gap-4">
              {step > 1 && (
                <button 
                  onClick={handleNext}
                  className={`px-8 py-3.5 border rounded-xl text-xs font-bold transition-all ${
                    isDark ? 'border-slate-800 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  Skip for now
                </button>
              )}
              <button 
                onClick={handleNext}
                className={`px-10 py-3.5 bg-emerald-500 text-black rounded-xl text-xs font-bold hover:bg-emerald-400 transition-all shadow-md flex items-center gap-2`}
              >
                {step === 3 ? "Complete Setup" : "Next Step"} <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </motion.div>

        <footer className="text-center">
            <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.5em]">Global Initialization // 2026 Edition</p>
        </footer>
      </div>
    </div>
  );
}
