/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { Send, Package, AlertCircle, Brain } from 'lucide-react';
import { InventoryItem, ChatMessage, Screen, Lead, AppConfig } from '../types';
import { AIService } from '../services/aiService';

interface DashboardProps {
  inventory: InventoryItem[];
  leads: Lead[];
  bargainingEnabled: boolean;
  apiKey: string;
  settingsVersion: number;
  aiPaused: boolean;
  isDark: boolean;
  config?: AppConfig;
  customInstructions?: string;
  onUpdate: (settings: Partial<any>) => void;
  onNavigate: (screen: Screen) => void;
  onAICycle?: () => void;
  onAddLead?: (lead: Lead) => void;
}

export default function Dashboard({ 
  inventory, 
  leads,
  bargainingEnabled, 
  apiKey, 
  settingsVersion, 
  aiPaused, 
  isDark,
  config,
  customInstructions,
  onUpdate, 
  onNavigate,
  onAICycle,
  onAddLead
}: DashboardProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [initDone, setInitDone] = useState(false);

  useEffect(() => {
    if (!initDone && config && Object.keys(config).length > 0) {
      const welcomeText = config?.Start_Message || "Assalamu Alaikum! Ami apnar Smart-Sales AI. Kivabe help korte pari?";
      setMessages([
        { role: 'assistant', content: welcomeText, timestamp: new Date().toLocaleTimeString() }
      ]);
      setInitDone(true);
    }
  }, [config, initDone]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const aiService = useRef<AIService | null>(null);

  useEffect(() => {
    if (apiKey) {
      aiService.current = new AIService(apiKey);
    }
  }, [apiKey, settingsVersion]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const isLimitReached = false;

  let conversionRate = 0;
  if (leads && leads.length > 0) {
    const totalProcessed = leads.filter(l => l.status === 'shipped' || l.status === 'delivered').length;
    conversionRate = Math.round((totalProcessed / leads.length) * 100);
  }

  const handleSend = async () => {
    if (!input.trim() || isTyping || isLimitReached) return;
    if (!apiKey) {
       onNavigate(Screen.VAULT);
       return;
    }

    const userMsg: ChatMessage = { role: 'user', content: input, timestamp: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    
    if (aiPaused) {
      setIsTyping(false);
      return;
    }

    setIsTyping(true);
    const startTime = Date.now();

    if (aiService.current) {
      try {
        const history = messages.map(m => ({
          role: m.role === 'user' ? 'user' as const : 'model' as const,
          parts: [{ text: m.content }]
        }));

        let aiResponse = await aiService.current.getResponse(input, history, inventory, bargainingEnabled, customInstructions);
        
        // Order Extraction Logic (Frontend Simulation)
        const orderMatch = aiResponse.match(/\[ORDER_CAPTURED:\s*([\s\S]*?)\]/);
        if (orderMatch && onAddLead) {
          try {
            const cleanJson = orderMatch[1].replace(/```json/g, '').replace(/```/g, '').trim();
            const orderData = JSON.parse(cleanJson);
            
            const newLead: Lead = {
              id: `SIM-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
              name: orderData.name || 'Unknown',
              phone: orderData.phone || '',
              address: orderData.address || '',
              product: orderData.product || 'Unknown',
              amount: Number(orderData.amount) || 0,
              status: 'pending',
              timestamp: new Date().toISOString()
            };
            
            onAddLead(newLead);
            
            // Clean message for display
            aiResponse = aiResponse.replace(/\[ORDER_CAPTURED:\s*[\s\S]*?\]/g, "").trim();
          } catch (e) {
            console.error("Simulation order parse error:", e);
          }
        }

        const endTime = Date.now();
        setLatency(endTime - startTime);
        if (onAICycle) onAICycle();

        const assistantMsg: ChatMessage = { 
          role: 'assistant', 
          content: aiResponse, 
          timestamp: new Date().toLocaleTimeString() 
        };
        setMessages(prev => [...prev, assistantMsg]);
      } catch (error) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "System Error. Context buffer overflow or API rejected request. Check Node Health.", 
          timestamp: new Date().toLocaleTimeString() 
        }]);
      }
    } else {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Setup Required: AI Agent not initialized. Please add your Gemini API key in Settings.", 
        timestamp: new Date().toLocaleTimeString() 
      }]);
    }

    setIsTyping(false);
  };

  if (!apiKey) {
    return (
      <div className={`flex-1 flex items-center justify-center p-8 relative overflow-hidden ${isDark ? 'bg-[#050505]' : 'bg-slate-50'}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.1),transparent)]"></div>
        <div className={`max-w-md w-full p-10 border border-red-500/30 rounded-2xl text-center space-y-6 relative z-10 shadow-xl ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
           <AlertCircle size={48} className="text-red-500 mx-auto" />
           <h2 className="text-2xl font-bold text-red-500">Setup Required</h2>
           <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Please add your Gemini API key in the settings to activate your AI.</p>
           <button 
             onClick={() => onNavigate(Screen.VAULT)}
             className="w-full py-4 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 transition-all shadow-md"
           >
             Configure Settings
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-full overflow-hidden relative ${isDark ? 'bg-[#050505]' : 'bg-slate-50'}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.03),transparent)] pointer-events-none"></div>
      
      {/* Left Panel: Inventory */}
      <div className={`hidden xl:flex w-80 border-r flex-col p-6 overflow-y-auto ${isDark ? 'bg-[#0a0a0b] border-slate-800' : 'bg-white border-slate-200'}`}>
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
          <Package className="w-3 h-3" /> Live Inventory
        </h2>
        <div className="space-y-1">
          {inventory.map((item) => (
            <div key={item.id} className={`p-3 border-b transition-all group ${isDark ? 'border-slate-800/50 hover:bg-emerald-500/5' : 'border-slate-100 hover:bg-emerald-50/50'}`}>
              <div className="flex justify-between items-start mb-1">
                <span className={`text-xs font-semibold group-hover:text-emerald-500 transition-colors uppercase tracking-tight ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{item.name}</span>
                <span className={`text-[10px] font-mono ${isDark ? 'text-emerald-500' : 'text-emerald-600'}`}>৳{item.price}</span>
              </div>
              <div className="flex justify-between items-center text-[9px]">
                <span className="text-slate-500 uppercase tracking-tighter">{item.category}</span>
                <span className={`font-mono ${item.stock > 10 ? (isDark ? 'text-emerald-500' : 'text-emerald-600') : 'text-amber-500'}`}>
                   SYNCED: {item.stock}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Center Panel: Chat Simulation */}
      <div className="flex-1 flex flex-col relative transition-colors">
        
        <div className={`p-4 border-b flex justify-between items-center transition-colors ${isDark ? 'bg-[#0a0a0b]/50 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200'}`}>
              <Brain className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            </div>
            <div>
              <h3 className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>AI Assistant Core</h3>
              <p className={`text-[10px] font-medium ${isDark ? 'text-emerald-500' : 'text-emerald-600'}`}>Online & Ready to Convert Leads</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* AI/Human Toggle */}
            <button 
              onClick={() => onUpdate({ aiPaused: !aiPaused })}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
                aiPaused 
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-sm' 
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-sm'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${aiPaused ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
              <span className="text-[10px] font-bold">
                {aiPaused ? 'AI is Paused (Manual)' : 'AI is Active'}
              </span>
            </button>

            <span className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase ${isDark ? 'bg-slate-900 text-slate-500 border-slate-800' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
              LATENCY: {latency ? `${latency}MS` : 'WAIT_SYNC'}
            </span>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
          {messages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-start' : 'items-end'}`}>
              <span className={`text-[11px] font-bold mb-1 ${msg.role === 'user' ? (isDark ? 'text-slate-500' : 'text-slate-500') : (isDark ? 'text-emerald-500' : 'text-emerald-500')}`}>
                {msg.role === 'user' ? `Customer • ${msg.timestamp}` : `AI Assistant • ${msg.timestamp}`}
              </span>
              <div className={`px-4 py-3 rounded-2xl text-sm max-w-[85%] border shadow-sm transition-colors ${
                msg.role === 'user' 
                  ? (isDark ? 'bg-slate-900/60 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800') 
                  : (isDark ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-100' : 'bg-emerald-500/10 border-emerald-600/20 text-emerald-900')
              } rounded-tl-none font-sans leading-relaxed`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex flex-col items-end">
               <span className={`text-[9px] mb-1 uppercase tracking-widest font-bold ${isDark ? 'text-emerald-600' : 'text-emerald-500'}`}>SMART-SALES AI: THINKING</span>
               <div className={`px-4 py-2 rounded-2xl rounded-tr-none flex gap-1 border transition-colors ${isDark ? 'bg-emerald-600/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}>
                <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse delay-75"></span>
                <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse delay-150"></span>
              </div>
            </div>
          )}
        </div>

        <div className={`p-4 border-t transition-colors ${isDark ? 'bg-[#0a0a0b] border-slate-800' : 'bg-white border-slate-100'}`}>
          <div className="relative flex items-center">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isLimitReached ? "Usage limit reached..." : "Test your AI assistant here..."}
              disabled={isLimitReached}
              className={`w-full pl-6 pr-14 py-4 border rounded-xl focus:ring-1 focus:ring-emerald-500/50 text-sm transition-all disabled:opacity-30 ${
                isDark ? 'bg-[#050505] border-slate-800 text-emerald-50 placeholder:text-slate-700' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
              }`}
            />
            <button 
              onClick={handleSend}
              disabled={isLimitReached}
              className="absolute right-2 p-3 bg-emerald-500 text-black rounded-lg hover:bg-emerald-400 transition-all font-bold disabled:opacity-30"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel: Status */}
      <div className={`hidden lg:flex w-72 border-l flex-col p-6 transition-colors ${isDark ? 'bg-[#0a0a0b] border-slate-800' : 'bg-white border-slate-200'}`}>
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-8">System Telemetry</h2>
        
        <div className="space-y-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Sync Pipeline</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            </div>
            <div className="space-y-2">
              <div className={`p-3 rounded-lg border transition-colors ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center justify-between mb-1">
                   <span className="text-[10px] font-mono text-slate-400">SHEETS_DATA_LINK</span>
                   <span className={`text-[9px] font-mono ${isDark ? 'text-emerald-500' : 'text-emerald-600'}`}>STABLE</span>
                </div>
                <div className={`w-full h-1 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                  <div className="bg-emerald-500 h-full w-[85%]"></div>
                </div>
              </div>
              <div className={`p-3 rounded-lg border transition-colors ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center justify-between mb-1">
                   <span className="text-[10px] font-mono text-slate-400">GEMINI_API_NODE</span>
                   <span className={`text-[9px] font-mono ${isDark ? 'text-emerald-500' : 'text-emerald-600'}`}>ACTIVE</span>
                </div>
                <div className={`w-full h-1 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                  <div className="bg-emerald-500 h-full w-[99%]"></div>
                </div>
              </div>
            </div>
          </div>

          <div>
             <span className={`text-[10px] font-bold uppercase tracking-wider block mb-4 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>AI Protocol States</span>
            <div className="space-y-2">
              <div className={`flex items-center justify-between p-3 rounded-lg border font-mono text-[9px] transition-colors ${
                bargainingEnabled 
                  ? (isDark ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600') 
                  : (isDark ? 'bg-slate-900/50 border-slate-800 text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-400')
              }`}>
                <span>BARGAINING_MODE</span>
                <span className="font-bold">{bargainingEnabled ? 'ENABLED' : 'DISABLED'}</span>
              </div>
              <div className={`flex items-center justify-between p-3 rounded-lg border font-mono text-[9px] transition-colors ${
                isDark ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600'
              }`}>
                <span>BANGLISH_SYNTAX_V1.5</span>
                <span className="font-bold">LIVE</span>
              </div>
            </div>
          </div>

          <div className={`mt-auto p-4 rounded-xl border transition-colors ${isDark ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-emerald-50 border-emerald-100'}`}>
            <p className="text-[10px] text-slate-500 uppercase mb-1">Daily Conversion</p>
            <h4 className={`text-2xl font-mono italic ${isDark ? 'text-emerald-100' : 'text-emerald-900'}`}>{conversionRate}%</h4>
            <div className={`mt-2 w-full h-1 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
              <div className={`h-full bg-emerald-500 transition-all duration-1000`} style={{ width: `${conversionRate}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
