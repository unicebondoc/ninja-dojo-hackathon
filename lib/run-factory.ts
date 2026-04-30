import { demoOutput } from "@/lib/demo-output";
import type { DojoArtifact, DojoRun, DojoRunEvent } from "@/lib/types";

export const defaultArtifacts: DojoArtifact[] = [
  {
    kind: "plan",
    title: "Moji plan",
    summary: "Landing page scope, acceptance criteria, and build handoff.",
    body: [
      "Objective: ship a complete magical oracle deck landing page with a waitlist CTA.",
      "Sections: mystical hero, product promise, how it works, what buyers receive, audience fit.",
      "Acceptance: clear copy, mobile-safe layout, replayable artifacts, preview at /demo/oracle."
    ]
  },
  {
    kind: "build",
    title: "Miji build",
    summary: "Next.js route and polished Tailwind interface.",
    body: [
      "Implemented /demo/oracle as a static shipped page.",
      "Used local visual assets built from CSS and Tailwind rather than external media.",
      "Kept the CTA visual-only until the production waitlist adapter is connected."
    ]
  },
  {
    kind: "attack",
    title: "Maji attack",
    summary: "Product risks called out before the ship moment.",
    body: [
      "CTA needed to be clear above the fold.",
      "Mobile spacing needed to keep the oracle card and headline readable.",
      "External integrations stay behind adapters until the core run loop is stable."
    ]
  },
  {
    kind: "review",
    title: "Meji review",
    summary: "Architecture stays simple and Codex-native.",
    body: [
      "App Router routes cover the dashboard, shipped preview, cached API, and SSE run stream.",
      "AGENTS.md documents the Dojo Law and product constraints.",
      "Six Codex Skills map directly to the visible ninja roles."
    ]
  },
  {
    kind: "deploy",
    title: "Muji deploy",
    summary: "Build path and preview route are verified for deployment.",
    body: [
      "Production build passes with Next.js 15.",
      "Local preview paths: /, /demo/oracle, /api/runs, and /api/train.",
      "SSE run streaming works locally before production adapters are connected."
    ]
  },
  {
    kind: "judge",
    title: "Meowts judgment",
    summary: "The moon rises only after the packet is complete.",
    body: [
      "Approved: the scroll becomes a visible shipped page.",
      "Roast preserved for memorability.",
      "Next step: replace local run generation with real worktree orchestration."
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

export function createLiveDojoRun(
  scroll: string,
  id = makeRunId(new Date())
): DojoRun {
  const run: DojoRun = {
    ...createDojoRun(scroll),
    id,
    status: "running",
    source: "local-live",
    streamPath: `/api/runs/${id}/events?scroll=${encodeURIComponent(
      scroll.trim() || demoOutput.scroll
    )}`
  };

  return {
    ...run,
    agents: run.agents.map((agent) => ({
      ...agent,
      status: "idle" as const,
      output: ""
    }))
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

export function createLiveDojoEvents(run: DojoRun): DojoRunEvent[] {
  const completedRun = completeDojoRun(run);

  return [
    {
      id: `${run.id}-start`,
      type: "run_started",
      at: 0,
      runId: run.id,
      message: "The scroll hits the tatami. Opening the live dojo."
    },
    {
      id: `${run.id}-moji-start`,
      type: "agent_started",
      at: 500,
      runId: run.id,
      agentName: "Moji",
      role: "Plan",
      message: "I am reading the scroll and pinning the acceptance criteria."
    },
    {
      id: `${run.id}-moji-talk`,
      type: "agent_message",
      at: 1250,
      runId: run.id,
      agentName: "Moji",
      role: "Plan",
      message: "Miji, take this blueprint: hero, story, benefits, waitlist CTA."
    },
    {
      id: `${run.id}-moji-done`,
      type: "agent_completed",
      at: 1800,
      runId: run.id,
      agentName: "Moji",
      role: "Plan",
      message: demoOutput.agents[0].output
    },
    {
      id: `${run.id}-miji-start`,
      type: "agent_started",
      at: 2050,
      runId: run.id,
      agentName: "Miji",
      role: "Build",
      message: "Copy. I am assembling the shipped page and keeping the CTA visible."
    },
    {
      id: `${run.id}-miji-talk`,
      type: "agent_message",
      at: 3000,
      runId: run.id,
      agentName: "Miji",
      role: "Build",
      message: "Maji, warm up. I want you to break this before a customer does."
    },
    {
      id: `${run.id}-miji-done`,
      type: "agent_completed",
      at: 3700,
      runId: run.id,
      agentName: "Miji",
      role: "Build",
      message: demoOutput.agents[1].output
    },
    {
      id: `${run.id}-reviewers-start`,
      type: "agent_started",
      at: 4050,
      runId: run.id,
      agentName: "Maji",
      role: "Attack",
      message: "I found the weak spots: CTA clarity and mobile breathing room."
    },
    {
      id: `${run.id}-meji-start`,
      type: "agent_started",
      at: 4300,
      runId: run.id,
      agentName: "Meji",
      role: "Review",
      message: "Architecture is under review. Keep the critical path simple."
    },
    {
      id: `${run.id}-muji-start`,
      type: "agent_started",
      at: 4550,
      runId: run.id,
      agentName: "Muji",
      role: "Deploy",
      message: "I am checking the local preview routes and deploy readiness."
    },
    {
      id: `${run.id}-maji-done`,
      type: "agent_completed",
      at: 5600,
      runId: run.id,
      agentName: "Maji",
      role: "Attack",
      message: demoOutput.agents[2].output
    },
    {
      id: `${run.id}-meji-done`,
      type: "agent_completed",
      at: 6400,
      runId: run.id,
      agentName: "Meji",
      role: "Review",
      message: demoOutput.agents[3].output
    },
    {
      id: `${run.id}-muji-done`,
      type: "agent_completed",
      at: 7250,
      runId: run.id,
      agentName: "Muji",
      role: "Deploy",
      message: demoOutput.agents[4].output
    },
    {
      id: `${run.id}-artifact-ready`,
      type: "artifact_ready",
      at: 7750,
      runId: run.id,
      artifactKind: "judge",
      message: "Artifact packet sealed: plan, build, attack, review, deploy, judge."
    },
    {
      id: `${run.id}-meowts-start`,
      type: "agent_started",
      at: 8050,
      runId: run.id,
      agentName: "Meowts",
      role: "Judge",
      message: "I have inspected the work from the pagoda roof. Try not to make me regret this."
    },
    {
      id: `${run.id}-meowts-done`,
      type: "agent_completed",
      at: 9100,
      runId: run.id,
      agentName: "Meowts",
      role: "Judge",
      message: demoOutput.agents[5].output
    },
    {
      id: `${run.id}-complete`,
      type: "run_completed",
      at: 9800,
      runId: run.id,
      message: demoOutput.verdict,
      run: completedRun
    }
  ];
}

export function makeRunId(date: Date) {
  const stamp = date
    .toISOString()
    .replaceAll("-", "")
    .replaceAll(":", "")
    .replace(".", "")
    .slice(0, 15);
  return `scroll-${stamp}`;
}
