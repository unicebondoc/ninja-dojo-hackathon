import { NextResponse } from "next/server";
import {
  syncMissionToNotion,
  syncProjectToNotion,
  syncReceiptToNotion
} from "@/lib/integrations/notion-sync";
import type {
  MissionMemoryEntry,
  ProjectMemoryEntry,
  ReceiptMemoryEntry
} from "@/lib/memory/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      mission?: MissionMemoryEntry;
      project?: ProjectMemoryEntry;
      receipt?: ReceiptMemoryEntry;
    };

    await Promise.all([
      body.project ? syncProjectToNotion(body.project) : undefined,
      body.mission ? syncMissionToNotion(body.mission) : undefined,
      body.receipt ? syncReceiptToNotion(body.receipt) : undefined
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.warn("[ninja-dojo:notion] sync route skipped", error);
    return NextResponse.json({ ok: true, skipped: true });
  }
}
