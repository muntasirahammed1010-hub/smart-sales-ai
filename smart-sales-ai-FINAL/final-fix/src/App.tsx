/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Screen, InventoryItem, Lead, AppSettings } from './types';
import Landing from './screens/Landing';
import Pricing from './screens/Pricing';
import Dashboard from './screens/Dashboard';
import CRM from './screens/CRM';
import Vault from './screens/Vault';
import Login from './screens/Login';
import Onboarding from './screens/Onboarding';
import Sidebar from './components/Sidebar';
// 🟢 এই যে নতুন ২টা ফাইল ইম্পোর্ট করা হলো
import Analytics from './screens/Analytics';
import History from './screens/History';
import { fetchSheetData, parseProducts, parseLeads, parseConfig } from './lib/sheets';
import { Sun, Moon } from 'lucide-react';

const INITIAL_SETTINGS: AppSettings = {
  geminiApiKey: '',
  sheetId: '',
  metaPageToken: '',
  bargainingEnabled: true,
  aiPaused: false,
  subscriptionTier: 'Pro', // 🔓 Pro আনলকড
  theme: 'dark',
  config: {},
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.LANDING);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('smart_sales_auth') === 'true';
  });
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    return localStorage.getItem('smart_sales_onboarding') === 'true';
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [settingsVersion, setSettingsVersion] = useState(0);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('smart_sales_settings');
    const parsed = saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    return { ...parsed, subscriptionTier: 'Pro' };
  });

  const [bootTime] = useState(Date.now());
  const [totalAICycles, setTotalAICycles] = useState(0);

  useEffect(() => {
    localStorage.setItem('smart_sales_settings', JSON.stringify(settings));
  }, [settings]);

  // Real-time Data Sync Protocol
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        await fetch('/api/settings-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            settings: {
              geminiApiKey: settings.geminiApiKey,
              metaPageToken: settings.metaPageToken,
              whatsAppToken: settings.whatsAppToken,
              instagramToken: settings.instagramToken,
              sheetId: settings.sheetId,
              bargainingEnabled: settings.bargainingEnabled,
              aiPaused: settings.aiPaused
            },
            currentInventory: inventory
          })
        });
      } catch (err) {
        console.warn("Server sync failed (Non-critical):", err);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [settings, inventory]);

  // Real-time Backend Sync Polling
  useEffect(() => {
    const pollLeads = async () => {
      try {
        const response = await fetch('/api/leads');
        if (response.ok) {
          const cloudLeads = await response.json();
          if (cloudLeads && Array.isArray(cloudLeads)) {
            setLeads(prev => {
              // Preserve locally-created SIM- and WEB- leads not yet in cloud
              const localLeads = prev.filter(l => l.id.startsWith('SIM-') || l.id.startsWith('WEB-'));
              const cloudIds = new Set(cloudLeads.map((l: any) => l.id));
              const uniqueLocalLeads = localLeads.filter(l => !cloudIds.has(l.id));
              return [...cloudLeads, ...uniqueLocalLeads];
            });
          }
        }
      } catch (err) {
        console.warn("Backend poll failed:", err);
      }
    };

    const interval = setInterval(pollLeads, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (settings.sheetId) {
        setIsSyncing(true);
        setConnectionError(null);
        try {
          const productRows = await fetchSheetData(settings.sheetId, 'Products');
          if (productRows && productRows.length > 0) {
            setInventory(parseProducts(productRows));
          }

          const leadRows = await fetchSheetData(settings.sheetId, 'Leads');
          if (leadRows && leadRows.length > 0) {
            setLeads(prev => {
              // Preserve simulation leads and backend webhook leads
              const localLeads = prev.filter(l => l.id.startsWith('SIM-') || l.id.startsWith('WEB-'));
              const sheetLeads = parseLeads(leadRows);
              const sheetIds = new Set(sheetLeads.map(l => l.id));
              const uniqueLocalLeads = localLeads.filter(l => !sheetIds.has(l.id));
              return [...uniqueLocalLeads, ...sheetLeads];
            });
          }

          const configRows = await fetchSheetData(settings.sheetId, 'Config');
          if (configRows && configRows.length > 0) {
            const parsedConfig = parseConfig(configRows);
            updateSettings({ config: parsedConfig });
          }

          if ((!productRows || productRows.length === 0) && (!leadRows || leadRows.length === 0)) {
            setConnectionError("INVALID_DATASOURCE_LINK");
          }
        } catch (error) {
          setConnectionError("LINK_FATAL_ERROR");
        } finally {
          setTimeout(() => setIsSyncing(false), 800);
        }
      }
    };
    fetchData();
  }, [settings.sheetId]);

  const updateLeadStatus = async (id: string, newStatus: string) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus as any } : l));
    // Sync to server for all non-simulation leads (M-, I-, W- from webhooks)
    if (!id.startsWith('SIM-')) {
      try {
        await fetch('/api/update-lead', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ id, status: newStatus }) 
        });
      } catch (err) {}
    }
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    setSettingsVersion(v => v + 1);
  };

  const isDark = settings.theme === 'dark';

  const renderScreen = () => {
    if (!isAuthenticated) {
      return <Login onLogin={() => {
        setIsAuthenticated(true);
        localStorage.setItem('smart_sales_auth', 'true');
      }} isDark={isDark} />;
    }

    if (!hasCompletedOnboarding) {
      return <Onboarding 
        onUpdate={updateSettings} 
        onComplete={() => {
          setHasCompletedOnboarding(true);
          localStorage.setItem('smart_sales_onboarding', 'true');
          setCurrentScreen(Screen.DASHBOARD);
        }} 
        isDark={isDark} 
      />;
    }

    switch (currentScreen) {
      case Screen.LANDING:
        return <Landing onNavigate={setCurrentScreen} isDark={isDark} />;
      case Screen.PRICING:
        return <Pricing onNavigate={setCurrentScreen} onUpdate={updateSettings} isDark={isDark} />;
      case Screen.DASHBOARD:
        return <Dashboard 
          inventory={inventory} 
          leads={leads}
          bargainingEnabled={settings.bargainingEnabled}
          apiKey={settings.geminiApiKey}
          settingsVersion={settingsVersion}
          aiPaused={settings.aiPaused}
          config={settings.config}
          customInstructions={settings.customInstructions}
          onUpdate={updateSettings}
          onNavigate={setCurrentScreen}
          isDark={isDark}
          onAICycle={() => setTotalAICycles(prev => prev + 1)}
          onAddLead={(newLead) => setLeads(prev => [newLead, ...prev])}
        />;
      case Screen.CRM:
        return <CRM leads={leads} onUpdateLead={updateLeadStatus} onNavigate={setCurrentScreen} isDark={isDark} />;
      case Screen.VAULT:
        return <Vault 
          settings={settings} 
          onUpdate={updateSettings} 
          connectionError={connectionError} 
          isDark={isDark}
          systemStats={{ bootTime, cycles: totalAICycles }}
        />;

      // 🟢 এই যে রাউটিং অ্যাড করা হলো! 
      case Screen.ANALYTICS:
        return <Analytics isDark={isDark} leads={leads} />;
      case Screen.HISTORY:
        return <History isDark={isDark} leads={leads} bootTime={bootTime} />;

      default:
        return <Landing onNavigate={setCurrentScreen} isDark={isDark} />;
    }
  };

  const adminName = settings.config?.Admin_Name || settings.config?.Store_Name || 'Mun SaaS AI';
  const hideChrome = !isAuthenticated || !hasCompletedOnboarding;
  const toggleTheme = () => updateSettings({ theme: isDark ? 'light' : 'dark' });

  return (
    <div className={`flex h-screen w-screen overflow-x-hidden font-sans transition-colors duration-300 ${
      isDark ? 'bg-[#050505] text-slate-200' : 'bg-slate-50 text-slate-900'
    }`}>
      {!hideChrome && (
        <Sidebar 
          currentScreen={currentScreen} 
          onNavigate={setCurrentScreen} 
          adminName={adminName}
          isDark={isDark}
        />
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!hideChrome && (
          <header className={`h-16 border-b px-8 flex items-center justify-between shrink-0 transition-colors ${
            isDark ? 'border-slate-800 bg-[#050505]' : 'border-slate-200 bg-white'
          }`}>
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Node Health</span>
                <span className={`text-sm font-mono uppercase flex items-center gap-2 ${isDark ? 'text-emerald-100' : 'text-emerald-600'}`}>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,1)]"></div>
                  System: Online
                </span>
              </div>
              <div className={`h-8 w-px hidden md:block ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
              <div className="hidden md:flex gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${settings.bargainingEnabled ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-slate-700'}`}></div>
                  <span className={`text-[10px] font-mono uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>BARGAINING: {settings.bargainingEnabled ? 'ON' : 'OFF'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-slate-700'}`}></div>
                  <span className={`text-[10px] font-mono uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>SHEET_SYNC: {isSyncing ? 'SYNCING...' : 'ACTIVE'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <button onClick={toggleTheme} className={`p-2 rounded-full border transition-all ${isDark ? 'border-slate-800 text-slate-400 hover:text-emerald-400' : 'border-slate-200 text-slate-500 hover:text-emerald-600'}`}>
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold uppercase tracking-tight">{adminName}</p>
                  <p className={`text-[10px] font-bold uppercase tracking-tighter text-emerald-500`}>
                    Pro Tier Subscription
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-full border border-emerald-500/30 p-0.5 overflow-hidden flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                   <span className="text-xs font-black text-emerald-500 italic">{adminName.substring(0, 2).toUpperCase()}</span>
                </div>
              </div>
            </div>
          </header>
        )}
        <main className="flex-1 h-full overflow-y-auto">
          {renderScreen()}
        </main>
      </div>
    </div>
  );
}