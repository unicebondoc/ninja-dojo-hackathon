"use client";

import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import type { DojoAgent, DojoDialogue } from "@/lib/types";

type AnimeDojoStageProps = {
  agents: DojoAgent[];
  isComplete: boolean;
  isRunning: boolean;
  latestLine?: DojoDialogue;
};

type AnimeEffect = "idle" | "plan" | "build" | "attack" | "review" | "deploy" | "judge";

type StageAgent = {
  name: string;
  role: string;
  accent: string;
  x: number;
  y: number;
  face: "ninja" | "masked" | "mentor" | "deployer" | "cat";
};

const stageAgents: Record<string, StageAgent> = {
  Moji: { name: "Moji", role: "Plan", accent: "#f6e7b1", x: 18, y: 45, face: "ninja" },
  Miji: { name: "Miji", role: "Build", accent: "#dc2626", x: 36, y: 66, face: "ninja" },
  Maji: { name: "Maji", role: "Attack", accent: "#fb923c", x: 72, y: 43, face: "masked" },
  Meji: { name: "Meji", role: "Review", accent: "#99f6e4", x: 61, y: 66, face: "mentor" },
  Muji: { name: "Muji", role: "Deploy", accent: "#93c5fd", x: 21, y: 75, face: "deployer" },
  Meowts: { name: "Meowts", role: "Judge", accent: "#f9a8d4", x: 82, y: 74, face: "cat" }
};

export function AnimeDojoStage({
  agents,
  isComplete,
  isRunning,
  latestLine
}: AnimeDojoStageProps) {
  const effect = getEffectForSpeaker(latestLine?.speaker);
  const speaker = latestLine?.speaker;

  return (
    <div className="anime-dojo-shell mt-5" data-effect={effect} data-running={isRunning}>
      <div className="anime-dojo-sky">
        <motion.div
          animate={{
            opacity: isComplete ? 1 : 0.42,
            y: isComplete ? 0 : 36,
            scale: isComplete ? 1 : 0.84
          }}
          className="anime-dojo-moon"
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <div className="anime-dojo-wall">
        <div className="anime-dojo-lantern anime-dojo-lantern--left" />
        <div className="anime-dojo-lantern anime-dojo-lantern--right" />
        <div className="anime-dojo-scroll">
          <span>SCROLL</span>
        </div>
      </div>

      <div className="anime-dojo-floor">
        <div className="anime-dojo-ring" />
      </div>

      <motion.div
        animate={{
          opacity: isRunning || isComplete ? 1 : 0.64,
          x: speaker === "Miji" || speaker === "Maji" ? 8 : 0,
          scale: speaker === "Miji" ? 1.03 : 1
        }}
        className="anime-hero-card"
        transition={{ type: "spring", stiffness: 160, damping: 16 }}
      >
        <img
          alt="Anime female ninja lead for Ninja Dojo"
          className="anime-hero-image"
          src="/anime/female-ninja-reference.svg"
        />
        <div className="anime-hero-label">
          <span>Lead Ninja</span>
          <strong>Codename: Miji</strong>
        </div>
      </motion.div>

      <div className="anime-agent-layer">
        {agents.map((agent) => {
          const stageAgent = stageAgents[agent.name] ?? {
            name: agent.name,
            role: agent.role,
            accent: "#f6e7b1",
            x: 50,
            y: 60,
            face: "ninja" as const
          };
          const isSpeaking = speaker === agent.name;
          const isWorking = agent.status === "working";
          const isDone = agent.status === "complete";
          const x = isComplete
            ? 50 + (stageAgent.x - 50) * 0.58
            : isRunning && agent.status !== "idle"
              ? 50 + (stageAgent.x - 50) * 0.76
              : stageAgent.x;
          const y = isComplete
            ? 58 + (stageAgent.y - 58) * 0.44
            : isRunning && agent.status !== "idle"
              ? 57 + (stageAgent.y - 57) * 0.62
              : stageAgent.y;

          return (
            <motion.div
              animate={{
                left: `${x}%`,
                top: `${y}%`,
                scale: isSpeaking ? 1.18 : isWorking ? 1.08 : 1,
                y: isWorking || isSpeaking ? [0, -8, 0] : 0
              }}
              className="anime-agent"
              data-active={isSpeaking || isWorking}
              data-complete={isDone}
              data-face={stageAgent.face}
              key={agent.name}
              style={{ "--agent-accent": stageAgent.accent } as CSSProperties}
              transition={{
                left: { type: "spring", stiffness: 90, damping: 18 },
                top: { type: "spring", stiffness: 90, damping: 18 },
                scale: { type: "spring", stiffness: 180, damping: 16 },
                y: { repeat: isWorking || isSpeaking ? Infinity : 0, duration: 0.72 }
              }}
            >
              {isSpeaking ? <div className="anime-speech-burst">LIVE</div> : null}
              <div className="anime-agent-shadow" />
              <div className="anime-agent-body">
                <div className="anime-agent-hair" />
                <div className="anime-agent-face">
                  <span className="anime-agent-eye anime-agent-eye--left" />
                  <span className="anime-agent-eye anime-agent-eye--right" />
                  <span className="anime-agent-mouth" />
                </div>
                <div className="anime-agent-scarf" />
                <div className="anime-agent-blade" />
              </div>
              <div className="anime-agent-nameplate">
                <strong>{agent.name}</strong>
                <span>{agent.role}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="anime-battle-layer" data-effect={effect}>
        <div className="anime-battle-slash anime-battle-slash--one" />
        <div className="anime-battle-slash anime-battle-slash--two" />
        <div className="anime-shuriken anime-shuriken--one" />
        <div className="anime-shuriken anime-shuriken--two" />
        <div className="anime-impact anime-impact--one" />
        <div className="anime-impact anime-impact--two" />
      </div>

      <div className="anime-dojo-hud">
        <span>{isComplete ? "Moonrise victory" : isRunning ? "Live anime dojo" : "Awaiting scroll"}</span>
        <span>{effect === "idle" ? "Dojo calm" : `${effect} technique`}</span>
      </div>

      {latestLine ? (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="anime-dialogue-card"
          initial={{ opacity: 0, y: 14 }}
          key={latestLine.id}
          transition={{ duration: 0.24 }}
        >
          <div className="anime-dialogue-portrait" data-speaker={latestLine.speaker}>
            <span />
          </div>
          <div>
            <strong>{latestLine.speaker}</strong>
            <span>{latestLine.message}</span>
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}

function getEffectForSpeaker(speaker?: string): AnimeEffect {
  if (!speaker) {
    return "idle";
  }

  if (speaker === "Moji") {
    return "plan";
  }

  if (speaker === "Miji") {
    return "build";
  }

  if (speaker === "Maji") {
    return "attack";
  }

  if (speaker === "Meji") {
    return "review";
  }

  if (speaker === "Muji") {
    return "deploy";
  }

  if (speaker === "Meowts") {
    return "judge";
  }

  return "idle";
}
