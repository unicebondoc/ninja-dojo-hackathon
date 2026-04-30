"use client";

import Link from "next/link";
import { ExternalLink, RotateCcw } from "lucide-react";
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
  const promptRef = useRef("");
  const [complete, setComplete] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [dialogue, setDialogue] = useState<DojoDialogue[]>([]);
  const [gameReady, setGameReady] = useState(false);
  const [inputPulse, setInputPulse] = useState(false);
  const [scrollSent, setScrollSent] = useState(false);
  const [scrollPrompt, setScrollPrompt] = useState("");
  const [submittedPrompt, setSubmittedPrompt] = useState("");
  const [running, setRunning] = useState(false);

  const handleGameReady = useCallback(() => {
    setGameReady(true);
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
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("ninja-dojo:last-scroll", cleanPrompt);
    }
    dojoRef.current?.runDojo();
  }

  const activeScroll = submittedPrompt || scrollPrompt;
  const moonriseHref =
    complete && submittedPrompt
      ? `/moonrise?scroll=${encodeURIComponent(submittedPrompt)}`
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
        />
      </div>

      <div className="rpg-controls">
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
