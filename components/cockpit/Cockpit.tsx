"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChatPane } from "@/components/cockpit/ChatPane";
import { DojoMap } from "@/components/cockpit/DojoMap";
import { MoonGauge } from "@/components/cockpit/MoonGauge";
import { ScrollFeed } from "@/components/cockpit/ScrollFeed";
import { ShrineBar } from "@/components/cockpit/ShrineBar";
import type { AgentId, AgentStatus } from "@/lib/agent-registry";
import { agentById, agentRegistry } from "@/lib/agent-registry";
import { dispatchMissionEvent } from "@/lib/events/mission-events";
import type { AgentReceipt, MissionTask } from "@/lib/adapters/types";
import type {
  AgentMemoryEntry,
  ApprovalGate,
  ApprovalStatus,
  ExecutionAudit,
  MissionMemoryEntry,
  ProjectMemoryEntry,
  ReceiptMemoryEntry
} from "@/lib/memory/types";
import type { DojoEvent, ShrineProject } from "@/lib/mock-dojo-events";
import { mockDojoEvents } from "@/lib/mock-dojo-events";
import {
  getApprovals,
  getExecutionAudits,
  getMissions,
  getProjects,
  getReceipts,
  clearLocalMemory,
  saveAgentMemory,
  saveApproval,
  saveExecutionAudit,
  saveMission,
  saveProject,
  saveReceipt
} from "@/lib/memory/storage";
import { formatRunBrief } from "@/lib/runs/formatRunBrief";
import { createPlaybackEvents, type PlaybackEvent, type PlaybackState } from "@/lib/runs/playback";
import { loadRunManifests, saveRunManifest } from "@/lib/runs/runStorage";
import type { RunManifest, RunManifestStage } from "@/lib/runs/types";

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

type CodexExecutionResponse = AgentReceipt & {
  audit?: ExecutionAudit;
  executionPlan?: string[];
};

type OrchestratorStepResult = {
  id: "build" | "judge" | "plan" | "review";
  label: string;
  receipt: AgentReceipt;
  status: string;
};

