import React from "react";
import { useAuth } from "./contexts/AuthContext";
import { useAppNavigation } from "./contexts/NavigationContext";
import { Login } from "./screens/Login";
import { PinScreen } from "./screens/PinScreen";
import { Header, Navigation } from "./components/Navigation";
import { Dashboard } from "./screens/Dashboard";
import { ItemsScreen } from "./screens/Items";
import { BillingScreen } from "./screens/Billing";
import { ReportsScreen } from "./screens/Reports";
import { CustomersScreen } from "./screens/Customers";

const MainContent = () => {
  const { activeTab } = useAppNavigation();

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-[calc(6rem+env(safe-area-inset-bottom))]">
      <div className="max-w-7xl mx-auto">
        {activeTab === "home" && <Dashboard />}
        {activeTab === "items" && <ItemsScreen />}
        {activeTab === "billing" && <BillingScreen />}
        {activeTab === "reports" && <ReportsScreen />}
        {activeTab === "customers" && <CustomersScreen />}
        {activeTab === "settings" && <div className="text-white">Settings module coming soon. Admin only function.</div>}
      </div>
    </main>
  );
};

export default function App() {
  const { user, isInitialLoading, isLocked } = useAuth();

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-white mt-4 font-mono uppercase tracking-widest text-sm text-slate-500">Initializing Systems</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (isLocked) {
    return <PinScreen />;
  }

  return (
    <div className="fixed inset-0 bg-[#0f172a] text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white overflow-hidden pt-[env(safe-area-inset-top)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      <Header />
      <div className="flex flex-1 flex-col overflow-hidden relative">
        <MainContent />
        <Navigation />
      </div>
    </div>
  );
}
