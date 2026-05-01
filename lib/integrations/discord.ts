export type DiscordMissionEvent =
  | "approval.approved"
  | "approval.rejected"
  | "approval.requested"
  | "mission.failed"
  | "mission.needs_approval"
  | "mission.receipt_ready"
  | "mission.stage_changed"
  | "mission.started";

export type DiscordMissionPayload = {
  approvalId?: string;
  missionName?: string;
  missionId?: string;
  notes?: string;
  receiptUrl?: string;
  runId?: string;
  stage?: string;
  status?: string;
  summary?: string;
};

type DiscordConfig = {
  webhookUrl?: string;
};

const discordConfig: DiscordConfig = {};

export function configureDiscordIntegration(config: DiscordConfig) {
  discordConfig.webhookUrl = config.webhookUrl;
}

export async function sendDiscordMessage(
  event: DiscordMissionEvent,
  payload: DiscordMissionPayload
) {
  const content = formatDiscordMessage(event, payload);

  if (!discordConfig.webhookUrl) {
    console.log("[ninja-dojo:discord]", content);
    return { mode: "console" as const, ok: true };
  }

  try {
    const response = await fetch(discordConfig.webhookUrl, {
      body: JSON.stringify({ content }),
      headers: { "Content-Type": "application/json" },
      method: "POST"
    });

    return { mode: "webhook" as const, ok: response.ok };
  } catch (error) {
    console.warn("[ninja-dojo:discord] signal failed", error);
    return { mode: "webhook" as const, ok: false };
  }
}

function formatDiscordMessage(event: DiscordMissionEvent, payload: DiscordMissionPayload) {
  return [
    `Ninja Dojo signal: ${event}`,
    payload.missionName ? `Mission: ${payload.missionName}` : undefined,
    payload.stage ? `Stage: ${payload.stage}` : undefined,
    payload.status ? `Status: ${payload.status}` : undefined,
    payload.missionId ? `Mission ID: ${payload.missionId}` : undefined,
    payload.approvalId ? `Approval: ${payload.approvalId}` : undefined,
    payload.receiptUrl ? `Receipt: ${payload.receiptUrl}` : undefined,
    payload.notes ? `Notes: ${payload.notes}` : undefined,
    payload.summary ? `Summary: ${payload.summary}` : undefined,
    payload.runId ? `Run: ${payload.runId}` : undefined
  ]
    .filter(Boolean)
    .join(" | ");
}
