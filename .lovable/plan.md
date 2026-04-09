

## Plan: Wire real fetch calls to FastAPI backend

The code already has `BASE_URL` and conditional fetch logic in `api.ts`. The changes needed are minor: switch `fetchPL` from GET to POST with JSON body, add error handling (`throw` on non-ok), and update `telegram.ts` to proxy through the backend when `BASE_URL` is set.

### File 1: `src/services/api.ts`

**Lines 270-294 — `fetchPL`**: Change from GET with query params to POST with JSON body. Add error handling.
```ts
if (BASE_URL) {
  const res = await fetch(`${BASE_URL}/api/v1/pl`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
```

**Lines 296-305 — `fetchInsights`**: Keep GET but add error handling.
```ts
if (BASE_URL) {
  const res = await fetch(`${BASE_URL}/api/v1/insights?propertyId=${propertyId}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
```

**Lines 307-316 — `fetchInventory`**: Same — add error throw.

**Lines 318-331 — `submitInventory`**: Same — add error throw.

**Lines 333-341 — `fetchMultiProperty`**: Same — add error throw.

### File 2: `src/services/telegram.ts`

**Lines 18-39 — `sendTelegramMessage`**: Add backend proxy as first path when `VITE_API_BASE_URL` is set. Keep existing direct Bot API call as fallback.

```ts
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
    } catch { return false; }
  }
  // existing direct Bot API fallback unchanged
}
```

### File 3: `.env.example` (create)

```
VITE_API_BASE_URL=   # leave empty for mock data, set to FastAPI URL for live
```

### What stays the same
- All interfaces (`KPIMetric`, `PLRow`, `PLResponse`, `InsightCard`, etc.)
- All mock data arrays
- All hooks (`usePL`, `useInsights`, etc.)
- All page and component files
- The `delay()` and `wrapResponse()` helpers

