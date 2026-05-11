# Profix — Joint Release Protocol (`v0.1.x-cloudrun` → `v0.x.y-cloudrun`)

**Single source of truth.** This file lives in both repos at `docs/deploy/RELEASE_PROTOCOL.md`. If the two copies ever differ, the one in `profixai/finops-platform-profix` is authoritative.

**Audience.** Every agent that touches Profix infra: humans (JDO, YNA), Claude Code in VS Code, Gordon, future hires, future contractors. Read this before cutting any tag whose name ends in `-cloudrun`.

**Last advancement.** `v0.1.0-cloudrun` — Sun 10 May 2026 — first Cloud Run ship.

---

## 1. The contract

1. **One tag, two repos.** Every Cloud Run release ships under one tag name that exists in **both** repos at the same time. No exceptions.
2. **No tag without a green joint smoke test.** The tag is the proof that `app.myprofix.ai` and `api.myprofix.ai` talked to each other successfully, not a wish.
3. **Never deploy from `main` HEAD in production.** Always check out the canonical `vX.Y.Z-cloudrun` tag, build the image with that tag as the Docker tag, deploy from there. Cold rollback is then `gcloud run services update-traffic` to the previous tag, nothing else.
4. **Never advance one repo's tag without the other.** If you only need to ship a backend fix, you still cut a paired empty frontend tag at the same SHA as the previous frontend `cloudrun` tag (see §6 "Single-side hotfix").
5. **`v0.1.0-rc2` is superseded.** Any link, doc, or chat that references it is stale — open a PR to fix it.
6. **The runbooks win.** If this protocol conflicts with `docs/deploy/profit-{ui,api}-cloud-run.md`, the runbooks are authoritative for the command surface; this file is authoritative for the *workflow around* the commands.

## 2. Versioning rules

Format: `vMAJOR.MINOR.PATCH-cloudrun`.

- **PATCH** (`v0.1.0` → `v0.1.1`): bug fix, dependency bump, doc-only change that touches a deploy path, secret rotation. Never a schema change. Backwards compatible.
- **MINOR** (`v0.1.x` → `v0.2.0`): new endpoint, new UI surface, new env var with safe default, new managed service added (e.g. Cloud Storage bucket for invoices), schema migration that's backwards compatible.
- **MAJOR** (`v0.x.y` → `v1.0.0`): first paying hotel live, contract-locking schema change, breaking API change, multi-region.

The `-cloudrun` suffix is permanent until we ship somewhere other than Cloud Run. If we ever port back to AWS, that release would be tagged `vX.Y.Z-aws` from the `aws-archive-YYYY-MM` branch, in parallel — not by overwriting `cloudrun` tags.

## 3. Who can cut a tag

| Role | Can propose? | Can push the tag? |
| --- | --- | --- |
| JDO / YNA | yes | yes |
| Claude Code (any model) | yes | **only when explicitly told `go` by JDO or YNA in chat** |
| Gordon / other agents | yes | no — open a PR labeled `release-candidate` instead |
| Future contractor | yes | no — same as Gordon |

The push step is the single irreversible action; it's gated on a human typing `go`.

## 4. The advancement procedure (`v0.1.0-cloudrun` → `v0.1.1-cloudrun`, by example)

Run from `~/profix/` with both repos cloned as siblings. The whole procedure should take 20–40 minutes including DNS-free Cloud Run revision swap.

### Step 0 — Open the protocol checklist issue

In whichever repo has the larger diff, open an issue titled `Release: v0.1.1-cloudrun` with the body templated from `§9` below. Link any inbound PRs. This issue is the audit trail.

### Step 1 — Decide the SHA pair

For each repo, identify the **green-CI commit on `main`** you want to ship:
```bash
gh run list --repo profixai/profit-ui --branch main --workflow CI --limit 5 \
  --json conclusion,headSha,displayTitle --jq '.[] | select(.conclusion=="success") | "\(.headSha[0:7])  \(.displayTitle)"'
gh run list --repo profixai/finops-platform-profix --branch main --workflow CI --limit 5 \
  --json conclusion,headSha,displayTitle --jq '.[] | select(.conclusion=="success") | "\(.headSha[0:7])  \(.displayTitle)"'
```
Pick the most recent green SHA in each. If either repo's CI is red, **stop** — fix CI first, never cut a tag from a red commit.

### Step 2 — Open the lockstep PR (paired RC label)

