"use client";

import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import type { DojoAgent } from "@/lib/types";

type SpriteEffect = "idle" | "plan" | "build" | "attack" | "review" | "deploy" | "judge";

type DojoSpriteProps = {
  agent: DojoAgent;
  effect: SpriteEffect;
  facing: "left" | "right";
  isActive: boolean;
  isWalking: boolean;
  x: number;
  y: number;
};

const spriteFiles: Record<string, string> = {
  Meowts: "meowts.png",
  Miji: "miji.png",
  Moji: "moji.png",
  Renegade: "renegade.png",
  Sensei: "sensei.png",
  Tester: "tester.png"
};

const walkSpriteFiles: Record<string, string> = {
  Meowts: "meowts-walk.png",
  Miji: "miji-walk.png",
  Moji: "moji-walk.png",
  Renegade: "renegade-walk.png",
  Sensei: "sensei-walk.png",
  Tester: "tester-walk.png"
};

function getMotion(effect: SpriteEffect, isActive: boolean) {
  if (!isActive) {
    return { rotate: 0, scale: 1, x: 0, y: 0 };
  }

  if (effect === "attack") {
    return {
      rotate: [0, -4, 5, -2, 0],
      scale: [1, 1.18, 1.08, 1.16, 1.08],
      x: [0, -24, 26, -12, 0],
      y: [0, -8, 4, -4, 0]
    };
  }

  if (effect === "judge") {
    return {
      rotate: [0, -3, 3, 0],
      scale: [1, 1.16, 1.08, 1.14],
      x: 0,
      y: [0, -18, 0, -8, 0]
    };
  }

  return {
    rotate: 0,
    scale: [1, 1.12, 1.04, 1.1],
    x: 0,
    y: [0, -9, 0]
  };
}

export function DojoSprite({
  agent,
  effect,
  facing,
  isActive,
  isWalking,
  x,
  y
}: DojoSpriteProps) {
  const isComplete = agent.status === "complete";
  const fileName = spriteFiles[agent.name] ?? "moji.png";
  const walkFileName = walkSpriteFiles[agent.name] ?? "moji-walk.png";

  return (
    <motion.div
      animate={{
        left: `${x}%`,
        top: `${y}%`,
        ...getMotion(effect, isActive)
      }}
      className="rpg-sprite"
      data-active={isActive}
      data-complete={isComplete}
      data-effect={effect}
      data-facing={facing}
      data-status={agent.status}
      data-walking={isWalking}
      style={
        {
          "--sprite-x": `${x}%`,
          "--sprite-y": `${y}%`,
          "--walk-sheet": `url("/assets/dojo/${walkFileName}")`
        } as CSSProperties
      }
      transition={{
        left: { type: "spring", stiffness: 92, damping: 17 },
        rotate: { duration: effect === "attack" ? 0.48 : 0.7 },
        scale: { duration: effect === "attack" ? 0.48 : 0.75 },
        top: { type: "spring", stiffness: 92, damping: 17 },
        x: { duration: effect === "attack" ? 0.48 : 0.7 },
        y: {
          duration: effect === "attack" ? 0.48 : effect === "judge" ? 0.78 : 0.75,
          repeat: isActive && effect !== "attack" ? Infinity : 0
        }
      }}
    >
      <span className="rpg-sprite__label">
        <strong>{agent.name.toUpperCase()}</strong>
        <em>{agent.role}</em>
      </span>
      {isWalking ? (
        <span
          aria-label={`${agent.name} walking ${agent.role} ninja sprite`}
          className="rpg-sprite__walk"
          role="img"
        />
      ) : (
        <img
          alt={`${agent.name} ${agent.role} ninja sprite`}
          className="rpg-sprite__image"
          draggable={false}
          src={`/assets/dojo/${fileName}`}
        />
      )}
      <span className="rpg-sprite__shadow" />
      {isComplete ? <span className="rpg-sprite__check">✓</span> : null}
    </motion.div>
  );
}
