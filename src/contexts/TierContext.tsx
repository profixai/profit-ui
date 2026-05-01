import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type Tier = "free" | "team" | "enterprise";

const TIER_RANK: Record<Tier, number> = { free: 0, team: 1, enterprise: 2 };

interface TierContextType {
  tier: Tier;
  setTier: (t: Tier) => void;
  hasTier: (required: Tier) => boolean;
}

const TierContext = createContext<TierContextType>({
  tier: "free",
  setTier: () => {},
  hasTier: () => false,
});

export const TierProvider = ({ children, initial = "free" }: { children: ReactNode; initial?: Tier }) => {
  const [tier, setTier] = useState<Tier>(initial);
  const hasTier = useCallback(
    (required: Tier) => TIER_RANK[tier] >= TIER_RANK[required],
    [tier],
  );
  return (
    <TierContext.Provider value={{ tier, setTier, hasTier }}>
      {children}
    </TierContext.Provider>
  );
};

export const useTier = () => useContext(TierContext);
