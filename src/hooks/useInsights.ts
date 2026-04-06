import { useState, useEffect } from "react";
import { fetchInsights, InsightCard } from "@/services/api";

export function useInsights(propertyId: string) {
  const [data, setData] = useState<InsightCard[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchInsights(propertyId)
      .then((res) => setData(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [propertyId]);

  return { data, loading, error };
}
