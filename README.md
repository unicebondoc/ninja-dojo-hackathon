# Ninja Dojo

**One scroll in. Live ninjas out. One shipped result.**

Ninja Dojo is a commercial AI command center for solo builders coordinating parallel Codex-style workflows. A builder writes one product scroll, then watches specialized agents plan, build, attack, review, deploy, and judge the result in a live dojo.

## Product Direction

Ninja Dojo is becoming a live operations layer for AI software work:

- Start a run from a product scroll.
- Stream agent dialogue and status changes into the UI.
- Preserve artifacts from each role: plan, build notes, attack findings, review, deploy checks, and judgment.
- Open the shipped preview when the run passes.
- Keep the interface memorable enough to understand at a glance, but structured enough to become a real work dashboard.

The current app ships a local-live backend first. It does not depend on external services for development, but the route structure is ready for database persistence, auth, Codex orchestration, and hosted deployment.

## Live Backend

The current backend is implemented with Next.js route handlers:

- `POST /api/runs` creates a local-live `DojoRun`.
- `GET /api/runs/[runId]/events` streams run events over Server-Sent Events.
- `GET /api/train` remains as a cached compatibility endpoint.

The frontend consumes the stream with `EventSource`, updates ninja status panels in real time, renders the live dojo conversation, persists completed runs in browser localStorage, and keeps the artifact packet available after completion.

## Commercial Roadmap

The next production adapters should preserve the current `DojoRun` and `DojoRunEvent` shape:

- Database: Postgres for runs, events, artifacts, users, and team workspaces.
- Auth: account login, workspace membership, and run ownership.
- Codex orchestration: replace the local event factory with real worktree execution.
- Deployments: connect Tester to preview deploy providers.
- Billing: add plans only after the core run loop is valuable.
- Observability: event logs, run replay, error recovery, and agent quality metrics.

## How To Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`, write a scroll, click **Launch live dojo**, then watch the agents talk to each other and complete the run. The shipped preview is available at `/demo/oracle`.

## Optional Environment

No environment variables are required for the current local-live product. Use `.env.example` as the future production contract for database, Codex, and deployment adapters.

## Current Routes

- `/` live Ninja Dojo dashboard
- `/demo/oracle` sample shipped product page
- `/api/runs` run creation API
- `/api/runs/[runId]/events` SSE run stream
- `/api/train` cached compatibility API
