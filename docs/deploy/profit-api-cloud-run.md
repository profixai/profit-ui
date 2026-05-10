# Claude Code — `profit-api` Cloud Run Deploy (sub-60-minute runbook)

Paste the prompt below into the Claude Code VS Code extension from the **root of the `finops-platform-profix` repo** (the one containing `backend/Dockerfile`, `backend/app/main.py`, and `requirements.txt`). Run on `main` after pulling latest.

This deploys the FastAPI backend at **`https://api.myprofix.ai`** so the already-deployed `profit-ui` (`VITE_API_BASE=https://api.myprofix.ai`) can talk to it. The frontend live at `app.myprofix.ai` will then resolve `/upload/invoices/{job_id}` against the real API.

---

## Tag pinning contract (read this first)

This runbook deploys **`v0.1.0-cloudrun`** — the canonical, lockstep release across both repos.

- Backend tag: [`finops-platform-profix v0.1.0-cloudrun`](https://github.com/profixai/finops-platform-profix/releases/tag/v0.1.0-cloudrun) (commit `0ca0667`).
- Frontend tag: `profit-ui v0.1.0-cloudrun` — applied after first successful joint deploy.
- **Never** deploy from `main` HEAD. **Never** advance one tag without the other. `v0.1.0-rc2` is superseded; do not use.

## Architectural facts inferred from the repo

| Concern | Value | Source of truth |
| --- | --- | --- |
| Runtime | Python 3.11 + FastAPI + Uvicorn | [`backend/Dockerfile`](https://github.com/profixai/finops-platform-profix/blob/main/backend/Dockerfile) |
| Entry | `uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}` | same |
| Cloud Run port | **8080** (Cloud Run injects `PORT=8080`; the `${PORT:-8000}` fallback handles it) | [Container runtime contract](https://cloud.google.com/run/docs/container-contract#port) |
| Health route | `/health` (mounted by `health.router`) | [`backend/app/main.py`](https://github.com/profixai/finops-platform-profix/blob/main/backend/app/main.py) |
| Upload routes | `/upload/*` and `/upload/invoices/{job_id}` | same |
| DB driver | `postgresql+asyncpg://` (already supported) | [`.env.example`](https://github.com/profixai/finops-platform-profix/blob/main/.env.example) |
| LLM contract | OpenAI-compatible `/chat/completions` (any provider) | `backend/app/core/config.py` |
| Auth | Supabase (URL + anon + service-role keys) | same |

## Context for Claude (paste verbatim)

You are deploying the FastAPI backend `profit-api` from `finops-platform-profix` to Google Cloud Run.

- Project: `profix-prod`
- Region: `europe-west9` (Paris)
- Artifact Registry repo: `profix` (Docker)
- Service name: `profit-api`
- Custom domain: `api.myprofix.ai`
- Runtime service account: `profix-runtime@profix-prod.iam.gserviceaccount.com` (created in the frontend deploy; reuse it)
- DB: Cloud SQL Postgres 16, instance `profix-pg`, db `profix`, user `profix_app`
- Frontend origin to allow in CORS: `https://app.myprofix.ai`
- LLM provider for demo: **Groq** (fast, free tier, OpenAI-compatible) — switch to Vertex/Mistral later
- DO NOT modify `backend/Dockerfile` or `backend/app/main.py` unless a deploy error forces it

## 60-minute timeline

| Block | Minutes | Owner action |
| --- | --- | --- |
| 1 | 0–5 | Pre-flight + APIs |
| 2 | 5–15 | Cloud SQL Postgres + DB user |
| 3 | 15–22 | Secrets in Secret Manager |
| 4 | 22–28 | IAM bindings on the runtime SA |
| 5 | 28–40 | Build & push image |
| 6 | 40–48 | Deploy to Cloud Run with secrets + Cloud SQL |
| 7 | 48–55 | Custom domain `api.myprofix.ai` + Namecheap CNAME |
| 8 | 55–60 | Smoke test + tag |

---

## Step-by-step

### Block 1 — Pre-flight (5 min)

1. Confirm gcloud is on `profix-prod` and Paris:
   ```bash
   gcloud config set project profix-prod
   gcloud config set run/region europe-west9
   gcloud config set artifacts/location europe-west9
   ```
2. Enable APIs (idempotent):
   ```bash
   gcloud services enable \
     run.googleapis.com \
     artifactregistry.googleapis.com \
     cloudbuild.googleapis.com \
     secretmanager.googleapis.com \
     sqladmin.googleapis.com
   ```
   Reference: [Enabling APIs](https://cloud.google.com/endpoints/docs/openapi/enable-api).

### Block 2 — Cloud SQL Postgres (10 min)

3. Create the instance (db-f1-micro is fine for demo; Paris region; public IP off later):
   ```bash
   gcloud sql instances create profix-pg \
     --database-version=POSTGRES_16 \
     --region=europe-west9 \
     --tier=db-f1-micro \
     --storage-size=10GB \
     --storage-type=SSD \
     --backup
   ```
   Reference: [Create a PostgreSQL instance](https://cloud.google.com/sql/docs/postgres/create-instance).

4. Create database + app user (capture the password — you'll put it in Secret Manager next):
   ```bash
   DB_PASS="$(openssl rand -base64 24 | tr -d '/+=' | head -c 24)"
   gcloud sql databases create profix --instance=profix-pg
   gcloud sql users create profix_app --instance=profix-pg --password="$DB_PASS"
   echo "$DB_PASS"   # copy this to a scratch buffer; you'll need it once
   ```
   Reference: [Create users](https://cloud.google.com/sql/docs/postgres/create-manage-users).

5. Note the connection name (looks like `profix-prod:europe-west9:profix-pg`):
   ```bash
   INSTANCE_CONN="$(gcloud sql instances describe profix-pg --format='value(connectionName)')"
   echo "$INSTANCE_CONN"
   ```
   Reference: [Connect from Cloud Run](https://cloud.google.com/sql/docs/postgres/connect-run).

### Block 3 — Secret Manager (7 min)

6. Build the `DATABASE_URL` for asyncpg over the Cloud SQL Unix socket. Cloud Run mounts the socket at `/cloudsql/<instance_connection_name>`. The format below uses the socket via the `host` query param — asyncpg supports it:
   ```bash
   DATABASE_URL="postgresql+asyncpg://profix_app:${DB_PASS}@/profix?host=/cloudsql/${INSTANCE_CONN}"
   ```
7. Create one secret per sensitive value:
   ```bash
   printf '%s' "$DATABASE_URL"               | gcloud secrets create DATABASE_URL --data-file=-
   printf '%s' "${SUPABASE_URL}"             | gcloud secrets create SUPABASE_URL --data-file=-
   printf '%s' "${SUPABASE_ANON_KEY}"        | gcloud secrets create SUPABASE_ANON_KEY --data-file=-
   printf '%s' "${SUPABASE_SERVICE_ROLE_KEY}"| gcloud secrets create SUPABASE_SERVICE_ROLE_KEY --data-file=-
   printf '%s' "${LLM_API_KEY}"              | gcloud secrets create LLM_API_KEY --data-file=-
   ```
   Replace the four `${...}` shell vars before running, with values from the existing local `.env` (they already exist for the EC2 path). If you don't have a Groq key handy, sign up at [console.groq.com](https://console.groq.com) — 2 minutes — and use a `gsk_...` token as `LLM_API_KEY`.

   Reference: [Creating secrets](https://cloud.google.com/secret-manager/docs/create-secret).

### Block 4 — IAM on the runtime SA (6 min)

8. Bind the four roles the backend needs:
   ```bash
   SA="profix-runtime@profix-prod.iam.gserviceaccount.com"
   for role in \
     roles/cloudsql.client \
     roles/secretmanager.secretAccessor \
     roles/logging.logWriter \
     roles/monitoring.metricWriter; do
     gcloud projects add-iam-policy-binding profix-prod \
       --member="serviceAccount:${SA}" --role="$role"
   done
   ```
   References: [Connecting Cloud Run to Cloud SQL — IAM](https://cloud.google.com/sql/docs/postgres/connect-run#configure), [Secret Manager IAM](https://cloud.google.com/secret-manager/docs/access-control).

### Block 5 — Build & push the backend image (12 min)

9. From the **repo root** (the directory that contains `backend/`, `agents/`, `data/`, and `requirements.txt`). **Check out the canonical tag first — never deploy from a moving `main`:**
   ```bash
   git fetch --tags
   git checkout v0.1.0-cloudrun           # see release: https://github.com/profixai/finops-platform-profix/releases/tag/v0.1.0-cloudrun
   IMAGE="europe-west9-docker.pkg.dev/profix-prod/profix/profit-api:v0.1.0-cloudrun"
   gcloud builds submit \
     --tag "$IMAGE" \
     --region=europe-west9 \
     --machine-type=e2-highcpu-8 \
     --timeout=20m \
     -f backend/Dockerfile \
     .
   ```
   Notes:
   - The build context **must be the repo root** because `backend/Dockerfile` does `COPY agents/`, `COPY backend/`, `COPY data/`.
   - `-f backend/Dockerfile` tells Cloud Build which Dockerfile to use.
   - `requirements-ml.txt` (if it pulls torch/transformers) can blow build time. The base `requirements.txt` is what `Dockerfile` installs, so this should be fine.

   Reference: [`gcloud builds submit`](https://cloud.google.com/sdk/gcloud/reference/builds/submit), [Cloud Build overview](https://cloud.google.com/build/docs/overview).

### Block 6 — Deploy to Cloud Run (8 min)

10. One command. Mount the Cloud SQL instance, inject secrets as env vars, set CORS for the live frontend domain:
    ```bash
    gcloud run deploy profit-api \
      --image "$IMAGE" \
      --region europe-west9 \
      --platform managed \
      --service-account "$SA" \
      --port 8080 \
      --cpu 1 --memory 1Gi \
      --min-instances 0 --max-instances 10 \
      --concurrency 40 \
      --timeout 300 \
      --allow-unauthenticated \
      --add-cloudsql-instances "$INSTANCE_CONN" \
      --set-env-vars "STORAGE_BACKEND=LOCAL,UPLOAD_DIR=/tmp/uploads,LOG_LEVEL=INFO,LLM_BASE_URL=https://api.groq.com/openai/v1,LLM_MODEL=llama-3.1-8b-instant,LLM_ENABLED=true,CORS_ORIGINS=https://app.myprofix.ai" \
      --set-secrets "DATABASE_URL=DATABASE_URL:latest,SUPABASE_URL=SUPABASE_URL:latest,SUPABASE_ANON_KEY=SUPABASE_ANON_KEY:latest,SUPABASE_SERVICE_ROLE_KEY=SUPABASE_SERVICE_ROLE_KEY:latest,LLM_API_KEY=LLM_API_KEY:latest"
    ```
    References:
    - [Deploy a service](https://cloud.google.com/run/docs/deploying)
    - [Connect Cloud Run to Cloud SQL](https://cloud.google.com/sql/docs/postgres/connect-run)
    - [Mount secrets as env vars](https://cloud.google.com/run/docs/configuring/services/secrets)
    - [Configure environment variables](https://cloud.google.com/run/docs/configuring/services/environment-variables)

11. Capture the printed `Service URL` (e.g. `https://profit-api-xxxxxx-ew.a.run.app`) and verify health:
    ```bash
    SERVICE_URL="$(gcloud run services describe profit-api --region=europe-west9 --format='value(status.url)')"
    curl -fsS "${SERVICE_URL}/health" && echo OK
    ```

### Block 7 — Custom domain `api.myprofix.ai` (7 min)

12. Map the domain. (Domain mappings are in `beta` for most regions — `europe-west9` is supported.):
    ```bash
    gcloud beta run domain-mappings create \
      --service profit-api \
      --domain api.myprofix.ai \
      --region europe-west9
    gcloud beta run domain-mappings describe \
      --domain api.myprofix.ai --region europe-west9 \
      --format='value(status.resourceRecords)'
    ```
    Reference: [Mapping custom domains](https://cloud.google.com/run/docs/mapping-custom-domains).

13. The describe output prints the CNAME target (typically `ghs.googlehosted.com`). In **Namecheap → Domain List → myprofix.ai → Advanced DNS**, add:
    - Type: `CNAME Record`
    - Host: `api`
    - Value: `ghs.googlehosted.com.`
    - TTL: `Automatic`
    Wait 5–15 minutes for Google's managed cert to provision.

### Block 8 — Smoke test + tag (5 min)

14. End-to-end check from the live frontend:
    ```bash
    curl -fsS https://api.myprofix.ai/health && echo BACKEND_OK
    curl -I https://app.myprofix.ai | head -1   # expect 200
    ```
    Then in the browser at `https://app.myprofix.ai`:
    - Open DevTools → Network.
    - Go to **Data Vault** → upload a sample PDF.
    - Confirm `POST https://api.myprofix.ai/upload/...` returns 200 and the polling `GET https://api.myprofix.ai/upload/invoices/{job_id}` returns 200 (not 404, not the mock fallback).
    - Confirm a P&L insight renders.

15. **Tag is already created** at `v0.1.0-cloudrun` (see release link above). Do **not** create or move it. Future joint releases (`v0.1.1-cloudrun`, ...) advance both repos in lockstep — never tag one without the other.

## If something fails (don't retry blindly)

- Pull last 100 log lines:
  ```bash
  gcloud run services logs read profit-api --region=europe-west9 --limit=100
  ```
- Common gotchas:
  - **`PORT` mismatch** → confirm Cloud Run service uses `--port 8080` and the Dockerfile CMD respects `${PORT}`. The current Dockerfile already does. [Container contract](https://cloud.google.com/run/docs/container-contract).
  - **DB connection refused** → check `--add-cloudsql-instances` matches `INSTANCE_CONN` exactly and the `DATABASE_URL` `host=/cloudsql/...` path is correct. [Connecting from Cloud Run](https://cloud.google.com/sql/docs/postgres/connect-run).
  - **Secret access denied** → `gcloud secrets get-iam-policy <NAME>` must show the runtime SA with `roles/secretmanager.secretAccessor`. [Secret Manager IAM](https://cloud.google.com/secret-manager/docs/access-control).
  - **CORS error in browser** → verify the deployed env shows `CORS_ORIGINS=https://app.myprofix.ai`; the FastAPI `cors_origins` reads from this. If it lists the localhost defaults instead, redeploy with the env var.
  - **`/upload/invoices/{job_id}` returns 404** → confirm the deployed image was built from the repo root (block 5) and that `backend/app/main.py` mounts `invoices.router` under `prefix="/upload"`.

## Report back

When done, paste:
1. `Service URL` of `profit-api` and the git SHA.
2. `curl -fsS https://api.myprofix.ai/health` output.
3. Browser-side result of a real PDF upload through `app.myprofix.ai`.
4. Anything weird in `gcloud run services logs read profit-api --limit=50`.

## Out of scope (do later, not today)

- Switch `STORAGE_BACKEND` from `LOCAL` to GCS bucket (`profix-invoices-eu`). Cloud Run filesystem is ephemeral; uploads survive only inside one instance lifetime.
- Min-instances > 0 to remove cold start (~€7/mo per always-warm instance).
- Cloud Build trigger on `main` push for continuous deploy.
- Cloud Armor + IAP for the API (only needed if hotel customer demands it).
