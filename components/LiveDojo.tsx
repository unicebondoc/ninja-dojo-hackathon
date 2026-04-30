"use client";

import Link from "next/link";
import { ExternalLink, RotateCcw, Send } from "lucide-react";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { DojoEventLog } from "@/components/DojoEventLog";
import { DojoProgress } from "@/components/DojoProgress";
import { DojoSprite } from "@/components/DojoSprite";
import { MoonPanel } from "@/components/MoonPanel";
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

type AgentEffect = "idle" | "plan" | "build" | "attack" | "review" | "deploy" | "judge";
type ActorState = "idle" | "walking" | "working" | "done";
type Facing = "left" | "right";
type Position = { x: number; y: number };

type DojoActor = {
  effect: AgentEffect;
  facing: Facing;
  home: Position;
  id: string;
  name: string;
  position: Position;
  role: string;
  state: ActorState;
  work: Position;
};

type TimelineStep = {
  activeAgent?: string;
  at: number;
  effect: AgentEffect;
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
    effect: "idle",
    message: "00:00 Scroll received.",
    role: "Scroll",
    speaker: "Dojo",
    stage: 0
  },
  {
    activeAgent: "Moji",
    at: 1500,
    effect: "plan",
    message: "00:01 Moji is writing the plan...",
    role: "Plan",
    speaker: "Moji",
    stage: 1
  },
  {
    activeAgent: "Miji",
    at: 3500,
    effect: "build",
    message: "00:03 Miji is building the oracle page...",
    role: "Build",
    speaker: "Miji",
    stage: 2
  },
  {
    activeAgent: "Renegade",
    at: 6000,
    effect: "attack",
    message: "00:06 Renegade is attacking weak spots...",
    role: "Attack",
    speaker: "Renegade",
    stage: 3
  },
  {
    activeAgent: "Sensei",
    at: 9000,
    effect: "review",
    message: "00:09 Sensei is reviewing architecture...",
    role: "Review",
    speaker: "Sensei",
    stage: 4
  },
  {
    activeAgent: "Tester",
    at: 11000,
    effect: "deploy",
    message: "00:11 Tester is running build checks...",
    role: "Deploy",
    speaker: "Tester",
    stage: 5
  },
  {
    activeAgent: "Meowts",
    at: 13000,
    effect: "judge",
    message: "00:13 Meowts is judging the dojo run...",
    role: "Judge",
    speaker: "Meowts",
    stage: 6
  },
  {
    at: 15000,
    effect: "idle",
    message: "00:15 The moon rises. The build is complete.",
    role: "Moonrise",
    speaker: "Dojo",
    stage: 7
  }
];

const homePositions: Record<string, Position> = {
  Meowts: { x: 92, y: 58 },
  Miji: { x: 22, y: 82 },
  Moji: { x: 12, y: 78 },
  Renegade: { x: 82, y: 78 },
  Sensei: { x: 72, y: 83 },
  Tester: { x: 48, y: 86 }
};

const workPositions: Record<string, Position> = {
  Meowts: { x: 78, y: 42 },
  Miji: { x: 35, y: 60 },
  Moji: { x: 43, y: 48 },
  Renegade: { x: 65, y: 50 },
  Sensei: { x: 62, y: 66 },
  Tester: { x: 50, y: 70 }
};

const scrollPosition = { x: 50, y: 50 };

const busyLines: Record<string, string> = {
  Meowts: "Judging the final run.",
  Miji: "Building the oracle page.",
  Moji: "Writing the plan.",
  Renegade: "Attacking weak spots.",
  Sensei: "Reviewing the architecture.",
  Tester: "Running build checks."
};

const doneLines: Record<string, string> = {
  Meowts: "Approved. The moon may rise.",
  Miji: "Build complete.",
  Moji: "Plan complete.",
  Renegade: "Weak spots found.",
  Sensei: "Architecture approved.",
  Tester: "Checks passed."
};

const petals = [
  { delay: -1.4, left: 12, size: 20, speed: 8.2 },
  { delay: -5.1, left: 29, size: 16, speed: 10.4 },
  { delay: -2.8, left: 54, size: 22, speed: 9.1 },
  { delay: -6.3, left: 73, size: 18, speed: 11.2 },
  { delay: -4.5, left: 91, size: 15, speed: 8.8 }
];

