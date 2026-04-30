/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Shield, Key, Database, Globe, AlertCircle, MessageCircle, Camera, Brain, Activity, Clock, TrendingUp } from 'lucide-react';
import { AppSettings } from '../types';

interface VaultProps {
  settings: AppSettings;
  onUpdate: (settings: Partial<AppSettings>) => void;
  connectionError?: string | null;
  isDark: boolean;
  systemStats?: {
    bootTime: number;
    cycles: number;
  };
}

export default function Vault({ settings, onUpdate, connectionError, isDark, systemStats }: VaultProps) {
  // Dynamic Uptime Calculation
  const uptimeMs = systemStats ? Date.now() - systemStats.bootTime : 0;
  const uptimeMinutes = Math.floor(uptimeMs / 60000);
  const uptimeSeconds = Math.floor((uptimeMs % 60000) / 1000);
  

  return (
    <div className={`p-8 min-h-full max-w-4xl mx-auto space-y-8 overflow-y-auto relative transition-colors ${isDark ? 'bg-[#050505]' : 'bg-slate-50'}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.03),transparent)] pointer-events-none"></div>
      
      <div className="flex items-center justify-between relative z-10">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight uppercase ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>API & System Core</h1>
          <p className="text-sm text-slate-500">Manage your connected platform tokens and AI configuration.</p>
        </div>
        <div className={`px-4 py-2 rounded-lg border font-mono text-[10px] uppercase tracking-widest bg-emerald-500/10 border-emerald-500/30 text-emerald-500`}>
          NODE: ACTIVE
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <div className="md:col-span-2 space-y-6">
          {/* 🟢 Fully Unlocked Prompt Injection */}
          <div className={`p-8 rounded-xl border relative overflow-hidden transition-all ${isDark ? 'bg-slate-900/20 border-slate-800' : 'bg-white border-slate-200'}`}>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-6">
              <Brain className="w-4 h-4 text-emerald-500" /> Custom Instructions (Unlocked)
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block pl-1">AI System Prompt Injection</label>
                <textarea 
                  value={settings.customInstructions || ''}
                  onChange={(e) => onUpdate({ customInstructions: e.target.value })}
                  placeholder="Tell your AI how to behave, e.g. 'Always be polite and offer discounts for orders over ৳5000'..."
                  className={`w-full px-4 py-3 border rounded-xl text-sm h-24 focus:ring-1 focus:ring-emerald-500/50 transition-all ${
                    isDark ? 'bg-black border-slate-800 text-emerald-100 placeholder:text-slate-800' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-3">
                  <div 
                    onClick={() => onUpdate({ removeWatermark: !settings.removeWatermark })}
                    className={`w-8 h-4 rounded-full transition-all relative cursor-pointer border ${settings.removeWatermark ? 'bg-emerald-500/20 border-emerald-500/50' : (isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200')}`}>
                    <div className={`w-2 h-2 rounded-sm absolute top-0.5 transition-all ${settings.removeWatermark ? 'left-5 bg-emerald-500' : 'left-0.5 bg-slate-500'}`} />
                  </div>
                  <span className="text-[9px] font-bold text-slate-600 uppercase">Remove Watermark</span>
                </div>
                <div className="flex items-center gap-3">
                  <div 
                    onClick={() => onUpdate({ priorityQueue: !settings.priorityQueue })}
                    className={`w-8 h-4 rounded-full transition-all relative cursor-pointer border ${settings.priorityQueue ? 'bg-emerald-500/20 border-emerald-500/50' : (isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200')}`}>
                    <div className={`w-2 h-2 rounded-sm absolute top-0.5 transition-all ${settings.priorityQueue ? 'left-5 bg-emerald-500' : 'left-0.5 bg-slate-500'}`} />
                  </div>
                  <span className="text-[9px] font-bold text-slate-600 uppercase">Priority Queue</span>
                </div>
              </div>
            </div>
          </div>

          <div className={`p-8 rounded-xl border shadow-sm space-y-6 transition-all ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-500" /> Connection Credentials
            </h3>
            
            <div className="space-y-4">
              {[
                { label: "Gemini API Key", key: 'geminiApiKey', type: 'password', icon: <Shield className="text-emerald-500" size={14} />, placeholder: "Enter API Key" },
                { label: "Google Sheet ID", key: 'sheetId', type: 'text', icon: <Database className="text-emerald-400" size={14} />, placeholder: "Google Sheets Identifier", error: connectionError },
                { label: "Facebook Page Token", key: 'metaPageToken', type: 'password', icon: <Globe className="text-blue-500" size={14} />, placeholder: "Messenger Access Token" },
                { label: "WhatsApp API Token", key: 'whatsAppToken', type: 'password', icon: <MessageCircle className="text-emerald-500" size={14} />, placeholder: "WhatsApp Cloud Token" },
                { label: "Instagram API Token", key: 'instagramToken', type: 'password', icon: <Camera className="text-pink-500" size={14} />, placeholder: "Instagram Graph Token" },
              ].map((field) => (
                <div key={field.key}>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-slate-500 block">{field.label}</label>
                    {(field as any).error && (
                      <span className="text-[10px] font-bold text-red-500 uppercase flex items-center gap-1">
                        <AlertCircle size={10} /> {(field as any).error}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input 
                      type={field.type}
                      value={(settings as any)[field.key] || ''}
                      onChange={(e) => onUpdate({ [field.key]: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-lg text-xs font-mono focus:ring-1 focus:ring-emerald-500/50 transition-all ${ 
                        isDark 
                          ? `bg-black/50 border-slate-800 text-emerald-100 placeholder:text-slate-800 ${field.error ? 'border-red-500/50' : 'border-slate-800'}` 
                          : `bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-300 ${field.error ? 'border-red-500/50' : 'border-slate-200'}`
                      }`}
                      placeholder={field.placeholder}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50">
                      {field.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className={`pt-4 flex items-center justify-between border-t transition-colors ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-5 rounded-full transition-all relative cursor-pointer border ${settings.bargainingEnabled ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-slate-900 border-slate-800'}`}
                     onClick={() => onUpdate({ bargainingEnabled: !settings.bargainingEnabled })}>
                  <div className={`w-3 h-3 rounded-sm absolute top-1 transition-all ${settings.bargainingEnabled ? 'left-6 bg-emerald-500' : 'left-0.5 bg-slate-700'}`} />
                </div>
                <span className={`text-xs font-bold text-slate-600`}>Enable Bargaining</span>
              </div>
              <p className="text-[10px] text-slate-500">Max Discount: 5%</p>
            </div>
          </div>
        </div>

        {/* 🟢 Right Column: New Analytics & History Cards */}
        <div className="space-y-6 text-slate-500">
          
          {/* Analytics Overview Card */}
          <div className={`p-6 rounded-xl border transition-colors ${isDark ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-white border-slate-200 shadow-sm text-slate-400'}`}>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" /> Analytics Overview
            </h4>
            <div className="space-y-4">
              <div className={`flex justify-between items-center border-b pb-2 ${isDark ? 'border-slate-800/50' : 'border-slate-100'}`}>
                <span className="text-xs font-medium">AI Cycles Run</span>
                <span className={`text-xs font-bold ${isDark ? 'text-emerald-500' : 'text-emerald-600'}`}>{systemStats?.cycles ?? 0}</span>
              </div>
              <div className={`flex justify-between items-center border-b pb-2 ${isDark ? 'border-slate-800/50' : 'border-slate-100'}`}>
                <span className="text-xs font-medium">Uptime</span>
                <span className={`text-xs font-bold flex items-center gap-1 ${isDark ? 'text-emerald-500' : 'text-emerald-600'}`}>
                  <TrendingUp size={12} /> {uptimeMinutes}m {uptimeSeconds}s
                </span>
              </div>
              <div className={`flex justify-between items-center border-b pb-2 ${isDark ? 'border-slate-800/50' : 'border-slate-100'}`}>
                <span className="text-xs font-medium">AI Status</span>
                <span className={`text-xs font-bold ${settings.aiPaused ? 'text-amber-500' : (isDark ? 'text-emerald-500' : 'text-emerald-600')}`}>{settings.aiPaused ? 'Paused' : 'Active'}</span>
              </div>
            </div>
          </div>

          {/* History Card */}
          <div className={`p-6 rounded-xl border transition-colors ${isDark ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-white border-slate-200 shadow-sm text-slate-400'}`}>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500" /> History
            </h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1"></div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Inventory Sync</p>
                  <p className="text-[9px] text-slate-600">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1"></div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">New Lead Captured</p>
                  <p className="text-[9px] text-slate-600">15 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1"></div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">System Boot</p>
                  <p className="text-[9px] text-slate-600">{uptimeMinutes}m {uptimeSeconds}s ago</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-xl">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-2">Integration Success</h4>
            <p className="text-[11px] text-emerald-500/80 leading-relaxed">
              Your AI assistant is currently monitoring messages across all connected channels.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}