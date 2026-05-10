import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useAppNavigation } from "../contexts/NavigationContext";
import { Lock, LayoutDashboard, Package, Receipt, Users, PieChart, Settings } from "lucide-react";

import { Wrench } from "lucide-react";

export const Header = () => {
  const { userProfile, lockSession } = useAuth();
  
  return (
    <header className="h-20 bg-[#1e293b]/80 border-b border-slate-700 backdrop-blur-md px-4 md:px-8 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Wrench className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg md:text-xl font-bold tracking-tight text-white uppercase">Harshvardhan Traders</h1>
          <p className="text-xs text-slate-400">Balpur, Gonda • 9455136226</p>
        </div>
      </div>
      <div className="flex items-center gap-4 md:gap-6">
        <div className="hidden md:flex flex-col items-end">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            <span className="text-xs font-mono text-orange-400 uppercase tracking-widest">{userProfile?.role} Session</span>
          </div>
          <span className="text-xs text-slate-500 italic">Secure PIN Active</span>
        </div>
        <button
          onClick={lockSession}
          className="hidden md:block px-6 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-full text-xs font-semibold uppercase tracking-wider transition-all"
        >
          Lock App
        </button>
        <button
          onClick={lockSession}
          className="md:hidden w-10 h-10 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-full flex items-center justify-center text-white"
        >
          <Lock className="w-4 h-4" />
        </button>
        <div className="hidden md:flex w-10 h-10 rounded-full bg-blue-500 items-center justify-center border-2 border-slate-700">
          <span className="font-bold text-white text-sm">{userProfile?.email?.substring(0, 2).toUpperCase() || 'HT'}</span>
        </div>
      </div>
    </header>
  );
};

export const Navigation = () => {
  const { activeTab, setActiveTab } = useAppNavigation();
  const { userProfile } = useAuth();

  const navItems = [
    { id: "billing", label: "Billing", icon: Receipt },
    { id: "customers", label: "Customers", icon: Users },
    { id: "items", label: "Stock", icon: Package },
  ];

  if (userProfile?.role === "Admin") {
    navItems.unshift({ id: "home", label: "Dashboard", icon: LayoutDashboard });
    navItems.push({ id: "reports", label: "Reports", icon: PieChart });
    navItems.push({ id: "settings", label: "Settings", icon: Settings });
  }

  return (
    <nav className="pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] bg-slate-900 border-t border-slate-800 flex items-center justify-center absolute bottom-0 left-0 w-full shrink-0 px-2 z-50">
      <div className="flex items-center justify-between bg-slate-800 p-1.5 rounded-2xl w-full max-w-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex-1 min-w-0 px-1 py-3 md:px-4 rounded-xl flex flex-col items-center gap-1 transition-all ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-inner shadow-white/10' 
                  : 'text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest truncate w-full text-center px-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
