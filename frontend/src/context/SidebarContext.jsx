import React, { createContext, useContext, useState, useCallback } from "react";

const SidebarContext = createContext();

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshSidebar = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const value = {
    refreshSidebar,
    refreshTrigger,
  };

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
};
