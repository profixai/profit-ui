import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useRequireRole } from "@/contexts/AuthContext";
import { useInventory } from "@/hooks/useInventory";
import { submitInventory, type InventoryEntry } from "@/services/api";
import { toast } from "sonner";
import { Check, Save } from "lucide-react";

import { WhyThisMatters } from "@/components/saas/WhyThisMatters";
import { pageValueBlocks } from "@/lib/saas-data";

const departmentLines: Record<string, string[]> = {
  rooms: ["Linen & Towels", "Minibar Restock", "Amenities (Toiletries)", "Cleaning Supplies"],
  fb: ["Beverage Cost", "Food Cost", "Wastage", "Disposables"],
  housekeeping: ["Cleaning Chemicals", "Equipment Maintenance", "Laundry Consumables"],
  maintenance: ["Spare Parts", "Electrical Supplies", "Plumbing Supplies", "HVAC Filters"],
};

const departmentLabels: Record<string, string> = {
  rooms: "Rooms",
  fb: "F&B",
  housekeeping: "Housekeeping",
  maintenance: "Maintenance",
};

type SubmissionStatus = "Draft" | "Submitted" | "Approved";

interface HistoryEntry {
  date: string;
  department: string;
  total: number;
  status: SubmissionStatus;
}

const initialHistory: HistoryEntry[] = [
  { date: "2026-03-31", department: "F&B", total: 3420, status: "Approved" },
  { date: "2026-03-30", department: "Rooms", total: 1850, status: "Approved" },
  { date: "2026-03-30", department: "F&B", total: 3180, status: "Submitted" },
  { date: "2026-03-29", department: "Housekeeping", total: 920, status: "Approved" },
  { date: "2026-03-29", department: "Maintenance", total: 1540, status: "Submitted" },
  { date: "2026-03-28", department: "F&B", total: 3650, status: "Draft" },
  { date: "2026-03-27", department: "Rooms", total: 1720, status: "Approved" },
];

const statusColor: Record<SubmissionStatus, string> = {
  Draft: "bg-muted text-muted-foreground",
  Submitted: "bg-accent/20 text-accent-foreground",
  Approved: "bg-positive/10 text-positive",
};

const today = new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
const todayISO = new Date().toISOString().split("T")[0];

/**
 * Normalize a notes textarea value at typing-time.
 * - Strips all leading whitespace immediately.
 * - Strips all trailing whitespace immediately.
 * - Preserves internal spacing (single, double, or more spaces between words stay as typed).
 * - Whitespace-only input collapses to "".
 */
export const normalizeNotesInput = (v: string): string => v.replace(/^\s+|\s+$/g, "");

/**
 * Normalize a notes value for persistence (autosave, draft save, submit).
 * - Applies typing-time normalization (trims outer whitespace).
 * - Collapses any run of internal whitespace into a single ASCII space, so
 *   server-side data can never contain repeated whitespace.
 */
export const normalizeNotesForStorage = (v: string): string =>
  normalizeNotesInput(v).replace(/\s+/g, " ");

const lineEntrySchema = z.object({
  amount: z
    .string()
    .trim()
    .refine((v) => v === "" || (!Number.isNaN(Number(v)) && Number(v) >= 0), {
      message: "Amount must be a positive number",
    })
    .refine((v) => v === "" || Number(v) <= 1_000_000, {
      message: "Amount looks too large",
    }),
  notes: z.string().trim().max(280, "Notes must be under 280 characters"),
});

type LineValues = Record<string, { amount: string; notes: string }>;
type DraftStore = Record<string, LineValues>;

const draftStorageKey = (dept: string, date: string) => `pp_inventory_draft_${dept}_${date}`;

