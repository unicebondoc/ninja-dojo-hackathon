import { NextResponse } from "next/server";
import { createLiveDojoRun } from "@/lib/run-factory";
import { demoOutput } from "@/lib/demo-output";

export const dynamic = "force-dynamic";

const headers = {
  "Cache-Control": "no-store"
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { scroll?: string };
    return NextResponse.json(createLiveDojoRun(body.scroll ?? demoOutput.scroll), {
      headers
    });
  } catch {
    return NextResponse.json(createLiveDojoRun(demoOutput.scroll), { headers });
  }
}
