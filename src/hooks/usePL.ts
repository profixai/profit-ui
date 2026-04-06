import { useState, useEffect } from "react";
import { fetchPL, PLResponse } from "@/services/api";

export function usePL(params: { property: string; year: number; month: string; period: "daily" | "monthly" | "ytd" }) {
  const [data, setData] = useState<PLResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchPL(params)
      .then((res) => setData(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [params.property, params.year, params.month, params.period]);

  return { data, loading, error };
}
