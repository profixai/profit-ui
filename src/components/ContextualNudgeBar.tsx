import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { getNudge, NudgeSeverity } from "@/lib/nudges";
import { useLiveClock } from "@/contexts/LiveClockContext";

const ALLOWED = new Set(["/overview", "/dashboard", "/pl", "/insights"]);

const borderBySeverity: Record<NudgeSeverity, string> = {
  info: "#b8a9e8",
  warning: "#f59e0b",
  opportunity: "#34d399",
};

export const ContextualNudgeBar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { hour, dayOfWeek } = useLiveClock();
  const dismissKey = `nudge_dismissed_${hour}_${dayOfWeek}`;

  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(dismissKey) === "1";
    } catch {
      return false;
    }
  });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setDismissed(sessionStorage.getItem(dismissKey) === "1");
  }, [dismissKey]);

  useEffect(() => {
    const t = window.setTimeout(() => setVisible(true), 20);
    return () => window.clearTimeout(t);
  }, [dismissKey]);

  const nudge = useMemo(() => getNudge(hour, dayOfWeek), [hour, dayOfWeek]);

  if (!ALLOWED.has(pathname) || dismissed) return null;

  const handleDismiss = () => {
    sessionStorage.setItem(dismissKey, "1");
    setDismissed(true);
  };

  return (
    <div
      className="h-10 px-4 lg:px-6 flex items-center gap-3 text-xs shrink-0 border-b"
      style={{
        backgroundColor: "#0f3530",
        borderLeft: `3px solid ${borderBySeverity[nudge.severity]}`,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-4px)",
        transition: "opacity 300ms ease, transform 300ms ease",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <span aria-hidden>{nudge.icon}</span>
      <span className="font-medium text-foreground">{nudge.headline}</span>
      <span className="text-muted-foreground">·</span>
      <span className="text-muted-foreground truncate">{nudge.subtext}</span>
      {nudge.action && nudge.actionRoute && (
        <button
          onClick={() => navigate(nudge.actionRoute!)}
          className="ml-auto text-[11px] font-medium text-primary hover:underline ripple-target px-2 py-1 rounded-md"
        >
          {nudge.action}
        </button>
      )}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss"
        className={`${nudge.action ? "" : "ml-auto"} text-muted-foreground hover:text-foreground p-1 rounded-md`}
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
};
