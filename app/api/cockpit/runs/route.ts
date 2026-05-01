import { NextResponse } from "next/server";
import { createRunManifest } from "@/lib/runs/createRunManifest";

export const dynamic = "force-dynamic";

const headers = {
  "Cache-Control": "no-store"
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { scrollText?: unknown };
    const scrollText = typeof body.scrollText === "string" ? body.scrollText.trim() : "";

    if (!scrollText) {
      return NextResponse.json(
        { error: "scrollText is required" },
        { headers, status: 400 }
      );
    }

    return NextResponse.json({ run: createRunManifest(scrollText) }, { headers });
  } catch {
    return NextResponse.json(
      { error: "Invalid scroll payload" },
      { headers, status: 400 }
    );
  }
}
