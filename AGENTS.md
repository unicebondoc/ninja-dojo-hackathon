# AGENTS.md — Ninja Dojo

## Product

Ninja Dojo is a commercial AI command center for solo builders to coordinate parallel Codex-style workflows.

Claim:
One scroll in. Six ninjas ship it.

## The Cast

| Name   | Role     |
| ------ | -------- |
| Moji   | Plan     |
| Miji   | Build    |
| Maji   | Attack   |
| Meji   | Review   |
| Muji   | Deploy   |
| Meowts | Judge    |

## Stage Flow

Scroll → Plan → Build → Attack → Review → Deploy → Judge → Moonrise

## Dojo Law

Every scroll follows the way of the ninja:

1. Moji plans before any blade is drawn.
2. Miji builds in isolation, never in the main hall.
3. Maji attacks every plan to find weakness.
4. Meji reviews architecture for harmony.
5. Muji deploys only when the work passes.
6. Meowts judges the final result from the pagoda roof.

## Vows

- No ninja ships untested code.
- No ninja merges without review.
- No ninja builds without a scroll.

## Rules

- Prefer local-live reliability before external integration risk.
- The core product must work locally before it depends on hosted services.
- If live orchestration fails, render a replayable local run with clear failure state.
- Keep the UI dark, sharp, and memorable.
- Do not overbuild. Ship the scroll → live dojo → panels → moon path first.

## Stage-Demo Constraints

The stage-demo path is cached-first and must run without:

- Telegram
- Vercel
- Supabase
- WebSockets
- Auth
- Payments
- Any external orchestration

Live adapters may exist behind feature flags. They must never be required for the stage demo.

## Demo Scroll

Build a landing page for a magical oracle deck with a waitlist CTA.

## Pitch

I am a solo builder. Codex gives me parallel workers, but I needed a command center.
Ninja Dojo is that command center: one scroll in, live ninjas out.
Moji plans, Miji builds, Maji attacks, Meji reviews, Muji deploys, and Meowts judges.
The scroll becomes a shipped page. The moon rises when it passes.
