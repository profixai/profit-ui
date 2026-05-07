export type NudgeSeverity = "info" | "warning" | "opportunity";

export interface Nudge {
  icon: string;
  headline: string;
  subtext: string;
  action?: string;
  actionRoute?: string;
  severity: NudgeSeverity;
}

interface HourRule {
  range: [number, number];
  nudge: Nudge;
}

const hourRules: HourRule[] = [
  {
    range: [0, 6],
    nudge: {
      icon: "🌙",
      headline: "Night audit window — low traffic, high data",
      subtext: "Good time to upload invoices and reports",
      severity: "info",
    },
  },
  {
    range: [7, 9],
    nudge: {
      icon: "☀️",
      headline: "Morning: check last night's RevPAR",
      subtext: "Review overnight performance before the day starts",
      action: "Open Dashboard",
      actionRoute: "/dashboard",
      severity: "info",
    },
  },
  {
    range: [9, 11],
    nudge: {
      icon: "🧹",
      headline: "Housekeeping peak: watch laundry costs",
      subtext: "Monitor consumables and overtime in real time",
      action: "View Financials",
      actionRoute: "/pl",
      severity: "warning",
    },
  },
  {
    range: [11, 13],
    nudge: {
      icon: "🍽️",
      headline: "Pre-lunch: F&B revenue window open",
      subtext: "Best time to confirm covers and upsells",
      severity: "opportunity",
    },
  },
  {
    range: [14, 16],
    nudge: {
      icon: "📥",
      headline: "Afternoon lull: review pending invoices",
      subtext: "Catch outstanding items before end of day",
      action: "Open Data Vault",
      actionRoute: "/data",
      severity: "info",
    },
  },
  {
    range: [17, 19],
    nudge: {
      icon: "🏨",
      headline: "Check-in surge: front desk revenue moments",
      subtext: "Upsell rooms and late checkout packages",
      severity: "opportunity",
    },
  },
  {
    range: [20, 23],
    nudge: {
      icon: "📊",
      headline: "Evening: reconcile today's GOP variance",
      subtext: "Close the day with a clean variance report",
      action: "View P&L",
      actionRoute: "/pl",
      severity: "info",
    },
  },
];

const dayRules: Record<number, Nudge> = {
  0: {
    icon: "🗂️",
    headline: "Low day: catch up on outstanding invoices",
    subtext: "Sunday is ideal for vault hygiene",
    action: "Open Data Vault",
    actionRoute: "/data",
    severity: "info",
  },
  1: {
    icon: "🔁",
    headline: "Weekly reset: compare weekend vs forecast",
    subtext: "Lock in learnings from the prior week",
    action: "Open Dashboard",
    actionRoute: "/dashboard",
    severity: "info",
  },
  3: {
    icon: "🩺",
    headline: "Midweek health check: labour cost trending?",
    subtext: "Spot drift before it bites the GOP line",
    action: "View P&L",
    actionRoute: "/pl",
    severity: "warning",
  },
  5: {
    icon: "🎯",
    headline: "Weekend prep: review room rates and inventory",
    subtext: "Tighten pricing and stock before the rush",
    severity: "opportunity",
  },
};

const inRange = (hour: number, range: [number, number]): boolean => {
  const [start, end] = range;
  return hour >= start && hour <= end;
};

export const getNudge = (hour: number, dayOfWeek: number): Nudge => {
  const hourRule = hourRules.find((r) => inRange(hour, r.range));
  const dayRule = dayRules[dayOfWeek];

  if (hourRule && dayRule) {
    return {
      icon: dayRule.icon,
      headline: dayRule.headline,
      subtext: hourRule.headline,
      action: dayRule.action ?? hourRule.action,
      actionRoute: dayRule.actionRoute ?? hourRule.actionRoute,
      severity:
        dayRule.severity === "warning" || hourRule.severity === "warning"
          ? "warning"
          : dayRule.severity === "opportunity" || hourRule.severity === "opportunity"
          ? "opportunity"
          : "info",
    };
  }
  return (
    hourRule?.nudge ??
    dayRule ?? {
      icon: "💡",
      headline: "Welcome back",
      subtext: "Pick up where you left off",
      severity: "info",
    }
  );
};
