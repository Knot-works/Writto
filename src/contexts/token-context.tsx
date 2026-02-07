import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useAuth } from "./auth-context";
import { callGetTokenUsage, type TokenUsageResponse } from "@/lib/functions";

interface TokenContextType {
  tokenUsage: TokenUsageResponse | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export function TokenProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tokenUsage, setTokenUsage] = useState<TokenUsageResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setTokenUsage(null);
      return;
    }
    setLoading(true);
    try {
      const data = await callGetTokenUsage();
      setTokenUsage(data);
    } catch (err) {
      console.error("Failed to fetch token usage:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch token usage when user logs in
  useEffect(() => {
    if (user && !tokenUsage && !loading) {
      refresh();
    } else if (!user) {
      setTokenUsage(null);
    }
  }, [user, tokenUsage, loading, refresh]);

  return (
    <TokenContext.Provider value={{ tokenUsage, loading, refresh }}>
      {children}
    </TokenContext.Provider>
  );
}

export function useToken() {
  const context = useContext(TokenContext);
  if (context === undefined) {
    throw new Error("useToken must be used within a TokenProvider");
  }
  return context;
}
