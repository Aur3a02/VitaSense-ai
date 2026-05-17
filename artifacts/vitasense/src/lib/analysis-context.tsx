import { createContext, useContext, useState, ReactNode } from "react";
import { AnalysisResult } from "@workspace/api-client-react";

type AnalysisContextType = {
  latestResult: AnalysisResult | null;
  setLatestResult: (result: AnalysisResult | null) => void;
};

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [latestResult, setLatestResult] = useState<AnalysisResult | null>(null);

  return (
    <AnalysisContext.Provider value={{ latestResult, setLatestResult }}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error("useAnalysis must be used within an AnalysisProvider");
  }
  return context;
}
