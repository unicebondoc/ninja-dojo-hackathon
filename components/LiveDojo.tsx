"use client";

import { motion } from "framer-motion";
import type { DojoAgent, DojoDialogue } from "@/lib/types";

type LiveDojoProps = {
  agents: DojoAgent[];
  dialogue: DojoDialogue[];
  isComplete: boolean;
  isRunning: boolean;
};

export function LiveDojo({
  agents,
  dialogue,
  isComplete,
  isRunning
}: LiveDojoProps) {
  const latestLine = dialogue.at(-1);
  const latestSpeaker = latestLine?.speaker;
  const visibleDialogue = dialogue.slice(-6);

  return (
    <div className="relative overflow-hidden rounded-lg border border-white/10 bg-black/55 p-5 shadow-shoji">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(246,231,177,0.12),transparent_28rem),linear-gradient(180deg,rgba(220,38,38,0.08),transparent)]" />
      <div className="relative z-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold">
              Live dojo
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">
              {isComplete
                ? "Council complete"
                : isRunning
                  ? "Ninjas are talking"
                  : "Ready to open the floor"}
            </h2>
          </div>
          <span className="rounded-full border border-blood/40 bg-blood/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-red-100 shadow-blood">
            SSE live stream
          </span>
        </div>

        <PixelDojoStage
          agents={agents}
          isComplete={isComplete}
          isRunning={isRunning}
          latestLine={latestLine}
        />

        <div className="mt-5 rounded-md border border-moon/15 bg-zinc-950/70 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
              Dojo comms
            </p>
            <span className="h-2 w-2 rounded-full bg-blood shadow-blood" />
          </div>
          <div className="mt-4 space-y-3">
            {visibleDialogue.length === 0 ? (
              <p className="text-sm leading-6 text-zinc-500">
                Start a scroll and the council will narrate the run in real
                time.
              </p>
            ) : (
              visibleDialogue.map((line) => (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-md border border-white/10 bg-black/45 p-3"
                  initial={{ opacity: 0, y: 8 }}
                  key={line.id}
                  transition={{ duration: 0.25 }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-black text-white">
                      {line.speaker}
                      <span className="ml-2 text-xs font-bold uppercase tracking-[0.16em] text-gold">
                        {line.role}
                      </span>
                    </p>
                    <time className="text-xs text-zinc-600">
                      {formatTime(line.createdAt)}
                    </time>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-300">
                    {line.message}
                  </p>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PixelDojoStage({
  agents,
  isComplete,
  isRunning,
  latestLine
}: {
  agents: DojoAgent[];
  isComplete: boolean;
  isRunning: boolean;
  latestLine?: DojoDialogue;
}) {
  const activeEffect = getBattleEffect(latestLine);

  return (
    <div className="pixel-dojo mt-5 aspect-[16/11] min-h-[420px] overflow-hidden rounded-md border border-moon/15 bg-zinc-950/80">
      <div className="pixel-dojo__wall" />
      <div className="pixel-dojo__beam pixel-dojo__beam--top" />
      <div className="pixel-dojo__beam pixel-dojo__beam--bottom" />
      <div className="pixel-dojo__mat" />
      <div className="pixel-dojo__sparring-ring" />
      <div className="pixel-dojo__scroll">
        <span />
      </div>
      <div className="pixel-dojo__weapon-rack pixel-dojo__weapon-rack--left" />
      <div className="pixel-dojo__weapon-rack pixel-dojo__weapon-rack--right" />
      <div className="pixel-dojo__lantern pixel-dojo__lantern--left" />
      <div className="pixel-dojo__lantern pixel-dojo__lantern--right" />
      <div className="pixel-dojo__moon" data-visible={isComplete} />
      <BattleEffect effect={activeEffect} />
      <div className="pixel-dojo__caption">
        {isComplete
          ? "moonrise shipped"
          : isRunning
            ? "live run in motion"
            : "press launch to wake the dojo"}
      </div>

      {agents.map((agent, index) => (
        <PixelCharacter
          agent={agent}
          index={index}
          isComplete={isComplete}
          isRunning={isRunning}
          isSpeaking={latestLine?.speaker === agent.name}
          key={agent.name}
          latestLine={latestLine}
        />
      ))}
    </div>
  );
}

function BattleEffect({ effect }: { effect: BattleEffectKind }) {
  if (effect === "idle") {
    return null;
  }

  return (
    <div className="battle-layer" data-effect={effect}>
      <span className="battle-slash battle-slash--one" />
      <span className="battle-slash battle-slash--two" />
      <span className="battle-shuriken battle-shuriken--one" />
      <span className="battle-shuriken battle-shuriken--two" />
      <span className="battle-impact battle-impact--one" />
      <span className="battle-impact battle-impact--two" />
    </div>
  );
}

const homePositions = {
  Moji: { x: 20, y: 30 },
  Miji: { x: 35, y: 76 },
  Renegade: { x: 80, y: 34 },
  Sensei: { x: 67, y: 76 },
  Tester: { x: 16, y: 70 },
  Meowts: { x: 85, y: 72 }
};

const councilPositions = {
  Moji: { x: 36, y: 39 },
  Miji: { x: 45, y: 64 },
  Renegade: { x: 62, y: 42 },
  Sensei: { x: 56, y: 67 },
  Tester: { x: 31, y: 62 },
  Meowts: { x: 72, y: 58 }
};

const shippedPositions = {
  Moji: { x: 31, y: 38 },
  Miji: { x: 43, y: 63 },
  Renegade: { x: 60, y: 38 },
  Sensei: { x: 54, y: 68 },
  Tester: { x: 24, y: 62 },
  Meowts: { x: 75, y: 47 }
};

const spriteAccent = {
  Moji: "#f6e7b1",
  Miji: "#dc2626",
  Renegade: "#f97316",
  Sensei: "#a7f3d0",
  Tester: "#93c5fd",
  Meowts: "#f9a8d4"
};

type BattleEffectKind = "idle" | "plan" | "build" | "attack" | "review" | "deploy" | "judge";

function getBattleEffect(line?: DojoDialogue): BattleEffectKind {
  if (!line) {
    return "idle";
  }

  if (line.speaker === "Renegade") {
    return "attack";
  }

  if (line.speaker === "Miji") {
    return "build";
  }

  if (line.speaker === "Sensei") {
    return "review";
  }

  if (line.speaker === "Tester") {
    return "deploy";
  }

  if (line.speaker === "Meowts") {
    return "judge";
  }

  if (line.speaker === "Moji") {
    return "plan";
  }

  return "idle";
}

function PixelCharacter({
  agent,
  index,
  isComplete,
  isRunning,
  isSpeaking,
  latestLine
}: {
  agent: DojoAgent;
  index: number;
  isComplete: boolean;
  isRunning: boolean;
  isSpeaking: boolean;
  latestLine?: DojoDialogue;
}) {
  const position = getCharacterPosition(agent, isComplete, isRunning, isSpeaking);
  const isActive = agent.status === "working" || isSpeaking;
  const isMeowts = agent.name === "Meowts";
  const direction = position.x > 50 ? "left" : "right";

  return (
    <motion.div
      animate={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        scale: isActive ? 1.08 : 1
      }}
      className="pixel-character"
      data-active={isActive}
      data-direction={direction}
      data-meowts={isMeowts}
      data-speaking={isSpeaking}
      initial={false}
      style={
        {
          "--sprite-accent":
            spriteAccent[agent.name as keyof typeof spriteAccent] ?? "#dc2626",
          zIndex: Math.round(position.y)
        } as React.CSSProperties
      }
      transition={{ duration: 0.75, ease: "easeInOut" }}
    >
      {isSpeaking && latestLine ? (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="pixel-speech"
          initial={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.2 }}
        >
          {latestLine.message}
        </motion.div>
      ) : null}
      <div
        className={[
          "pixel-sprite-wrap",
          isActive ? "pixel-sprite-wrap--active" : "",
          isMeowts ? "pixel-sprite-wrap--cat" : ""
        ].join(" ")}
      >
        <div
          className={isMeowts ? "pixel-cat-sprite" : "pixel-ninja-sprite"}
          data-complete={agent.status === "complete"}
        />
        <span className="pixel-shadow" />
      </div>
      <div className="pixel-nameplate">
        <span>{agent.name}</span>
        <span>{String(index + 1).padStart(2, "0")}</span>
      </div>
    </motion.div>
  );
}

function getCharacterPosition(
  agent: DojoAgent,
  isComplete: boolean,
  isRunning: boolean,
  isSpeaking: boolean
) {
  const name = agent.name as keyof typeof homePositions;

  if (isComplete) {
    return shippedPositions[name] ?? homePositions[name];
  }

  if (isRunning && (agent.status !== "idle" || isSpeaking)) {
    return councilPositions[name] ?? homePositions[name];
  }

  return homePositions[name];
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "now";
  }

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit"
  });
}
