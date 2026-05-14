import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { normalizeNotesForStorage } from "@/pages/Inventory";
import { submitInventory, type InventoryEntry } from "@/services/api";

/**
 * Integration test: the form -> API boundary.
 *
 * Verifies that when the Inventory form submits entries, the outgoing HTTP
 * payload has notes that have been normalized by `normalizeNotesForStorage`
 * (outer whitespace trimmed, internal whitespace collapsed to a single space).
 *
 * We point the API base at a real URL so fetchWithFallback issues a real fetch
 * call, intercept it, and inspect the request body.
 */

const API_BASE = "https://test.api.profix.local";

// Build the same shape Inventory.tsx produces in handleSubmit, applying
// normalizeNotesForStorage on the raw notes the user typed/pasted.
const buildEntry = (
  category: string,
  rawNotes: string,
  value: number,
): InventoryEntry => {
  const normalized = normalizeNotesForStorage(rawNotes);
  return {
    id: `fb-2026-05-14-${category.replace(/\s+/g, "-").toLowerCase()}`,
    department: "fb",
    category,
    quantity: 1,
    unit: "lot",
    value,
    date: "2026-05-14",
    submittedBy: "inventory",
    status: "submitted",
    ...(normalized ? { notes: normalized } : {}),
  };
};

describe("submitInventory — outgoing payload uses normalizeNotesForStorage", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.stubEnv("VITE_API_BASE", API_BASE);
    fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          ok: true,
          data: { success: true, submissionId: "test-submission" },
          error: null,
          request_id: "req-test",
          timestamp: new Date().toISOString(),
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("trims outer whitespace and collapses internal repeats in submitted notes", async () => {
    const entries: InventoryEntry[] = [
      buildEntry("Beverage Cost", "   stocked   weekend   rush   ", 1500),
      buildEntry("Food Cost", "  clean   prep  ", 800),
    ];

    await submitInventory(entries);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];

    expect(url).toBe(`${API_BASE}/api/v1/inventory`);
    expect(init.method).toBe("POST");

    const body = JSON.parse(init.body as string) as InventoryEntry[];
    expect(body).toHaveLength(2);

    const beverage = body.find((e) => e.category === "Beverage Cost");
    const food = body.find((e) => e.category === "Food Cost");

    expect(beverage?.notes).toBe("stocked weekend rush");
    expect(food?.notes).toBe("clean prep");

    // Sanity: no field in the payload contains repeated whitespace anywhere.
    const serialized = init.body as string;
    expect(/\s\s/.test(serialized.replace(/\\n|\\t/g, " "))).toBe(false);
  });

  it("collapses tabs and newlines pasted into notes to a single space", async () => {
    const entries: InventoryEntry[] = [
      buildEntry("Beverage Cost", "line one\n\nline two\t\twith tabs", 600),
    ];

    await submitInventory(entries);

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string) as InventoryEntry[];

    expect(body[0]?.notes).toBe("line one line two with tabs");
  });

  it("omits the notes field entirely when raw input is whitespace-only", async () => {
    const entries: InventoryEntry[] = [
      buildEntry("Beverage Cost", "   \t\n  ", 400),
    ];

    await submitInventory(entries);

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string) as InventoryEntry[];

    expect(body[0]).not.toHaveProperty("notes");
  });

  it("leaves a clean single-spaced note untouched in the payload", async () => {
    const entries: InventoryEntry[] = [
      buildEntry("Food Cost", "fresh delivery", 250),
    ];

    await submitInventory(entries);

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string) as InventoryEntry[];

    expect(body[0]?.notes).toBe("fresh delivery");
  });
});
