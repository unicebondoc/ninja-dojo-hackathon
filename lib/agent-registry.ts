import type { RunManifestStage } from "@/lib/runs/types";

export type AgentStatus = "complete" | "idle" | "working" | "waiting" | "stuck";

export type AgentId = "moji" | "miji" | "maji" | "meji" | "muji" | "meowts";

export type DojoZoneId =
  | "archive"
  | "build"
  | "content"
  | "marketing"
  | "mission-center"
  | "strategy";

export type DojoZone = {
  id: DojoZoneId;
  label: string;
  purpose: string;
  x: number;
  y: number;
};

export type AgentDefinition = {
  homeZone: DojoZoneId;
  id: AgentId;
  labelSide: "left" | "right" | "top" | "bottom";
  mapX: number;
  mapY: number;
  name: string;
  role: string;
  room: "NW" | "N" | "NE" | "SW" | "S" | "SE";
  shortLine: string;
  specialist?: boolean;
  spriteSrc: string;
};

export const dojoZones: DojoZone[] = [
  {
    id: "mission-center",
    label: "Mission Center",
    purpose: "scroll + receipt",
    x: 50,
    y: 56
  },
  {
    id: "strategy",
    label: "Strategy",
    purpose: "manifest + review",
    x: 31,
    y: 43
  },
  {
    id: "build",
    label: "Build",
    purpose: "handoff forge",
    x: 44,
    y: 65
  },
  {
    id: "content",
    label: "Content",
    purpose: "attack + research",
    x: 66,
    y: 44
  },
  {
    id: "marketing",
    label: "Marketing",
    purpose: "deploy readiness",
    x: 70,
    y: 68
  },
  {
    id: "archive",
    label: "Archive",
    purpose: "memory + receipts",
    x: 28,
    y: 74
  }
];

export const agentRegistry: AgentDefinition[] = [
  {
    homeZone: "strategy",
    id: "moji",
    labelSide: "right",
    mapX: 27,
    mapY: 51,
    name: "Moji",
    role: "planner / manifest",
    room: "NW",
    shortLine: "Manifest route mapped.",
    spriteSrc: "/assets/dojo/moji.png"
  },
  {
    homeZone: "build",
    id: "miji",
    labelSide: "top",
    mapX: 42,
    mapY: 73,
    name: "Miji",
    role: "builder / handoff",
    room: "N",
    shortLine: "Build handoff warming.",
    spriteSrc: "/assets/dojo/miji.png"
  },
  {
    homeZone: "content",
    id: "maji",
    labelSide: "left",
    mapX: 69,
    mapY: 49,
    name: "Maji",
    role: "attacker / weak spots",
    room: "NE",
    shortLine: "Weak spots marked.",
    spriteSrc: "/assets/dojo/maji.png"
  },
  {
    homeZone: "strategy",
    id: "meji",
    labelSide: "right",
    mapX: 35,
    mapY: 62,
    name: "Meji",
    role: "reviewer / quality",
    room: "SW",
    shortLine: "Quality gate watching.",
    spriteSrc: "/assets/dojo/meji.png"
  },
  {
    homeZone: "marketing",
    id: "muji",
    labelSide: "left",
    mapX: 63,
    mapY: 75,
    name: "Muji",
    role: "deploy readiness",
    room: "S",
    shortLine: "Deploy path checked.",
    spriteSrc: "/assets/dojo/muji.png"
  },
  {
    homeZone: "mission-center",
    id: "meowts",
    labelSide: "top",
    mapX: 78,
    mapY: 62,
    name: "Meowts",
    role: "judge / receipt",
    room: "SE",
    shortLine: "Receipt judgment pending.",
    spriteSrc: "/assets/dojo/meowts.png"
  }
];

export const agentById = Object.fromEntries(
  agentRegistry.map((agent) => [agent.id, agent])
) as Record<AgentId, AgentDefinition>;

export type AgentStageRoute = {
  agent: AgentId;
  zone: DojoZoneId;
};

export const agentZoneByStage: Partial<
  Record<RunManifestStage["id"], AgentStageRoute>
> = {
  scroll: { agent: "moji", zone: "mission-center" },
  plan: { agent: "moji", zone: "strategy" },
  build: { agent: "miji", zone: "build" },
  attack: { agent: "maji", zone: "content" },
  review: { agent: "meji", zone: "strategy" },
  deploy: { agent: "muji", zone: "marketing" },
  judge: { agent: "meowts", zone: "mission-center" },
  moonrise: { agent: "meowts", zone: "archive" }
};

export const zoneById = Object.fromEntries(
  dojoZones.map((zone) => [zone.id, zone])
) as Record<DojoZoneId, DojoZone>;
