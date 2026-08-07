"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Provider } from "../lib/x402/types";
import { INITIAL_PROVIDERS } from "../lib/data/providers";
import { findBestProvider } from "../lib/recommendation";
import { generateId } from "../lib/utils";

interface ProviderContextType {
  providers: Provider[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  addProvider: (newProvider: Omit<Provider, "id">) => Provider;
  getBestProvider: (category?: string, excludeId?: string, minQuality?: number) => Provider | undefined;
}

const ProviderContext = createContext<ProviderContextType | undefined>(undefined);

export const ProviderProvider = ({ children }: { children: ReactNode }) => {
  const [providers, setProviders] = useState<Provider[]>(INITIAL_PROVIDERS);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const addProvider = (newProvider: Omit<Provider, "id">): Provider => {
    const created: Provider = {
      ...newProvider,
      id: generateId("p_custom"),
    };
    setProviders((prev) => [created, ...prev]);
    return created;
  };

  const getBestProvider = (category?: string, excludeId?: string, minQuality: number = 70) => {
    return findBestProvider(providers, category, excludeId, minQuality);
  };

  return (
    <ProviderContext.Provider
      value={{
        providers,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        addProvider,
        getBestProvider,
      }}
    >
      {children}
    </ProviderContext.Provider>
  );
};

export const useProviderContext = () => {
  const context = useContext(ProviderContext);
  if (!context) {
    throw new Error("useProviderContext must be used within a ProviderProvider");
  }
  return context;
};
