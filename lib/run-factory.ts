import { demoOutput } from "@/lib/demo-output";
import type { DojoArtifact, DojoRun } from "@/lib/types";

export const defaultArtifacts: DojoArtifact[] = [
  {
    kind: "plan",
    title: "Moji plan",
    summary: "Landing page scope, acceptance criteria, and build handoff.",
    body: [
      "Objective: ship a complete magical oracle deck landing page with a waitlist CTA.",
      "Sections: mystical hero, product promise, how it works, what buyers receive, audience fit.",
      "Acceptance: stage-readable copy, mobile-safe layout, no backend dependency, preview at /demo/oracle."
    ]
  },
  {
    kind: "build",
    title: "Miji build",
    summary: "Next.js route and polished Tailwind interface.",
    body: [
      "Implemented /demo/oracle as a static shipped page.",
      "Used local visual assets built from CSS and Tailwind rather than external media.",
      "Kept the CTA visual-only so the demo cannot fail on forms, auth, or network."
    ]
  },
  {
    kind: "attack",
    title: "Renegade attack",
    summary: "Stage risks called out before the ship moment.",
    body: [
      "CTA needed to be clear above the fold.",
      "Mobile spacing needed to keep the oracle card and headline readable.",
      "Live deploy, Telegram, Supabase, and WebSockets were cut from the critical path."
    ]
  },
  {
    kind: "review",
    title: "Sensei review",
    summary: "Architecture stays simple and Codex-native.",
    body: [
      "App Router routes are limited to the dashboard, shipped demo, and cached API.",
      "AGENTS.md documents the Dojo Law and stage constraints.",
      "Six Codex Skills map directly to the visible ninja roles."
    ]
  },
  {
    kind: "deploy",
    title: "Tester deploy",
    summary: "Build path and preview route are verified locally.",
    body: [
      "Production build passes with Next.js 15.",
      "Local preview paths: /, /demo/oracle, and /api/train.",
      "No external services are required for the stage path."
    ]
  },
  {
    kind: "judge",
    title: "Meowts judgment",
    summary: "The moon rises only after the packet is complete.",
    body: [
      "Approved: the scroll becomes a visible shipped page.",
      "Roast preserved for memorability.",
      "Next step: replace cached run generation with optional worktree orchestration."
    ]
  }
];

export function createDojoRun(scroll: string): DojoRun {
  const cleanScroll = scroll.trim() || demoOutput.scroll;
  const now = new Date();

  return {
    ...demoOutput,
    id: makeRunId(now),
    scroll: cleanScroll,
    createdAt: now.toISOString(),
    completedAt: undefined,
    source: "cached",
    artifacts: defaultArtifacts
  };
}

export function completeDojoRun(run: DojoRun): DojoRun {
  return {
    ...run,
    status: "shipped",
    completedAt: new Date().toISOString(),
    agents: run.agents.map((agent) => ({
      ...agent,
      status: "complete"
    }))
  };
}

function makeRunId(date: Date) {
  const stamp = date
    .toISOString()
    .replaceAll("-", "")
    .replaceAll(":", "")
    .replace(".", "")
    .slice(0, 15);
  return `scroll-${stamp}`;
}
