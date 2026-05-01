import { NextResponse } from "next/server";
import { claudeAdapter, type AgentReceipt, type MissionTask } from "@/lib/adapters";
import type { ApprovalGate } from "@/lib/memory/types";
import type { RunManifest } from "@/lib/runs/types";

type ClaudeExecuteRequest = {
  approval?: ApprovalGate;
  mission?: (Partial<RunManifest> & { approval?: ApprovalGate }) | null;
  task?: Partial<MissionTask> | null;
};

export async function POST(request: Request) {
  let body: ClaudeExecuteRequest;
  try {
    body = (await request.json()) as ClaudeExecuteRequest;
  } catch {
    return NextResponse.json(blockedReceipt("invalid-request", "Request body must be valid JSON."), {
      status: 400
    });
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
        "Claude analysis blocked. CEO approval is required before any worker can run."
      )
    );
  }

  if (!claudeAdapter.canHandle(task)) {
    return NextResponse.json(
      blockedReceipt(task.id, `Claude cannot handle ${task.department} tasks.`),
      { status: 400 }
    );
  }

  const receipt = await claudeAdapter.execute(task);
  return NextResponse.json(receipt);
}

function normalizeTask(
  task: ClaudeExecuteRequest["task"],
  mission: ClaudeExecuteRequest["mission"]
): MissionTask | null {
  if (!task?.prompt || !task.title || !task.department) return null;
  return {
    agent: "claude",
    context:
      task.context ??
      [
        mission?.scrollText ? `Scroll: ${mission.scrollText}` : undefined,
        mission?.inferredName ? `Mission: ${mission.inferredName}` : undefined,
        mission?.judgeResult
          ? `Judge: ${mission.judgeResult.verdict} (${mission.judgeResult.score}/100)`
          : undefined,
        mission?.receiptUrl ? `Receipt: ${mission.receiptUrl}` : undefined
      ]
        .filter(Boolean)
        .join("\n"),
    department: task.department,
    id: task.id ?? `claude-${mission?.runId ?? Date.now()}`,
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

function missionIdFor(mission: ClaudeExecuteRequest["mission"]) {
  if (!mission) return undefined;
  if (mission.id?.startsWith("mission-")) return mission.id;
  return mission.runId ? `mission-${mission.runId}` : mission.id;
}

function blockedReceipt(taskId: string, summary: string): AgentReceipt {
  return {
    agent: "claude",
    artifacts: [],
    exitCode: null,
    insights: [],
    logs: [summary],
    recommendations: [],
    risks: [],
    stderr: "",
    status: "blocked",
    stdout: "",
    summary,
    taskId,
    type: "analysis"
  };
}