const Inventory = () => {
  useRequireRole(["inventory"]);

  const [activeDept, setActiveDept] = useState("fb");
  const [values, setValues] = useState<DraftStore>({});
  const [statuses, setStatuses] = useState<Record<string, SubmissionStatus>>({});
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});
  const [history, setHistory] = useState<HistoryEntry[]>(initialHistory);
  const [lastSavedAt, setLastSavedAt] = useState<Record<string, number>>({});

  const { loading } = useInventory(activeDept, todayISO);

  // Hydrate drafts from localStorage on mount
  useEffect(() => {
    const hydrated: DraftStore = {};
    const hydratedStatuses: Record<string, SubmissionStatus> = {};
    Object.keys(departmentLines).forEach((dept) => {
      try {
        const raw = localStorage.getItem(draftStorageKey(dept, todayISO));
        if (raw) {
          const parsed = JSON.parse(raw) as { values?: LineValues; status?: SubmissionStatus };
          if (parsed.values) hydrated[dept] = parsed.values;
          if (parsed.status) hydratedStatuses[dept] = parsed.status;
        }
      } catch {
        // ignore corrupt drafts
      }
    });
    setValues(hydrated);
    setStatuses(hydratedStatuses);
  }, []);

  // Autosave drafts (debounced via timeout per change)
  useEffect(() => {
    const handle = window.setTimeout(() => {
      Object.keys(departmentLines).forEach((dept) => {
        const deptValues = values[dept];
        if (!deptValues) return;
        const normalized: LineValues = Object.fromEntries(
          Object.entries(deptValues).map(([line, v]) => [
            line,
            { amount: v.amount, notes: normalizeNotesForStorage(v.notes) },
          ]),
        );
        const hasContent = Object.values(normalized).some((v) => v.amount.trim() !== "" || v.notes !== "");
        if (!hasContent) return;
        localStorage.setItem(
          draftStorageKey(dept, todayISO),
          JSON.stringify({ values: normalized, status: statuses[dept] ?? "Draft" }),
        );
        setLastSavedAt((prev) => ({ ...prev, [dept]: Date.now() }));
      });
    }, 600);
    return () => window.clearTimeout(handle);
  }, [values, statuses]);

  const getVal = (dept: string, line: string) =>
    values[dept]?.[line] || { amount: "", notes: "" };

  const setVal = (dept: string, line: string, field: "amount" | "notes", v: string) => {
    const nextValue = field === "notes" ? normalizeNotesInput(v) : v;
    setValues((prev) => ({
      ...prev,
      [dept]: { ...prev[dept], [line]: { ...getVal(dept, line), [field]: nextValue } },
    }));
    setErrors((prev) => {
      const deptErrors = { ...(prev[dept] ?? {}) };
      delete deptErrors[`${line}.${field}`];
      return { ...prev, [dept]: deptErrors };
    });
  };

  const totals = useMemo(() => {
    const out: Record<string, number> = {};
    Object.entries(values).forEach(([dept, lines]) => {
      out[dept] = Object.values(lines).reduce((sum, line) => {
        const n = Number(line.amount);
        return Number.isFinite(n) ? sum + n : sum;
      }, 0);
    });
    return out;
  }, [values]);

  const validateDept = (dept: string): boolean => {
    const lines = departmentLines[dept];
    const deptErrors: Record<string, string> = {};
    let anyValue = false;
    lines.forEach((line) => {
      const val = getVal(dept, line);
      const result = lineEntrySchema.safeParse(val);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          const field = issue.path[0] as "amount" | "notes";
          deptErrors[`${line}.${field}`] = issue.message;
        });
      }
      if (val.amount.trim() !== "") anyValue = true;
    });
    setErrors((prev) => ({ ...prev, [dept]: deptErrors }));
    if (Object.keys(deptErrors).length > 0) return false;
    if (!anyValue) {
      toast.error("Add at least one line amount before submitting");
      return false;
    }
    return true;
  };

  const handleSaveDraft = (dept: string) => {
    if (!validateDept(dept)) return;
    const deptValues = values[dept] ?? {};
    const normalized: LineValues = Object.fromEntries(
      Object.entries(deptValues).map(([line, v]) => [
        line,
        { amount: v.amount, notes: v.notes.trim() },
      ]),
    );
    setValues((prev) => ({ ...prev, [dept]: normalized }));
    setStatuses((prev) => ({ ...prev, [dept]: "Draft" }));
    localStorage.setItem(
      draftStorageKey(dept, todayISO),
      JSON.stringify({ values: normalized, status: "Draft" }),
    );
    setLastSavedAt((prev) => ({ ...prev, [dept]: Date.now() }));
    toast.success(`${departmentLabels[dept]} draft saved`);
  };

  const handleSubmit = (dept: string) => {
    if (!validateDept(dept)) return;
    const total = totals[dept] ?? 0;
    const deptValues = values[dept] ?? {};
    const entries: InventoryEntry[] = departmentLines[dept]
      .filter((line) => {
        const v = deptValues[line];
        return v && v.amount.trim() !== "" && Number(v.amount) > 0;
      })
      .map((line) => {
        const trimmedNotes = deptValues[line].notes.trim();
        return {
          id: `${dept}-${todayISO}-${line.replace(/\s+/g, "-").toLowerCase()}`,
          department: dept,
          category: line,
          quantity: 1,
          unit: "lot",
          value: Number(deptValues[line].amount),
          date: todayISO,
          submittedBy: "inventory",
          status: "submitted" as const,
          ...(trimmedNotes ? { notes: trimmedNotes } : {}),
        };
      });

    setStatuses((prev) => ({ ...prev, [dept]: "Submitted" }));
    localStorage.setItem(
      draftStorageKey(dept, todayISO),
      JSON.stringify({ values: deptValues, status: "Submitted" }),
    );
    setHistory((prev) => [
      { date: todayISO, department: departmentLabels[dept], total, status: "Submitted" },
      ...prev,
    ]);

    const payload = { date: todayISO, department: dept, total, entries };
    window.dispatchEvent(new CustomEvent("pp:inventory-submit", { detail: payload }));
    void submitInventory(entries);

    toast.success(`${departmentLabels[dept]} submission sent for review`, {
      description: `Total €${total.toLocaleString("de-DE")} forwarded to the Finance Manager`,
    });
  };

  const formatSavedAt = (ts?: number) => {
    if (!ts) return null;
    const seconds = Math.round((Date.now() - ts) / 1000);
    if (seconds < 5) return "Saved just now";
    if (seconds < 60) return `Saved ${seconds}s ago`;
    const minutes = Math.round(seconds / 60);
    return `Saved ${minutes}m ago`;
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6">
        <WhyThisMatters block={pageValueBlocks.inventory} />
        <div>
          <h1 className="text-base font-semibold">Daily stock & cost entry</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{today}</p>
        </div>

        <Tabs value={activeDept} onValueChange={setActiveDept}>
          <TabsList>
            {Object.entries(departmentLabels).map(([key, label]) => (
              <TabsTrigger key={key} value={key} className="text-xs">
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(departmentLines).map(([dept, lines]) => {
            const deptErrors = errors[dept] ?? {};
            const status = statuses[dept];
            const submitted = status === "Submitted" || status === "Approved";
            return (
              <TabsContent key={dept} value={dept}>
                <Card className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-medium">{departmentLabels[dept]}</h2>
                    <div className="flex items-center gap-2">
                      {lastSavedAt[dept] && !submitted && (
                        <span className="text-[10px] text-muted-foreground inline-flex items-center gap-1">
                          <Save className="h-3 w-3" />
                          {formatSavedAt(lastSavedAt[dept])}
                        </span>
                      )}
                      {status && (
                        <Badge className={`text-[10px] ${statusColor[status]}`}>{status}</Badge>
                      )}
                    </div>
                  </div>

                  {loading ? (
                    <div className="space-y-3">
                      {lines.map((_, i) => (
                        <Skeleton key={i} className="h-8 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {lines.map((line) => {
                        const val = getVal(dept, line);
                        const amountError = deptErrors[`${line}.amount`];
                        const notesError = deptErrors[`${line}.notes`];
                        return (
                          <div key={line} className="grid grid-cols-[1fr_140px_1fr] gap-3 items-start">
                            <Label className="text-xs pt-2">{line}</Label>
                            <div>
                              <Input
                                type="number"
                                inputMode="decimal"
                                min={0}
                                placeholder="€ 0"
                                value={val.amount}
                                disabled={submitted}
                                onChange={(e) => setVal(dept, line, "amount", e.target.value)}
                                className={`h-8 text-xs ${amountError ? "border-destructive" : ""}`}
                                aria-invalid={!!amountError}
                              />
                              {amountError && (
                                <p className="text-[10px] text-destructive mt-1">{amountError}</p>
                              )}
                            </div>
                            <div>
                              <Textarea
                                placeholder="Notes (optional)"
                                value={val.notes}
                                disabled={submitted}
                                maxLength={280}
                                onChange={(e) => setVal(dept, line, "notes", e.target.value)}
                                className={`text-xs min-h-[32px] h-8 resize-none ${notesError ? "border-destructive" : ""}`}
                                aria-invalid={!!notesError}
                              />
                              {notesError && (
                                <p className="text-[10px] text-destructive mt-1">{notesError}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div className="text-xs text-muted-foreground">
                      Day total{" "}
                      <span className="font-mono-data text-foreground">
                        €{(totals[dept] ?? 0).toLocaleString("de-DE")}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        disabled={submitted}
                        onClick={() => handleSaveDraft(dept)}
                      >
                        Save draft
                      </Button>
                      <Button
                        size="sm"
                        className="text-xs"
                        disabled={submitted}
                        onClick={() => handleSubmit(dept)}
                      >
                        {submitted ? (
                          <>
                            <Check className="h-3 w-3 mr-1" /> Submitted
                          </>
                        ) : (
                          "Submit for review"
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>

        <Card className="p-4">
          <h2 className="text-sm font-medium mb-3">Recent submissions</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Date</TableHead>
                <TableHead className="text-xs">Department</TableHead>
                <TableHead className="text-xs text-right">Total</TableHead>
                <TableHead className="text-xs text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((entry, i) => (
                <TableRow key={`${entry.date}-${entry.department}-${i}`}>
                  <TableCell className="text-xs">{entry.date}</TableCell>
                  <TableCell className="text-xs">{entry.department}</TableCell>
                  <TableCell className="text-xs text-right font-mono-data">
                    €{entry.total.toLocaleString("de-DE")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge className={`text-[10px] ${statusColor[entry.status]}`}>
                      {entry.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AppShell>
  );
};

export { Inventory };
export default Inventory;