type OrchestratorResult = {
  missionId: string;
  receipts: AgentReceipt[];
  steps: OrchestratorStepResult[];
  status: "blocked" | "complete" | "needs-review";
  summary: string;
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

const stageOrder: RunManifestStage["id"][] = [
  "scroll",
  "plan",
  "build",
  "attack",
  "review",
  "deploy",
  "judge",
  "moonrise"
];

export function Cockpit() {
  const requestedApprovalsRef = useRef(new Set<string>());
  const savedReceiptsRef = useRef(new Set<string>());
  const syncedMemoryRef = useRef(new Set<string>());
  const timersRef = useRef<number[]>([]);
  const [activeHandoff, setActiveHandoff] = useState<Handoff | undefined>();
  const [activeRun, setActiveRun] = useState<RunManifest | null>(null);
  const [activeStage, setActiveStage] = useState<RunManifestStage["id"] | null>(null);
  const [claudeReceipt, setClaudeReceipt] = useState<AgentReceipt | null>(null);
  const [claudeState, setClaudeState] = useState<"blocked" | "complete" | "failed" | "idle" | "running">("idle");
  const [completedStages, setCompletedStages] = useState<RunManifestStage["id"][]>([]);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const [dryRun, setDryRun] = useState(true);
  const [earnedProgress, setEarnedProgress] = useState(16);
  const [eternalHealth, setEternalHealth] = useState(94);
  const [executionReceipt, setExecutionReceipt] = useState<AgentReceipt | null>(null);
  const [executionAudits, setExecutionAudits] = useState<ExecutionAudit[]>([]);
  const [executionPlan, setExecutionPlan] = useState<string[]>([]);
  const [executionState, setExecutionState] = useState<
    "blocked" | "complete" | "dry-run" | "failed" | "idle" | "preview" | "running"
  >("idle");
  const [helpOpen, setHelpOpen] = useState(false);
  const [latestLines, setLatestLines] = useState(initialLines);
  const [logs, setLogs] = useState(initialLogs);
  const [playbackState, setPlaybackState] = useState<PlaybackState>("idle");
  const [memoryMissions, setMemoryMissions] = useState<MissionMemoryEntry[]>([]);
  const [memoryApprovals, setMemoryApprovals] = useState<ApprovalGate[]>([]);
  const [memoryProjects, setMemoryProjects] = useState<ProjectMemoryEntry[]>([]);
  const [memoryReceipts, setMemoryReceipts] = useState<ReceiptMemoryEntry[]>([]);
  const [orchestratorResult, setOrchestratorResult] = useState<OrchestratorResult | null>(null);
  const [orchestratorState, setOrchestratorState] = useState<
    "blocked" | "complete" | "failed" | "idle" | "needs-review" | "running"
  >("idle");
  const [runHistory, setRunHistory] = useState<RunManifest[]>([]);
  const [scrollError, setScrollError] = useState("");
  const [scrollText, setScrollText] = useState("");
  const [scrolls, setScrolls] = useState<ScrollItem[]>([
    {
      id: "initial-scroll",
      preview: "Mission control online. Submit a scroll to create a local Run Manifest.",
      source: "butler-checkin",
      ts: Date.now()
    }
  ]);
  const [selectedAgent, setSelectedAgent] = useState<AgentId | null>(null);
  const [selectedPlugin, setSelectedPlugin] = useState<PluginTerminal | null>(null);
  const [shrines, setShrines] = useState(initialShrines);
  const [sprintLabel, setSprintLabel] = useState("Local run");
  const [statuses, setStatuses] = useState(initialStatuses);

  const selected = selectedAgent ? agentById[selectedAgent] : null;
  const selectedStatus = selectedAgent ? statuses[selectedAgent] : "idle";
  const latestScroll = scrolls[0];
  const stuckCount = Object.values(statuses).filter((status) => status === "stuck").length;
  const workingCount = Object.values(statuses).filter((status) => status === "working").length;
  const receiptReady = activeRun?.status === "shipped" || playbackState === "complete";
  const activeMissionId = activeRun ? missionIdFor(activeRun) : undefined;
  const activeApproval = activeMissionId
    ? memoryApprovals.find((approval) => approval.missionId === activeMissionId)
    : undefined;
  const approvalStatus: ApprovalStatus | "blocked" = receiptReady
    ? activeApproval?.status ?? "pending"
    : "blocked";
  const isDev = process.env.NODE_ENV !== "production";

  const applyEvent = useCallback((event: DojoEvent) => {
    if (event.type === "agent.status") {
      setStatuses((current) => ({
        ...current,
        [event.agent]: event.status
      }));
      if (event.task) appendAgentLog(event.agent, event.task);
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
      addScroll(event.preview, event.source);
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

  function addScroll(preview: string, source: ScrollItem["source"] = "diary") {
    setScrolls((current) =>
      [
        {
          id: `scroll-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          preview,
          source,
          ts: Date.now()
        },
        ...current
      ].slice(0, 9)
    );
  }

  const clearPlaybackTimers = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }, []);

  const resetTransientRunState = useCallback(() => {
    clearPlaybackTimers();
    setActiveHandoff(undefined);
    setActiveStage(null);
    setCompletedStages([]);
    setEarnedProgress(16);
    setLatestLines(initialLines);
    setLogs(initialLogs);
    setPlaybackState("idle");
    setStatuses(initialStatuses);
  }, [clearPlaybackTimers]);

  useEffect(() => {
    const savedRuns = loadRunManifests();
    setMemoryApprovals(getApprovals());
    setExecutionAudits(getExecutionAudits());
    setMemoryMissions(getMissions());
    setMemoryProjects(getProjects());
    setMemoryReceipts(getReceipts());
    setRunHistory(savedRuns);
    if (savedRuns[0]) {
      setActiveRun(savedRuns[0]);
      setScrollText(savedRuns[0].scrollText);
      setActiveStage(savedRuns[0].status === "shipped" ? "moonrise" : null);
      setCompletedStages(savedRuns[0].status === "shipped" ? stageOrder : []);
      setEarnedProgress(savedRuns[0].status === "shipped" ? 100 : 16);
      setPlaybackState(savedRuns[0].status === "shipped" ? "complete" : "idle");
      addScroll(`Restored latest run: ${savedRuns[0].scrollText}`, "diary");
    }
  }, []);

  useEffect(() => {
    const unsubscribe = mockDojoEvents.subscribe((event) => {
      if (event.type === "shrine.update" || event.type === "moon.eternal") {
        applyEvent(event);
      }
    });
    mockDojoEvents.start();
    return () => {
      unsubscribe();
      mockDojoEvents.stop();
      clearPlaybackTimers();
    };
  }, [applyEvent, clearPlaybackTimers]);

  const missionState = useMemo(() => {
    if (playbackState === "complete") return "receipt ready";
    if (playbackState === "running") return activeStage ? `${activeStage} active` : "running";
    if (activeRun?.status === "shipped") return "receipt ready";
    if (stuckCount > 0) return "needs attention";
    if (workingCount > 0) return `${workingCount} active`;
    return "ready";
  }, [activeRun?.status, activeStage, playbackState, stuckCount, workingCount]);

  async function handleSendScroll() {
    const cleanScroll = scrollText.trim();
    if (!cleanScroll) {
      setScrollError("Write a scroll before sending.");
      return;
    }

    setScrollError("");
    setCopyState("idle");
    resetTransientRunState();
    setPlaybackState("running");

    try {
      const response = await fetch("/api/cockpit/runs", {
        body: JSON.stringify({ scrollText: cleanScroll }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });

      if (!response.ok) throw new Error("Run creation failed");

      const payload = (await response.json()) as { run: RunManifest };
      setActiveRun(payload.run);
      setClaudeReceipt(null);
      setClaudeState("idle");
      setExecutionReceipt(null);
      setExecutionPlan([]);
      setExecutionState("idle");
      setOrchestratorResult(null);
      setOrchestratorState("idle");
      setRunHistory(saveRunManifest(payload.run));
      persistMissionMemory(payload.run, "active");
      dispatchMissionEvent("mission.started", {
        missionName: payload.run.inferredName,
        runId: payload.run.runId,
        stage: "scroll",
        status: payload.run.status,
        summary: payload.run.scrollText
      });
      startPlayback(payload.run);
    } catch (error) {
      dispatchMissionEvent("mission.failed", {
        missionName: "Local cockpit run",
        status: "failed",
        summary: error instanceof Error ? error.message : "The local run could not be created."
      });
      setPlaybackState("idle");
      setScrollError("The local run could not be created.");
    }
  }

  function startPlayback(run: RunManifest) {
    clearPlaybackTimers();
    const events = createPlaybackEvents(run);
    for (const event of events) {
      const timer = window.setTimeout(() => applyPlaybackEvent(event, run), event.at);
      timersRef.current.push(timer);
    }
  }

  function applyPlaybackEvent(event: PlaybackEvent, run: RunManifest) {
    if (event.type === "scroll.arrived") {
      addScroll(event.preview, "diary");
      setActiveStage("scroll");
      setEarnedProgress(12);
      return;
    }

    if (event.type === "agent.started") {
      setActiveStage(event.stage);
      setEarnedProgress(progressForStage(event.stage));
      setStatuses((current) => ({ ...current, [event.agent]: "working" }));
      appendAgentLog(event.agent, event.line);
      dispatchMissionEvent("mission.stage_changed", {
        missionName: run.inferredName,
        runId: run.runId,
        stage: event.stage,
        status: "working",
        summary: event.line
      });
      return;
    }

    if (event.type === "agent.log") {
      appendAgentLog(event.agent, event.line);
      return;
    }

    if (event.type === "stage.completed") {
      setCompletedStages((current) => uniqueStages([...current, event.stage]));
      setEarnedProgress(progressForStage(event.stage));
      if (event.agent) {
        setStatuses((current) => ({ ...current, [event.agent!]: "complete" }));
        appendAgentLog(event.agent, event.line);
      }
      return;
    }

    if (event.type === "judge.completed") {
      setActiveStage("judge");
      setCompletedStages((current) => uniqueStages([...current, "judge"]));
      setStatuses((current) => ({ ...current, meowts: "working" }));
      appendAgentLog("meowts", event.line);
      setEarnedProgress(88);
      return;
    }

    if (event.type === "receipt.ready") {
      const completedRun: RunManifest = {
        ...run,
        logs: [
          ...run.logs,
          {
            at: new Date().toISOString(),
            department: "meowts",
            id: `${run.runId}-receipt-ready`,
            message: event.line,
            stage: "moonrise"
          }
        ],
        stages: run.stages.map((stage) => ({ ...stage, status: "complete" })),
        status: "shipped"
      };
      setActiveRun(completedRun);
      setRunHistory(saveRunManifest(completedRun));
      persistReceiptMemory(completedRun);
      setActiveStage("moonrise");
      setCompletedStages(stageOrder);
      setEarnedProgress(100);
      setPlaybackState("complete");
      setStatuses((current) => ({ ...current, meowts: "complete" }));
      addScroll(event.line, "diary");
      dispatchMissionEvent("mission.receipt_ready", {
        missionName: completedRun.inferredName,
        receiptUrl: completedRun.receiptUrl || completedRun.moonriseUrl,
        runId: completedRun.runId,
        stage: "moonrise",
        status: completedRun.status,
        summary: event.line
      });
      requestApproval(completedRun);
    }
  }

  function persistMissionMemory(run: RunManifest, status: ProjectMemoryEntry["status"]) {
    const projectId = projectIdFor(run);
    const now = new Date().toISOString();
    const mission: MissionMemoryEntry = {
      createdAt: run.createdAt,
      id: missionIdFor(run),
      projectId,
      runId: run.runId,
      scrollText: run.scrollText,
      status: run.status,
      summary: `${run.inferredName}: ${run.requirements.slice(0, 2).join(", ")}`,
      updatedAt: now
    };
    const project: ProjectMemoryEntry = {
      createdAt: run.createdAt,
      id: projectId,
      lastMissionId: mission.id,
      name: run.inferredName,
      nextAction: "Wait for Meowts receipt.",
      status,
      updatedAt: now
    };

    setMemoryMissions(saveMission(mission));
    setMemoryProjects(saveProject(project));
    queueNotionSync({ mission, project });
  }

  function persistReceiptMemory(run: RunManifest) {
    if (savedReceiptsRef.current.has(run.runId)) return;
    savedReceiptsRef.current.add(run.runId);

    const projectId = projectIdFor(run);
    const missionId = missionIdFor(run);
    const now = new Date().toISOString();
    const receipt: ReceiptMemoryEntry = {
      createdAt: now,
      id: receiptIdFor(run),
      missionId,
      projectId,
      receiptUrl: run.receiptUrl || run.moonriseUrl,
      runId: run.runId,
      score: run.judgeResult.score,
      summary: `${run.judgeResult.verdict} for ${run.inferredName}`,
      verdict: run.judgeResult.verdict
    };
    const mission: MissionMemoryEntry = {
      createdAt: run.createdAt,
      id: missionId,
      projectId,
      runId: run.runId,
      scrollText: run.scrollText,
      status: "shipped",
      summary: `Receipt produced for ${run.inferredName}.`,
      updatedAt: now
    };
    const project: ProjectMemoryEntry = {
      createdAt: run.createdAt,
      id: projectId,
      lastMissionId: missionId,
      lastReceiptId: receipt.id,
      name: run.inferredName,
      nextAction: "Open receipt or copy run brief.",
      status: "shipped",
      updatedAt: now
    };

    setMemoryMissions(saveMission(mission));
    setMemoryReceipts(saveReceipt(receipt));
    setMemoryProjects(saveProject(project));
    queueNotionSync({ mission, project, receipt });
  }

  function requestApproval(run: RunManifest) {
    const missionId = missionIdFor(run);
    if (requestedApprovalsRef.current.has(missionId)) return;
    requestedApprovalsRef.current.add(missionId);

    const storedApprovals = getApprovals();
    const existing = storedApprovals.find((approval) => approval.missionId === missionId);
    if (existing) {
      setMemoryApprovals(storedApprovals);
      return;
    }

    const approval: ApprovalGate = {
      id: approvalIdFor(run),
      missionId,
      notes: "Receipt ready. Future execution is blocked until CEO approval.",
      requestedAt: new Date().toISOString(),
      status: "pending"
    };

    setMemoryApprovals(saveApproval(approval));
    updateProjectApprovalState(run, "pending");
    dispatchMissionEvent("approval.requested", {
      approvalId: approval.id,
      missionId,
      missionName: run.inferredName,
      notes: approval.notes,
      receiptUrl: run.receiptUrl || run.moonriseUrl,
      runId: run.runId,
      status: approval.status,
      summary: "CEO approval required before future execution."
    });
  }

  function decideApproval(status: Exclude<ApprovalStatus, "pending">) {
    if (!activeRun || !receiptReady) return;

    const missionId = missionIdFor(activeRun);
    const storedApprovals = getApprovals();
    const existing =
      activeApproval ?? storedApprovals.find((approval) => approval.missionId === missionId);
    const now = new Date().toISOString();
    const approval: ApprovalGate = {
      id: existing?.id ?? approvalIdFor(activeRun),
      missionId,
      notes:
        status === "approved"
          ? "Approved by CEO for future execution."
          : "Rejected by CEO. Future execution remains blocked.",
      requestedAt: existing?.requestedAt ?? now,
      status,
      decidedAt: now,
      decidedBy: "CEO"
    };

    setMemoryApprovals(saveApproval(approval));
    updateProjectApprovalState(activeRun, status);
    dispatchMissionEvent(status === "approved" ? "approval.approved" : "approval.rejected", {
      approvalId: approval.id,
      missionId,
      missionName: activeRun.inferredName,
      notes: approval.notes,
      receiptUrl: activeRun.receiptUrl || activeRun.moonriseUrl,
      runId: activeRun.runId,
      status: approval.status,
      summary: approval.notes
    });
  }

  function updateProjectApprovalState(run: RunManifest, status: ApprovalStatus) {
    const projectId = projectIdFor(run);
    const now = new Date().toISOString();
    const project: ProjectMemoryEntry = {
      createdAt: run.createdAt,
      id: projectId,
      lastMissionId: missionIdFor(run),
      lastReceiptId: receiptIdFor(run),
      name: run.inferredName,
      nextAction:
        status === "approved"
          ? "Approved for future execution."
          : status === "rejected"
            ? "Rejected. Revise the scroll or receipt before execution."
            : "CEO approval required before execution.",
      status: status === "approved" ? "shipped" : "blocked",
      updatedAt: now
    };

    setMemoryProjects(saveProject(project));
    queueNotionSync({ project });
  }

  function queueNotionSync({
    mission,
    project,
    receipt
  }: {
    mission?: MissionMemoryEntry;
    project?: ProjectMemoryEntry;
    receipt?: ReceiptMemoryEntry;
  }) {
    const payload: {
      mission?: MissionMemoryEntry;
      project?: ProjectMemoryEntry;
      receipt?: ReceiptMemoryEntry;
    } = {};

    if (project && markSyncQueued("project", project.id, project.updatedAt)) {
      payload.project = project;
    }
    if (mission && markSyncQueued("mission", mission.id, mission.updatedAt)) {
      payload.mission = mission;
    }
    if (receipt && markSyncQueued("receipt", receipt.id, receipt.createdAt)) {
      payload.receipt = receipt;
    }
    if (!payload.project && !payload.mission && !payload.receipt) return;

    void fetch("/api/integrations/notion/sync", {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
      method: "POST"
    }).catch((error) => {
      console.warn("[ninja-dojo:notion] queued sync skipped", error);
    });
  }

  function markSyncQueued(kind: string, id: string, version: string) {
    const key = `${kind}:${id}:${version}`;
    if (syncedMemoryRef.current.has(key)) return false;
    syncedMemoryRef.current.add(key);
    return true;
  }

  async function handleCopyBrief() {
    if (!activeRun) return;
    try {
      await navigator.clipboard.writeText(formatRunBrief(activeRun));
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  function handlePreviewCodexExecution() {
    if (!activeRun) {
      const receipt = blockedCodexReceipt("no-active-run", "No active mission is available.");
      setExecutionReceipt(receipt);
      setExecutionPlan([]);
      setExecutionState("blocked");
      return;
    }

    const task = createCodexTask(activeRun);
    const plan = createExecutionPlan(task, dryRun);
    setExecutionPlan(plan);
    setExecutionReceipt(null);
    setExecutionState("preview");
    appendAgentLog("miji", `Codex execution preview prepared for ${task.id}.`);
  }

  async function handleRunCodexWorker() {
    if (!activeRun) {
      const receipt = blockedCodexReceipt("no-active-run", "No active mission is available.");
      setExecutionReceipt(receipt);
      setExecutionState("blocked");
      return;
    }
    if (executionPlan.length === 0) {
      handlePreviewCodexExecution();
      return;
    }

    setExecutionState("running");
    setExecutionReceipt({
      agent: "codex",
      artifacts: [],
      logs: ["Codex worker request started."],
      status: "running",
      summary: "Waiting for gated Codex execution result.",
      taskId: codexTaskIdFor(activeRun)
    });

    const task = createCodexTask(activeRun);
    try {
      const response = await fetch("/api/agents/codex/execute", {
        body: JSON.stringify({
          approval: activeApproval,
          confirmed: true,
          dryRun,
          mission: {
            ...activeRun,
            approval: activeApproval
          },
          task
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });
      const receipt = (await response.json()) as CodexExecutionResponse;
      setExecutionReceipt(receipt);
      if (receipt.executionPlan?.length) setExecutionPlan(receipt.executionPlan);
      if (receipt.audit) setExecutionAudits(saveExecutionAudit(receipt.audit));
      setExecutionState(
        receipt.status === "blocked"
          ? "blocked"
          : receipt.status === "dry-run"
            ? "dry-run"
          : receipt.status === "complete"
            ? "complete"
            : "failed"
      );
      appendAgentLog("miji", `Codex worker ${receipt.status}: ${receipt.summary}`);
    } catch (error) {
      const summary =
        error instanceof Error ? error.message : "Codex worker request could not complete.";
      const receipt = blockedCodexReceipt(task.id, summary);
      setExecutionReceipt(receipt);
      setExecutionState("failed");
      appendAgentLog("miji", `Codex worker failed: ${summary}`);
    }
  }

  async function handleRunClaudeReview() {
    if (!activeRun) {
      const receipt = blockedClaudeReceipt("no-active-run", "No active mission is available.");
      setClaudeReceipt(receipt);
      setClaudeState("blocked");
      return;
    }

    setClaudeState("running");
    setClaudeReceipt({
      agent: "claude",
      artifacts: [],
      insights: [],
      logs: ["Claude review request started."],
      recommendations: [],
      risks: [],
      status: "running",
      summary: "Waiting for gated Claude analysis.",
      taskId: claudeTaskIdFor(activeRun),
      type: "review"
    });

    const task = createClaudeTask(activeRun);
    try {
      const response = await fetch("/api/agents/claude/execute", {
        body: JSON.stringify({
          approval: activeApproval,
          mission: {
            ...activeRun,
            approval: activeApproval
          },
          task
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });
      const receipt = (await response.json()) as AgentReceipt;
      setClaudeReceipt(receipt);
      setClaudeState(
        receipt.status === "blocked"
          ? "blocked"
          : receipt.status === "complete"
            ? "complete"
            : "failed"
      );
      appendAgentLog("meji", `Claude ${receipt.type ?? "analysis"} ${receipt.status}: ${receipt.summary}`);
    } catch (error) {
      const summary =
        error instanceof Error ? error.message : "Claude analysis request could not complete.";
      const receipt = blockedClaudeReceipt(task.id, summary);
      setClaudeReceipt(receipt);
      setClaudeState("failed");
      appendAgentLog("meji", `Claude analysis failed: ${summary}`);
    }
  }

  async function handleRunMissionOrchestrator() {
    if (!activeRun) {
      setOrchestratorResult({
        missionId: "no-active-run",
        receipts: [],
        status: "blocked",
        steps: [],
        summary: "No active mission is available."
      });
      setOrchestratorState("blocked");
      return;
    }

    setOrchestratorState("running");
    setOrchestratorResult({
      missionId: missionIdFor(activeRun),
      receipts: [],
      status: "needs-review",
      steps: [
        {
          id: "plan",
          label: "Claude plan",
          receipt: runningReceipt("claude", `orchestrator-plan-${activeRun.runId}`),
          status: "running"
        }
      ],
      summary: "Mission orchestration is running."
    });

    try {
      const response = await fetch("/api/orchestrator/run", {
        body: JSON.stringify({
          approval: activeApproval,
          dryRun,
          mission: activeRun
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });
      if (!response.ok) throw new Error("Mission orchestration failed.");
      const result = (await response.json()) as OrchestratorResult;
      setOrchestratorResult(result);
      setOrchestratorState(result.status);
      for (const receipt of result.receipts) {
        saveAgentReceipt(activeRun, receipt);
      }
      appendAgentLog("meowts", `Mission orchestration ${result.status}: ${result.summary}`);
    } catch (error) {
      const summary =
        error instanceof Error ? error.message : "Mission orchestration could not complete.";
      setOrchestratorResult({
        missionId: missionIdFor(activeRun),
        receipts: [],
        status: "needs-review",
        steps: [],
        summary
      });
      setOrchestratorState("failed");
      appendAgentLog("meowts", `Mission orchestration failed: ${summary}`);
    }
  }

  function handleResetRun() {
    resetTransientRunState();
    setActiveRun(null);
    setClaudeReceipt(null);
    setClaudeState("idle");
    setExecutionReceipt(null);
    setExecutionPlan([]);
    setExecutionState("idle");
    setOrchestratorResult(null);
    setOrchestratorState("idle");
    setScrollError("");
    setCopyState("idle");
  }

  function handleDevClearLocalState() {
    if (!isDev) return;
    const confirmed = window.confirm("Clear local Ninja Dojo runs and memory?");
    if (!confirmed) return;
    clearPlaybackTimers();
    clearLocalMemory();
    requestedApprovalsRef.current.clear();
    savedReceiptsRef.current.clear();
    syncedMemoryRef.current.clear();
    setActiveRun(null);
    setActiveStage(null);
    setClaudeReceipt(null);
    setClaudeState("idle");
    setCompletedStages([]);
    setCopyState("idle");
    setDryRun(true);
    setEarnedProgress(16);
    setExecutionAudits([]);
    setExecutionReceipt(null);
    setExecutionPlan([]);
    setExecutionState("idle");
    setOrchestratorResult(null);
    setOrchestratorState("idle");
    setLatestLines(initialLines);
    setLogs(initialLogs);
    setMemoryApprovals([]);
    setMemoryMissions([]);
    setMemoryProjects([]);
    setMemoryReceipts([]);
    setPlaybackState("idle");
    setRunHistory([]);
    setScrollError("");
    setScrollText("");
    setScrolls([
      {
        id: "cleared-scroll",
        preview: "Local memory cleared. Submit a scroll to start a new mission.",
        source: "diary",
        ts: Date.now()
      }
    ]);
    setStatuses(initialStatuses);
  }

  function progressForStage(stage: RunManifestStage["id"]) {
    const index = stageOrder.indexOf(stage);
    return Math.max(12, Math.round(((index + 1) / stageOrder.length) * 100));
  }

  function uniqueStages(stages: RunManifestStage["id"][]) {
    return Array.from(new Set<RunManifestStage["id"]>(stages));
  }

  function projectIdFor(run: RunManifest) {
    return slugify(run.inferredName) || run.runId;
  }

  function missionIdFor(run: RunManifest) {
    return `mission-${run.runId}`;
  }

  function receiptIdFor(run: RunManifest) {
    return `receipt-${run.runId}`;
  }

  function approvalIdFor(run: RunManifest) {
    return `approval-${run.runId}`;
  }

  function codexTaskIdFor(run: RunManifest) {
    return `codex-${run.runId}`;
  }

  function claudeTaskIdFor(run: RunManifest) {
    return `claude-${run.runId}`;
  }

  function createCodexTask(run: RunManifest): MissionTask {
    return {
      agent: "codex",
      context: [
        `Run: ${run.runId}`,
        `Scroll: ${run.scrollText}`,
        `Product: ${run.inferredName}`,
        `Receipt: ${run.receiptUrl || run.moonriseUrl}`,
        `Judge: ${run.judgeResult.verdict} (${run.judgeResult.score}/100)`
      ].join("\n"),
      department: "builder",
      id: codexTaskIdFor(run),
      prompt: [
        `Use the current Ninja Dojo repo to perform the approved implementation pass for ${run.inferredName}.`,
        `Original scroll: ${run.scrollText}`,
        "Keep the work scoped. Do not commit, push, deploy, or touch secrets."
      ].join("\n"),
      runId: run.runId,
      title: `Approved Codex worker pass for ${run.inferredName}`
    };
  }

  function createClaudeTask(run: RunManifest): MissionTask {
    return {
      agent: "claude",
      context: [
        `Run: ${run.runId}`,
        `Scroll: ${run.scrollText}`,
        `Product: ${run.inferredName}`,
        `Requirements: ${run.requirements.join("; ")}`,
        `Judge: ${run.judgeResult.verdict} (${run.judgeResult.score}/100)`,
        `Codex result: ${executionReceipt?.summary ?? "No Codex receipt yet."}`
      ].join("\n"),
      department: "auditor",
      id: claudeTaskIdFor(run),
      prompt: [
        `Review the current Ninja Dojo mission for ${run.inferredName}.`,
        "Analyze the run manifest, judge result, and any Codex output.",
        "Return insights, risks, and recommendations only. Do not edit files or execute commands."
      ].join("\n"),
      runId: run.runId,
      title: `Claude review for ${run.inferredName}`
    };
  }

  function saveAgentReceipt(run: RunManifest, receipt: AgentReceipt) {
    const entry: AgentMemoryEntry = {
      agent: receipt.agent as AgentMemoryEntry["agent"],
      artifacts: receipt.artifacts,
      createdAt: new Date().toISOString(),
      id: `${receipt.agent}-${receipt.taskId}`,
      logs: receipt.logs,
      missionId: missionIdFor(run),
      status: receipt.status,
      summary: receipt.summary
    };
    saveAgentMemory(entry);
  }

  function runningReceipt(agent: string, taskId: string): AgentReceipt {
    return {
      agent,
      artifacts: [],
      logs: ["Running."],
      status: "running",
      summary: "Running.",
      taskId
    };
  }

  function createExecutionPlan(task: MissionTask, isDryRun: boolean) {
    const scopeHints = [
      task.prompt.toLowerCase().includes("ui") || task.prompt.toLowerCase().includes("layout")
        ? "frontend"
        : undefined,
      task.prompt.toLowerCase().includes("api") ? "api route" : undefined,
      task.prompt.toLowerCase().includes("memory") ? "local memory" : undefined,
      task.department
    ].filter(Boolean);

    return [
      `Check CEO approval for ${task.id}.`,
      isDryRun ? "Use dry-run mode; do not launch codex exec." : "Launch guarded codex exec after confirmation.",
      `Scope task: ${task.title}.`,
      `Expected focus: ${Array.from(new Set(scopeHints)).join(", ")}.`,
      "Capture stdout, stderr, exit code, and changed files.",
      "Return ExecutionAudit. No commit, push, deploy, or destructive command."
    ];
  }

  function blockedCodexReceipt(taskId: string, summary: string): AgentReceipt {
    return {
      agent: "codex",
      artifacts: [],
      exitCode: null,
      logs: [summary],
      stderr: "",
      status: "blocked",
      stdout: "",
      summary,
      taskId
    };
  }

  function blockedClaudeReceipt(taskId: string, summary: string): AgentReceipt {
    return {
      agent: "claude",
      artifacts: [],
      exitCode: null,
      insights: [],
      logs: [summary],
      recommendations: [],
      risks: [],
      stderr: "",
      status: "blocked",
      stdout: "",
      summary,
      taskId,
      type: "analysis"
    };
  }

  function slugify(value: string) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

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
          <span>{missionState}</span>
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
          {isDev ? (
            <button
              aria-label="Clear local development state"
              onClick={handleDevClearLocalState}
              type="button"
            >
              Clear
            </button>
          ) : null}
        </div>
      </header>

      {helpOpen ? (
        <aside className="cockpit-help">
          Dojo tracks the mission. Plugins do the work. Meowts judges the receipt.
        </aside>
      ) : null}

      <section className="cockpit-command-strip" aria-label="Scroll command">
        <div>
          <span>Scroll command</span>
          <textarea
            aria-label="Scroll command"
            onChange={(event) => {
              setScrollText(event.target.value);
              setScrollError("");
            }}
            placeholder="Build me a landing page for a moonlit ramen shop with online booking, pricing, and testimonials."
            rows={2}
            value={scrollText}
          />
          {scrollError ? <p>{scrollError}</p> : null}
        </div>
        <button disabled={playbackState === "running"} onClick={handleSendScroll} type="button">
          {playbackState === "running" ? "Running" : "Send Scroll"}
        </button>
      </section>

      <section className="cockpit-main" aria-label="Ninja Dojo cockpit">
        <aside className="mission-rail" aria-label="Mission state">
          <section>
            <span>Current mission</span>
            <strong>{activeRun?.inferredName ?? "No active scroll"}</strong>
            <p>{activeRun ? activeRun.scrollText : "No active run. Send a scroll to create mission memory."}</p>
          </section>
          <section>
            <span>Next action</span>
            <strong>{receiptReady ? "Open receipt" : playbackState === "running" ? "Watch stages" : "Send scroll"}</strong>
            <p>{receiptReady ? "Moonrise Receipt is ready to inspect or copy." : "Awaiting local stage playback."}</p>
          </section>
          <ScrollFeed items={scrolls} />
        </aside>

        <section className="cockpit-center" aria-label="Live dojo operation view">
          <div className="mission-strip">
            <div>
              <span>Run Manifest</span>
              <strong>{activeRun?.runId ?? "waiting for scroll"}</strong>
            </div>
            <div>
              <span>Stage</span>
              <strong>{activeStage ?? "standby"}</strong>
            </div>
            <div>
              <span>Department</span>
              <strong>{activeRun?.stages.find((stage) => stage.id === activeStage)?.department ?? "local"}</strong>
            </div>
          </div>
          <DojoMap
            activeHandoff={activeHandoff}
            activeStage={activeStage}
            completedStages={completedStages}
            latestLines={latestLines}
            onOpenAgent={setSelectedAgent}
            statuses={statuses}
          />
        </section>

        <aside className="receipt-rail" aria-label="Receipt status">
          <section>
            <span>Moonrise Receipt</span>
            <strong>{receiptReady ? "ready" : activeRun ? "collecting" : "standby"}</strong>
            <p>{activeRun ? `Receipt target: ${activeRun.inferredName}` : "No receipts yet."}</p>
          </section>
          <section>
            <span>Meowts</span>
            <strong>{activeRun ? `${activeRun.judgeResult.score}/100` : "--/100"}</strong>
            <p>{activeRun ? activeRun.judgeResult.verdict : "Waiting for a scroll to judge."}</p>
          </section>
          <section>
            <span>Project Memory</span>
            <strong>{memoryProjects.length}</strong>
            <p>
              {memoryProjects.length
                ? `${memoryMissions.length} missions · ${memoryReceipts.length} receipts stored locally.`
                : "No saved memory yet."}
            </p>
          </section>
          <section className="approval-panel" data-status={approvalStatus}>
            <span>CEO Approval</span>
            <strong>
              {approvalStatus === "blocked"
                ? "blocked"
                : approvalStatus === "pending"
                  ? "pending"
                  : approvalStatus}
            </strong>
            <p>
              {approvalStatus === "approved"
                ? "Future execution is unblocked."
                : approvalStatus === "rejected"
                  ? "Future execution remains blocked."
                  : receiptReady
                    ? "Approve before any real execution can happen."
                    : "Receipt required before approval."}
            </p>
            <div className="approval-actions">
              <button
                disabled={!receiptReady || approvalStatus === "approved"}
                onClick={() => decideApproval("approved")}
                type="button"
              >
                Approve
              </button>
              <button
                className="is-tertiary"
                disabled={!receiptReady || approvalStatus === "rejected"}
                onClick={() => decideApproval("rejected")}
                type="button"
              >
                Reject
              </button>
            </div>
          </section>
          <section className="mission-flow-panel" data-status={orchestratorState}>
            <span>Mission Flow</span>
            <strong>
              {orchestratorState === "idle"
                ? approvalStatus === "approved"
                  ? "ready"
                  : "blocked"
                : orchestratorState}
            </strong>
            <p>
              {orchestratorResult
                ? orchestratorResult.summary
                : "Run Claude plan, gated Codex build, Claude review, and Meowts judge."}
            </p>
            {orchestratorResult?.steps.length ? (
              <ol>
                {orchestratorResult.steps.map((step) => (
                  <li key={step.id}>
                    <b>{step.label}</b>
                    <span>{step.status}</span>
                  </li>
                ))}
              </ol>
            ) : null}
            <button
              disabled={!activeRun || orchestratorState === "running"}
              onClick={handleRunMissionOrchestrator}
              type="button"
            >
              {orchestratorState === "running" ? "Running Mission" : "Run Mission"}
            </button>
          </section>
          <section className="codex-worker-panel" data-status={executionState}>
            <span>Codex Worker</span>
            <strong>
              {executionState === "idle"
                ? approvalStatus === "approved"
                  ? "ready"
                  : "blocked"
                : executionState}
            </strong>
            <p>
              {executionReceipt
                ? executionReceipt.summary
                : executionState === "preview"
                  ? "Review the execution plan, then confirm."
                : approvalStatus === "approved"
                  ? "Preview required before execution."
                  : "CEO approval is required before Codex can run."}
            </p>
            <label className="codex-worker-panel__toggle">
              <input
                checked={dryRun}
                disabled={executionState === "running"}
                onChange={(event) => {
                  setDryRun(event.target.checked);
                  setExecutionPlan([]);
                  if (executionState === "preview") setExecutionState("idle");
                }}
                type="checkbox"
              />
              Dry run
            </label>
            {executionPlan.length ? (
              <ol>
                {executionPlan.slice(0, 4).map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ol>
            ) : null}
            {executionReceipt?.logs.length ? (
              <small>{executionReceipt.logs.slice(-1)[0]}</small>
            ) : null}
            {executionAudits[0] ? (
              <small>
                Last audit: {executionAudits[0].status} · exit{" "}
                {executionAudits[0].exitCode ?? "n/a"} ·{" "}
                {executionAudits[0].filesChanged.length} files
              </small>
            ) : null}
            <div className="codex-worker-panel__actions">
              <button
                disabled={!activeRun || executionState === "running"}
                onClick={handlePreviewCodexExecution}
                type="button"
              >
                Preview
              </button>
              <button
                disabled={!activeRun || executionState === "running" || executionPlan.length === 0}
                onClick={handleRunCodexWorker}
                type="button"
              >
                {executionState === "running"
                  ? "Running"
                  : dryRun
                    ? "Confirm Dry Run"
                    : "Confirm Execute"}
              </button>
            </div>
          </section>
          <section className="claude-worker-panel" data-status={claudeState}>
            <span>Claude Review</span>
            <strong>
              {claudeState === "idle"
                ? approvalStatus === "approved"
                  ? "ready"
                  : "blocked"
                : claudeState}
            </strong>
            <p>
              {claudeReceipt
                ? claudeReceipt.summary
                : approvalStatus === "approved"
                  ? "Run gated analysis or review. Claude does not edit files."
                  : "CEO approval is required before Claude can analyze."}
            </p>
            {claudeReceipt?.insights?.length ? (
              <div className="claude-worker-panel__grid">
                <span>Insights</span>
                <ul>
                  {claudeReceipt.insights.slice(0, 2).map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {claudeReceipt?.risks?.length ? (
              <div className="claude-worker-panel__grid">
                <span>Risks</span>
                <ul>
                  {claudeReceipt.risks.slice(0, 2).map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {claudeReceipt?.recommendations?.length ? (
              <div className="claude-worker-panel__grid">
                <span>Recommendations</span>
                <ul>
                  {claudeReceipt.recommendations.slice(0, 2).map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <button
              disabled={!activeRun || claudeState === "running"}
              onClick={handleRunClaudeReview}
              type="button"
            >
              {claudeState === "running" ? "Reviewing" : "Run Claude Review"}
            </button>
          </section>
          <div className="receipt-rail__actions">
            <a
              aria-disabled={!receiptReady || !activeRun}
              className={!receiptReady || !activeRun ? "is-disabled" : ""}
              href={receiptReady && activeRun ? activeRun.receiptUrl || activeRun.moonriseUrl : undefined}
              rel="noreferrer"
              target="_blank"
            >
              View Receipt
            </a>
            <button disabled={!activeRun} onClick={handleCopyBrief} type="button">
              {copyState === "copied" ? "Copied" : copyState === "failed" ? "Copy failed" : "Copy Brief"}
            </button>
            <button className="is-tertiary" onClick={handleResetRun} type="button">
              Reset
            </button>
          </div>
          <section className="plugin-terminals" aria-label="Plugin terminals">
            <header>
              <span>Plugin terminals</span>
              <strong>local</strong>
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

      <section className="run-history-strip" aria-label="Run history">
        <header>
          <span>History</span>
          <strong>{runHistory.length}</strong>
        </header>
        <div>
          {runHistory.length === 0 ? (
            <p>No local runs yet.</p>
          ) : (
            runHistory.slice(0, 6).map((run) => (
              <button
                data-active={activeRun?.runId === run.runId}
                key={run.runId}
                onClick={() => {
                  resetTransientRunState();
                  setActiveRun(run);
                  setClaudeReceipt(null);
                  setClaudeState("idle");
                  setExecutionReceipt(null);
                  setExecutionPlan([]);
                  setExecutionState("idle");
                  setOrchestratorResult(null);
                  setOrchestratorState("idle");
                  setScrollText(run.scrollText);
                  setActiveStage(run.status === "shipped" ? "moonrise" : null);
                  setCompletedStages(run.status === "shipped" ? stageOrder : []);
                  setEarnedProgress(run.status === "shipped" ? 100 : 16);
                  setPlaybackState(run.status === "shipped" ? "complete" : "idle");
                }}
                type="button"
              >
                <strong>{run.inferredName}</strong>
                <span>{run.status}</span>
              </button>
            ))
          )}
        </div>
      </section>

      <ShrineBar projects={memoryProjects} shrines={shrines} />

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
                <dd>Local handoff only. Real plugin execution lands later.</dd>
              </div>
            </dl>
          </aside>
        </>
      ) : null}
    </main>
  );
}
