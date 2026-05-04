# profit-ui — Vite SPA build, served as static files via `serve`.
#
# Built by finops's docker-compose.prod.yml when both repos are checked
# out as siblings (../profit-ui next to finops). Runs at port 3000;
# Caddy proxies the box's :443 → web:3000 in production.
#
# Mirrors the pattern used by profit-pulse: Bun for install + build,
# Node + serve@14 for the runtime stage (small, no JS runtime in the
# build artifact, matching the style of finops/web/Dockerfile).

# ─── Stage 1: build (Bun) ───────────────────────────────────────
FROM oven/bun:1.3-slim AS builder

WORKDIR /app

# Lockfiles + manifest first for cacheable install layer.
# Bun reads bun.lock (text) or bun.lockb (binary); copy whichever exists.
COPY package.json bun.lock* bun.lockb* ./

RUN bun install --frozen-lockfile

# Copy the rest of the source. .dockerignore keeps node_modules/dist/.env*
# out of the build context.
COPY . .

# Build-time env vars baked into the JS bundle.
# Override at build:
#   docker build --build-arg VITE_API_BASE=https://api.example.com .
ARG VITE_API_BASE=/api
ARG VITE_SUPABASE_URL=""
ARG VITE_SUPABASE_ANON_KEY=""
ARG VITE_TENANT_ID=""
ARG VITE_APP_VERSION=prod
ARG VITE_SITE_URL=https://app.myprofix.ai
ENV VITE_API_BASE=$VITE_API_BASE
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_TENANT_ID=$VITE_TENANT_ID
ENV VITE_APP_VERSION=$VITE_APP_VERSION
ENV VITE_SITE_URL=$VITE_SITE_URL

RUN bun run build

# ─── Stage 2: serve (Node + serve) ──────────────────────────────
FROM node:20-slim AS runtime

WORKDIR /app

RUN npm install -g serve@14 && npm cache clean --force

COPY --from=builder /app/dist /app/dist

EXPOSE 3000

# -s = single-page app fallback (rewrite all 404s to index.html for
# client-side routing).
CMD ["serve", "-s", "/app/dist", "-l", "3000"]
