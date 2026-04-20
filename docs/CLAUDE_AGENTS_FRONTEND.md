# Claude Agents — Frontend (Profit Pulse)

This repo is the UI lab half of Profix. The heavier Claude agent layer
(product backend, sales, onboarding, maintenance, MCP, budget) lives in
the sibling repo `yasharnaghdi/finops-platform-profix`. See
`docs/agentic/` there for the full picture.

## What lives here

| Surface | Path |
|---|---|
| Project memory | `.claude/CLAUDE.md` |
| Permissions + hooks | `.claude/settings.json` |
| Subagents | `.claude/agents/ui-engineer.md`, `.claude/agents/design-qa.md` |

That's the whole harness. Deliberate minimalism — this repo's job is to ship
UI fast, not host ops automation.

## How a Claude Code session uses it

1. Opens, reads `CLAUDE.md` — understands it's the MVP UI lab and what's contract-locked.
2. User describes a UI task → `ui-engineer` subagent auto-routes on task match.
3. Before shipping a batch → `design-qa` subagent audits and produces a report.
4. User decides what to fix; `ui-engineer` implements; repeat.

## Sync points with the backend repo

- **Contract types.** `src/contracts/index.ts` mirrors `finops-platform-profix/backend/app/api/schemas.py`. A PR that changes types here must reference a matching backend PR.
- **Component handoff.** When a component stabilizes here, it lands in `finops-platform-profix/web/` and the row in the main README's "Onboarding Candidates" table flips to *handed off*.
- **Design tokens.** Tokens originate here; the production repo imports them. Changes to tokens require sign-off from both repos.

## Budget posture

This repo's Claude usage is small — most work is mechanical UI. Uses the
default Sonnet 4.6 tier. No separate budget tracking needed at this scale;
if sessions start costing more than ~$2/day, revisit.
