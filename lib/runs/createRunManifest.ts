import { runSteps, type RunStage } from "@/game/run/RunStateMachine";
import {
  generatePreview,
  inferProductType,
  inferRequirements,
  sanitizePrompt
} from "@/lib/runs/generatePreview";
import { judgeRun } from "@/lib/runs/judgeRun";
import type {
  RunDepartment,
  RunManifest,
  RunManifestAgent,
  RunManifestLog,
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

const departmentByStage: Record<RunManifestStage["id"], RunDepartment> = {
  attack: "researcher",
  build: "builder",
  deploy: "marketer",
  judge: "meowts",
  moonrise: "creator",
  plan: "strategist",
  review: "auditor",
  scroll: "scribe"
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
  const receiptUrl = moonriseUrlFor(cleanScroll, runId);
  const stages = createStages(status);

  return {
    agents: createAgents(),
    createdAt,
    generatedPreview,
    id: runId,
    inferredName: generatedPreview.brandName,
    judgeResult,
    logs: createInitialLogs(runId, createdAt, cleanScroll),
    moonriseUrl: receiptUrl,
    productType: inferProductType(cleanScroll.toLowerCase()),
    receiptUrl,
    requirements: inferRequirements(cleanScroll),
    runId,
    scrollText: cleanScroll,
    stages,
    status
  };
}

export function completeRunManifest(run: RunManifest): RunManifest {
  return {
    ...run,
    judgeResult: judgeRun(run.scrollText, run.generatedPreview),
    logs: [
      ...run.logs,
      {
        at: new Date().toISOString(),
        department: "meowts",
        id: `${run.runId}-receipt-ready`,
        message: `Moonrise Receipt ready for ${run.inferredName}.`,
        stage: "moonrise"
      }
    ],
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
    department: departmentByStage[id],
    id,
    label: stageLabels[id],
    ninja: ninjaByStage[id],
    role: roleByStage[id],
    status: stageStatusFor(id, status),
    summary: stageSummary(id)
  }));
}

function createAgents(): RunManifestAgent[] {
  return [
    {
      department: "scribe",
      id: "dojo",
      name: "Dojo",
      role: "Scroll intake",
      summary: "Captures intent and starts the mission trail."
    },
    {
      department: "strategist",
      id: "moji",
      name: "Moji",
      role: "Plan",
      summary: "Turns the scroll into a mission manifest."
    },
    {
      department: "builder",
      id: "miji",
      name: "Miji",
      role: "Build",
      summary: "Packages the build handoff."
    },
    {
      department: "researcher",
      id: "maji",
      name: "Maji",
      role: "Attack",
      summary: "Checks weak spots before the receipt is trusted."
    },
    {
      department: "auditor",
      id: "meji",
      name: "Meji",
      role: "Review",
      summary: "Reviews quality, structure, and constraints."
    },
    {
      department: "marketer",
      id: "muji",
      name: "Muji",
      role: "Deploy",
      summary: "Checks launch readiness and conversion path."
    },
    {
      department: "meowts",
      id: "meowts",
      name: "Meowts",
      role: "Judge",
      summary: "Scores the receipt and calls Moonrise."
    },
    {
      department: "creator",
      id: "moonrise",
      name: "Dojo",
      role: "Moonrise",
      summary: "Produces the final Moonrise Receipt."
    }
  ];
}

function createInitialLogs(runId: string, createdAt: string, scrollText: string): RunManifestLog[] {
  return [
    {
      at: createdAt,
      department: "scribe",
      id: `${runId}-scroll`,
      message: `Scroll captured: ${scrollText}`,
      stage: "scroll"
    }
  ];
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
