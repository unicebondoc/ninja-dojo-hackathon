import type { AgentId, AgentStatus } from "@/lib/agent-registry";

export type ShrineProject = "landlit" | "wwd" | "ninja-publisher" | "seeksniper";

export type DojoEvent =
  | { type: "agent.status"; agent: AgentId; status: AgentStatus; task?: string }
  | { type: "agent.log"; agent: AgentId; line: string; ts: number }
  | { type: "agent.handoff"; from: AgentId; to: AgentId; payload: string }
  | {
      type: "shrine.update";
      project: ShrineProject;
      lastCommit?: string;
      openPRs?: number;
      deployState?: string;
    }
  | { type: "moon.eternal"; vpsUptime: number; healthPct: number }
  | { type: "moon.earned"; sprintProgress: number; sprintLabel: string }
  | {
      type: "scroll.arrived";
      source: "butler-checkin" | "job-match" | "diary";
      preview: string;
    };

type Listener = (event: DojoEvent) => void;

const agents: AgentId[] = ["moji", "miji", "maji", "meji", "muji", "meowts"];
const statuses: AgentStatus[] = ["idle", "working", "waiting", "idle", "working"];
const projects: ShrineProject[] = ["landlit", "wwd", "ninja-publisher", "seeksniper"];

const logLines: Record<AgentId, string[]> = {
  maji: [
    "Attack pass found two copy risks.",
    "Weak CTA marked for review.",
    "Adversarial notes ready."
  ],
  meji: [
    "Architecture note added to receipt.",
    "Quality gate is clean.",
    "Review trace compressed."
  ],
  meowts: [
    "Receipt score recalculated.",
    "Judgment waits for final handoff.",
    "Moonrise criteria checked."
  ],
  miji: [
    "Build handoff packaged.",
    "Plugin prompt updated.",
    "Artifact slot is ready."
  ],
  moji: [
    "Manifest outline refreshed.",
    "Intent parsed into stages.",
    "Scroll constraints recorded."
  ],
  muji: [
    "Deploy readiness scan queued.",
    "Preview route checked.",
    "Launch checklist updated."
  ]
};

const scrolls: DojoEvent[] = [
  {
    type: "scroll.arrived",
    source: "butler-checkin",
    preview: "LandLIT approval flow needs a clean receipt trail."
  },
  {
    type: "scroll.arrived",
    source: "job-match",
    preview: "SeekSniper found three founder roles to rank."
  },
  {
    type: "scroll.arrived",
    source: "diary",
    preview: "WWD needs a calmer share page before launch."
  }
];

class MockDojoEventEmitter {
  private listeners = new Set<Listener>();
  private timer: number | undefined;
  private cursor = 0;

  emit(event: DojoEvent) {
    this.listeners.forEach((listener) => listener(event));
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  start() {
    if (this.timer || typeof window === "undefined") return;
    this.scheduleNext(600);
  }

  stop() {
    if (this.timer && typeof window !== "undefined") {
      window.clearTimeout(this.timer);
    }
    this.timer = undefined;
  }

  private scheduleNext(delay = 2600) {
    this.timer = window.setTimeout(() => {
      this.emit(this.nextEvent());
      this.scheduleNext(2000 + Math.floor(Math.random() * 4000));
    }, delay);
  }

  private nextEvent(): DojoEvent {
    this.cursor += 1;
    const index = this.cursor;
    const agent = agents[index % agents.length];

    if (index % 9 === 0) {
      return scrolls[(index / 9) % scrolls.length];
    }

    if (index % 7 === 0) {
      const from = agents[index % agents.length];
      const to = agents[(index + 1) % agents.length];
      return {
        type: "agent.handoff",
        from,
        payload: `${from} handed receipt evidence to ${to}.`,
        to
      };
    }

    if (index % 6 === 0) {
      return {
        type: "moon.earned",
        sprintLabel: "Sprint 2",
        sprintProgress: 48 + ((index * 7) % 45)
      };
    }

    if (index % 5 === 0) {
      return {
        type: "moon.eternal",
        healthPct: 84 + (index % 13),
        vpsUptime: 120 + index * 3
      };
    }

    if (index % 4 === 0) {
      return {
        type: "shrine.update",
        deployState: index % 8 === 0 ? "reviewing" : "green",
        lastCommit: "feat: update mission receipt",
        openPRs: (index % 3) + 1,
        project: projects[index % projects.length]
      };
    }

    if (index % 3 === 0) {
      return {
        type: "agent.status",
        agent,
        status: statuses[index % statuses.length],
        task: logLines[agent][index % logLines[agent].length]
      };
    }

    return {
      type: "agent.log",
      agent,
      line: logLines[agent][index % logLines[agent].length],
      ts: Date.now()
    };
  }
}

export const mockDojoEvents = new MockDojoEventEmitter();
