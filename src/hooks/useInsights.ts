import { useState, useEffect, useCallback } from "react";
import { fetchInsights } from "@/services/api";
import type { InsightCard } from "@/services/api";

export function useInsights(propertyId: string) {
  const [data, setData] = useState<InsightCard[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchInsights(propertyId)
      .then((res) => {
        if (res.ok) setData(res.data);
        else setError(res.error || "Failed to load insights");
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [propertyId]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, retry: load };
}
