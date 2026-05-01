import { NextResponse } from "next/server";
import { MissionOrchestrator } from "@/lib/orchestrator/mission-orchestrator";
import type { ApprovalGate } from "@/lib/memory/types";
import type { RunManifest } from "@/lib/runs/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type OrchestratorRunRequest = {
  approval?: ApprovalGate;
  dryRun?: boolean;
  mission?: RunManifest | null;
};

export async function POST(request: Request) {
  let body: OrchestratorRunRequest;
  try {
    body = (await request.json()) as OrchestratorRunRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  if (!body.mission?.runId || !body.mission.scrollText) {
    return NextResponse.json({ error: "mission is required" }, { status: 400 });
  }

  const result = await MissionOrchestrator.run(body.mission, {
    approval: body.approval,
    dryRun: body.dryRun ?? true
  });

  return NextResponse.json(result);
}
