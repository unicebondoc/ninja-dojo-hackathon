export type AgentStatus = "idle" | "working" | "waiting" | "stuck";

export type AgentId = "moji" | "miji" | "maji" | "meji" | "muji" | "meowts";

export type AgentDefinition = {
  id: AgentId;
  labelSide: "left" | "right" | "top" | "bottom";
  mapX: number;
  mapY: number;
  name: string;
  role: string;
  room: "NW" | "N" | "NE" | "SW" | "S" | "SE";
  shortLine: string;
  spriteSrc: string;
};

export const agentRegistry: AgentDefinition[] = [
  {
    id: "moji",
    labelSide: "right",
    mapX: 30,
    mapY: 46,
    name: "Moji",
    role: "planner / manifest",
    room: "NW",
    shortLine: "Manifest route mapped.",
    spriteSrc: "/assets/dojo/moji.png"
  },
  {
    id: "miji",
    labelSide: "top",
    mapX: 43,
    mapY: 62,
    name: "Miji",
    role: "builder / handoff",
    room: "N",
    shortLine: "Build handoff warming.",
    spriteSrc: "/assets/dojo/miji.png"
  },
  {
    id: "maji",
    labelSide: "left",
    mapX: 60,
    mapY: 42,
    name: "Maji",
    role: "attacker / weak spots",
    room: "NE",
    shortLine: "Weak spots marked.",
    spriteSrc: "/assets/dojo/maji.png"
  },
  {
    id: "meji",
    labelSide: "right",
    mapX: 56,
    mapY: 72,
    name: "Meji",
    role: "reviewer / quality",
    room: "SW",
    shortLine: "Quality gate watching.",
    spriteSrc: "/assets/dojo/meji.png"
  },
  {
    id: "muji",
    labelSide: "left",
    mapX: 48,
    mapY: 78,
    name: "Muji",
    role: "deploy readiness",
    room: "S",
    shortLine: "Deploy path checked.",
    spriteSrc: "/assets/dojo/muji.png"
  },
  {
    id: "meowts",
    labelSide: "top",
    mapX: 79,
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
