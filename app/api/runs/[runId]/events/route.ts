import { createLiveDojoEvents, createLiveDojoRun } from "@/lib/run-factory";
import { demoOutput } from "@/lib/demo-output";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    runId: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { runId } = await context.params;
  const url = new URL(request.url);
  const scroll = url.searchParams.get("scroll") ?? demoOutput.scroll;
  const run = createLiveDojoRun(scroll, runId);
  const events = createLiveDojoEvents(run);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let previousAt = 0;

      for (const event of events) {
        const delay = event.at - previousAt;
        previousAt = event.at;

        if (delay > 0) {
          await sleep(delay);
        }

        if (request.signal.aborted) {
          controller.close();
          return;
        }

        controller.enqueue(
          encoder.encode(`event: dojo\ndata: ${JSON.stringify(event)}\n\n`)
        );
      }

      controller.enqueue(encoder.encode("event: done\ndata: {}\n\n"));
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "Content-Type": "text/event-stream",
      "X-Accel-Buffering": "no"
    }
  });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
