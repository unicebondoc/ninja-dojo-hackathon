"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChatPane } from "@/components/cockpit/ChatPane";
import { DojoMap } from "@/components/cockpit/DojoMap";
import { MoonGauge } from "@/components/cockpit/MoonGauge";
import { ScrollFeed } from "@/components/cockpit/ScrollFeed";
import { ShrineBar } from "@/components/cockpit/ShrineBar";
import type { AgentId, AgentStatus } from "@/lib/agent-registry";
import { agentById, agentRegistry } from "@/lib/agent-registry";
import type { DojoEvent, ShrineProject } from "@/lib/mock-dojo-events";
import { mockDojoEvents } from "@/lib/mock-dojo-events";

type ScrollItem = {
  id: string;
  preview: string;
  source: "butler-checkin" | "job-match" | "diary";
  ts: number;
};

type Handoff = {
  from: AgentId;
  payload: string;
  to: AgentId;
  ts: number;
};

type PluginId = "openclaw" | "codex" | "claude" | "gpt-image-2" | "manual" | "telegram";

type PluginTerminal = {
  id: PluginId;
  latestActivity: string;
  mode: string;
  name: string;
  status: "mock" | "handoff-only" | "planned" | "connected-later";
};

const pluginTerminals: PluginTerminal[] = [
  {
    id: "openclaw",
    latestActivity: "Local action gateway prompt staged.",
    mode: "Gateway later",
    name: "OpenClaw",
    status: "planned"
  },
  {
    id: "codex",
    latestActivity: "Build handoff prompt ready.",
    mode: "Worktree handoff",
    name: "Codex",
    status: "handoff-only"
  },
  {
    id: "claude",
    latestActivity: "Review brief prepared for deep critique.",
    mode: "Review handoff",
    name: "Claude",
    status: "handoff-only"
  },
  {
    id: "gpt-image-2",
    latestActivity: "Asset prompt archive available.",
    mode: "Asset generation later",
    name: "GPT Image 2",
    status: "planned"
  },
  {
    id: "manual",
    latestActivity: "Paste-result fallback connected.",
    mode: "Human-in-loop",
    name: "Manual",
    status: "mock"
  },
  {
    id: "telegram",
    latestActivity: "Scroll capture route planned.",
    mode: "Check-ins later",
    name: "Telegram",
    status: "connected-later"
  }
];

const initialStatuses = Object.fromEntries(
  agentRegistry.map((agent) => [agent.id, "idle"])
) as Record<AgentId, AgentStatus>;

const initialLines = Object.fromEntries(
  agentRegistry.map((agent) => [agent.id, agent.shortLine])
) as Record<AgentId, string>;

const initialLogs = Object.fromEntries(
  agentRegistry.map((agent) => [
    agent.id,
    [`${agent.name} standing by in ${agent.role} room.`]
  ])
) as Record<AgentId, string[]>;

const initialShrines = {
  landlit: {
    deployState: "green",
    label: "LandLIT",
    lastCommit: "feat: add approval orchestration · 2h ago",
    openPRs: 2,
    project: "landlit",
    subtitle: "WhatsApp PropTech"
  },
  wwd: {
    deployState: "yellow",
    label: "WWD",
    lastCommit: "fix: tighten gesture parser · 4h ago",
    openPRs: 1,
    project: "wwd",
    subtitle: "gesture oracle"
  },
  "ninja-publisher": {
    deployState: "green",
    label: "Ninja Publisher",
    lastCommit: "chore: queue receipt summary · 1h ago",
    openPRs: 0,
    project: "ninja-publisher",
    subtitle: "Medium auto-poster"
  },
  seeksniper: {
    deployState: "red",
    label: "SeekSniper",
    lastCommit: "feat: rank founder roles · 6h ago",
    openPRs: 3,
    project: "seeksniper",
    subtitle: "job hunt landing"
  }
} satisfies Record<ShrineProject, {
  deployState: string;
  label: string;
  lastCommit: string;
  openPRs: number;
  project: ShrineProject;
  subtitle: string;
}>;

