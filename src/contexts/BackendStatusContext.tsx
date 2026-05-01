import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";

export type BackendStatus = "live" | "degraded" | "offline";

export interface BackendHealth {
  status: BackendStatus;
  db?: "ok" | "error";
  version?: string;
  lastCheckedAt: string | null;
}

interface BackendStatusContextType extends BackendHealth {
  refresh: () => void;
}

const BackendStatusContext = createContext<BackendStatusContextType>({
  status: "offline",
  db: undefined,
  version: undefined,
  lastCheckedAt: null,
  refresh: () => {},
});

const POLL_MS = 60_000;
const BASE = import.meta.env.VITE_API_BASE ?? "";

export const BackendStatusProvider = ({ children }: { children: ReactNode }) => {
  const [health, setHealth] = useState<BackendHealth>({
    status: "offline",
    lastCheckedAt: null,
  });
  const timerRef = useRef<number | null>(null);

  const check = async () => {
    if (!BASE) {
      setHealth({ status: "offline", lastCheckedAt: new Date().toISOString() });
      return;
    }
    try {
      const res = await fetch(`${BASE}/health`, { method: "GET" });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const json = await res.json();
      const apiStatus: string = json?.status ?? "degraded";
      const db: string = json?.db ?? "error";
      const status: BackendStatus =
        apiStatus === "ok" && db === "ok" ? "live" : "degraded";
      setHealth({
        status,
        db: db === "ok" ? "ok" : "error",
        version: json?.version,
        lastCheckedAt: new Date().toISOString(),
      });
    } catch {
      setHealth({ status: "offline", lastCheckedAt: new Date().toISOString() });
    }
  };

  useEffect(() => {
    check();
    timerRef.current = window.setInterval(check, POLL_MS);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  return (
    <BackendStatusContext.Provider value={{ ...health, refresh: check }}>
      {children}
    </BackendStatusContext.Provider>
  );
};

export const useBackendStatus = () => useContext(BackendStatusContext);
