/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Truck, Search, Download, Clock, PackageSearch, Activity } from 'lucide-react';
import { Lead, Screen } from '../types';

interface CRMProps {
  leads: Lead[];
  onUpdateLead: (id: string, status: string) => void;
  onNavigate: (screen: Screen) => void;
  isDark: boolean;
}

export default function CRM({ leads, onUpdateLead, onNavigate, isDark }: CRMProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamic Stats Calculation
  const totalRevenue = leads.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const activeLeads = leads.filter(l => l.status === 'pending').length;
  const pendingBuffer = leads.filter(l => l.status === 'shipped').length;
  const fulfilledUnits = leads.filter(l => l.status === 'delivered').length;

  // Dynamic Chart Data Generation (Grouping by date/day)
  // For simplicity, we'll map the last 7 days or use available timestamps
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const chartDataMap: { [key: string]: number } = {};
  
  leads.forEach(lead => {
    try {
      const date = new Date(lead.timestamp);
      const dayName = days[date.getDay()];
      chartDataMap[dayName] = (chartDataMap[dayName] || 0) + lead.amount;
    } catch (e) {
      // Fallback if timestamp is just a string like "Yesterday"
      const dayName = 'Mon'; // Default bin
      chartDataMap[dayName] = (chartDataMap[dayName] || 0) + lead.amount;
    }
  });

  const chartData = days.map(day => ({
    name: day,
    sales: chartDataMap[day] || 0
  }));

  const exportLeads = () => {
    const headers = ['ID', 'Name', 'Phone', 'Address', 'Product', 'Status', 'Timestamp', 'Amount'];
    const rows = leads.map(l => [
      l.id, 
      `"${l.name.replace(/"/g, '""')}"`, 
      `"${l.phone}"`, 
      `"${l.address.replace(/"/g, '""')}"`, 
      `"${l.product.replace(/"/g, '""')}"`, 
      l.status, 
      l.timestamp, 
      l.amount
    ]);
    
    const csvString = [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `Mun_Shop_Orders.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const stats = [
    { label: "Total Revenue Generated", value: `৳${totalRevenue.toLocaleString()}`, trend: leads.length > 5 ? "+12.5%" : "STABLE", color: 'emerald' },
    { label: "Active Pending Leads", value: activeLeads.toString(), trend: activeLeads > 10 ? "HIGH_LOAD" : "NOMINAL", color: 'emerald' },
    { label: "Logistics Hub Buffer", value: pendingBuffer.toString(), trend: pendingBuffer > 0 ? "DISPATCHING" : "EMPTY", color: 'emerald' },
    { label: "Conversion Rate Optimal", value: `${leads.length > 0 ? Math.round((fulfilledUnits / leads.length) * 100) : 0}%`, trend: "99.9%", color: 'emerald' },
  ];

  return (
    <div className={`p-8 min-h-full space-y-8 overflow-y-auto transition-colors ${isDark ? 'bg-[#050505]' : 'bg-slate-50'}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight uppercase ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Order Analytics & CRM</h1>
          <p className={`text-sm font-mono ${isDark ? 'text-emerald-500/80' : 'text-emerald-600'}`}>LATENCY_CORE: {leads.length > 0 ? 'STABLE_LINK_OK' : 'WAITING_FOR_DATA_SYNC'}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportLeads}
            className={`px-4 py-2 border rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Download size={14} className="inline mr-2" /> Export_Data
          </button>
          <button 
            onClick={() => onNavigate(Screen.VAULT)}
            className="px-4 py-2 bg-emerald-500 text-black rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-400 transition-colors"
          >
            <Truck size={14} className="inline mr-2" /> Global_Logistics
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className={`p-6 rounded-xl border relative overflow-hidden group transition-all ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <Activity size={40} className="text-emerald-500" />
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className={`text-3xl font-mono tracking-tighter ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{stat.value}</p>
            <p className={`text-[10px] mt-2 font-mono uppercase ${isDark ? 'text-emerald-500' : 'text-emerald-600'}`}>{stat.trend} FROM_SATELLITE</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sales Chart */}
        <div className={`lg:col-span-8 border rounded-xl p-8 relative overflow-hidden transition-colors ${isDark ? 'bg-slate-900/20 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.05),transparent)] pointer-events-none"></div>
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-8">Temporal Performance Matrix</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#1e293b" : "#f1f5f9"} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: isDark ? '#64748b' : '#94a3b8', fontFamily: 'JetBrains Mono' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: isDark ? '#64748b' : '#94a3b8', fontFamily: 'JetBrains Mono' }}
                  dx={-10}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }}
                  contentStyle={{ backgroundColor: isDark ? '#0a0a0b' : '#ffffff', borderRadius: '8px', border: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0', boxShadow: 'none' }}
                  labelStyle={{ color: '#10b981', fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase' }}
                />
                <Bar 
                  dataKey="sales" 
                  fill="#10b981" 
                  radius={[4, 4, 0, 0]} 
                  barSize={32}
                  className="drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Conversion Log */}
        <div className={`lg:col-span-4 border rounded-xl overflow-hidden flex flex-col transition-colors ${isDark ? 'bg-slate-900/20 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className={`p-4 border-b transition-colors ${isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-slate-50'}`}>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Live AI Verdicts</h3>
          </div>
          <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
            {leads.slice(0, 6).map((lead) => (
              <div key={lead.id} className={`flex items-center gap-4 p-3 rounded-lg border transition-all group ${
                isDark ? 'bg-slate-900/20 border-slate-800/50 hover:border-emerald-500/30' : 'bg-slate-50 border-slate-100 hover:border-emerald-200 shadow-sm'
              }`}>
                <div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <PackageSearch className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className={`text-[10px] font-bold truncate uppercase mt-0.5 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{lead.name}</p>
                  <p className="text-[9px] text-slate-500 font-mono uppercase truncate">{lead.product}</p>
                </div>
                <div className="text-right">
                  <p className={`text-[10px] font-mono ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>৳{lead.amount}</p>
                  <p className="text-[8px] text-slate-400 italic">Extraction_OK</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className={`border rounded-xl overflow-hidden mb-8 transition-colors ${isDark ? 'bg-slate-900/20 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className={`px-6 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Latest Order Leads</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, phone, product..." 
              className={`pl-9 pr-4 py-2 border rounded-lg text-[10px] font-mono transition-all w-full sm:w-64 ${
                isDark ? 'bg-black border-slate-800 text-emerald-100 placeholder:text-slate-700' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
              } focus:ring-1 focus:ring-emerald-500/50`}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className={`text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b transition-colors ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                <th className="px-6 py-4 font-bold">Customer Details</th>
                <th className="px-6 py-4 font-bold">Contact Info</th>
                <th className="px-6 py-4 font-bold">Order Details</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Operations</th>
              </tr>
            </thead>
            <tbody className={`divide-y transition-colors ${isDark ? 'divide-slate-800/50' : 'divide-slate-100'}`}>
              {leads.filter(l => 
                !searchQuery || 
                l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                l.phone.includes(searchQuery) ||
                l.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
                l.id.toLowerCase().includes(searchQuery.toLowerCase())
              ).length === 0 && (
                <tr>
                  <td colSpan={5} className={`px-6 py-12 text-center text-sm ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                    {searchQuery ? `No leads match "${searchQuery}"` : 'No leads yet. Start chatting to capture orders.'}
                  </td>
                </tr>
              )}
              {leads.filter(l => 
                !searchQuery || 
                l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                l.phone.includes(searchQuery) ||
                l.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
                l.id.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((lead) => (
                <tr key={lead.id} className={`transition-colors ${isDark ? 'hover:bg-emerald-500/5' : 'hover:bg-emerald-50/50'}`}>
                  <td className="px-6 py-4">
                    <div className={`font-bold uppercase tracking-tight ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{lead.name}</div>
                    <div className="text-[9px] font-mono text-slate-500">{lead.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`font-mono ${isDark ? 'text-emerald-100' : 'text-emerald-700'}`}>{lead.phone}</div>
                    <div className="text-[9px] text-slate-400 uppercase tracking-tighter truncate max-w-[150px]">{lead.address}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border transition-colors mb-1 ${
                        isDark ? 'text-slate-400 bg-slate-900 border-slate-800' : 'text-slate-500 bg-slate-50 border-slate-200'
                      }`}>{lead.product || 'Unknown'}</span>
                      <span className={`text-[10px] font-mono ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>৳{lead.amount || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-widest border ${
                      lead.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                      lead.status === 'shipped' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                      lead.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {lead.status === 'pending' && (
                        <button 
                          onClick={() => onUpdateLead(lead.id, 'shipped')}
                          title="Mark as Shipped"
                          className={`h-8 w-8 rounded transition-all inline-flex items-center justify-center border ${
                            isDark ? 'hover:bg-blue-500 hover:text-black text-slate-400 border-slate-800' : 'hover:bg-blue-500 hover:text-white text-slate-400 border-slate-200'
                          }`}
                        >
                          <Truck size={12} />
                        </button>
                      )}
                      
                      {lead.status === 'shipped' && (
                        <button 
                          onClick={() => onUpdateLead(lead.id, 'delivered')}
                          title="Mark as Delivered"
                          className={`h-8 w-8 rounded transition-all inline-flex items-center justify-center border ${
                            isDark ? 'hover:bg-emerald-500 hover:text-black text-slate-400 border-slate-800' : 'hover:bg-emerald-500 hover:text-white text-slate-400 border-slate-200'
                          }`}
                        >
                          <PackageSearch size={12} />
                        </button>
                      )}

                      {lead.status !== 'delivered' && lead.status !== 'cancelled' && (
                        <button 
                          onClick={() => onUpdateLead(lead.id, 'cancelled')}
                          title="Cancel Order"
                          className={`h-8 w-8 rounded transition-all inline-flex items-center justify-center border ${
                            isDark ? 'hover:bg-red-500 hover:text-black text-slate-400 border-slate-800' : 'hover:bg-red-500 hover:text-white text-slate-400 border-slate-200'
                          }`}
                        >
                          <Clock size={12} className="rotate-45" />
                        </button>
                      )}

                      {(lead.status === 'delivered' || lead.status === 'cancelled') && (
                        <div className={`h-8 px-3 rounded text-[9px] font-mono uppercase flex items-center border ${
                          isDark ? 'bg-slate-900/50 text-slate-600 border-slate-800/50' : 'bg-slate-50 text-slate-300 border-slate-100'
                        }`}>
                          Link_Closed
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
