# Claude Code — profit-ui Cloud Run Deploy

Paste the prompt below into the Claude Code VS Code extension from the **root of the `profit-ui` repo** (the one containing the merged Dockerfile from PR #1). Run on `main` after pulling latest.

---

## Context for Claude (paste this verbatim)

You are deploying `profit-ui` (Vite SPA, Bun build, Node + serve@14 runtime, port 3000) to Google Cloud Run in region `europe-west9` (Paris).

The Dockerfile is already merged on `main` from PR #1. Do NOT modify the Dockerfile unless a build error forces it. The image listens on **port 3000**.

The backend (`profit-api` from `finops-platform-profix`) is being deployed as a separate Cloud Run service. The frontend talks to it via `VITE_API_BASE`, baked at build time. For this deploy use:

```
VITE_API_BASE=https://api.myprofix.ai
```

Project: `profix-prod`
Region: `europe-west9`
Artifact Registry repo: `profix` (Docker format)
Service name: `profit-ui`
Runtime service account: `profix-runtime@profix-prod.iam.gserviceaccount.com`
Custom domain: `app.myprofix.ai` (DNS managed in Namecheap — we'll add a CNAME after the service is live)

## Step-by-step instructions for Claude

1. **Verify environment**
   - Run `gcloud config get-value project` and confirm it returns `profix-prod`. If not, run `gcloud config set project profix-prod` and `gcloud auth login` if needed.
   - Run `gcloud config set run/region europe-west9`.
   - Confirm the working directory is the `profit-ui` repo root (Dockerfile present, `package.json` present, `bun.lock` or `bun.lockb` present).

2. **Enable required APIs (idempotent)**
   ```bash
   gcloud services enable \
     run.googleapis.com \
     artifactregistry.googleapis.com \
     cloudbuild.googleapis.com
   ```

3. **Create Artifact Registry repo if it does not exist**
   ```bash
   gcloud artifacts repositories describe profix --location=europe-west9 \
     || gcloud artifacts repositories create profix \
        --repository-format=docker --location=europe-west9 \
        --description="Profix container images"
   ```

4. **Create the runtime service account if it does not exist**
   ```bash
   gcloud iam service-accounts describe profix-runtime@profix-prod.iam.gserviceaccount.com \
     || gcloud iam service-accounts create profix-runtime --display-name="Profix runtime"
   ```
   The frontend service does not need extra IAM beyond the default; secrets/SQL/Vertex are the backend's concern.

5. **Build & push the image with Cloud Build (no local Docker required)**
   Use a deterministic tag based on the short git SHA so we can pin and roll back:
   ```bash
   GIT_SHA=$(git rev-parse --short HEAD)
   IMAGE="europe-west9-docker.pkg.dev/profix-prod/profix/profit-ui:${GIT_SHA}"
   gcloud builds submit \
     --tag "$IMAGE" \
     --region=europe-west9 \
     --substitutions=_VITE_API_BASE=https://api.myprofix.ai \
     .
   ```
   If Cloud Build complains about build args not being substituted, fall back to a docker-build-and-push that passes the build arg explicitly:
   ```bash
   gcloud auth configure-docker europe-west9-docker.pkg.dev
   docker build \
     --build-arg VITE_API_BASE=https://api.myprofix.ai \
     --build-arg VITE_APP_VERSION="${GIT_SHA}" \
     --build-arg VITE_SITE_URL=https://app.myprofix.ai \
     -t "$IMAGE" .
   docker push "$IMAGE"
   ```

6. **Deploy to Cloud Run**
   ```bash
   gcloud run deploy profit-ui \
     --image "$IMAGE" \
     --region europe-west9 \
     --platform managed \
     --service-account profix-runtime@profix-prod.iam.gserviceaccount.com \
     --port 3000 \
     --cpu 1 --memory 512Mi \
     --min-instances 0 --max-instances 10 \
     --concurrency 80 \
     --allow-unauthenticated \
     --set-env-vars APP_ENV=production
   ```
   Capture the printed `Service URL` (looks like `https://profit-ui-xxxxxx-ew.a.run.app`). Open it in a browser and confirm the SPA loads.

7. **Smoke-test the bug fix from PR #1**
   - In the deployed app, open DevTools → Network tab.
   - Go to the Data Vault page, upload a sample PDF.
   - Confirm `GET https://api.myprofix.ai/upload/invoices/{job_id}` returns **200**, not 404, and the polling loop hits the real backend (not the mock-data fallback).

8. **Map the custom domain `app.myprofix.ai`**
   ```bash
   gcloud beta run domain-mappings create \
     --service profit-ui \
     --domain app.myprofix.ai \
     --region europe-west9
   ```
   The command prints a CNAME target (typically `ghs.googlehosted.com`). Add it in Namecheap:
   - Type: `CNAME`
   - Host: `app`
   - Value: `ghs.googlehosted.com.`
   - TTL: `Automatic`
   Wait 5–15 min for cert provisioning, then `curl -I https://app.myprofix.ai` should return `200` with a Google-managed cert.

9. **Tag the release**
   ```bash
   git tag -a "v0.1.0-cloudrun" -m "First Cloud Run deploy of profit-ui"
   git push origin "v0.1.0-cloudrun"
   ```

10. **Report back** with:
    - The exact `Service URL`.
    - The git SHA deployed.
    - Result of the `/upload/invoices/{job_id}` smoke test (200 or 404, screenshot if possible).
    - Whether `app.myprofix.ai` is resolving with valid TLS.

## Guardrails

- Do NOT delete or modify the EC2 / Caddy / Terraform files in `finops-platform-profix` — they're parked, not removed.
- Do NOT change `src/services/api.ts`. The `/upload/invoices/{job_id}` fix from PR #1 must stay.
- Do NOT bake secrets into the image. The frontend has no secrets; only public `VITE_*` vars are baked in.
- If the Cloud Run deploy fails, capture the **last 100 lines** of `gcloud builds log` and `gcloud run services logs read profit-ui --region=europe-west9 --limit=100`, then stop and report — do not retry blindly.

## When you're done

Reply in the chat with the four items from step 10 plus any anomalies. I'll handle the backend deploy and Cloud DNS / Identity Platform wiring next.
