import { runSteps, type RunStage } from "@/game/run/RunStateMachine";
import {
  generatePreview,
  inferProductType,
  inferRequirements,
  sanitizePrompt
} from "@/lib/runs/generatePreview";
import { judgeRun } from "@/lib/runs/judgeRun";
import type {
  RunManifest,
  RunManifestStage,
  RunManifestStatus,
  RunStageStatus
} from "@/lib/runs/types";

type CreateRunManifestOptions = {
  createdAt?: string;
  runId?: string;
  status?: RunManifestStatus;
};

const stageLabels: Record<RunManifestStage["id"], string> = {
  attack: "Attack",
  build: "Build",
  deploy: "Deploy",
  judge: "Judge",
  moonrise: "Moonrise",
  plan: "Plan",
  review: "Review",
  scroll: "Scroll"
};

const ninjaByStage: Record<RunManifestStage["id"], RunManifestStage["ninja"]> = {
  attack: "Maji",
  build: "Miji",
  deploy: "Muji",
  judge: "Meowts",
  moonrise: "Dojo",
  plan: "Moji",
  review: "Meji",
  scroll: "Dojo"
};

const roleByStage: Record<RunManifestStage["id"], string> = {
  attack: "Attack",
  build: "Build",
  deploy: "Deploy",
  judge: "Judge",
  moonrise: "Result",
  plan: "Plan",
  review: "Review",
  scroll: "Intake"
};

export function createRunManifest(
  scrollText: string,
  options: CreateRunManifestOptions = {}
): RunManifest {
  const cleanScroll = sanitizePrompt(scrollText);
  const createdAt = options.createdAt ?? new Date().toISOString();
  const runId = options.runId ?? makeRunId(createdAt);
  const status = options.status ?? "running";
  const generatedPreview = generatePreview(cleanScroll);
  const judgeResult = judgeRun(cleanScroll, generatedPreview);

  return {
    createdAt,
    generatedPreview,
    inferredName: generatedPreview.brandName,
    judgeResult,
    moonriseUrl: moonriseUrlFor(cleanScroll, runId),
    productType: inferProductType(cleanScroll.toLowerCase()),
    requirements: inferRequirements(cleanScroll),
    runId,
    scrollText: cleanScroll,
    stages: createStages(status),
    status
  };
}

export function completeRunManifest(run: RunManifest): RunManifest {
  return {
    ...run,
    judgeResult: judgeRun(run.scrollText, run.generatedPreview),
    stages: createStages("shipped"),
    status: "shipped"
  };
}

export function moonriseUrlFor(scrollText: string, runId: string) {
  const params = new URLSearchParams({
    run: runId,
    scroll: scrollText
  });
  return `/moonrise?${params.toString()}`;
}

function createStages(status: RunManifestStatus): RunManifestStage[] {
  const ids: RunManifestStage["id"][] = [
    "scroll",
    "plan",
    "build",
    "attack",
    "review",
    "deploy",
    "judge",
    "moonrise"
  ];

  return ids.map((id) => ({
    id,
    label: stageLabels[id],
    ninja: ninjaByStage[id],
    role: roleByStage[id],
    status: stageStatusFor(id, status),
    summary: stageSummary(id)
  }));
}

function stageStatusFor(id: RunManifestStage["id"], status: RunManifestStatus): RunStageStatus {
  if (status === "failed") return id === "moonrise" ? "failed" : "complete";
  if (status === "shipped") return "complete";
  if (status === "running") return id === "scroll" ? "complete" : "queued";
  return "queued";
}

function stageSummary(id: RunManifestStage["id"]) {
  if (id === "scroll") return "Scroll captured and converted into a run manifest.";
  if (id === "moonrise") return "Preview URL and run brief are ready after judgment.";

  const step = runSteps.find((item) => item.stage === (id as RunStage));
  return step?.message.replace(/\.\.\.$/, ".") ?? "Stage queued.";
}

function makeRunId(createdAt: string) {
  const stamp = createdAt
    .replaceAll("-", "")
    .replaceAll(":", "")
    .replaceAll(".", "")
    .slice(0, 15);
  const suffix =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 6)
      : Math.random().toString(36).slice(2, 8);
  return `dojo-${stamp}-${suffix}`;
}
