export type DiscordCommandMission = {
  approvalStatus?: "approved" | "pending" | "rejected";
  missionId: string;
  missionName?: string;
  receiptUrl?: string;
  runId?: string;
  status?: string;
  updatedAt: string;
};

type DiscordCommandState = {
  missions: Map<string, DiscordCommandMission>;
};

const globalState = globalThis as typeof globalThis & {
  __ninjaDojoDiscordCommandState?: DiscordCommandState;
};

const state =
  globalState.__ninjaDojoDiscordCommandState ??
  (globalState.__ninjaDojoDiscordCommandState = {
    missions: new Map<string, DiscordCommandMission>()
  });

export function listDiscordCommandMissions() {
  return Array.from(state.missions.values()).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt)
  );
}

export function getDiscordCommandMission(missionId: string) {
  return state.missions.get(missionId);
}

export function registerDiscordCommandMission(
  mission: Partial<DiscordCommandMission> & { missionId: string }
) {
  const existing = state.missions.get(mission.missionId);
  const next: DiscordCommandMission = {
    ...existing,
    ...mission,
    missionId: mission.missionId,
    updatedAt: new Date().toISOString()
  };
  state.missions.set(next.missionId, next);
  return next;
}

export function approveDiscordCommandMission(missionId: string) {
  return registerDiscordCommandMission({
    approvalStatus: "approved",
    missionId,
    status: "approved"
  });
}

export function rejectDiscordCommandMission(missionId: string) {
  return registerDiscordCommandMission({
    approvalStatus: "rejected",
    missionId,
    status: "rejected"
  });
}
