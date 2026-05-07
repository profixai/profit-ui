import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

interface LiveClock {
  hour: number;
  minute: number;
  dayOfWeek: number;
  timeLabel: string;
}

const computeLabel = (hour: number): string => {
  if (hour < 6) return "Night audit";
  if (hour < 12) return "Good morning";
  if (hour < 14) return "Midday";
  if (hour < 18) return "Good afternoon";
  if (hour < 22) return "Good evening";
  return "End of day";
};

const snapshot = (): { hour: number; minute: number; dayOfWeek: number } => {
  const now = new Date();
  return { hour: now.getHours(), minute: now.getMinutes(), dayOfWeek: now.getDay() };
};

const LiveClockContext = createContext<LiveClock | undefined>(undefined);

export const LiveClockProvider = ({ children }: { children: ReactNode }) => {
  const [tick, setTick] = useState(snapshot);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const next = snapshot();
      setTick((prev) =>
        prev.minute === next.minute && prev.hour === next.hour && prev.dayOfWeek === next.dayOfWeek
          ? prev
          : next,
      );
    }, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const value = useMemo<LiveClock>(
    () => ({ ...tick, timeLabel: computeLabel(tick.hour) }),
    [tick],
  );

  return <LiveClockContext.Provider value={value}>{children}</LiveClockContext.Provider>;
};

export const useLiveClock = (): LiveClock => {
  const ctx = useContext(LiveClockContext);
  if (!ctx) throw new Error("useLiveClock must be used within LiveClockProvider");
  return ctx;
};
