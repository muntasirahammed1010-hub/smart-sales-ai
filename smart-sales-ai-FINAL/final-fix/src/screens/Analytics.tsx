/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Activity, TrendingUp, MessageSquare, Zap } from 'lucide-react';
import { Lead } from '../types';

interface AnalyticsProps {
  isDark: boolean;
  leads: Lead[];
}

export default function Analytics({ isDark, leads }: AnalyticsProps) {
  // রিয়েল টাইম ডাটা ক্যালকুলেশন
  const totalLeads = leads.length;
  const successfulLeads = leads.filter(l => l.status === 'shipped' || l.status === 'delivered').length;
  const conversionRate = totalLeads > 0 ? Math.round((successfulLeads / totalLeads) * 100) : 0;

  return (
    <div className={`p-8 min-h-full max-w-4xl mx-auto space-y-8 overflow-y-auto ${isDark ? 'bg-[#050505]' : 'bg-slate-50'}`}>
      <div>
        <h1 className={`text-2xl font-bold tracking-tight uppercase ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Live Analytics</h1>
        <p className="text-sm text-slate-500">Real-time performance metrics based on your actual data.</p>
      </div>

      <div className={`p-8 rounded-xl border transition-colors ${isDark ? 'bg-slate-900/50 border-slate-800 text-slate-300' : 'bg-white border-slate-200 shadow-sm text-slate-600'}`}>
        <h4 className="text-sm font-bold uppercase tracking-widest mb-8 flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-500" /> Platform Metrics
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`p-6 rounded-lg border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
            <span className="text-xs font-medium text-slate-500 uppercase flex items-center gap-2">
              <MessageSquare size={14} /> Total Leads Captured
            </span>
            <p className={`text-3xl font-bold mt-2 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
              {totalLeads} {/* একদম রিয়েল ডাটা */}
            </p>
          </div>
          <div className={`p-6 rounded-lg border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
            <span className="text-xs font-medium text-slate-500 uppercase flex items-center gap-2">
              <TrendingUp size={14} /> Conversion Rate
            </span>
            <p className={`text-3xl font-bold mt-2 flex items-center gap-2 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
               {conversionRate}% {/* রিয়েল পার্সেন্টেজ */}
            </p>
          </div>
          <div className={`p-6 rounded-lg border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
            <span className="text-xs font-medium text-slate-500 uppercase flex items-center gap-2">
              <Zap size={14} /> System Status
            </span>
            <p className={`text-lg font-bold mt-3 ${isDark ? 'text-emerald-400' : 'text-emerald-600'} uppercase tracking-widest`}>
              Online & Syncing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}