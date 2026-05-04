// ─── Single source of all env reads ──────────────────────────
// Every module outside src/integrations/supabase/client.ts (which is
// auto-generated and must not be edited) MUST import env values from
// this file rather than reading import.meta.env directly.
//
// Canonical Vite vars (NEXT_PUBLIC_* are intentionally not used — this
// is a Vite/React SPA, not Next.js):
//   VITE_API_BASE     FastAPI backend URL (empty → mock-only mode)
//   VITE_TENANT_ID    dev-only fallback tenant_id
//   VITE_APP_VERSION  injected by CI, default "dev"
//   VITE_SITE_URL     CloudFront / public site origin in prod

export const API_BASE: string = import.meta.env.VITE_API_BASE ?? "";
export const TENANT_ID_FALLBACK: string = import.meta.env.VITE_TENANT_ID ?? "";
export const APP_VERSION: string = import.meta.env.VITE_APP_VERSION ?? "dev";
export const SITE_URL: string =
  import.meta.env.VITE_SITE_URL ?? "http://localhost:3000";

/** True when no live backend is configured — consumers should use mocks. */
export const IS_MOCK_MODE: boolean = !API_BASE;
