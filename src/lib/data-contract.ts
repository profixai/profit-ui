/**
 * ════════════════════════════════════════════════════════════════
 *  PROFIX CANONICAL DATA CONTRACT  v1.0
 * ════════════════════════════════════════════════════════════════
 *
 *  Every importer (Opera, Mews, Protel, CSV, …) MUST output data
 *  conforming to these schemas.  The rest of the app — pipeline,
 *  DB tables, dashboard — consumes ONLY these types.
 *
 *  Flow:  Importer (per source) → validate → Canonical types → DB
 *
 *  Multi-tenant: every row carries `property_id`.
 * ════════════════════════════════════════════════════════════════
 */

import { z } from "zod";

// ─── Primitives ────────────────────────────────────────────────

/** ISO-8601 month string, e.g. "2024-10" */
const MonthString = z.string().regex(/^\d{4}-(?:0[1-9]|1[0-2])$/);

/** ISO-8601 date string */
const DateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

/** Percentage 0-100 */
const Pct = z.number().min(0).max(100);

/** Non-negative currency amount in base unit (EUR cents or whole EUR) */
const Amount = z.number().nonnegative();

// ─── Core Domain Schemas ───────────────────────────────────────

export const MonthlyMarginSchema = z.object({
  property_id: z.string().uuid(),
  month: MonthString,
  revenue: Amount,
  costs: Amount,
  gop: Amount,
  gop_margin_pct: Pct,
});

export const CostDriverSchema = z.object({
  property_id: z.string().uuid(),
  month: MonthString,
  rank: z.number().int().positive(),
  account_name: z.string().min(1),
  department: z.string().min(1),
  amount: Amount,
  pct_of_total_cost: Pct,
  delta_pct: z.number(),
});

export const DepartmentCostSchema = z.object({
  property_id: z.string().uuid(),
  month: MonthString,
  department: z.string().min(1),
  total: Amount,
  pct: Pct,
});

export const BreakevenSchema = z.object({
  property_id: z.string().uuid(),
  period: z.string(), // e.g. "Q4 2024"
  breakeven_occupancy_pct: Pct,
  current_occupancy_pct: Pct,
  rooms_per_night_needed: z.number().int().nonnegative(),
  months_below: z.number().int().nonnegative(),
  total_months: z.number().int().positive(),
});

export const KPISnapshotSchema = z.object({
  property_id: z.string().uuid(),
  period_start: DateString,
  period_end: DateString,
  total_revenue: Amount,
  total_costs: Amount,
  gop: Amount,
  gop_margin_pct: Pct,
  revenue_delta: z.number(),
  costs_delta: z.number(),
  gop_delta: z.number(),
  margin_delta: z.number(),
});

export const OccupancyKPISchema = z.object({
  property_id: z.string().uuid(),
  month: MonthString,
  occupancy_pct: Pct,
  adr: Amount,          // Average Daily Rate
  revpar: Amount,       // Revenue Per Available Room
  rooms_available: z.number().int().positive(),
  rooms_sold: z.number().int().nonnegative(),
});

// ─── Importer Metadata ─────────────────────────────────────────

export const SourceFileSchema = z.object({
  property_id: z.string().uuid(),
  filename: z.string().min(1),
  source_system: z.string().min(1),   // "opera" | "mews" | "protel" | "csv" | …
  file_type: z.enum(["pl", "utility", "forecast"]),
  uploaded_at: z.string().datetime(),
  row_count: z.number().int().nonnegative(),
  validation_status: z.enum(["valid", "warnings", "errors"]),
  validation_messages: z.array(z.string()).default([]),
});

// ─── Aggregated Insights Response ──────────────────────────────
//     This is what the dashboard consumes.

export const InsightsResponseSchema = z.object({
  property_id: z.string().uuid(),
  filename: z.string(),
  period_start: DateString,
  period_end: DateString,
  kpis: KPISnapshotSchema.omit({ property_id: true, period_start: true, period_end: true }),
  monthly_margins: z.array(MonthlyMarginSchema.omit({ property_id: true })),
  cost_drivers: z.array(CostDriverSchema.omit({ property_id: true, month: true })),
  department_costs: z.array(DepartmentCostSchema.omit({ property_id: true, month: true })),
  breakeven: BreakevenSchema.omit({ property_id: true, period: true }),
});

// ─── Inferred TypeScript Types ─────────────────────────────────

export type MonthlyMargin = z.infer<typeof MonthlyMarginSchema>;
export type CostDriver = z.infer<typeof CostDriverSchema>;
export type DepartmentCost = z.infer<typeof DepartmentCostSchema>;
export type Breakeven = z.infer<typeof BreakevenSchema>;
export type KPISnapshot = z.infer<typeof KPISnapshotSchema>;
export type OccupancyKPI = z.infer<typeof OccupancyKPISchema>;
export type SourceFile = z.infer<typeof SourceFileSchema>;
export type InsightsResponse = z.infer<typeof InsightsResponseSchema>;

// ─── Validation Helpers ────────────────────────────────────────

/** Validate a full insights payload — returns typed data or throws */
export function validateInsights(data: unknown): InsightsResponse {
  return InsightsResponseSchema.parse(data);
}

/** Safe validation — returns { success, data?, error? } */
export function safeValidateInsights(data: unknown) {
  return InsightsResponseSchema.safeParse(data);
}

/**
 * Importer output contract.
 * Every importer plugin must return this shape.
 */
export const ImporterOutputSchema = z.object({
  source_system: z.string(),
  property_id: z.string().uuid(),
  extracted_at: z.string().datetime(),
  monthly_margins: z.array(MonthlyMarginSchema),
  cost_drivers: z.array(CostDriverSchema),
  department_costs: z.array(DepartmentCostSchema),
  breakeven: BreakevenSchema.optional(),
  occupancy_kpis: z.array(OccupancyKPISchema).optional(),
  source_file: SourceFileSchema,
});

export type ImporterOutput = z.infer<typeof ImporterOutputSchema>;
