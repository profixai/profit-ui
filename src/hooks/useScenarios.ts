import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Scenario {
  id: string;
  slug: string;
  title: string;
  narrative: string;
  metric: string;
  actual: number;
  threshold: number;
  recommendation: string;
  severity: "critical" | "warning" | "info";
  department: string;
  image_keyword: string | null;
}

export function useScenarios() {
  const [data, setData] = useState<Scenario[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data: rows, error: err } = await supabase
      .from("scenarios")
      .select("*")
      .order("created_at", { ascending: false });
    if (err) {
      setError(err.message);
      setData(null);
    } else {
      setData((rows ?? []) as Scenario[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, retry: load };
}
