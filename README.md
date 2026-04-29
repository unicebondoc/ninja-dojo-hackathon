# Ninja Dojo

**One scroll in. Five Codex worktrees out.**

Ninja Dojo is a visual command center for solo builders coordinating parallel Codex workflows. The hackathon MVP is a cached-first stage demo: enter one product scroll, watch the dojo route work through specialized AI ninjas, then open the shipped preview.

## What was built during the hackathon

Built on-site at OpenAI Codex Hackathon Sydney:

- Cached-first Next.js demo app
- Scroll → Panels → Moon Ninja Dojo dashboard
- `/demo/oracle` shipped page
- `AGENTS.md` Dojo Law
- Six Codex Skills in `.codex/skills`
- Cached `/api/train` endpoint
- Stage-safe fallback with no Telegram/Vercel/WebSocket dependency

This MVP was built during the hackathon. It does not depend on Telegram, Vercel, Supabase, or WebSockets for the stage demo.

## Demo Flow

1. Scroll received: “Build a landing page for a magical oracle deck with a waitlist CTA.”
2. Shoji panels open and the ninja agents activate.
3. Moji plans.
4. Miji builds.
5. Renegade attacks the result.
6. Sensei reviews architecture.
7. Tester prepares the preview.
8. Meowts judges.
9. The moon rises on success.
10. Open the shipped page at `/demo/oracle`.

## Codex-Native Pieces

- `AGENTS.md` defines the Dojo Law and stage-demo constraints.
- Six local Codex Skills live in `.codex/skills/*`.
- The MVP uses a cached-first demo path through `lib/demo-output.ts` and `public/demo-output.json`.
- Future live App Server or WebSocket streaming can hydrate the same UI, but the demo never depends on it.
- Future worktree orchestration can plug into the same agent roles without changing the stage path.

## End-to-End Local Workflow

Ninja Dojo now runs as a local-first command loop:

1. The dashboard submits the scroll to `/api/train`.
2. The API returns a cached `DojoRun` with agent outputs, artifact packets, preview path, and verdict.
3. The UI animates Moji, Miji, Renegade, Sensei, Tester, and Meowts through the scroll → panels → moon sequence.
4. Completed runs are saved in browser localStorage so they can be replayed from the run archive.
5. The artifact packet shows the plan, build notes, attack findings, architecture review, deploy check, and final judgment.

This keeps the product demo complete without pretending live orchestration exists yet. The next real integration point is replacing `lib/run-factory.ts` with an adapter that can launch isolated worktrees while preserving the same `DojoRun` shape.

## How To Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`, click **Run cached scroll**, then open the shipped preview at `/demo/oracle`.

## Stage Demo Fallback Notes

The demo does not require Telegram, Supabase, Vercel, Codex App Server, WebSocket, auth, payments, or any external service. If live orchestration fails in a future version, render `public/demo-output.json` and keep the audience on the scroll → panels → moon path.
