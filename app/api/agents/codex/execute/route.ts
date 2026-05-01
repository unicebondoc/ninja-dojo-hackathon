import { NextResponse } from "next/server";
import { codexAdapter, type AgentReceipt, type MissionTask } from "@/lib/adapters";
import type { ApprovalGate, ExecutionAudit, ExecutionAuditStatus } from "@/lib/memory/types";
import type { RunManifest } from "@/lib/runs/types";

type CodexExecuteRequest = {
  approval?: ApprovalGate;
  confirmed?: boolean;
  dryRun?: boolean;
  mission?: (Partial<RunManifest> & { approval?: ApprovalGate }) | null;
  task?: Partial<MissionTask> | null;
};

export async function POST(request: Request) {
  let body: CodexExecuteRequest;
  try {
    body = (await request.json()) as CodexExecuteRequest;
  } catch {
    return NextResponse.json(
      blockedReceipt("invalid-request", "Request body must be valid JSON."),
      { status: 400 }
    );
  }

  const task = normalizeTask(body.task, body.mission);
  if (!task) {
    return NextResponse.json(
      blockedReceipt("invalid-task", "Missing task prompt, title, or department."),
      { status: 400 }
    );
  }

  const approval = body.approval ?? body.mission?.approval;
  const missionId = missionIdFor(body.mission);
  const approved = isApprovedForMission(approval, missionId);
  const executionPlan = createExecutionPlan(task, body.dryRun ?? false);
  const startedAt = new Date().toISOString();
  if (!isApprovedForMission(approval, missionId)) {
    const receipt = blockedReceipt(
      task.id,
      "Codex execution blocked. CEO approval is required before any worker can run."
    );
    return NextResponse.json(withAudit(receipt, task, missionId, approved, executionPlan, startedAt));
  }

  if (!body.confirmed) {
    const receipt = blockedReceipt(
      task.id,
      "Codex execution blocked. Preview confirmation is required before execution."
    );
    return NextResponse.json(withAudit(receipt, task, missionId, approved, executionPlan, startedAt));
  }

  const unsafeReason = unsafeInstruction(task);
  if (unsafeReason) {
    const receipt = blockedReceipt(task.id, unsafeReason);
    return NextResponse.json(withAudit(receipt, task, missionId, approved, executionPlan, startedAt));
  }

  if (!codexAdapter.canHandle(task)) {
    const receipt = blockedReceipt(task.id, `Codex cannot handle ${task.department} tasks.`);
    return NextResponse.json(
      withAudit(receipt, task, missionId, approved, executionPlan, startedAt),
      { status: 400 }
    );
  }

  if (body.dryRun) {
    const receipt = dryRunReceipt(task);
    return NextResponse.json(withAudit(receipt, task, missionId, approved, executionPlan, startedAt));
  }

  const receipt = await codexAdapter.execute(task);
  return NextResponse.json(withAudit(receipt, task, missionId, approved, executionPlan, startedAt));
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
  return match
    ? `Codex execution blocked. Task includes a forbidden operation: ${match}.`
    : "";
}

function normalizeTask(
  task: CodexExecuteRequest["task"],
  mission: CodexExecuteRequest["mission"]
): MissionTask | null {
  if (!task?.prompt || !task.title || !task.department) return null;
  return {
    agent: "codex",
    context:
      task.context ??
      [
        mission?.scrollText ? `Scroll: ${mission.scrollText}` : undefined,
        mission?.inferredName ? `Mission: ${mission.inferredName}` : undefined,
        mission?.receiptUrl ? `Receipt: ${mission.receiptUrl}` : undefined
      ]
        .filter(Boolean)
        .join("\n"),
    department: task.department,
    id: task.id ?? `codex-${mission?.runId ?? Date.now()}`,
    prompt: task.prompt,
    runId: task.runId ?? mission?.runId,
    title: task.title
  };
}

function isApprovedForMission(approval: ApprovalGate | undefined, missionId: string | undefined) {
  if (!approval || approval.status !== "approved") return false;
  if (!missionId) return true;
  return approval.missionId === missionId;
}

function missionIdFor(mission: CodexExecuteRequest["mission"]) {
  if (!mission) return undefined;
  if (mission.id?.startsWith("mission-")) return mission.id;
  return mission.runId ? `mission-${mission.runId}` : mission.id;
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
  const stdout = [
    `Dry run accepted for ${task.id}.`,
    `Department: ${task.department}`,
    "No codex exec process was launched.",
    "No files were modified."
  ].join("\n");
  return {
    agent: "codex",
    artifacts: [],
    exitCode: 0,
    logs: stdout.split("\n"),
    stderr: "",
    status: "dry-run",
    stdout,
    summary: "Dry run complete. Codex execution was simulated.",
    taskId: task.id
  };
}

function withAudit(
  receipt: AgentReceipt,
  task: MissionTask,
  missionId: string | undefined,
  approved: boolean,
  executionPlan: string[],
  startedAt: string
) {
  const completedAt = new Date().toISOString();
  const audit: ExecutionAudit = {
    approved,
    completedAt,
    exitCode: receipt.exitCode ?? null,
    filesChanged: receipt.artifacts,
    id: `audit-${task.id}-${Date.now()}`,
    missionId: missionId ?? task.runId ?? "unknown-mission",
    startedAt,
    status: auditStatusFor(receipt.status),
    stderr: receipt.stderr ?? "",
    stdout: receipt.stdout ?? "",
    task
  };

  return {
    ...receipt,
    audit,
    executionPlan
  };
}

function auditStatusFor(status: string): ExecutionAuditStatus {
  if (status === "complete") return "complete";
  if (status === "dry-run") return "dry-run";
  if (status === "failed") return "failed";
  return "blocked";
}

function createExecutionPlan(task: MissionTask, dryRun: boolean) {
  const areas = inferAreas(task);
  return [
    `Validate CEO approval for ${task.id}.`,
    dryRun ? "Run in dry-run mode; skip codex exec." : "Launch guarded codex exec with a scoped prompt.",
    `Review task scope: ${task.title}.`,
    `Focus expected areas: ${areas.join(", ")}.`,
    "Capture stdout, stderr, exit code, and changed files.",
    "Return an AgentReceipt and ExecutionAudit without committing, pushing, or deploying."
  ];
}

function inferAreas(task: MissionTask) {
  const text = `${task.title} ${task.prompt}`.toLowerCase();
  const areas = [
    text.includes("ui") || text.includes("layout") ? "frontend" : undefined,
    text.includes("api") || text.includes("route") ? "api routes" : undefined,
    text.includes("memory") || text.includes("storage") ? "local memory" : undefined,
    text.includes("test") || text.includes("build") ? "validation" : undefined,
    task.department
  ].filter(Boolean) as string[];
  return Array.from(new Set(areas));
}
