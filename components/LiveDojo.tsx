"use client";

import Link from "next/link";
import { ExternalLink, Play, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { DojoEventLog } from "@/components/DojoEventLog";
import { DojoProgress } from "@/components/DojoProgress";
import { BrandLogo } from "@/components/BrandLogo";
import { MoonPanel } from "@/components/MoonPanel";
import { PhaserDojo, type PhaserDojoHandle } from "@/components/PhaserDojo";
import { EventBus } from "@/game/events";
import type { RunStage, RunStageEvent } from "@/game/run/RunStateMachine";
import { demoOutput } from "@/lib/demo-output";
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
  const [complete, setComplete] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [dialogue, setDialogue] = useState<DojoDialogue[]>([]);
  const [gameReady, setGameReady] = useState(false);
  const [running, setRunning] = useState(false);

  const handleGameReady = useCallback(() => {
    setGameReady(true);
  }, []);

  useEffect(() => {
    const offStage = EventBus.on<RunStageEvent>("run-stage", (event) => {
      if (!event) return;
      const index = stageOrder.indexOf(event.stage);
      if (index >= 0) setCurrentStage(index);
      setDialogue((current) =>
        [
          ...current,
          {
            createdAt: new Date().toISOString(),
            id: `stage-${Date.now()}-${event.index}`,
            message: `${formatTime(event.index)} ${event.message}`,
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
    setComplete(false);
    setCurrentStage(0);
    setDialogue([]);
    dojoRef.current?.runDojo();
  }

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
        src="/icons/decor-elements.png"
      />
      <header className="rpg-hero__header">
        <div className="rpg-title-block">
          <BrandLogo />
          <p className="rpg-hero-kicker">One scroll in. Six ninjas ship it.</p>
          <span>
            Watch Moji, Miji, Maji, Meji, Muji, and Meowts plan, build, attack, review, deploy, and judge a product run in real time.
          </span>
        </div>
        <DojoProgress
          currentStage={currentStage}
          isComplete={complete}
          isRunning={running}
        />
      </header>

      <div className="rpg-hero__layout">
        <DojoEventLog dialogue={dialogue} />

        <div className="rpg-board-shell">
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
        />
      </div>

      <div className="rpg-controls">
        <button disabled={running} onClick={runDojo} type="button">
          <Play className="h-5 w-5" />
          {complete ? "Run Again" : running ? "Training..." : "Send Scroll"}
        </button>
        <button
          className="is-secondary"
          disabled={!running && !complete && dialogue.length === 0}
          onClick={resetDojo}
          type="button"
        >
          <RotateCcw className="h-5 w-5" />
          Reset Dojo
        </button>
        <Link
          aria-disabled={!complete}
          className={!complete ? "is-disabled" : undefined}
          href={demoOutput.previewPath}
          tabIndex={!complete ? -1 : undefined}
        >
          <ExternalLink className="h-5 w-5" />
          View Moonrise
        </Link>
      </div>
    </section>
  );
}

function formatTime(index: number) {
  const seconds = Math.max(0, index * 2);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}
