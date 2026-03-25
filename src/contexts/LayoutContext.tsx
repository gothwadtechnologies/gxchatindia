import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LayoutContextType {
  activeFilters: { [key: string]: string };
  setActiveFilter: (tab: string, filter: string) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [activeFilters, setActiveFilters] = useState<{ [key: string]: string }>({
    home: 'For You',
    reels: 'Trending',
    chats: 'All',
    hub: 'Apps',
    profile: 'Posts'
  });

  const setActiveFilter = (tab: string, filter: string) => {
    setActiveFilters(prev => ({ ...prev, [tab]: filter }));
  };

  return (
    <LayoutContext.Provider value={{ activeFilters, setActiveFilter }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}
