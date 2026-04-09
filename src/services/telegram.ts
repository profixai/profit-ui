export interface TelegramConfig {
  botToken: string;
  chatId: string;
}

export function getTelegramConfig(): TelegramConfig | null {
  try {
    const stored = localStorage.getItem("pp_notification_settings");
    if (!stored) return null;
    const settings = JSON.parse(stored);
    if (!settings.botToken || !settings.chatId) return null;
    return { botToken: settings.botToken, chatId: settings.chatId };
  } catch {
    return null;
  }
}

export async function sendTelegramMessage(message: string): Promise<boolean> {
  const BASE = import.meta.env.VITE_API_BASE_URL ?? "";
  if (BASE) {
    try {
      const res = await fetch(`${BASE}/api/v1/notify/telegram`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, severity: "info", property_id: "default" }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  // fallback: direct Bot API (local dev without backend)
  const config = getTelegramConfig();
  if (!config) return false;

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${config.botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: config.chatId,
          text: message,
          parse_mode: "Markdown",
        }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

export function formatInsightMessage(insight: {
  severity: string;
  title: string;
  metric: string;
  actual: number;
  threshold: number;
  recommendation: string;
}): string {
  const emoji = insight.severity === "critical" ? "🔴" : insight.severity === "warning" ? "🟡" : "🔵";
  return `${emoji} *ProfitPulse Alert*\n\n*${insight.title}*\n📊 ${insight.metric}: ${insight.actual} (threshold: ${insight.threshold})\n\n💡 ${insight.recommendation}`;
}
