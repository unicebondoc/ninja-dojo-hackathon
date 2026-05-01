import { claudeAdapter, codexAdapter, type AgentReceipt, type MissionTask } from "@/lib/adapters";
import type { ApprovalGate } from "@/lib/memory/types";
import type { RunManifest } from "@/lib/runs/types";

export type MissionOrchestratorOptions = {
  approval?: ApprovalGate;
  dryRun?: boolean;
};

export type MissionOrchestratorStep = {
  id: "build" | "judge" | "plan" | "review";
  label: string;
  receipt: AgentReceipt;
  status: string;
};

export type MissionOrchestratorResult = {
  missionId: string;
  receipts: AgentReceipt[];
  steps: MissionOrchestratorStep[];
  status: "blocked" | "complete" | "needs-review";
  summary: string;
};

export class MissionOrchestrator {
  static async run(
    mission: RunManifest,
    options: MissionOrchestratorOptions = {}
  ): Promise<MissionOrchestratorResult> {
    const missionId = missionIdFor(mission);
    const steps: MissionOrchestratorStep[] = [];

    const plan = await claudeAdapter.execute(createPlanTask(mission));
    steps.push(step("plan", "Claude plan", plan));

    const build = await runCodexBuild(mission, options);
    steps.push(step("build", "Codex build", build));

    const review = await claudeAdapter.execute(createReviewTask(mission, build));
    steps.push(step("review", "Claude review", review));

    const judge = createMeowtsReceipt(mission, steps);
    steps.push(step("judge", "Meowts judge", judge));

    const receipts = steps.map((item) => item.receipt);
    const blocked = receipts.some((receipt) => receipt.status === "blocked");
    const failed = receipts.some((receipt) => receipt.status === "failed");

    return {
      missionId,
      receipts,
      steps,
      status: blocked ? "blocked" : failed ? "needs-review" : "complete",
      summary: blocked
        ? "Mission stopped at an approval or safety gate."
        : failed
          ? "Mission completed with review issues."
          : "Mission flow completed across Claude, Codex, Claude, and Meowts."
    };
  }
}

function step(
  id: MissionOrchestratorStep["id"],
  label: string,
  receipt: AgentReceipt
): MissionOrchestratorStep {
  return {
    id,
    label,
    receipt,
    status: receipt.status
  };
}

async function runCodexBuild(mission: RunManifest, options: MissionOrchestratorOptions) {
  const approval = options.approval;
  const task = createBuildTask(mission);
  if (!approval || approval.status !== "approved" || approval.missionId !== missionIdFor(mission)) {
    return blockedReceipt(
      task.id,
      "Codex build blocked. CEO approval is required before the build step can run."
    );
  }

  const unsafeReason = unsafeInstruction(task);
  if (unsafeReason) return blockedReceipt(task.id, unsafeReason);

  if (options.dryRun ?? true) {
    return dryRunReceipt(task);
  }

  return codexAdapter.execute(task);
}

function createPlanTask(mission: RunManifest): MissionTask {
  return {
    agent: "claude",
    context: missionContext(mission),
    department: "strategist",
    id: `orchestrator-plan-${mission.runId}`,
    prompt: [
      `Plan the mission for ${mission.inferredName}.`,
      `Original scroll: ${mission.scrollText}`,
      "Return implementation shape, risks, and handoff notes."
    ].join("\n"),
    runId: mission.runId,
    title: `Plan mission for ${mission.inferredName}`
  };
}

function createBuildTask(mission: RunManifest): MissionTask {
  return {
    agent: "codex",
    context: missionContext(mission),
    department: "builder",
    id: `orchestrator-build-${mission.runId}`,
    prompt: [
      `Perform the approved build pass for ${mission.inferredName}.`,
      `Original scroll: ${mission.scrollText}`,
      "Do not commit, push, deploy, or touch secrets."
    ].join("\n"),
    runId: mission.runId,
    title: `Build mission for ${mission.inferredName}`
  };
}

function createReviewTask(mission: RunManifest, build: AgentReceipt): MissionTask {
  return {
    agent: "claude",
    context: [missionContext(mission), `Codex receipt: ${build.summary}`].join("\n"),
    department: "auditor",
    id: `orchestrator-review-${mission.runId}`,
    prompt: [
      `Review the build receipt for ${mission.inferredName}.`,
      "Focus on whether the output matches the scroll and remains safe.",
      `Codex status: ${build.status}.`
    ].join("\n"),
    runId: mission.runId,
    title: `Review mission for ${mission.inferredName}`
  };
}

function createMeowtsReceipt(
  mission: RunManifest,
  steps: MissionOrchestratorStep[]
): AgentReceipt {
  const blocked = steps.some((item) => item.receipt.status === "blocked");
  const failed = steps.some((item) => item.receipt.status === "failed");
  const status = blocked ? "blocked" : failed ? "needs-review" : "complete";
  const summary =
    status === "complete"
      ? `Meowts judges ${mission.inferredName} ready for receipt review.`
      : status === "blocked"
        ? "Meowts blocked the mission because a required gate stopped execution."
        : "Meowts found review issues before receipt promotion.";

  return {
    agent: "meowts",
    artifacts: steps.flatMap((item) => item.receipt.artifacts),
    exitCode: null,
    logs: steps.map((item) => `${item.label}: ${item.receipt.status}`),
    recommendations: [
      status === "complete"
        ? "Promote this mission into the Moonrise Receipt."
        : "Resolve blocked or failed worker receipts before scaling execution."
    ],
    risks: blocked ? ["Codex build did not run because approval was missing or invalid."] : [],
    status,
    summary,
    taskId: `orchestrator-judge-${mission.runId}`,
    type: "review"
  };
}

function missionContext(mission: RunManifest) {
  return [
    `Run: ${mission.runId}`,
    `Mission: ${mission.inferredName}`,
    `Scroll: ${mission.scrollText}`,
    `Product type: ${mission.productType}`,
    `Requirements: ${mission.requirements.join("; ")}`,
    `Receipt: ${mission.receiptUrl || mission.moonriseUrl}`,
    `Judge: ${mission.judgeResult.verdict} (${mission.judgeResult.score}/100)`
  ].join("\n");
}

function missionIdFor(mission: RunManifest) {
  return `mission-${mission.runId}`;
}

function blockedReceipt(taskId: string, summary: string): AgentReceipt {
  return {
    agent: "codex",
    artifacts: [],
    exitCode: null,
    logs: [summary],
    stderr: "",
    status: "blocked",
    stdout: "",
    summary,
    taskId
  };
}

function dryRunReceipt(task: MissionTask): AgentReceipt {
  return {
    agent: "codex",
    artifacts: [],
    exitCode: 0,
    logs: [
      `Dry-run build accepted for ${task.id}.`,
      "No codex exec process was launched.",
      "No files were modified."
    ],
    stderr: "",
    status: "dry-run",
    stdout: `Dry-run build accepted for ${task.id}.`,
    summary: "Dry-run build step completed inside the orchestrated mission.",
    taskId: task.id
  };
}

function unsafeInstruction(task: MissionTask) {
  const prompt = `${task.title}\n${task.context ?? ""}\n${task.prompt}`.toLowerCase();
  const blocked = [
    "rm -rf",
    "git commit",
    "git push",
    "git reset --hard",
    "git checkout --",
    "vercel deploy",
    "npm publish",
    "pnpm publish",
    "yarn publish",
    "gh release",
    "delete .env",
    "print .env",
    "cat .env"
  ];
  const match = blocked.find((term) => prompt.includes(term));
  return match ? `Codex build blocked. Forbidden operation requested: ${match}.` : "";
}
