import { createContext, useContext, useState, ReactNode } from "react";
import type { CompareProductsResponse } from "@workspace/api-client-react";

interface CompareContextType {
  result: CompareProductsResponse | null;
  setResult: (result: CompareProductsResponse | null) => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [result, setResult] = useState<CompareProductsResponse | null>(null);
  return (
    <CompareContext.Provider value={{ result, setResult }}>
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
