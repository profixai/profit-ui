import { useState, useEffect, useCallback } from "react";
import { fetchMultiProperty } from "@/services/api";
import type { PropertySummary } from "@/services/api";

export function useMultiProperty() {
  const [data, setData] = useState<PropertySummary[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchMultiProperty()
      .then((res) => {
        if (res.ok) setData(res.data);
        else setError(res.error || "Failed to load portfolio data");
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, retry: load };
}
