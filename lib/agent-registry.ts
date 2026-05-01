export type AgentStatus = "idle" | "working" | "waiting" | "stuck";

export type AgentId = "moji" | "miji" | "maji" | "meji" | "muji" | "meowts";

export type AgentDefinition = {
  id: AgentId;
  name: string;
  role: string;
  room: "NW" | "N" | "NE" | "SW" | "S" | "SE";
  shortLine: string;
};

export const agentRegistry: AgentDefinition[] = [
  {
    id: "moji",
    name: "Moji",
    role: "planner / manifest",
    room: "NW",
    shortLine: "Manifest route mapped."
  },
  {
    id: "miji",
    name: "Miji",
    role: "builder / handoff",
    room: "N",
    shortLine: "Build handoff warming."
  },
  {
    id: "maji",
    name: "Maji",
    role: "attacker / weak spots",
    room: "NE",
    shortLine: "Weak spots marked."
  },
  {
    id: "meji",
    name: "Meji",
    role: "reviewer / quality",
    room: "SW",
    shortLine: "Quality gate watching."
  },
  {
    id: "muji",
    name: "Muji",
    role: "deploy readiness",
    room: "S",
    shortLine: "Deploy path checked."
  },
  {
    id: "meowts",
    name: "Meowts",
    role: "judge / receipt",
    room: "SE",
    shortLine: "Receipt judgment pending."
  }
];

export const agentById = Object.fromEntries(
  agentRegistry.map((agent) => [agent.id, agent])
) as Record<AgentId, AgentDefinition>;
