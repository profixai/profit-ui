import { useState, useEffect } from "react";
import { fetchInventory, InventoryEntry } from "@/services/api";

export function useInventory(department: string, date: string) {
  const [data, setData] = useState<InventoryEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchInventory(department, date)
      .then((res) => setData(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [department, date]);

  return { data, loading, error };
}
