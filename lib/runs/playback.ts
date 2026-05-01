import type { AgentId } from "@/lib/agent-registry";
import type { RunManifest, RunManifestStage } from "@/lib/runs/types";

export type PlaybackState = "idle" | "running" | "complete";

export type PlaybackEvent =
  | {
      at: number;
      preview: string;
      type: "scroll.arrived";
    }
  | {
      agent: AgentId;
      at: number;
      line: string;
      stage: RunManifestStage["id"];
      type: "agent.started";
    }
  | {
      agent: AgentId;
      at: number;
      line: string;
      stage: RunManifestStage["id"];
      type: "agent.log";
    }
  | {
      agent?: AgentId;
      at: number;
      line: string;
      stage: RunManifestStage["id"];
      type: "stage.completed";
    }
  | {
      at: number;
      line: string;
      score: number;
      type: "judge.completed";
      verdict: RunManifest["judgeResult"]["verdict"];
    }
  | {
      at: number;
      line: string;
      receiptUrl: string;
      type: "receipt.ready";
    };

const stageAgents: Partial<Record<RunManifestStage["id"], AgentId>> = {
  attack: "maji",
  build: "miji",
  deploy: "muji",
  judge: "meowts",
  plan: "moji",
  review: "meji"
};

const stageOffsets: Record<RunManifestStage["id"], number> = {
  attack: 6200,
  build: 3800,
  deploy: 10200,
  judge: 12400,
  moonrise: 14600,
  plan: 1400,
  review: 8400,
  scroll: 0
};

export function createPlaybackEvents(run: RunManifest): PlaybackEvent[] {
  const events: PlaybackEvent[] = [
    {
      at: 0,
      preview: `Scroll received: “${truncate(run.scrollText, 92)}”`,
      type: "scroll.arrived"
    }
  ];

  for (const stage of run.stages) {
    if (stage.id === "scroll") {
      events.push({
        at: 600,
        line: "Intent captured and Run Manifest opened.",
        stage: stage.id,
        type: "stage.completed"
      });
      continue;
    }

    if (stage.id === "moonrise") {
      events.push({
        at: stageOffsets.moonrise,
        line: `Moonrise Receipt ready for ${run.inferredName}.`,
        receiptUrl: run.receiptUrl,
        type: "receipt.ready"
      });
      continue;
    }

    const agent = stageAgents[stage.id];
    if (!agent) continue;

    const start = stageOffsets[stage.id];
    events.push({
      agent,
      at: start,
      line: startedLine(stage, run),
      stage: stage.id,
      type: "agent.started"
    });
    if (stage.id === "plan" || stage.id === "attack" || stage.id === "judge") {
      events.push({
        agent,
        at: start + 750,
        line: logLine(stage, run),
        stage: stage.id,
        type: "agent.log"
      });
    }
    events.push({
      agent,
      at: start + 1600,
      line: `${stage.label} locked.`,
      stage: stage.id,
      type: "stage.completed"
    });
  }

  events.push({
    at: 13400,
    line: `Judge complete: ${run.judgeResult.verdict}, ${run.judgeResult.score}/100.`,
    score: run.judgeResult.score,
    type: "judge.completed",
    verdict: run.judgeResult.verdict
  });

  return events.sort((a, b) => a.at - b.at);
}

function startedLine(stage: RunManifestStage, run: RunManifest) {
  if (stage.id === "plan") return `Moji is turning “${truncate(run.scrollText, 52)}” into a manifest.`;
  if (stage.id === "build") return `Miji is preparing the ${run.productType} handoff.`;
  if (stage.id === "attack") return "Maji is checking weak spots and missing requirements.";
  if (stage.id === "review") return "Meji is reviewing structure, quality, and constraints.";
  if (stage.id === "deploy") return "Muji is checking launch readiness and receipt links.";
  return "Meowts is judging the receipt trail.";
}

function logLine(stage: RunManifestStage, run: RunManifest) {
  if (stage.id === "plan") return `${run.requirements.length} requirements recorded for ${run.inferredName}.`;
  if (stage.id === "build") return `Preview brief points to ${run.generatedPreview.primaryCta}.`;
  if (stage.id === "attack") return `${run.judgeResult.improvements[0] ?? "No major blocker found."}`;
  if (stage.id === "review") return `${run.judgeResult.matched[0] ?? "Core scroll intent is represented."}`;
  if (stage.id === "deploy") return `Moonrise route staged: ${run.receiptUrl}`;
  return `${run.judgeResult.verdict} with ${run.judgeResult.score}/100 confidence.`;
}

function truncate(value: string, max: number) {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}