export function Cockpit() {
  const [activeHandoff, setActiveHandoff] = useState<Handoff | undefined>();
  const [earnedProgress, setEarnedProgress] = useState(73);
  const [eternalHealth, setEternalHealth] = useState(94);
  const [helpOpen, setHelpOpen] = useState(false);
  const [latestLines, setLatestLines] = useState(initialLines);
  const [logs, setLogs] = useState(initialLogs);
  const [scrolls, setScrolls] = useState<ScrollItem[]>([
    {
      id: "initial-scroll",
      preview: "Mission control online. Mock telemetry is cycling locally.",
      source: "butler-checkin",
      ts: Date.now()
    }
  ]);
  const [selectedAgent, setSelectedAgent] = useState<AgentId | null>(null);
  const [selectedPlugin, setSelectedPlugin] = useState<PluginTerminal | null>(null);
  const [shrines, setShrines] = useState(initialShrines);
  const [sprintLabel, setSprintLabel] = useState("Sprint 2");
  const [statuses, setStatuses] = useState(initialStatuses);

  const selected = selectedAgent ? agentById[selectedAgent] : null;
  const selectedStatus = selectedAgent ? statuses[selectedAgent] : "idle";
  const latestScroll = scrolls[0];
  const stuckCount = Object.values(statuses).filter((status) => status === "stuck").length;
  const workingCount = Object.values(statuses).filter((status) => status === "working").length;

  const applyEvent = useCallback((event: DojoEvent) => {
    if (event.type === "agent.status") {
      setStatuses((current) => ({
        ...current,
        [event.agent]: event.status
      }));
      if (event.task) {
        appendAgentLog(event.agent, event.task);
      }
      return;
    }

    if (event.type === "agent.log") {
      appendAgentLog(event.agent, event.line);
      return;
    }

    if (event.type === "agent.handoff") {
      setActiveHandoff({ ...event, ts: Date.now() });
      appendAgentLog(event.from, event.payload);
      appendAgentLog(event.to, `Received handoff from ${agentById[event.from].name}.`);
      window.setTimeout(() => setActiveHandoff(undefined), 1400);
      return;
    }

    if (event.type === "scroll.arrived") {
      setScrolls((current) =>
        [
          {
            id: `scroll-${Date.now()}`,
            preview: event.preview,
            source: event.source,
            ts: Date.now()
          },
          ...current
        ].slice(0, 9)
      );
      return;
    }

    if (event.type === "moon.eternal") {
      setEternalHealth(event.healthPct);
      return;
    }

    if (event.type === "moon.earned") {
      setEarnedProgress(event.sprintProgress);
      setSprintLabel(event.sprintLabel);
      return;
    }

    if (event.type === "shrine.update") {
      setShrines((current) => ({
        ...current,
        [event.project]: {
          ...current[event.project],
          deployState: event.deployState ?? current[event.project].deployState,
          lastCommit: event.lastCommit ?? current[event.project].lastCommit,
          openPRs: event.openPRs ?? current[event.project].openPRs
        }
      }));
    }
  }, []);

  function appendAgentLog(agent: AgentId, line: string) {
    setLatestLines((current) => ({
      ...current,
      [agent]: line
    }));
    setLogs((current) => ({
      ...current,
      [agent]: [...(current[agent] ?? []), line].slice(-50)
    }));
  }

  useEffect(() => {
    const unsubscribe = mockDojoEvents.subscribe(applyEvent);
    mockDojoEvents.start();
    return () => unsubscribe();
  }, [applyEvent]);

  const missionState = useMemo(() => {
    if (stuckCount > 0) return "needs attention";
    if (workingCount > 0) return `${workingCount} active`;
    return "watching";
  }, [stuckCount, workingCount]);

  return (
    <main className="cockpit-shell">
      <header className="cockpit-topbar">
        <div className="cockpit-title">
          <span className="cockpit-logo" aria-hidden="true">
            <i />
          </span>
          <div>
            <strong>Ninja Dojo</strong>
            <em>Mission control for AI shipping</em>
          </div>
        </div>
        <div className="cockpit-topbar__status">
          <span>Mock telemetry</span>
          <MoonGauge
            earnedProgress={earnedProgress}
            eternalHealth={eternalHealth}
            sprintLabel={sprintLabel}
          />
          <button
            aria-expanded={helpOpen}
            aria-label="Open help"
            onClick={() => setHelpOpen((open) => !open)}
            type="button"
          >
            ?
          </button>
        </div>
      </header>

      {helpOpen ? (
        <aside className="cockpit-help">
          Dojo tracks the mission. Plugins do the work. Meowts judges the receipt.
        </aside>
      ) : null}

      <section className="cockpit-main" aria-label="Ninja Dojo cockpit">
        <ScrollFeed items={scrolls} />

        <section className="cockpit-center" aria-label="Live dojo operation view">
          <div className="mission-strip">
            <div>
              <span>Current mission</span>
              <strong>{latestScroll.preview}</strong>
            </div>
            <div>
              <span>State</span>
              <strong>{missionState}</strong>
            </div>
            <button
              onClick={() =>
                mockDojoEvents.emit({
                  preview: "Manual scroll injected into the local cockpit feed.",
                  source: "diary",
                  type: "scroll.arrived"
                })
              }
              type="button"
            >
              Simulate scroll
            </button>
          </div>
          <DojoMap
            activeHandoff={activeHandoff}
            latestLines={latestLines}
            onOpenAgent={setSelectedAgent}
            statuses={statuses}
          />
        </section>

        <aside className="receipt-rail" aria-label="Receipt status">
          <section>
            <span>Moonrise Receipt</span>
            <strong>{earnedProgress >= 80 ? "ready soon" : "collecting"}</strong>
            <p>Latest scroll, handoffs, stage notes, and Meowts score will land here.</p>
          </section>
          <section>
            <span>Meowts</span>
            <strong>{stuckCount > 0 ? "64/100" : "91/100"}</strong>
            <p>{stuckCount > 0 ? "Blocked room needs attention." : "Receipt trail looks clean."}</p>
          </section>
          <div className="receipt-rail__actions">
            <button type="button">View receipt</button>
            <button type="button">Copy brief</button>
          </div>
          <section className="plugin-terminals" aria-label="Plugin terminals">
            <header>
              <span>Plugin terminals</span>
              <strong>mock</strong>
            </header>
            <div>
              {pluginTerminals.map((plugin) => (
                <button
                  data-status={plugin.status}
                  key={plugin.id}
                  onClick={() => setSelectedPlugin(plugin)}
                  type="button"
                >
                  <strong>{plugin.name}</strong>
                  <em>{plugin.mode}</em>
                  <span>{plugin.latestActivity}</span>
                </button>
              ))}
            </div>
          </section>
        </aside>
      </section>

      <ShrineBar shrines={shrines} />

      <ChatPane
        agent={selected}
        logs={selectedAgent ? logs[selectedAgent] : []}
        onClose={() => setSelectedAgent(null)}
        status={selectedStatus}
      />

      {selectedPlugin ? (
        <>
          <button
            aria-label="Close plugin terminal"
            className="plugin-terminal-drawer__scrim"
            onClick={() => setSelectedPlugin(null)}
            type="button"
          />
          <aside className="plugin-terminal-drawer" aria-label={`${selectedPlugin.name} terminal`}>
            <header>
              <div>
                <span>Plugin terminal</span>
                <h2>{selectedPlugin.name}</h2>
              </div>
              <i>{selectedPlugin.status}</i>
              <button onClick={() => setSelectedPlugin(null)} type="button">
                X
              </button>
            </header>
            <dl>
              <div>
                <dt>Mode</dt>
                <dd>{selectedPlugin.mode}</dd>
              </div>
              <div>
                <dt>Latest activity</dt>
                <dd>{selectedPlugin.latestActivity}</dd>
              </div>
              <div>
                <dt>Execution</dt>
                <dd>Mock only. Real handoff lands in a later PR.</dd>
              </div>
            </dl>
          </aside>
        </>
      ) : null}
    </main>
  );
}
