# AGENTS.md — Ninja Dojo

## Product

Ninja Dojo is mission control for AI shipping. It tracks every scroll from intent to plugin handoff, stage result, Meowts judgment, and Moonrise Receipt.

Claim:
Plugins do the work. Dojo owns mission state, Project Brain, and the receipt.

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

## Product Ownership

Dojo owns:

- mission state
- Run Manifest
- Project Brain
- plugin handoff prompts
- stage tracking
- Meowts Judge Report
- Moonrise Receipt
- run history

Plugins do the work:

- Codex
- Claude
- OpenClaw
- GPT Image 2
- Telegram
- manual paste-result fallback
- future content plugins

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
- Do not overbuild. Ship the scroll → mission state → plugin handoff → judge report → receipt path first.

## Fallback Constraints

The fallback run path is cached-first and must run without:

- Telegram
- Vercel
- Supabase
- WebSockets
- Auth
- Payments
- Any external orchestration

Live adapters may exist behind feature flags. They must never be required for the fallback run.

## Example Scroll

Build me a landing page for a moonlit ramen shop with online booking, pricing, and testimonials.

## Pitch

I am a solo builder. Codex gives me parallel workers, but I needed a command center.
Ninja Dojo is that command center: one scroll in, mission tracked.
Moji plans, Miji builds, Maji attacks, Meji reviews, Muji deploys, and Meowts judges the receipt.
The scroll becomes a Run Manifest, plugin handoffs, a judge report, and a Moonrise Receipt.
