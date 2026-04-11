import { useState, useEffect, useCallback } from "react";
import { fetchPL } from "@/services/api";
import type { PLResponse } from "@/services/api";

export function usePL(params: { property: string; year: number; month: string; period: "daily" | "monthly" | "ytd" }) {
  const [data, setData] = useState<PLResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchPL(params)
      .then((res) => {
        if (res.ok) setData(res.data);
        else setError(res.error || "Failed to load P&L data");
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [params.property, params.year, params.month, params.period]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, retry: load };
}
