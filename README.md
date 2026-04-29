# Ninja Dojo

**One scroll in. Five Codex worktrees out.**

Ninja Dojo is a visual command center for solo builders coordinating parallel Codex workflows. The hackathon MVP is a cached-first stage demo: enter one product scroll, watch the dojo route work through specialized AI ninjas, then open the shipped preview.

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

## How To Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`, click **Run cached scroll**, then open the shipped preview at `/demo/oracle`.

## Stage Demo Fallback Notes

The demo does not require Telegram, Supabase, Vercel, Codex App Server, WebSocket, auth, payments, or any external service. If live orchestration fails in a future version, render `public/demo-output.json` and keep the audience on the scroll → panels → moon path.
