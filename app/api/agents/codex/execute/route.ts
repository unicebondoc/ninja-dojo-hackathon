import { NextResponse } from "next/server";
import { codexAdapter, type AgentReceipt, type MissionTask } from "@/lib/adapters";
import type { ApprovalGate } from "@/lib/memory/types";
import type { RunManifest } from "@/lib/runs/types";

type CodexExecuteRequest = {
  approval?: ApprovalGate;
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
  if (!isApprovedForMission(approval, missionId)) {
    return NextResponse.json(
      blockedReceipt(
        task.id,
        "Codex execution blocked. CEO approval is required before any worker can run."
      )
    );
  }

  const unsafeReason = unsafeInstruction(task);
  if (unsafeReason) {
    return NextResponse.json(blockedReceipt(task.id, unsafeReason));
  }

  if (!codexAdapter.canHandle(task)) {
    return NextResponse.json(
      blockedReceipt(task.id, `Codex cannot handle ${task.department} tasks.`),
      { status: 400 }
    );
  }

  const receipt = await codexAdapter.execute(task);
  return NextResponse.json(receipt);
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
    logs: [summary],
    status: "blocked",
    summary,
    taskId
  };
}
