# Ninja Dojo

> A live dojo for coordinating Codex-style agent workflows. One scroll in. Six ninjas ship it.

![License MIT](https://img.shields.io/badge/license-MIT-f6e7b1)
![Next.js 15](https://img.shields.io/badge/Next.js-15-black)
![TypeScript 5](https://img.shields.io/badge/TypeScript-5-blue)
![Codex Skills](https://img.shields.io/badge/Codex-Skills-dc2626)

Ninja Dojo is a live command center for solo builders coordinating Codex-style agent workflows. You hand the dojo a single scroll — a product idea written in plain English — and watch six specialized ninjas plan, build, attack, review, deploy, and judge the result inside a 2D dojo simulation. When the work passes, the moon rises and the shipped page opens.

## What it is

Ninja Dojo turns one product request into one shipped result. You write what you want. Six AI agents take it from idea to live page in front of you, each with their own job. You can see them moving, talking, and finishing their part of the work. When everyone is done and the work passes review, the moon rises and the page opens. It's built for solo founders who want the visibility of a real team without hiring one.

## The Cast

| Ninja  | Role     | Emoji |
| ------ | -------- | ----- |
| Moji   | Plan     | 📜    |
| Miji   | Build    | 🔨    |
| Maji   | Attack   | ⚔️    |
| Meji   | Review   | 🏯    |
| Muji   | Deploy   | 🚀    |
| Meowts | Judge    | 🐱    |

## The Flow

```
Scroll → Plan → Build → Attack → Review → Deploy → Judge → Moonrise
```

1. **Scroll** — you describe what you want built.
2. **Plan** — Moji writes the spec and acceptance criteria.
3. **Build** — Miji ships the artifact in an isolated worktree.
4. **Attack** — Maji tries to break the plan and the build.
5. **Review** — Meji checks architecture and maintainability.
6. **Deploy** — Muji runs build/test checks and prepares a preview.
7. **Judge** — Meowts decides: does the moon rise?
8. **Moonrise** — the shipped page is ready to open.

## Codex-Native Architecture

Ninja Dojo is built around the way Codex actually works:

- **`AGENTS.md`** — the Dojo Law and product rules in one file.
- **`.codex/skills/`** — six Codex Skills, one per ninja:
  - `moji-plan` — turns a scroll into a plan.
  - `miji-build` — builds the artifact.
  - `maji-attack` — finds weakness in plan and build.
  - `meji-review` — reviews architecture for harmony.
  - `muji-deploy` — runs build checks and prepares deploy.
  - `meowts-judge` — decides whether the moon rises.
- **Worktree story** — each ninja maps to an isolated Codex worktree. The current app runs them as cached events; the production direction replaces the local factory with real Codex worktree execution while preserving the `DojoRun` and `DojoRunEvent` shapes.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`, send the scroll, and watch the dojo go to work. The shipped page remains available at `/demo/oracle` for compatibility.

## Product Flow

What a first-time visitor sees:

1. The dojo loads — six ninjas at their stations under a dark sky.
2. Send the scroll and watch the dojo go to work.
3. Moji writes the plan. Miji starts building.
4. Maji attacks the build. A katana slash flashes on screen.
5. Meji reviews the architecture. Muji runs deploy checks.
6. Meowts delivers the verdict from the pagoda roof.
7. The moon rises. The shipped page is ready to open.

The whole loop runs offline from cached data, so the product never blocks on a network call.

## Tech Stack

- **Next.js 15** — App Router, route handlers, SSE.
- **TypeScript 5** — strict mode across app, components, and game code.
- **Tailwind CSS** — dark dojo theming and the RPG hero layout.
- **Phaser 4** — 2D dojo simulation: tile world, ninja movement, NPC dialogue, run timeline.
- **OpenAI Codex** — `AGENTS.md` plus six Codex Skills shape the agent workflow.

## Routes

- `/` — live dojo dashboard.
- `/demo/oracle` — backwards-compatible moonrise page.
- `/api/runs` — run creation API.
- `/api/runs/[runId]/events` — SSE run stream.
- `/api/train` — cached compatibility API.

## What's Next

- Live deploy with a public URL.
- Real Codex worktree execution behind the run factory.
- Audio: koto loop, footsteps, scroll-receive, moonrise SFX.
- Persistent run archive — past scrolls become collectible artifacts.
- Account login, workspace membership, and run ownership for teams.
- Production deploy adapter for Muji.
- Observability: event logs, run replay, agent quality metrics.

## Credits

- **Origin story** — built at OpenAI Codex Hackathon Sydney 2026.
- **OpenAI APAC team** — for hosting the Codex Hackathon Sydney 2026.
- **Gabriel Chua** — feedback and encouragement on the Codex-native angle.
- **Thomas Jeng** — feedback and encouragement on the live dojo direction.
- **Arafat Tehsin** — feedback and encouragement on the agent flow.
- **Unice Bondoc** — solo builder.

## License

MIT
