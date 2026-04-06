import { useState, useEffect } from "react";
import { fetchMultiProperty, PropertySummary } from "@/services/api";

export function useMultiProperty() {
  const [data, setData] = useState<PropertySummary[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchMultiProperty()
      .then((res) => setData(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
