"use client";

import Link from "next/link";
import { ExternalLink, RotateCcw, Send } from "lucide-react";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { DojoEventLog } from "@/components/DojoEventLog";
import { DojoProgress } from "@/components/DojoProgress";
import { DojoSprite } from "@/components/DojoSprite";
import { MoonPanel } from "@/components/MoonPanel";
import type { DojoAgent, DojoDialogue } from "@/lib/types";

type LiveDojoProps = {
  agents: DojoAgent[];
  currentStage: number;
  dialogue: DojoDialogue[];
  isComplete: boolean;
  isRunning: boolean;
  onReset: () => void;
  onRun: () => void;
  previewPath?: string;
  showScroll: boolean;
  showSlash: boolean;
};

const spritePositions: Record<string, { x: number; y: number }> = {
  Meowts: { x: 87, y: 38 },
  Miji: { x: 25, y: 68 },
  Moji: { x: 18, y: 38 },
  Renegade: { x: 68, y: 45 },
  Sensei: { x: 75, y: 68 },
  Tester: { x: 50, y: 74 }
};

const petals = [
  { delay: -1.4, left: 12, size: 20, speed: 8.2 },
  { delay: -5.1, left: 29, size: 16, speed: 10.4 },
  { delay: -2.8, left: 54, size: 22, speed: 9.1 },
  { delay: -6.3, left: 73, size: 18, speed: 11.2 },
  { delay: -4.5, left: 91, size: 15, speed: 8.8 }
];

export function LiveDojo({
  agents,
  currentStage,
  dialogue,
  isComplete,
  isRunning,
  onReset,
  onRun,
  previewPath = "/demo/oracle",
  showScroll,
  showSlash
}: LiveDojoProps) {
  const activeSpeaker = dialogue.at(-1)?.speaker;
  const boardTitle = isComplete
    ? "Moonrise: shipped"
    : isRunning
      ? "Scroll in motion"
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
          isComplete={isComplete}
          isRunning={isRunning}
        />
      </header>

      <div className="rpg-hero__layout">
        <DojoEventLog dialogue={dialogue} />

        <div className="rpg-board-shell">
          <div
            className="rpg-board"
            data-complete={isComplete}
            data-running={isRunning}
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
              <span>Scroll → Plan → Build → Attack → Review → Deploy → Judge → Moonrise</span>
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

            {showScroll ? (
              <motion.img
                alt="Parchment scroll"
                animate={{ opacity: 1, scale: [0.84, 1.05, 1] }}
                className="rpg-board__scroll"
                draggable={false}
                initial={{ opacity: 0, scale: 0.72 }}
                src="/assets/dojo/scroll.png"
                transition={{ duration: 0.5 }}
              />
            ) : null}

            <div className="rpg-board__sprites">
              {agents.map((agent) => {
                const position = spritePositions[agent.name] ?? { x: 50, y: 50 };

                return (
                  <DojoSprite
                    agent={agent}
                    isActive={activeSpeaker === agent.name}
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
                animate={{ opacity: [0, 1, 0], scale: [0.76, 1.18, 1.28] }}
                className="rpg-board__slash"
                draggable={false}
                initial={{ opacity: 0, scale: 0.72 }}
                src="/assets/dojo/slash.png"
                transition={{ duration: 0.85, ease: "easeOut" }}
              />
            ) : null}
          </div>
        </div>

        <MoonPanel isComplete={isComplete} isRunning={isRunning} />
      </div>

      <div className="rpg-controls">
        <button disabled={isRunning} onClick={onRun} type="button">
          <Send className="h-5 w-5" />
          {isRunning ? "Scroll running" : "Send Scroll"}
        </button>
        <button className="is-secondary" onClick={onReset} type="button">
          <RotateCcw className="h-5 w-5" />
          Reset Dojo
        </button>
        <Link
          aria-disabled={!isComplete}
          className={!isComplete ? "is-disabled" : undefined}
          href={previewPath}
          tabIndex={!isComplete ? -1 : undefined}
        >
          <ExternalLink className="h-5 w-5" />
          Open Shipped Page
        </Link>
      </div>
    </section>
  );
}
