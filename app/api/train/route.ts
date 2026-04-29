import { NextResponse } from "next/server";
import { demoOutput } from "@/lib/demo-output";

export async function GET() {
  return NextResponse.json(demoOutput, {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
}