function createActors(): DojoActor[] {
  return demoOutput.agents.map((agent) => {
    const home = homePositions[agent.name] ?? { x: 50, y: 86 };
    const work = workPositions[agent.name] ?? { x: 50, y: 50 };

    return {
      effect: "idle",
      facing: getFacing(home, work),
      home,
      id: agent.name,
      name: agent.name,
      position: home,
      role: agent.role,
      state: "idle",
      work
    };
  });
}

function getFacing(from: Position, to: Position): Facing {
  return to.x < from.x ? "left" : "right";
}

function makeDialogue(step: TimelineStep): DojoDialogue {
  return {
    createdAt: new Date().toISOString(),
    id: `run-${step.at}`,
    message: step.message,
    role: step.role,
    speaker: step.speaker
  };
}

function speechFor(actor: DojoActor) {
  if (actor.state === "walking") {
    return "On my way.";
  }

  if (actor.state === "working") {
    return busyLines[actor.name] ?? "Working.";
  }

  if (actor.state === "done") {
    return doneLines[actor.name] ?? "Done.";
  }

  return "Waiting for the scroll.";
}

export function LiveDojo(_legacyProps: LegacyLiveDojoProps = {}) {
  const [actors, setActors] = useState<DojoActor[]>(createActors);
  const [activeAgent, setActiveAgent] = useState<string | undefined>();
  const [agentEffect, setAgentEffect] = useState<AgentEffect>("idle");
  const [complete, setComplete] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [dialogue, setDialogue] = useState<DojoDialogue[]>([]);
  const [running, setRunning] = useState(false);
  const [showScroll, setShowScroll] = useState(false);
  const [showSlash, setShowSlash] = useState(false);
  const [speech, setSpeech] = useState<{ actorId: string; message: string }>();
  const speechTimerRef = useRef<number | undefined>(undefined);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    return () => clearTimers();
  }, []);

  function clearTimers() {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];

    if (speechTimerRef.current) {
      window.clearTimeout(speechTimerRef.current);
      speechTimerRef.current = undefined;
    }
  }

  function resetDojo() {
    clearTimers();
    setActors(createActors());
    setActiveAgent(undefined);
    setAgentEffect("idle");
    setComplete(false);
    setCurrentStage(0);
    setDialogue([]);
    setRunning(false);
    setShowScroll(false);
    setShowSlash(false);
    setSpeech(undefined);
  }

  function appendLog(step: TimelineStep) {
    setDialogue((current) => [...current, makeDialogue(step)].slice(-24));
  }

  function showActorSpeech(actor: DojoActor) {
    if (speechTimerRef.current) {
      window.clearTimeout(speechTimerRef.current);
    }

    setSpeech({
      actorId: actor.id,
      message: speechFor(actor)
    });
    speechTimerRef.current = window.setTimeout(() => {
      setSpeech(undefined);
      speechTimerRef.current = undefined;
    }, 3000);
  }

  function beginAgentWalk(step: TimelineStep) {
    if (!step.activeAgent) {
      return;
    }

    setActors((current) =>
      current.map((actor) => {
        if (actor.id === step.activeAgent) {
          return {
            ...actor,
            effect: step.effect,
            facing: getFacing(actor.position, actor.work),
            position: actor.work,
            state: "walking"
          };
        }

        if (actor.state === "working") {
          return {
            ...actor,
            state: "done"
          };
        }

        return actor;
      })
    );

    const walkTimer = window.setTimeout(() => {
      setActors((current) =>
        current.map((actor) =>
          actor.id === step.activeAgent && actor.state === "walking"
            ? {
                ...actor,
                state: "working"
              }
            : actor
        )
      );
    }, 1200);
    timersRef.current.push(walkTimer);
  }

  function completeAllActors() {
    setActors((current) =>
      current.map((actor) => ({
        ...actor,
        effect: "idle",
        position: actor.work,
        state: "done"
      }))
    );
  }

  function runDojo() {
    if (running) {
      return;
    }

    clearTimers();
    setActors(createActors());
    setActiveAgent(undefined);
    setAgentEffect("idle");
    setComplete(false);
    setCurrentStage(0);
    setDialogue([]);
    setRunning(true);
    setShowScroll(false);
    setShowSlash(false);
    setSpeech(undefined);

    timeline.forEach((step) => {
      const timer = window.setTimeout(() => {
        setCurrentStage(step.stage);
        setAgentEffect(step.effect);
        setActiveAgent(step.activeAgent);
        appendLog(step);

        if (step.role === "Scroll") {
          setShowScroll(true);
        }

        beginAgentWalk(step);

        if (step.effect === "attack") {
          setShowSlash(true);
          const slashTimer = window.setTimeout(() => setShowSlash(false), 900);
          timersRef.current.push(slashTimer);
        }

        if (step.role === "Moonrise") {
          completeAllActors();
          setActiveAgent(undefined);
          setAgentEffect("idle");
          setComplete(true);
          setRunning(false);
          setShowSlash(false);
        }
      }, step.at);

      timersRef.current.push(timer);
    });
  }

  const activeActor = activeAgent
    ? actors.find((actor) => actor.id === activeAgent)
    : undefined;
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
          <div
            className="rpg-board"
            data-complete={complete}
            data-running={running}
          >
            <img
              alt=""
              className="rpg-board__background"
              draggable={false}
              src="/assets/dojo/dojo-background.png"
            />
            <div className="rpg-board__vignette" />

            <div className="rpg-board__status">
              <strong>{boardTitle}</strong>
              <span>
                {complete
                  ? "Moonrise: shipped."
                  : "Scroll → Plan → Build → Attack → Review → Deploy → Judge → Moonrise"}
              </span>
            </div>

            {petals.map((petal, index) => (
              <img
                alt=""
                className="rpg-board__petal"
                draggable={false}
                key={index}
                src="/assets/dojo/petal.png"
                style={
                  {
                    "--petal-delay": `${petal.delay}s`,
                    "--petal-left": `${petal.left}%`,
                    "--petal-size": `${petal.size}px`,
                    "--petal-speed": `${petal.speed}s`
                  } as CSSProperties
                }
              />
            ))}

            {showScroll || !running ? (
              <motion.img
                alt="Parchment scroll"
                animate={{
                  opacity: showScroll ? 1 : 0.58,
                  scale: showScroll ? [0.78, 1.08, 1] : 0.72,
                  y: showScroll ? [-60, 8, 0] : 0
                }}
                className="rpg-board__scroll"
                data-planning={activeAgent === "Moji" && !complete}
                data-resting={!showScroll}
                draggable={false}
                initial={false}
                src="/assets/dojo/scroll.png"
                style={
                  {
                    "--scroll-x": `${scrollPosition.x}%`,
                    "--scroll-y": `${scrollPosition.y}%`
                  } as CSSProperties
                }
                transition={{ duration: showScroll ? 0.65 : 0.25 }}
              />
            ) : null}

            {actors
              .filter((actor) => actor.state === "walking")
              .map((actor) => (
                <span
                  aria-hidden="true"
                  className="rpg-path-hint"
                  key={`path-${actor.id}`}
                  style={
                    {
                      "--path-angle": `${Math.atan2(
                        actor.work.y - actor.home.y,
                        actor.work.x - actor.home.x
                      )}rad`,
                      "--path-left": `${actor.home.x}%`,
                      "--path-length": `${Math.hypot(
                        actor.work.x - actor.home.x,
                        actor.work.y - actor.home.y
                      )}%`,
                      "--path-top": `${actor.home.y}%`
                    } as CSSProperties
                  }
                />
              ))}

            <div className="rpg-board__sprites">
              {actors.map((actor) => (
                <DojoSprite
                  actor={actor}
                  isActive={activeAgent === actor.id}
                  key={actor.id}
                  onSpeak={() => showActorSpeech(actor)}
                  speech={speech?.actorId === actor.id ? speech.message : undefined}
                />
              ))}
            </div>

            {showSlash ? (
              <motion.img
                alt=""
                animate={{ opacity: [0, 1, 0], scale: [0.72, 1.2, 1.34] }}
                className="rpg-board__slash"
                draggable={false}
                initial={{ opacity: 0, scale: 0.7 }}
                src="/assets/dojo/slash.png"
                transition={{ duration: 0.9, ease: "easeOut" }}
              />
            ) : null}

            {process.env.NODE_ENV === "development" ? (
              <div className="rpg-debug">
                stage={currentStage} agent={activeAgent ?? "none"} state=
                {activeActor?.state ?? "none"}
              </div>
            ) : null}
          </div>
        </div>

        <MoonPanel isComplete={complete} isRunning={running} />
      </div>

      <div className="rpg-controls">
        <button disabled={running} onClick={runDojo} type="button">
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
