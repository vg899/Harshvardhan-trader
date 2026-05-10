import { createContext, useContext, useState, ReactNode } from "react";

type Tab = "home" | "items" | "billing" | "reports" | "customers" | "settings";

interface AppContextType {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [activeTab, setActiveTab] = useState<Tab>("home");

  return (
    <AppContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppNavigation = () => useContext(AppContext);
