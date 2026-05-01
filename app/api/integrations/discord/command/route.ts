import { NextResponse } from "next/server";
import { dispatchMissionEvent } from "@/lib/events/mission-events";
import {
  approveDiscordCommandMission,
  getDiscordCommandMission,
  listDiscordCommandMissions,
  registerDiscordCommandMission,
  rejectDiscordCommandMission
} from "@/lib/integrations/discord-command-store";
import type { RunManifest } from "@/lib/runs/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type DiscordCommandBody = {
  command?: string;
  data?: {
    name?: string;
    options?: Array<{
      name: string;
      value?: string;
    }>;
  };
  mission?: Partial<RunManifest> | null;
  missionId?: string;
  receiptUrl?: string;
  text?: string;
  token?: string;
};

type ParsedCommand = {
  action: "approve" | "receipt" | "reject" | "status";
  missionId?: string;
};

export async function POST(request: Request) {
  let body: DiscordCommandBody;
  try {
    body = (await request.json()) as DiscordCommandBody;
  } catch {
    return commandResponse("Invalid JSON payload.", 400);
  }

  const auth = authorize(request, body);
  if (!auth.ok) {
    return commandResponse(auth.message, auth.status);
  }

  registerMissionFromPayload(body);
  const command = parseCommand(body);
  if (!command) {
    return commandResponse(
      "Unknown command. Use /dojo status, /dojo approve <missionId>, /dojo reject <missionId>, or /dojo receipt <missionId>.",
      400
    );
  }

  if (command.action === "status") {
    return commandResponse(statusText(command.missionId));
  }

  if (!command.missionId) {
    return commandResponse(`Mission ID required for ${command.action}.`, 400);
  }

  if (command.action === "approve") {
    const mission = approveDiscordCommandMission(command.missionId);
    dispatchMissionEvent("approval.approved", {
      missionId: command.missionId,
      missionName: mission.missionName,
      notes: "Approved from Discord command route.",
      receiptUrl: mission.receiptUrl,
      runId: mission.runId,
      status: "approved",
      summary: "CEO approved mission from Discord."
    });
    return commandResponse(`Approved ${command.missionId}. Future execution is unblocked.`);
  }

  if (command.action === "reject") {
    const mission = rejectDiscordCommandMission(command.missionId);
    dispatchMissionEvent("approval.rejected", {
      missionId: command.missionId,
      missionName: mission.missionName,
      notes: "Rejected from Discord command route.",
      receiptUrl: mission.receiptUrl,
      runId: mission.runId,
      status: "rejected",
      summary: "CEO rejected mission from Discord."
    });
    return commandResponse(`Rejected ${command.missionId}. Future execution remains blocked.`);
  }

  return commandResponse(receiptText(command.missionId));
}

function authorize(request: Request, body: DiscordCommandBody) {
  const expected =
    process.env.DISCORD_COMMAND_TOKEN ?? process.env.NINJA_DOJO_DISCORD_COMMAND_TOKEN;
  if (!expected) {
    return {
      message: "Discord command route is not configured.",
      ok: false,
      status: 503
    };
  }

  const authorization = request.headers.get("authorization") ?? "";
  const bearer = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  const headerToken =
    request.headers.get("x-ninja-dojo-discord-token") ??
    request.headers.get("x-discord-command-token") ??
    "";
  const provided = bearer || headerToken || body.token || "";

  if (provided !== expected) {
    return {
      message: "Unauthorized Discord command.",
      ok: false,
      status: 401
    };
  }

  return { message: "ok", ok: true, status: 200 };
}

function parseCommand(body: DiscordCommandBody): ParsedCommand | null {
  const fromDiscord = parseDiscordOptions(body);
  if (fromDiscord) return fromDiscord;

  const raw = (body.command ?? body.text ?? "").trim();
  const parts = raw.split(/\s+/).filter(Boolean);
  if (parts[0] === "/dojo") parts.shift();
  if (parts[0] === "dojo") parts.shift();

  const action = parts[0];
  if (!isAction(action)) return null;
  return {
    action,
    missionId: body.missionId ?? parts[1]
  };
}

function parseDiscordOptions(body: DiscordCommandBody): ParsedCommand | null {
  if (body.data?.name !== "dojo") return null;
  const subcommand = body.data.options?.[0];
  if (!subcommand || !isAction(subcommand.name)) return null;
  const missionId =
    body.missionId ??
    body.data.options?.find((option) => option.name === "missionId" || option.name === "mission")
      ?.value;
  return {
    action: subcommand.name,
    missionId
  };
}

function isAction(value: string | undefined): value is ParsedCommand["action"] {
  return value === "approve" || value === "receipt" || value === "reject" || value === "status";
}

function registerMissionFromPayload(body: DiscordCommandBody) {
  const missionId = missionIdFromPayload(body);
  if (!missionId) return;
  registerDiscordCommandMission({
    missionId,
    missionName: body.mission?.inferredName,
    receiptUrl: body.receiptUrl ?? body.mission?.receiptUrl ?? body.mission?.moonriseUrl,
    runId: body.mission?.runId,
    status: body.mission?.status
  });
}

function missionIdFromPayload(body: DiscordCommandBody) {
  if (body.missionId) return body.missionId;
  if (body.mission?.id?.startsWith("mission-")) return body.mission.id;
  if (body.mission?.runId) return `mission-${body.mission.runId}`;
  return undefined;
}

function statusText(missionId?: string) {
  if (missionId) {
    const mission = getDiscordCommandMission(missionId);
    if (!mission) return `No command-visible mission found for ${missionId}.`;
    return formatMissionStatus(mission);
  }

  const missions = listDiscordCommandMissions().slice(0, 5);
  if (!missions.length) return "No command-visible missions registered yet.";
  return missions.map(formatMissionStatus).join("\n");
}

function receiptText(missionId: string) {
  const mission = getDiscordCommandMission(missionId);
  if (!mission) return `No command-visible mission found for ${missionId}.`;
  if (!mission.receiptUrl) return `No receipt URL registered for ${missionId}.`;
  return `Moonrise Receipt for ${missionId}: ${mission.receiptUrl}`;
}

function formatMissionStatus(mission: {
  approvalStatus?: string;
  missionId: string;
  missionName?: string;
  receiptUrl?: string;
  status?: string;
}) {
  return [
    mission.missionName ? `${mission.missionName}` : mission.missionId,
    `missionId=${mission.missionId}`,
    `status=${mission.status ?? "unknown"}`,
    `approval=${mission.approvalStatus ?? "pending"}`,
    mission.receiptUrl ? `receipt=${mission.receiptUrl}` : undefined
  ]
    .filter(Boolean)
    .join(" | ");
}

function commandResponse(content: string, status = 200) {
  return NextResponse.json(
    {
      data: {
        content
      },
      text: content,
      type: 4
    },
    { status }
  );
}
