# Ninja Dojo

**One scroll in. Five Codex worktrees out. One shipped result.**

![MIT](https://img.shields.io/badge/license-MIT-f6e7b1)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Codex Skills](https://img.shields.io/badge/Codex-Skills-dc2626)
![Hackathon MVP](https://img.shields.io/badge/Hackathon-MVP-7f1d1d)

Ninja Dojo is a visual command center for solo builders coordinating Codex-style agent workflows. A builder writes one product scroll, then watches specialized agents plan, build, attack, review, deploy, and judge the result inside a cinematic dojo.

Inspired by world-simulation interfaces like [WorldX](https://github.com/YGYOOO/WorldX), but built for Codex agent workflows. WorldX was used as visual inspiration only; no code, assets, images, text, or exact UI were copied.

## Screenshots / GIF

> Add a short capture here: homepage → Launch live dojo → agents complete → moonrise → `/demo/oracle`.

```text
public/demo/ninja-dojo-loop.gif
```

## Demo Flow

```text
Product scroll
  ↓
Shoji panels open
  ↓
Moji plans → Miji builds → Renegade attacks → Sensei reviews → Tester deploys
  ↓
Meowts judges
  ↓
Moonrise: shipped
  ↓
/demo/oracle
```

The current local demo is cached-first and stage-safe. It does not require Telegram, Vercel, Supabase, WebSockets, auth, payments, or external services.

## Features

- Game-like dark dojo homepage with Scroll → Panels → Moon storytelling.
- Live 2D dojo board with moving chibi agents, moonlight, shuriken, katana effects, stations, progress, and event log.
- Local-live backend with Server-Sent Events for agent status and dialogue.
- Six named agent roles: Moji, Miji, Renegade, Sensei, Tester, and Meowts.
- Shoji status panels that show idle, working, complete, and failed states.
- Artifact packet for plan, build notes, attack findings, review, deploy checks, and final judgment.
- Cached `/api/train` compatibility endpoint for reliable demos.
- `/demo/oracle` shipped-page preview for the sample scroll.
- `AGENTS.md` Dojo Law plus six Codex Skills in `.codex/skills`.

## Original Visual Assets

Ninja Dojo uses original visual direction and asset prompts. WorldX was not copied; it was used only as broad inspiration for a live-world/game feel.

- Local generated asset script: `scripts/generate-local-assets.mjs`
- GPT Image 2 generation script: `scripts/generate-assets.mjs`
- Prompt pack: `public/assets/dojo/README.md`
- Target output folder: `public/assets/dojo/`
- Current generated files: `dojo-background.png`, `spritesheet.png`, `scroll.png`, `moon.png`, `katana-slash.png`
- Fallback: CSS/SVG sprites, moon, scroll, dojo room, and slash VFX keep the app working when generated assets are unavailable.

Generate local original PNG assets without an API key:

```bash
npm run generate:local-assets
```

Generate GPT Image 2 assets when `OPENAI_API_KEY` is configured:

```bash
npm run generate:assets
```

The requested spritesheet is a single transparent PNG with six chibi game sprites in one row: Moji, Miji, Renegade, Sensei, Tester, and Meowts.

## Architecture

```text
                 ┌──────────────────────────────┐
                 │        User product scroll    │
                 └───────────────┬──────────────┘
                                 │
                                 ▼
┌────────────────────────────────────────────────────────────┐
│ Next.js App Router homepage                                │
│ - Scroll input                                              │
│ - Live 2D dojo game board                                   │
│ - Shoji panels                                              │
│ - Progress rail and event log                               │
│ - Artifact packet                                           │
└───────────────────────┬────────────────────────────────────┘
                        │ POST /api/runs
                        ▼
┌────────────────────────────────────────────────────────────┐
│ Local run factory                                           │
│ Creates DojoRun, DojoAgent states, artifacts, stream path    │
└───────────────────────┬────────────────────────────────────┘
                        │ GET /api/runs/[runId]/events
                        ▼
┌────────────────────────────────────────────────────────────┐
│ SSE event stream                                            │
│ run_started → agent_started → agent_message                 │
│ → agent_completed → artifact_ready → run_completed          │
└───────────────────────┬────────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────────┐
│ Frontend state machine                                      │
│ Updates living agents, dialogue, panels, Meowts, moonrise    │
└───────────────────────┬────────────────────────────────────┘
                        │
                        ▼
                 ┌──────────────────────────────┐
                 │      /demo/oracle preview     │
                 └──────────────────────────────┘
```

## Codex-Native Pieces

- `AGENTS.md` describes the Dojo Law and product rules.
- `.codex/skills/moji-plan/SKILL.md` turns a scroll into a plan.
- `.codex/skills/miji-build/SKILL.md` builds the artifact.
- `.codex/skills/renegade-attack/SKILL.md` attacks the plan and build.
- `.codex/skills/sensei-review/SKILL.md` reviews architecture.
- `.codex/skills/tester-deploy/SKILL.md` checks build and preview readiness.
- `.codex/skills/meowts-judge/SKILL.md` decides whether the moon rises.

## Product Direction

Ninja Dojo is becoming a live operations layer for AI software work:

- Start a run from a product scroll.
- Stream agent dialogue and status changes into the UI.
- Watch agents move through a 2D anime dojo with katanas, shuriken, lighting, and combat-review effects.
- Preserve artifacts from each role: plan, build notes, attack findings, review, deploy checks, and judgment.
- Open the shipped preview when the run passes.
- Keep the interface memorable enough to understand at a glance, but structured enough to become a real work dashboard.

## Live Backend

The current backend is implemented with Next.js route handlers:

- `POST /api/runs` creates a local-live `DojoRun`.
- `GET /api/runs/[runId]/events` streams run events over Server-Sent Events.
- `GET /api/train` remains as a cached compatibility endpoint.

The frontend consumes the stream with `EventSource`, updates ninja status panels in real time, renders the live dojo conversation, persists completed runs in browser `localStorage`, and keeps the artifact packet available after completion.

## How To Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`, write a scroll, click **Launch live dojo**, then watch the agents talk to each other and complete the run. The shipped preview is available at `/demo/oracle`.

## Current Routes

- `/` live Ninja Dojo dashboard
- `/demo/oracle` sample shipped product page
- `/api/runs` run creation API
- `/api/runs/[runId]/events` SSE run stream
- `/api/train` cached compatibility API

## Commercial Roadmap

The next production adapters should preserve the current `DojoRun` and `DojoRunEvent` shape:

- Database: Postgres for runs, events, artifacts, users, and team workspaces.
- Auth: account login, workspace membership, and run ownership.
- Codex orchestration: replace the local event factory with real worktree execution.
- Deployments: connect Tester to preview deploy providers.
- Billing: add plans only after the core run loop is valuable.
- Observability: event logs, run replay, error recovery, and agent quality metrics.

## License

MIT
