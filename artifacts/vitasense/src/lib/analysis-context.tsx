import { createContext, useContext, useState, ReactNode } from "react";
import { AnalysisResult } from "@workspace/api-client-react";

interface AnalysisInput {
  symptoms: string[];
  duration: string;
  ageRange: string;
  severity: string;
  additionalNotes?: string;
}

type AnalysisContextType = {
  latestResult: AnalysisResult | null;
  latestInput: AnalysisInput | null;
  setLatestResult: (result: AnalysisResult | null, input?: AnalysisInput) => void;
};

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [latestResult, setLatestResultState] = useState<AnalysisResult | null>(null);
  const [latestInput, setLatestInput] = useState<AnalysisInput | null>(null);

  const setLatestResult = (result: AnalysisResult | null, input?: AnalysisInput) => {
    setLatestResultState(result);
    if (input) setLatestInput(input);
  };

  return (
    <AnalysisContext.Provider value={{ latestResult, latestInput, setLatestResult }}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const ctx = useContext(AnalysisContext);
  if (!ctx) throw new Error("useAnalysis must be used within AnalysisProvider");
  return ctx;
}
