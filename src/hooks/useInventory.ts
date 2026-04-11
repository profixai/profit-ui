import { useState, useEffect, useCallback } from "react";
import { fetchInventory } from "@/services/api";
import type { InventoryEntry } from "@/services/api";

export function useInventory(department: string, date: string) {
  const [data, setData] = useState<InventoryEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchInventory(department, date)
      .then((res) => {
        if (res.ok) setData(res.data);
        else setError(res.error || "Failed to load inventory");
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [department, date]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, retry: load };
}
