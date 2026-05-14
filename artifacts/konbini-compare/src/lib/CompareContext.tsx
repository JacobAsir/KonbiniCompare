import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface Product {
  id: string;
  name: string;
  nameJa?: string | null;
  brand?: string | null;
  category: string;
  store?: string | null;
  priceJpy?: number | null;
  tags: string[];
}

interface CompareContextType {
  // Selected products for comparison
  selectedProducts: Product[] | null;
  setSelectedProducts: (products: Product[] | null) => void;

  // User profile
  profile: string | null;
  setProfile: (profile: string) => void;

  // Allergens
  allergens: string[];
  setAllergens: (allergens: string[]) => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

const STORAGE_KEY_PROFILE = "konbini_profile";
const STORAGE_KEY_ALLERGENS = "konbini_allergens";

export function CompareProvider({ children }: { children: ReactNode }) {
  const [selectedProducts, setSelectedProducts] = useState<Product[] | null>(null);
  const [profile, setProfileState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_PROFILE);
    } catch {
      return null;
    }
  });
  const [allergens, setAllergensState] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ALLERGENS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const setProfile = (p: string) => {
    setProfileState(p);
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, p);
    } catch {}
  };

  const setAllergens = (a: string[]) => {
    setAllergensState(a);
    try {
      localStorage.setItem(STORAGE_KEY_ALLERGENS, JSON.stringify(a));
    } catch {}
  };

  return (
    <CompareContext.Provider
      value={{
        selectedProducts,
        setSelectedProducts,
        profile,
        setProfile,
        allergens,
        setAllergens,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompareResult() {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error("useCompareResult must be used within a CompareProvider");
  }
  return context;
}
