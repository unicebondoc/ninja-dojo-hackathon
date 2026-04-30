"use client";

import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import type { DojoAgent } from "@/lib/types";

type DojoSpriteProps = {
  agent: DojoAgent;
  isActive: boolean;
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

export function DojoSprite({ agent, isActive, x, y }: DojoSpriteProps) {
  const isComplete = agent.status === "complete";
  const fileName = spriteFiles[agent.name] ?? "moji.png";

  return (
    <motion.div
      animate={{
        left: `${x}%`,
        top: `${y}%`,
        scale: isActive ? 1.12 : 1,
        y: isActive ? [0, -8, 0] : 0
      }}
      className="rpg-sprite"
      data-active={isActive}
      data-complete={isComplete}
      data-status={agent.status}
      style={
        {
          "--sprite-x": `${x}%`,
          "--sprite-y": `${y}%`
        } as CSSProperties
      }
      transition={{
        left: { type: "spring", stiffness: 96, damping: 18 },
        scale: { type: "spring", stiffness: 180, damping: 18 },
        top: { type: "spring", stiffness: 96, damping: 18 },
        y: { duration: 0.72, repeat: isActive ? Infinity : 0 }
      }}
    >
      <span className="rpg-sprite__label">
        <strong>{agent.name.toUpperCase()}</strong>
        <em>{agent.role}</em>
      </span>
      <img
        alt={`${agent.name} ${agent.role} ninja sprite`}
        className="rpg-sprite__image"
        draggable={false}
        src={`/assets/dojo/${fileName}`}
      />
      <span className="rpg-sprite__shadow" />
    </motion.div>
  );
}
