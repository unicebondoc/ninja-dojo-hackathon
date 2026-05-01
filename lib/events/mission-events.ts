import {
  sendDiscordMessage,
  type DiscordMissionPayload
} from "@/lib/integrations/discord";

export type MissionLifecycleEvent =
  | "approval.approved"
  | "approval.rejected"
  | "approval.requested"
  | "mission.failed"
  | "mission.needs_approval"
  | "mission.receipt_ready"
  | "mission.stage_changed"
  | "mission.started";

export type MissionEventPayload = DiscordMissionPayload & {
  emittedAt?: string;
};

export type MissionEventRecord = {
  event: MissionLifecycleEvent;
  payload: MissionEventPayload;
};

type MissionEventListener = (record: MissionEventRecord) => void;

const listeners = new Set<MissionEventListener>();

export function subscribeMissionEvents(listener: MissionEventListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function dispatchMissionEvent(
  event: MissionLifecycleEvent,
  payload: MissionEventPayload
) {
  const record = {
    event,
    payload: {
      ...payload,
      emittedAt: payload.emittedAt ?? new Date().toISOString()
    }
  };

  listeners.forEach((listener) => listener(record));
  void sendDiscordMessage(event, record.payload);

  return record;
}
