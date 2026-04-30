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
        ].slice(-24)
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
    ? "Moonrise: shipped."
    : running
      ? stageOrder[currentStage]?.toUpperCase() ?? "Training"
      : "Live dojo standing by";

  return (
    <section className="rpg-hero" aria-label="Live Ninja Dojo RPG interface">
      <img
        alt=""
        aria-hidden="true"
        className="rpg-hero__decor"
        draggable={false}
        src="/icons/fantasy-brand-accents.png"
      />
      <header className="rpg-hero__header">
        <div className="rpg-title-block">
          <BrandLogo />
          <p className="rpg-hero-kicker">One scroll in. Six ninjas ship it.</p>
          <span>
            Watch Moji, Miji, Maji, Meji, Muji, and Meowts plan, build, attack, review, deploy, and judge a product run in real time.
          </span>
        </div>
        <div className="rpg-command-stack">
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
      </header>

      <div className="rpg-hero__layout">
        <DojoEventLog dialogue={dialogue} />

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

        <MoonPanel
          currentStage={currentStage}
          isComplete={complete}
          isRunning={running}
          prompt={activeScroll}
          run={activeRun}
        />
      </div>

      <div className="rpg-controls">
        {complete && activeRun ? (
          <a href={mailtoForRun(activeRun)}>
            <Mail className="h-5 w-5" />
            Request a Real Dojo Run
          </a>
        ) : null}
        {running || complete || dialogue.length > 0 ? (
          <button
            className="is-secondary"
            onClick={resetDojo}
            type="button"
          >
            <RotateCcw className="h-5 w-5" />
            Reset Run
          </button>
        ) : null}
        <Link
          aria-disabled={!complete}
          className={!complete ? "is-disabled" : undefined}
          href={moonriseHref}
          tabIndex={!complete ? -1 : undefined}
        >
          <ExternalLink className="h-5 w-5" />
          View Moonrise
        </Link>
      </div>
      {complete && activeRun ? (
        <section className="dojo-run-result" aria-live="polite">
          <div>
            <p>Meowts Judge Result</p>
            <h2>{activeRun.judgeResult.verdict}</h2>
            <span>{activeRun.judgeResult.score}/100 for {activeRun.inferredName}</span>
          </div>
          <div className="dojo-run-result__lists">
            <ul>
              {activeRun.judgeResult.matched.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <ul>
              {activeRun.judgeResult.improvements.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="dojo-run-result__checks">
            {activeRun.judgeResult.requestedItems
              .filter((item) => item.requested)
              .map((item) => (
                <span data-included={item.included} key={item.label}>
                  {item.label}: {item.included ? "included" : "missing"}
                </span>
              ))}
          </div>
          <div className="dojo-run-result__actions">
            <button onClick={copyRunBrief} type="button">
              <Copy className="h-4 w-4" />
              Copy Run Brief
            </button>
            <button onClick={downloadRunManifest} type="button">
              <Download className="h-4 w-4" />
              Download Run Manifest
            </button>
            {copyStatus ? <span>{copyStatus}</span> : null}
          </div>
        </section>
      ) : null}
      {runHistory.length > 0 ? (
        <section className="dojo-run-history" aria-label="Recent runs">
          <div className="dojo-run-history__header">
            <p>Recent Runs</p>
            <span>Stored locally in this browser</span>
          </div>
          <div className="dojo-run-history__list">
            {runHistory.map((run) => (
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
    return `${time} The dojo shipped a first pass for: ${shortPrompt}`;
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
