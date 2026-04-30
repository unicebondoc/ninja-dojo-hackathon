"use client";

import Link from "next/link";
import { Copy, Download, ExternalLink, Mail, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { DojoEventLog } from "@/components/DojoEventLog";
import { DojoProgress } from "@/components/DojoProgress";
import { BrandLogo } from "@/components/BrandLogo";
import { MoonPanel } from "@/components/MoonPanel";
import { PhaserDojo, type PhaserDojoHandle } from "@/components/PhaserDojo";
import {
  ScrollComposer,
  type ScrollComposerHandle
} from "@/components/ScrollComposer";
import { EventBus } from "@/game/events";
import type { RunStage, RunStageEvent } from "@/game/run/RunStateMachine";
import {
  completeRunManifest,
  createRunManifest
} from "@/lib/runs/createRunManifest";
import { formatRunBrief, mailtoForRun } from "@/lib/runs/formatRunBrief";
import {
  loadRunManifests,
  saveRunManifest
} from "@/lib/runs/runStorage";
import type { RunManifest } from "@/lib/runs/types";
import type { DojoDialogue } from "@/lib/types";

const stageOrder: RunStage[] = [
  "idle",
  "plan",
  "build",
  "attack",
  "review",
  "deploy",
  "judge",
  "moonrise"
];

const consoleTabs = ["Logs", "Manifest", "Handoffs", "Receipt", "Brain"] as const;
type ConsoleTab = (typeof consoleTabs)[number];

const pluginRegistry = [
  ["Codex", "Handoff", "Build prompt prepared", "Connect worker"],
  ["Claude", "Handoff", "Review prompt prepared", "Deep review"],
  ["OpenClaw", "Planned", "Local action prompt", "Gateway later"],
  ["GPT Image 2", "Planned", "Asset prompt archive", "Generate assets"],
  ["Telegram", "Planned", "Scroll capture route", "Notify run"],
  ["Manual", "Connected", "Paste tool results", "Save evidence"]
] as const;

export function LiveDojo() {
  const dojoRef = useRef<PhaserDojoHandle>(null);
  const composerRef = useRef<ScrollComposerHandle>(null);
  const activeRunRef = useRef<RunManifest | null>(null);
  const promptRef = useRef("");
  const [activeRun, setActiveRun] = useState<RunManifest | null>(null);
  const [complete, setComplete] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const [currentStage, setCurrentStage] = useState(0);
  const [dialogue, setDialogue] = useState<DojoDialogue[]>([]);
  const [gameReady, setGameReady] = useState(false);
  const [inputPulse, setInputPulse] = useState(false);
  const [activeTab, setActiveTab] = useState<ConsoleTab>("Logs");
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [scrollSent, setScrollSent] = useState(false);
  const [scrollPrompt, setScrollPrompt] = useState("");
  const [submittedPrompt, setSubmittedPrompt] = useState("");
  const [runHistory, setRunHistory] = useState<RunManifest[]>([]);
  const [running, setRunning] = useState(false);

  const handleGameReady = useCallback(() => {
    setGameReady(true);
  }, []);

  useEffect(() => {
    const storedRuns = loadRunManifests();
    setRunHistory(storedRuns);
    const latest = storedRuns[0];
    if (latest) {
      activeRunRef.current = latest;
      promptRef.current = latest.scrollText;
      setActiveRun(latest);
      setScrollPrompt(latest.scrollText);
      setSubmittedPrompt(latest.scrollText);
      setScrollSent(latest.status === "shipped");
      setComplete(latest.status === "shipped");
      setCurrentStage(latest.status === "shipped" ? 7 : 0);
      setDialogue([
        {
          createdAt: latest.createdAt,
          id: `restore-${latest.runId}`,
          message: `Restored latest run: ${summarizePrompt(latest.scrollText)}`,
          role: "Archive",
          speaker: "Dojo"
        }
      ]);
    }
  }, []);

  useEffect(() => {
    const offStage = EventBus.on<RunStageEvent>("run-stage", (event) => {
      if (!event) return;
      const index = stageOrder.indexOf(event.stage);
      const activePrompt = promptRef.current;
      if (index >= 0) setCurrentStage(index);
      setDialogue((current) =>
        [
          ...current,
          {
            createdAt: new Date().toISOString(),
            id: `stage-${Date.now()}-${event.index}`,
            message: formatEventMessage(event, activePrompt),
            role: event.role,
            speaker: event.agent ?? "Dojo"
          }
        ].slice(-8)
      );
    });

    const offStarted = EventBus.on("run-started", () => {
      setRunning(true);
      setComplete(false);
    });

    const offCompleted = EventBus.on("run-completed", () => {
      setRunning(false);
      setComplete(true);
      const currentRun =
        activeRunRef.current ??
        createRunManifest(promptRef.current, { status: "running" });
      const shippedRun = completeRunManifest(currentRun);
      activeRunRef.current = shippedRun;
      setActiveRun(shippedRun);
      setRunHistory(saveRunManifest(shippedRun));
    });

    const offReset = EventBus.on("run-reset", () => {
      setRunning(false);
      setComplete(false);
      setCurrentStage(0);
      setDialogue([]);
      setReceiptOpen(false);
      setScrollSent(false);
      setSubmittedPrompt("");
    });

    const offSave = EventBus.on<{ runsCompleted: number }>("dojo-save", () => {});

    return () => {
      offStage();
      offStarted();
      offCompleted();
      offReset();
      offSave();
    };
  }, []);

  function resetDojo() {
    dojoRef.current?.resetDojo();
  }

  function runDojo() {
    if (running) return;
    const cleanPrompt = scrollPrompt.trim();
    if (!cleanPrompt) {
      composerRef.current?.focus();
      setInputPulse(true);
      window.setTimeout(() => setInputPulse(false), 760);
      return;
    }

    promptRef.current = cleanPrompt;
    setSubmittedPrompt(cleanPrompt);
    setScrollSent(true);
    setComplete(false);
    setCurrentStage(0);
    setDialogue([]);
    const run = createRunManifest(cleanPrompt, { status: "running" });
    activeRunRef.current = run;
    setActiveRun(run);
    setRunHistory(saveRunManifest(run));
    dojoRef.current?.runDojo();
  }

  function selectRun(run: RunManifest) {
    activeRunRef.current = run;
    promptRef.current = run.scrollText;
    setActiveRun(run);
    setScrollPrompt(run.scrollText);
    setSubmittedPrompt(run.scrollText);
    setScrollSent(run.status === "shipped");
    setRunning(false);
    setComplete(run.status === "shipped");
    setCurrentStage(run.status === "shipped" ? 7 : 0);
    setDialogue([
      {
        createdAt: new Date().toISOString(),
        id: `select-${run.runId}`,
        message: `Selected run brief: ${summarizePrompt(run.scrollText)}`,
        role: "Archive",
        speaker: "Dojo"
      }
    ]);
  }

  async function copyRunBrief() {
    if (!activeRun) return;
    try {
      await navigator.clipboard.writeText(formatRunBrief(activeRun));
      setCopyStatus("Run brief copied.");
    } catch {
      setCopyStatus("Copy failed. Download the manifest instead.");
    }
    window.setTimeout(() => setCopyStatus(""), 1800);
  }

  function downloadRunManifest() {
    if (!activeRun || typeof window === "undefined") return;
    const blob = new Blob([JSON.stringify(activeRun, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${activeRun.runId}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const activeScroll = submittedPrompt || scrollPrompt;
  const moonriseHref =
    complete && activeRun
      ? activeRun.moonriseUrl
      : "/moonrise";
  const boardTitle = complete
    ? "Moonrise Receipt ready."
    : running
      ? stageOrder[currentStage]?.toUpperCase() ?? "Training"
      : "Mission console standing by";
  const currentStageLabel = stageOrder[currentStage] ?? "idle";
  const nextAction = complete
    ? "Open receipt or copy the run brief."
    : running
      ? "Watch stage output and judge signal."
      : "Drop a scroll to create mission state.";
  const visibleChecks =
    activeRun?.judgeResult.requestedItems.filter((item) => item.requested).slice(0, 4) ?? [];
  const currentStageManifest = activeRun?.stages[currentStage];

  return (
    <section className="rpg-hero cockpit" aria-label="Ninja Dojo mission control">
      <img
        alt=""
        aria-hidden="true"
        className="rpg-hero__decor"
        draggable={false}
        src="/icons/fantasy-brand-accents.png"
      />
      <header className="cockpit-header">
        <div className="cockpit-brand">
          <BrandLogo />
          <div>
            <p>Ninja Dojo</p>
            <h1>Mission control for AI shipping</h1>
            <span>Track scrolls, plugin handoffs, stage results, and Moonrise Receipts in one live console.</span>
          </div>
        </div>
        <div className="cockpit-header__ops">
          <span data-state={complete ? "complete" : running ? "running" : "idle"}>
            {complete ? "Receipt ready" : running ? "Mission running" : "Awaiting scroll"}
          </span>
          <a href="#method">Method</a>
          <a href="#plugins">Plugins</a>
          <a href="#receipt">Receipt</a>
        </div>
      </header>

      <div className="cockpit-command">
        <ScrollComposer
          isComplete={complete}
          isRunning={running}
          isSent={scrollSent}
          onChange={setScrollPrompt}
          onSubmit={runDojo}
          ref={composerRef}
          shouldPulse={inputPulse}
          value={scrollPrompt}
        />
      </div>

      <div className="cockpit-grid">
        <aside className="cockpit-rail cockpit-rail--left">
          <section className="cockpit-panel">
            <div className="cockpit-panel__title">
              <span>Current mission</span>
              <i>{activeRun ? activeRun.status : "idle"}</i>
            </div>
            <strong>{activeRun?.inferredName ?? "No active scroll"}</strong>
            <p>{activeScroll ? summarizePrompt(activeScroll) : "Drop a scroll to start tracking intent."}</p>
          </section>

          <section className="cockpit-panel cockpit-panel--meta">
            <div className="cockpit-panel__title">
              <span>Mission state</span>
              <i>{String(currentStage + 1).padStart(2, "0")}/08</i>
            </div>
            <dl>
              <div>
                <dt>Stage</dt>
                <dd>{currentStageLabel}</dd>
              </div>
              <div>
                <dt>Plugin mode</dt>
                <dd>Handoff-only</dd>
              </div>
              <div>
                <dt>Project memory</dt>
                <dd>{runHistory.length} local runs</dd>
              </div>
            </dl>
          </section>

          <DojoEventLog dialogue={dialogue} />

          <section className="cockpit-panel">
            <div className="cockpit-panel__title">
              <span>Next action</span>
              <i>now</i>
            </div>
            <p>{nextAction}</p>
          </section>
        </aside>

        <div className="rpg-board-shell">
          <DojoProgress
            currentStage={currentStage}
            isComplete={complete}
            isRunning={running}
          />
          <PhaserDojo
            boardTitle={boardTitle}
            complete={complete}
            onReady={handleGameReady}
            ref={dojoRef}
            running={running}
          />
          {process.env.NODE_ENV === "development" ? (
            <div className="phaser-dojo-debug">
              stage={currentStage} ready={String(gameReady)}
            </div>
          ) : null}
        </div>

        <aside className="cockpit-rail cockpit-rail--right">
          <MoonPanel
            currentStage={currentStage}
            isComplete={complete}
            isRunning={running}
            prompt={activeScroll}
            run={activeRun}
          />

          <section className="cockpit-panel cockpit-panel--judge">
            <div className="cockpit-panel__title">
              <span>Meowts</span>
              <i>{activeRun?.judgeResult.verdict ?? "pending"}</i>
            </div>
            <strong>{activeRun ? `${activeRun.judgeResult.score}/100` : "No score yet"}</strong>
            <div className="cockpit-checks">
              {visibleChecks.length > 0 ? (
                visibleChecks.map((item) => (
                  <span data-included={item.included} key={item.label}>
                    {item.label}
                  </span>
                ))
              ) : (
                <span>Checks appear after judging</span>
              )}
            </div>
          </section>

          <section className="cockpit-actions" aria-label="Mission actions">
            <button
              className={complete ? "is-primary" : "is-disabled"}
              disabled={!complete}
              onClick={() => setReceiptOpen(true)}
              type="button"
            >
              <ExternalLink className="h-4 w-4" />
              View Moonrise Receipt
            </button>
            <button
              disabled={!complete || !activeRun}
              onClick={copyRunBrief}
              type="button"
            >
              <Copy className="h-4 w-4" />
              Copy Brief
            </button>
            <button
              className="is-tertiary"
              disabled={!running && !complete && dialogue.length === 0}
              onClick={resetDojo}
              type="button"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
            {copyStatus ? <span>{copyStatus}</span> : null}
          </section>
        </aside>
      </div>

      <section className="cockpit-tabs" aria-label="Mission details">
        <div className="cockpit-tabs__nav" role="tablist">
          {consoleTabs.map((tab) => (
            <button
              aria-selected={activeTab === tab}
              data-active={activeTab === tab}
              key={tab}
              onClick={() => setActiveTab(tab)}
              role="tab"
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="cockpit-tabs__panel" role="tabpanel">
          {activeTab === "Logs" ? (
            <div className="cockpit-tab-grid">
              {(dialogue.length > 0 ? dialogue.slice(-5) : [
                {
                  createdAt: new Date().toISOString(),
                  id: "empty-log",
                  message: "No mission events yet. Send a scroll to create the first receipt trail.",
                  role: "Standby",
                  speaker: "Dojo"
                }
              ]).map((line) => (
                <article key={line.id}>
                  <span>{line.speaker}</span>
                  <strong>{line.role}</strong>
                  <p>{line.message}</p>
                </article>
              ))}
            </div>
          ) : null}

          {activeTab === "Manifest" ? (
            <div className="cockpit-manifest">
              <dl>
                <div>
                  <dt>Run</dt>
                  <dd>{activeRun?.runId ?? "not created"}</dd>
                </div>
                <div>
                  <dt>Mission</dt>
                  <dd>{activeRun?.inferredName ?? "awaiting scroll"}</dd>
                </div>
                <div>
                  <dt>Type</dt>
                  <dd>{activeRun?.productType ?? "unknown"}</dd>
                </div>
                <div>
                  <dt>Stage owner</dt>
                  <dd>{currentStageManifest ? `${currentStageManifest.ninja} / ${currentStageManifest.role}` : "Dojo"}</dd>
                </div>
              </dl>
              <p>{activeRun?.scrollText ?? "The manifest appears after the scroll is sent."}</p>
            </div>
          ) : null}

          {activeTab === "Handoffs" ? (
            <div className="cockpit-plugin-table">
              {pluginRegistry.map(([name, mode, output, action]) => (
                <article key={name}>
                  <strong>{name}</strong>
                  <span>{mode}</span>
                  <p>{output}</p>
                  <em>{action}</em>
                </article>
              ))}
            </div>
          ) : null}

          {activeTab === "Receipt" ? (
            <div className="cockpit-receipt-mini">
              <strong>{activeRun?.judgeResult.verdict ?? "Receipt pending"}</strong>
              <span>{activeRun ? `${activeRun.judgeResult.score}/100 · ${activeRun.inferredName}` : "Send a scroll to form the receipt."}</span>
              <button disabled={!complete} onClick={() => setReceiptOpen(true)} type="button">
                Open receipt drawer
              </button>
            </div>
          ) : null}

          {activeTab === "Brain" ? (
            <div className="cockpit-tab-grid cockpit-tab-grid--brain">
              {[
                ["Rules", "Cached-first, no external services required."],
                ["Memory", `${runHistory.length} local run${runHistory.length === 1 ? "" : "s"}.`],
                ["Current", activeRun ? activeRun.inferredName : "No active mission."],
                ["Next", nextAction]
              ].map(([label, value]) => (
                <article key={label}>
                  <span>{label}</span>
                  <p>{value}</p>
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {runHistory.length > 0 ? (
        <section className="dojo-run-history cockpit-history" aria-label="Recent runs">
          <div className="dojo-run-history__header">
            <p>Mission History</p>
            <span>Local project memory in this browser</span>
          </div>
          <div className="dojo-run-history__list">
            {runHistory.slice(0, 4).map((run) => (
              <button
                data-active={run.runId === activeRun?.runId}
                key={run.runId}
                onClick={() => selectRun(run)}
                type="button"
              >
                <strong>{run.inferredName}</strong>
                <span>{run.productType} · {run.status} · {formatRunDate(run.createdAt)}</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {receiptOpen ? (
        <div className="receipt-drawer" role="dialog" aria-modal="true" aria-label="Moonrise Receipt">
          <button
            aria-label="Close receipt"
            className="receipt-drawer__scrim"
            onClick={() => setReceiptOpen(false)}
            type="button"
          />
          <section className="receipt-drawer__panel">
            <header>
              <div>
                <p>Moonrise Receipt</p>
                <h2>{activeRun?.inferredName ?? "No active mission"}</h2>
              </div>
              <button onClick={() => setReceiptOpen(false)} type="button">Close</button>
            </header>
            {activeRun ? (
              <>
                <dl>
                  <div>
                    <dt>Status</dt>
                    <dd>{activeRun.status}</dd>
                  </div>
                  <div>
                    <dt>Meowts</dt>
                    <dd>{activeRun.judgeResult.score}/100 · {activeRun.judgeResult.verdict}</dd>
                  </div>
                  <div>
                    <dt>Type</dt>
                    <dd>{activeRun.productType}</dd>
                  </div>
                </dl>
                <p>{activeRun.scrollText}</p>
                <div className="receipt-drawer__lists">
                  <ul>
                    {activeRun.judgeResult.matched.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                  <ul>
                    {activeRun.judgeResult.improvements.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
                <div className="receipt-drawer__actions">
                  <Link href={moonriseHref}>
                    <ExternalLink className="h-4 w-4" />
                    Open preview
                  </Link>
                  <a href={mailtoForRun(activeRun)}>
                    <Mail className="h-4 w-4" />
                    Request real run
                  </a>
                  <button onClick={copyRunBrief} type="button">
                    <Copy className="h-4 w-4" />
                    Copy brief
                  </button>
                  <button onClick={downloadRunManifest} type="button">
                    <Download className="h-4 w-4" />
                    Download manifest
                  </button>
                </div>
              </>
            ) : (
              <p>Send a scroll first. The receipt drawer will collect stage evidence and Meowts judgment.</p>
            )}
          </section>
        </div>
      ) : null}
    </section>
  );
}

function formatEventMessage(event: RunStageEvent, prompt: string) {
  const time = formatTime(event.index);
  const shortPrompt = summarizePrompt(prompt);

  if (event.stage === "idle" && shortPrompt) {
    return `${time} Scroll received: "${shortPrompt}"`;
  }

  if (event.stage === "plan" && shortPrompt) {
    return `${time} Reading scroll: "${shortPrompt}"`;
  }

  if (event.stage === "moonrise" && shortPrompt) {
    return `${time} Moonrise Receipt produced for: ${shortPrompt}`;
  }

  return `${time} ${event.message}`;
}

function summarizePrompt(prompt: string) {
  const clean = prompt.trim().replace(/\s+/g, " ");
  return clean.length > 62 ? `${clean.slice(0, 59)}...` : clean;
}

function formatTime(index: number) {
  const seconds = Math.max(0, index * 2);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function formatRunDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short"
  }).format(new Date(value));
}
