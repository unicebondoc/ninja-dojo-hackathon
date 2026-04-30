# Ninja Dojo

> Mission control for AI shipping.

![License MIT](https://img.shields.io/badge/license-MIT-f6e7b1)
![Next.js 15](https://img.shields.io/badge/Next.js-15-black)
![TypeScript 5](https://img.shields.io/badge/TypeScript-5-blue)
![Codex Skills](https://img.shields.io/badge/Codex-Skills-dc2626)

Ninja Dojo tracks every scroll from intent to plugin handoff, stage result, Meowts judgment, and Moonrise Receipt.

It is not another coding model and not a generic AI wrapper. Plugins do the work. Dojo owns the mission state, Run Manifest, Project Brain, stage trail, judge report, and receipt.

## Product Thesis

Ninja Dojo is:

- mission control for AI shipping
- a receipt engine for agent work
- lightweight project memory for every scroll

Plugins can be Codex, Claude, OpenClaw, GPT Image 2, Telegram, manual paste-result fallback, or future content plugins. Ninja Dojo keeps the run legible no matter which worker produced the result.

## The Dojo Method

```
Scroll -> Plan -> Build -> Attack -> Review -> Deploy -> Judge -> Moonrise
```

1. **Scroll** - capture intent.
2. **Plan** - Moji writes the manifest.
3. **Build** - Miji prepares the build handoff.
4. **Attack** - Maji checks weak spots.
5. **Review** - Meji reviews quality and architecture.
6. **Deploy** - Muji checks launch readiness.
7. **Judge** - Meowts gives the verdict.
8. **Moonrise** - the receipt is produced.

## Core Artifacts

- **Run Manifest** - structured mission state for every scroll.
- **Plugin handoff prompts** - clean instructions for the tool doing the work.
- **Meowts Judge Report** - score, pass/fail notes, matched requirements, and improvements.
- **Moonrise Receipt** - original scroll, requirements, stage summaries, plugin results, judge score, and next fix prompt.
- **Project Brain** - repo rules, product constraints, decisions, active plugins, memory summary, latest run, and next action.

## Current Product Loop

The app is cached-first and Vercel-safe:

1. Type a scroll into the Scroll Composer.
2. The dojo creates a local Run Manifest.
3. The Phaser dojo scene plays the mission stages.
4. Meowts judges the run.
5. Moonrise opens a generated receipt/preview for the submitted scroll.
6. Run history persists in browser storage.

No auth, billing, database, or external orchestration is required for the default loop.

## Plugins

- **Codex plugin** - build handoff prompts now, real execution later.
- **Claude plugin** - review prompts now, deep review later.
- **OpenClaw plugin** - local action prompts now, gateway actions later.
- **GPT Image 2 plugin** - asset prompts now, generation integration later.
- **Telegram plugin** - scroll capture and mission updates.
- **Manual plugin** - paste results from any tool and save them to mission state.

## Cast

| Ninja  | Role   |
| ------ | ------ |
| Moji   | Plan   |
| Miji   | Build  |
| Maji   | Attack |
| Meji   | Review |
| Muji   | Deploy |
| Meowts | Judge  |

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`, drop a scroll, and watch the mission move from Run Manifest to Moonrise Receipt.

## Routes

- `/` - mission-control console.
- `/moonrise?scroll=...` - generated Moonrise Receipt and preview for the submitted scroll.
- `/api/runs` - cached run creation API.
- `/api/runs/[runId]/events` - local run event stream.
- `/api/train` - cached compatibility API.

## Tech Stack

- **Next.js 15** - App Router and route handlers.
- **TypeScript 5** - typed manifests, run storage, preview generation, and game glue.
- **Tailwind CSS** - moonlit mission-control styling.
- **Phaser 4** - live dojo scene, stage choreography, and click-to-talk.
- **Codex Skills** - repo-native skill folders for the six-stage workflow.

## Future Architecture

Future live execution can attach behind the same mission contract:

1. Scroll Composer creates a mission.
2. `/api/runs` persists the Run Manifest.
3. Orchestrator creates stage handoffs.
4. Plugins execute work and stream results.
5. Project Brain stores decisions and constraints.
6. Meowts judges the evidence.
7. Moonrise Receipt returns preview URL, repo/branch info, and next fix prompt.

## License

MIT
