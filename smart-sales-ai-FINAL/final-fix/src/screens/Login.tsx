/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Zap, Mail, Lock, ArrowRight, ShieldCheck, Globe } from 'lucide-react';
import { auth, googleProvider, db } from '../lib/firebase'; // Firebase config ইম্পোর্ট[cite: 1]
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

interface LoginProps {
  onLogin: (success: boolean) => void;
  isDark: boolean;
}

export default function Login({ onLogin, isDark }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ইমেইল ও পাসওয়ার্ড দিয়ে লগইন[cite: 1]
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // ইউজারকে Firestore এ Pro হিসেবে সেভ করা[cite: 1, 2]
      await setDoc(doc(db, "users", userCredential.user.uid), {
        status: 'pro',
        lastLogin: new Date().toISOString()
      }, { merge: true });
      
      onLogin(true); // App.tsx কে জানানো যে লগইন সফল[cite: 1]
    } catch (err: any) {
      alert("Login Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // গুগল দিয়ে লগইন[cite: 1]
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await setDoc(doc(db, "users", result.user.uid), {
        status: 'pro'
      }, { merge: true });
      onLogin(true);
    } catch (err: any) {
      alert("Google Login Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 ${isDark ? 'bg-[#050505]' : 'bg-slate-50'}`}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-md p-8 rounded-2xl border shadow-xl relative z-10 ${
          isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Zap className="text-black" fill="currentColor" />
          </div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Smart-Sales AI</h1>
          <p className="text-sm text-slate-500 mt-2">Login to access your Pro Dashboard[cite: 1]</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@smart-sales.ai"
                className="w-full pl-12 pr-4 py-3 border rounded-xl bg-black border-slate-800 text-white text-sm focus:ring-1 focus:ring-emerald-500/50 outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3 border rounded-xl bg-black border-slate-800 text-white text-sm focus:ring-1 focus:ring-emerald-500/50 outline-none"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-emerald-500 text-black rounded-lg text-sm font-bold hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? "Authenticating..." : <>Login to Node <ArrowRight size={14} /></>}
          </button>
        </form>

        <div className="my-8 flex items-center gap-4">
          <div className="flex-1 h-px bg-slate-800"></div>
          <span className="text-[10px] font-bold text-slate-600 uppercase">OR</span>
          <div className="flex-1 h-px bg-slate-800"></div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full py-3 border border-slate-800 rounded-lg text-xs font-bold uppercase text-slate-300 flex items-center justify-center gap-3 hover:bg-slate-800 transition-all"
        >
          <img src="https://www.google.com/favicon.ico" alt="G" className="w-4 h-4" />
          Continue with Google
        </button>

        <div className="mt-10 pt-6 border-t border-slate-800/50 flex items-center justify-between text-[9px] text-slate-600 font-mono">
          <div className="flex items-center gap-2"><ShieldCheck size={12} className="text-emerald-500/50" /> Secure_Link: OK</div>
          <div className="flex items-center gap-2"><Globe size={12} className="text-emerald-500/50" /> DHAKA_CORE</div>
        </div>
      </motion.div>
    </div>
  );
}