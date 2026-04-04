import { createContext, useContext, useState, ReactNode } from "react";

interface LargeTextContextType {
  largeText: boolean;
  toggleLargeText: () => void;
}

const LargeTextContext = createContext<LargeTextContextType>({
  largeText: false,
  toggleLargeText: () => {},
});

export function LargeTextProvider({ children }: { children: ReactNode }) {
  const [largeText, setLargeText] = useState(false);
  return (
    <LargeTextContext.Provider value={{ largeText, toggleLargeText: () => setLargeText((v) => !v) }}>
      {children}
    </LargeTextContext.Provider>
  );
}

export const useLargeText = () => useContext(LargeTextContext);
