import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useAppNavigation } from "../contexts/NavigationContext";
import { Lock, LayoutDashboard, Package, Receipt, Users, PieChart, Settings } from "lucide-react";

import { Wrench } from "lucide-react";

export const Header = () => {
  const { userProfile, lockSession } = useAuth();
  
  return (
    <header className="h-16 bg-[#1e293b]/95 border-b border-slate-700 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Wrench className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight text-white uppercase truncate max-w-[150px]">Harshvardhan Traders</h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-mono">{userProfile?.role}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={lockSession}
          className="w-10 h-10 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-full flex items-center justify-center text-white transition-colors"
        >
          <Lock className="w-4 h-4" />
        </button>
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
