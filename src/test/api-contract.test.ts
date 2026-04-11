import { describe, it, expect } from "vitest";

// ─── Smoke test: API envelope and fetchWithFallback ───────────

describe("API contract", () => {
  it("APIResponse shape has required fields", async () => {
    // Dynamic import to verify the module loads
    const api = await import("@/services/api");
    
    // fetchPL should return an APIResponse with ok, data, request_id, timestamp
    const result = await api.fetchPL({
      property: "le-grand",
      year: 2024,
      month: "dec",
      period: "monthly",
    });

    expect(result).toHaveProperty("ok", true);
    expect(result).toHaveProperty("data");
    expect(result).toHaveProperty("request_id");
    expect(result).toHaveProperty("timestamp");
    expect(result.data).not.toBeNull();

    // PLResponse shape
    const pl = result.data!;
    expect(pl).toHaveProperty("kpis");
    expect(pl).toHaveProperty("rows");
    expect(pl).toHaveProperty("metadata");
    expect(pl.metadata).toHaveProperty("property_id");
    expect(pl.metadata).toHaveProperty("period");
    expect(pl.metadata).toHaveProperty("generated_at");
    expect(Array.isArray(pl.kpis)).toBe(true);
    expect(Array.isArray(pl.rows)).toBe(true);
  });

  it("fetchInsights returns correct envelope", async () => {
    const api = await import("@/services/api");
    const result = await api.fetchInsights("le-grand");

    expect(result.ok).toBe(true);
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data!.length).toBeGreaterThan(0);
    expect(result.data![0]).toHaveProperty("severity");
    expect(result.data![0]).toHaveProperty("department");
  });

  it("fetchMultiProperty returns correct envelope", async () => {
    const api = await import("@/services/api");
    const result = await api.fetchMultiProperty();

    expect(result.ok).toBe(true);
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data![0]).toHaveProperty("revpar");
    expect(result.data![0]).toHaveProperty("gopBudget");
  });
});