If there are PRs that need to land before the tag, label each with `release-candidate-v0.1.1`. Do not cut the tag until all `release-candidate-*` PRs of that version are merged. This is how Gordon / Claude / contractors propose inclusion without push rights.

### Step 3 — Pre-tag dry-run in staging

Cloud Run supports **revision-only deploys** without traffic — use this as a dry-run:
```bash
# Backend dry-run
cd ~/profix/finops-platform-profix
git fetch && git checkout <backend_sha>
IMAGE="europe-west9-docker.pkg.dev/profix-prod/profix/profit-api:v0.1.1-cloudrun"
gcloud builds submit --tag "$IMAGE" --region=europe-west9 -f backend/Dockerfile .
gcloud run deploy profit-api --image "$IMAGE" --region europe-west9 --no-traffic --tag rc

# Frontend dry-run (against the staged backend at the rc.profit-api...run.app URL)
cd ~/profix/profit-ui
git fetch && git checkout <frontend_sha>
IMAGE="europe-west9-docker.pkg.dev/profix-prod/profix/profit-ui:v0.1.1-cloudrun"
gcloud builds submit --tag "$IMAGE" --region=europe-west9 \
  --substitutions=_VITE_API_BASE=https://rc---profit-api-xxxxx-ew.a.run.app .
gcloud run deploy profit-ui --image "$IMAGE" --region europe-west9 --no-traffic --tag rc
```
The `--no-traffic --tag rc` pair creates an addressable URL (`https://rc---profit-ui-xxxxx-ew.a.run.app`) that serves the new revision to nobody except you. Open it manually and run the §5 smoke checklist.

### Step 4 — Promote to 100% traffic

Only after §5 green:
```bash
gcloud run services update-traffic profit-api --region europe-west9 --to-tags rc=100
gcloud run services update-traffic profit-ui --region europe-west9 --to-tags rc=100
```
Watch logs for 60 seconds:
```bash
gcloud run services logs read profit-api --region=europe-west9 --limit=100 | tail -20
```
Anything red → §7 rollback.

### Step 5 — Push the joint tag

Both repos, same name, in the same minute. **This is the only line that requires a human typing `go`.**
```bash
# Backend
cd ~/profix/finops-platform-profix
git tag -a v0.1.1-cloudrun -m "Lockstep release: see profit-ui v0.1.1-cloudrun"
git push origin v0.1.1-cloudrun
gh release create v0.1.1-cloudrun --repo profixai/finops-platform-profix \
  --target "$(git rev-parse HEAD)" \
  --title "v0.1.1-cloudrun" \
  --notes "Lockstep with profit-ui v0.1.1-cloudrun. Diff vs v0.1.0-cloudrun: $(git log --oneline v0.1.0-cloudrun..HEAD | wc -l) commits. Smoke test artifacts: <link>."

# Frontend (same minute)
cd ~/profix/profit-ui
git tag -a v0.1.1-cloudrun -m "Lockstep release: see finops-platform-profix v0.1.1-cloudrun"
git push origin v0.1.1-cloudrun
gh release create v0.1.1-cloudrun --repo profixai/profit-ui \
  --target "$(git rev-parse HEAD)" \
  --title "v0.1.1-cloudrun" \
  --notes "Lockstep with finops-platform-profix v0.1.1-cloudrun. Built with VITE_API_BASE=https://api.myprofix.ai."
```

### Step 6 — Close the release issue

Paste both Release URLs into the issue from Step 0, check all boxes, close it.

## 5. The joint smoke checklist (every release must pass)

Run against the production URLs *after* traffic flip — or against the `rc---` URLs *during* dry-run.

- [ ] `curl -fsS https://api.myprofix.ai/health` returns 200 with `{"status":"ok"}` shape.
- [ ] `curl -I https://app.myprofix.ai` returns `HTTP/2 200`.
- [ ] In an Incognito window: load `app.myprofix.ai`, sign in via Supabase, **upload a PDF in Data Vault**.
- [ ] Network tab: `POST /upload/...` returns 200 *and* `GET /upload/invoices/{job_id}` polling returns 200 (not 404, not mock fallback).
- [ ] P&L dashboard renders at least one AI-generated insight.
- [ ] Cloud Run revision count = 2 (new + previous-still-warm for rollback).
- [ ] No `ERROR` lines in last 100 lines of either service's logs.

Screenshot the Network tab + dashboard, save to `~/profix/releases/v0.1.1-cloudrun/`, link from the Release notes.

## 6. Single-side hotfix (e.g. backend-only patch)

