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

const spritePositions: Record<string, { idle: { x: number; y: number }; active: { x: number; y: number } }> = {
  Meowts: { active: { x: 84, y: 32 }, idle: { x: 87, y: 38 } },
  Miji: { active: { x: 34, y: 62 }, idle: { x: 25, y: 68 } },
  Moji: { active: { x: 41, y: 47 }, idle: { x: 18, y: 38 } },
  Renegade: { active: { x: 60, y: 46 }, idle: { x: 68, y: 45 } },
  Sensei: { active: { x: 67, y: 62 }, idle: { x: 75, y: 68 } },
  Tester: { active: { x: 50, y: 66 }, idle: { x: 50, y: 74 } }
};

const petals = [
  { delay: -1.4, left: 12, size: 20, speed: 8.2 },
  { delay: -5.1, left: 29, size: 16, speed: 10.4 },
  { delay: -2.8, left: 54, size: 22, speed: 9.1 },
  { delay: -6.3, left: 73, size: 18, speed: 11.2 },
  { delay: -4.5, left: 91, size: 15, speed: 8.8 }
];

function createIdleAgents(): DojoAgent[] {
  return demoOutput.agents.map((agent) => ({
    ...agent,
    output: "",
    status: "idle"
  }));
}

function getAgentOutput(agentName: string) {
  return demoOutput.agents.find((agent) => agent.name === agentName)?.output ?? "";
}

function nextAgentState(agent: DojoAgent, activeAgent?: string): DojoAgent {
  if (agent.name === activeAgent) {
    return {
      ...agent,
      output: getAgentOutput(agent.name),
      status: "working"
    };
  }

  if (agent.status === "working") {
    return {
      ...agent,
      output: getAgentOutput(agent.name),
      status: "complete"
    };
  }

  return agent;
}

export function LiveDojo(_legacyProps: LegacyLiveDojoProps = {}) {
  const [agents, setAgents] = useState<DojoAgent[]>(createIdleAgents);
  const [activeAgent, setActiveAgent] = useState<string | undefined>();
  const [agentEffect, setAgentEffect] = useState<AgentEffect>("idle");
  const [complete, setComplete] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [dialogue, setDialogue] = useState<DojoDialogue[]>([]);
  const [running, setRunning] = useState(false);
  const [showScroll, setShowScroll] = useState(false);
  const [showSlash, setShowSlash] = useState(false);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    return () => clearTimers();
  }, []);

  function clearTimers() {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }

  function resetDojo() {
    clearTimers();
    setActiveAgent(undefined);
    setAgentEffect("idle");
    setAgents(createIdleAgents());
    setComplete(false);
    setCurrentStage(0);
    setDialogue([]);
    setRunning(false);
    setShowScroll(false);
    setShowSlash(false);
  }

  function appendLog(step: TimelineStep) {
    setDialogue((current) =>
      [
        ...current,
        {
          createdAt: new Date().toISOString(),
          id: `run-${step.at}`,
          message: step.message,
          role: step.role,
          speaker: step.speaker
        }
      ].slice(-24)
    );
  }

  function completeAllAgents() {
    setAgents((current) =>
      current.map((agent) => ({
        ...agent,
        output: getAgentOutput(agent.name),
        status: "complete"
      }))
    );
  }

  function runDojo() {
    if (running) {
      return;
    }

    clearTimers();
    setActiveAgent(undefined);
    setAgentEffect("idle");
    setAgents(createIdleAgents());
    setComplete(false);
    setCurrentStage(0);
    setDialogue([]);
    setRunning(true);
    setShowScroll(false);
    setShowSlash(false);

    timeline.forEach((step) => {
      const timer = window.setTimeout(() => {
        setCurrentStage(step.stage);
        setAgentEffect(step.effect);
        setActiveAgent(step.activeAgent);
        appendLog(step);

        if (step.role === "Scroll") {
          setShowScroll(true);
        }

        if (step.activeAgent) {
          setAgents((current) =>
            current.map((agent) => nextAgentState(agent, step.activeAgent))
          );
        }

        if (step.effect === "attack") {
          setShowSlash(true);
          const slashTimer = window.setTimeout(() => setShowSlash(false), 900);
          timersRef.current.push(slashTimer);
        }

        if (step.role === "Moonrise") {
          completeAllAgents();
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
                data-resting={!showScroll}
                draggable={false}
                initial={false}
                src="/assets/dojo/scroll.png"
                transition={{ duration: showScroll ? 0.65 : 0.25 }}
              />
            ) : null}

            <div className="rpg-board__sprites">
              {agents.map((agent) => {
                const positions = spritePositions[agent.name] ?? {
                  active: { x: 50, y: 50 },
                  idle: { x: 50, y: 50 }
                };
                const isActive = activeAgent === agent.name;
                const position = isActive ? positions.active : positions.idle;

                return (
                  <DojoSprite
                    agent={agent}
                    effect={isActive ? agentEffect : "idle"}
                    isActive={isActive}
                    key={agent.name}
                    x={position.x}
                    y={position.y}
                  />
                );
              })}
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
