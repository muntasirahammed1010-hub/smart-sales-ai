/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { LayoutDashboard, Users, ShieldCheck, LogOut, Menu, X, Activity, Clock } from 'lucide-react';
import { Screen } from '../types';

interface SidebarProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  adminName: string;
  isDark: boolean;
}

export default function Sidebar({ currentScreen, onNavigate, adminName, isDark }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // 🟢 "Upgrade Node" মুছে Analytics ও History যোগ করা হয়েছে
  const menuItems = [
    { id: Screen.DASHBOARD, icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { id: Screen.CRM, icon: <Users size={20} />, label: 'CRM Leads' },
    { id: 'ANALYTICS' as Screen, icon: <Activity size={20} />, label: 'Analytics Overview' }, // New Menu
    { id: 'HISTORY' as Screen, icon: <Clock size={20} />, label: 'History' }, // New Menu
    { id: Screen.VAULT, icon: <ShieldCheck size={20} />, label: 'API Settings' },
  ];

  const handleNavigate = (id: Screen) => {
    onNavigate(id);
    setIsOpen(false);
  }

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg shadow-lg transition-colors ${
          isDark ? 'bg-slate-900 text-emerald-400 border border-slate-800' : 'bg-white text-emerald-600 border border-slate-200'
        }`}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 flex flex-col border-r transition-all duration-300
        ${isDark ? 'bg-[#0a0a0b] text-slate-400 border-slate-800' : 'bg-white text-slate-600 border-slate-200'}
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center text-black font-bold text-xs">
              {adminName.substring(0, 1).toUpperCase()}
            </div>
            <h1 className="text-sm font-bold tracking-widest uppercase text-emerald-400 truncate">{adminName}</h1>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all text-xs font-semibold uppercase tracking-wider ${
                  currentScreen === item.id 
                    ? (isDark ? 'text-emerald-400 bg-emerald-500/10 border-r-2 border-emerald-500' : 'text-emerald-600 bg-emerald-500/5 border-r-2 border-emerald-600')
                    : (isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-700')
                }`}
              >
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${currentScreen === item.id ? 'bg-emerald-500/20' : ''}`}>
                  {currentScreen === item.id ? <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> : null}
                </div>
                {item.icon}
                <span className="ml-1">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className={`mt-auto p-6 border-t ${isDark ? 'border-slate-900 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
          <div className={`p-3 rounded-lg border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <p className="text-[10px] text-slate-500 uppercase tracking-tighter mb-1">Engine Status</p>
            <p className={`text-xs font-mono ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>GEMINI_2.0_FLASH_OK</p>
          </div>
          <button 
            onClick={() => handleNavigate(Screen.LANDING)}
            className={`w-full mt-4 flex items-center gap-3 transition-colors text-[10px] font-bold uppercase tracking-widest ${
              isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <LogOut size={16} />
            Term_Session
          </button>
        </div>
      </div>
    </>
  );
}