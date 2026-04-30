/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Clock, UserPlus, Power } from 'lucide-react';
import { Lead } from '../types';

interface HistoryProps {
  isDark: boolean;
  leads: Lead[];
  bootTime: number;
}

export default function History({ isDark, leads, bootTime }: HistoryProps) {
  // রিয়েল টাইম আপটাইম ক্যালকুলেশন
  const uptimeMs = Date.now() - bootTime;
  const uptimeMinutes = Math.floor(uptimeMs / 60000);

  // সর্বশেষ ৫টি লিড দেখানোর জন্য
  const recentLeads = [...leads].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

  return (
    <div className={`p-8 min-h-full max-w-4xl mx-auto space-y-8 overflow-y-auto ${isDark ? 'bg-[#050505]' : 'bg-slate-50'}`}>
      <div>
        <h1 className={`text-2xl font-bold tracking-tight uppercase ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Live System History</h1>
        <p className="text-sm text-slate-500">Real-time event logs and AI activities.</p>
      </div>

      <div className={`p-8 rounded-xl border transition-colors ${isDark ? 'bg-slate-900/50 border-slate-800 text-slate-300' : 'bg-white border-slate-200 shadow-sm text-slate-600'}`}>
        <h4 className="text-sm font-bold uppercase tracking-widest mb-8 flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-500" /> Event Logs
        </h4>
        <div className="space-y-4">
          
          {/* রিয়েল টাইম লিড হিস্ট্রি */}
          {recentLeads.length > 0 ? (
            recentLeads.map((lead) => (
              <div key={lead.id} className={`flex items-start gap-4 p-4 rounded-lg border ${isDark ? 'bg-slate-800/30 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                <div>
                  <p className="text-xs uppercase font-bold text-emerald-500 flex items-center gap-2">
                    <UserPlus size={12} /> New Lead: {lead.name} ({lead.product})
                  </p>
                  <p className="text-[10px] font-mono text-slate-500 mt-1">ID: {lead.id} | {new Date(lead.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 italic p-4">No leads captured yet. Waiting for AI to process orders...</p>
          )}

          {/* রিয়েল সিস্টেম বুট হিস্ট্রি */}
          <div className={`flex items-start gap-4 p-4 rounded-lg border ${isDark ? 'bg-slate-800/30 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
            <div className="w-3 h-3 rounded-full bg-blue-500 mt-1 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
            <div>
              <p className="text-xs uppercase font-bold text-blue-500 flex items-center gap-2">
                <Power size={12} /> System Boot & Authentication
              </p>
              <p className="text-[10px] text-slate-500 mt-1">Node active for {uptimeMinutes} minutes</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}