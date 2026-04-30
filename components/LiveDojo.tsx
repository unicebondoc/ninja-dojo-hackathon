"use client";

import Link from "next/link";
import { ExternalLink, RotateCcw, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DojoEventLog } from "@/components/DojoEventLog";
import { DojoProgress } from "@/components/DojoProgress";
import { MoonPanel } from "@/components/MoonPanel";
import { PhaserDojo, type PhaserDojoHandle } from "@/components/PhaserDojo";
import { demoOutput } from "@/lib/demo-output";
import type { DojoAgent, DojoDialogue } from "@/lib/types";

type StageName =
  | "Scroll"
  | "Plan"
  | "Build"
  | "Attack"
  | "Review"
  | "Deploy"
  | "Judge"
  | "Moonrise";

type TimelineStep = {
  activeAgent?: string;
  at: number;
  message: string;
  role: StageName;
  speaker: string;
  stage: number;
};

type LegacyLiveDojoProps = Partial<{
  agents: DojoAgent[];
  currentStage: number;
  dialogue: DojoDialogue[];
  isComplete: boolean;
  isRunning: boolean;
  onReset: () => void;
  onRun: () => void;
  previewPath: string;
  showScroll: boolean;
  showSlash: boolean;
}>;

const timeline: TimelineStep[] = [
  {
    at: 0,
    message: "00:00 Scroll received.",
    role: "Scroll",
    speaker: "Dojo",
    stage: 0
  },
  {
    activeAgent: "Moji",
    at: 1500,
    message: "00:01 Moji is writing the plan...",
    role: "Plan",
    speaker: "Moji",
    stage: 1
  },
  {
    activeAgent: "Miji",
    at: 3500,
    message: "00:03 Miji is building the oracle page...",
    role: "Build",
    speaker: "Miji",
    stage: 2
  },
  {
    activeAgent: "Renegade",
    at: 6000,
    message: "00:06 Renegade is attacking weak spots...",
    role: "Attack",
    speaker: "Renegade",
    stage: 3
  },
  {
    activeAgent: "Sensei",
    at: 9000,
    message: "00:09 Sensei is reviewing architecture...",
    role: "Review",
    speaker: "Sensei",
    stage: 4
  },
  {
    activeAgent: "Tester",
    at: 11000,
    message: "00:11 Tester is running build checks...",
    role: "Deploy",
    speaker: "Tester",
    stage: 5
  },
  {
    activeAgent: "Meowts",
    at: 13000,
    message: "00:13 Meowts is judging the dojo run...",
    role: "Judge",
    speaker: "Meowts",
    stage: 6
  },
  {
    at: 15000,
    message: "00:15 The moon rises. The build is complete.",
    role: "Moonrise",
    speaker: "Dojo",
    stage: 7
  }
];

function makeDialogue(step: TimelineStep): DojoDialogue {
  return {
    createdAt: new Date().toISOString(),
    id: `run-${step.at}`,
    message: step.message,
    role: step.role,
    speaker: step.speaker
  };
}

export function LiveDojo(_legacyProps: LegacyLiveDojoProps = {}) {
  const dojoRef = useRef<PhaserDojoHandle>(null);
  const timersRef = useRef<number[]>([]);
  const [activeAgent, setActiveAgent] = useState<string | undefined>();
  const [complete, setComplete] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [dialogue, setDialogue] = useState<DojoDialogue[]>([]);
  const [gameReady, setGameReady] = useState(false);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    return () => clearTimers();
  }, []);

  function clearTimers() {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }

  function appendLog(step: TimelineStep) {
    setDialogue((current) => [...current, makeDialogue(step)].slice(-24));
  }

  function resetDojo() {
    clearTimers();
    dojoRef.current?.resetDojo();
    setActiveAgent(undefined);
    setComplete(false);
    setCurrentStage(0);
    setDialogue([]);
    setRunning(false);
  }

  function finishDojo() {
    setActiveAgent(undefined);
    setComplete(true);
    setCurrentStage(7);
    setRunning(false);
  }

  function runDojo() {
    if (running || !gameReady) {
      return;
    }

    clearTimers();
    setActiveAgent(undefined);
    setComplete(false);
    setCurrentStage(0);
    setDialogue([]);
    setRunning(true);
    dojoRef.current?.runDojo();

    timeline.forEach((step) => {
      const timer = window.setTimeout(() => {
        setCurrentStage(step.stage);
        setActiveAgent(step.activeAgent);
        appendLog(step);
      }, step.at);

      timersRef.current.push(timer);
    });
  }

  const boardTitle = complete
    ? "Moonrise: shipped."
    : running
      ? timeline[currentStage]?.role ?? "Training"
      : "Ready for scroll";

  return (
    <section className="rpg-hero" aria-label="Live Ninja Dojo RPG interface">
      <header className="rpg-hero__header">
        <div className="rpg-title-block">
          <p>Ninja Dojo</p>
          <h1>One scroll in. Five Codex worktrees out.</h1>
          <span>A live dojo for coordinating AI agents.</span>
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
            onComplete={finishDojo}
            onReady={() => setGameReady(true)}
            ref={dojoRef}
            running={running}
          />
          {process.env.NODE_ENV === "development" ? (
            <div className="phaser-dojo-debug">
              stage={currentStage} agent={activeAgent ?? "none"} ready=
              {String(gameReady)}
            </div>
          ) : null}
        </div>

        <MoonPanel isComplete={complete} isRunning={running} />
      </div>

      <div className="rpg-controls">
        <button disabled={running || !gameReady} onClick={runDojo} type="button">
          <Send className="h-5 w-5" />
          {running ? "Training..." : complete ? "Run Again" : "Send Scroll"}
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
          Open Shipped Page
        </Link>
      </div>
    </section>
  );
}
