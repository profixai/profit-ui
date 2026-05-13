import { useState } from "react";

export type Scenario =
  | "morning-ops"
  | "revenue"
  | "maintenance"
  | "f&b"
  | "housekeeping"
  | "front-desk"
  | "night-audit"
  | "finance";

interface ScenarioImageCardProps {
  scenario: Scenario;
  headline: string;
  subtext: string;
  size?: "sm" | "md";
}

const keywordMap: Record<Scenario, string> = {
  "morning-ops": "hotel+lobby+morning",
  revenue: "hotel+finance+data",
  maintenance: "hotel+maintenance",
  "f&b": "restaurant+hotel",
  housekeeping: "hotel+housekeeping",
  "front-desk": "hotel+reception",
  "night-audit": "hotel+night+desk",
  finance: "spreadsheet+office",
};

const emojiMap: Record<Scenario, string> = {
  "morning-ops": "☀️",
  revenue: "📈",
  maintenance: "🔧",
  "f&b": "🍽️",
  housekeeping: "🛏️",
  "front-desk": "🏨",
  "night-audit": "🌙",
  finance: "📊",
};

export const ScenarioImageCard = ({
  scenario,
  headline,
  subtext,
  size = "sm",
}: ScenarioImageCardProps) => {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  const height = size === "md" ? 160 : 96;
  const url = `https://source.unsplash.com/400x200/?${keywordMap[scenario]}`;

  return (
    <div
      className="rounded-lg overflow-hidden border card-lift"
      style={{ backgroundColor: "#0f3530" }}
    >
      <div className="p-3">
        <p className="text-sm font-medium text-foreground">{headline}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{subtext}</p>
      </div>
      <div
        className="relative w-full flex items-center justify-center"
        style={{ height, backgroundColor: "#0f3530" }}
      >
        {errored ? (
          <img
            src="/placeholder.svg"
            alt={headline}
            className="h-full w-full object-contain p-4 opacity-70"
          />
        ) : (
          <img
            src={url}
            alt={headline}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setErrored(true)}
            className="w-full h-full object-cover"
            style={{
              opacity: loaded ? 1 : 0,
              transition: "opacity 400ms ease",
            }}
          />
        )}
      </div>
    </div>
  );
};