You **still** advance both tags, but the unchanged side gets a re-tag at its previous SHA. This keeps the contract trivially mechanical.

```bash
# Backend: real change
cd ~/profix/finops-platform-profix
git checkout <new_backend_sha>
git tag -a v0.1.2-cloudrun -m "Hotfix: ..."
git push origin v0.1.2-cloudrun

# Frontend: re-tag the previous cloudrun SHA, no rebuild needed (image already in Artifact Registry)
cd ~/profix/profit-ui
PREV_SHA=$(git rev-list -n 1 v0.1.1-cloudrun)
git tag -a v0.1.2-cloudrun "$PREV_SHA" -m "Lockstep no-op: identical frontend to v0.1.1-cloudrun"
git push origin v0.1.2-cloudrun
```
And in Cloud Run, only redeploy the changed service. The frontend service keeps serving its existing revision.

In the Release notes, write **"Frontend unchanged; same SHA as v0.1.1-cloudrun"** so anyone reading the timeline can see the no-op.

## 7. Rollback

Cloud Run rollback is a traffic flip, not a redeploy. Use this any time §5 fails on a live release.

```bash
# Roll back to previous traffic-100 revision (Cloud Run remembers them)
gcloud run services update-traffic profit-api --region europe-west9 --to-revisions <prev_revision_name>=100
gcloud run services update-traffic profit-ui --region europe-west9 --to-revisions <prev_revision_name>=100
```
List revisions with: `gcloud run revisions list --service profit-api --region europe-west9`.

**Do not delete the bad tag.** Mark its Release as "Pre-release" / "Yanked" and open a new tag (`v0.1.2-cloudrun`) with the fix. Audit trail wins over neatness.

## 8. AWS-resting invariant

The AWS account is in resting state. Every joint release re-asserts this:

- [ ] Tag `aws-archive-YYYY-MM` exists on `finops-platform-profix` pointing at the last EC2-targeted commit. The current one is `aws-archive-2026-05` at commit `f180f23`'s parent.
- [ ] No active EC2 instance, no active RDS, no active ALB. (Run `aws ec2 describe-instances --query 'Reservations[].Instances[?State.Name==\`running\`].[InstanceId,Tags]' --output table` — empty.)
- [ ] AWS billing alarm at $5/month still firing into `james@myprofix.ai`.

If any of these drift, fix before cutting the release.

## 9. Release issue template

Paste into the body of the GitHub issue opened in Step 0.

```markdown
# Release v0.1.X-cloudrun

## SHAs
- profit-ui:   `<sha>` (CI: <link>)
- finops:      `<sha>` (CI: <link>)

## Included PRs (label `release-candidate-v0.1.X`)
- [ ] profit-ui#NN — ...
- [ ] finops#NN — ...

## Dry-run (no-traffic revisions tagged `rc`)
- [ ] Backend rc URL: <https://rc---profit-api-xxxxx-ew.a.run.app/health> → 200
- [ ] Frontend rc URL: <https://rc---profit-ui-xxxxx-ew.a.run.app> → 200

## Joint smoke (see §5)
- [ ] /health 200
- [ ] app.myprofix.ai 200
- [ ] PDF upload polling 200
- [ ] P&L insight renders
- [ ] No ERROR in logs
- [ ] Screenshots saved at ~/profix/releases/v0.1.X-cloudrun/

## AWS-resting invariant (see §8)
- [ ] aws-archive-* tag present
- [ ] No running EC2/RDS/ALB
- [ ] $5 billing alarm active

## Tags & releases
- [ ] finops tag pushed: <release URL>
- [ ] profit-ui tag pushed: <release URL>

## Rollback plan
Previous revisions:
- profit-api: `<revision_name>`
- profit-ui:  `<revision_name>`
Command: `gcloud run services update-traffic ... --to-revisions <prev>=100`
```

## 10. When to amend this protocol

Edit this file via PR labeled `protocol-change`. Two human approvers required (JDO + YNA, or one + one delegated reviewer). Bump the "Last advancement" line on every successful release. If a sentence in this file ever felt ambiguous mid-incident, that's a bug — open the PR.

---

**Authoritative copy:** `profixai/finops-platform-profix:docs/deploy/RELEASE_PROTOCOL.md`
**Mirror:** `profixai/profit-ui:docs/deploy/RELEASE_PROTOCOL.md`
**Lockstep tag schema:** `vMAJOR.MINOR.PATCH-cloudrun`
**Current production tag:** `v0.1.0-cloudrun` (10 May 2026)
