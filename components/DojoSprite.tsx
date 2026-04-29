"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import type { CSSProperties } from "react";
import type { DojoAgent } from "@/lib/types";

type DojoSpriteProps = {
  agent: DojoAgent;
  isSpeaking: boolean;
  x: number;
  y: number;
};

const spriteMeta: Record<
  string,
  {
    accent: string;
    variant: "scroll" | "builder" | "blade" | "sensei" | "tester" | "cat";
    sheetIndex: number;
  }
> = {
  Moji: { accent: "#f6e7b1", variant: "scroll", sheetIndex: 0 },
  Miji: { accent: "#dc2626", variant: "builder", sheetIndex: 1 },
  Renegade: { accent: "#fb923c", variant: "blade", sheetIndex: 2 },
  Sensei: { accent: "#cbd5e1", variant: "sensei", sheetIndex: 3 },
  Tester: { accent: "#93c5fd", variant: "tester", sheetIndex: 4 },
  Meowts: { accent: "#f9a8d4", variant: "cat", sheetIndex: 5 }
};

export function DojoSprite({ agent, isSpeaking, x, y }: DojoSpriteProps) {
  const meta = spriteMeta[agent.name] ?? spriteMeta.Moji;
  const isWorking = agent.status === "working";
  const isComplete = agent.status === "complete";
  const [sheetState, setSheetState] = useState<"loading" | "loaded" | "missing">(
    "loading"
  );

  return (
    <motion.div
      animate={{
        left: `${x}%`,
        top: `${y}%`,
        scale: isSpeaking ? 1.16 : isWorking ? 1.08 : 1,
        y: isWorking || isSpeaking ? [0, -7, 0] : 0
      }}
      className="dojo-sprite"
      data-complete={isComplete}
      data-speaking={isSpeaking}
      data-sheet={sheetState === "loaded"}
      data-status={agent.status}
      data-variant={meta.variant}
      style={
        {
          "--sprite-accent": meta.accent,
          "--sprite-index": meta.sheetIndex
        } as CSSProperties
      }
      transition={{
        left: { type: "spring", stiffness: 90, damping: 18 },
        top: { type: "spring", stiffness: 90, damping: 18 },
        scale: { type: "spring", stiffness: 180, damping: 18 },
        y: {
          duration: 0.72,
          repeat: isWorking || isSpeaking ? Infinity : 0
        }
      }}
    >
      <div className="dojo-sprite__shadow" />
      <div aria-hidden="true" className="dojo-sprite__image">
        {sheetState !== "missing" ? (
          <span className="dojo-sprite__sheet-frame">
            <img
              alt=""
              onError={() => setSheetState("missing")}
              onLoad={() => setSheetState("loaded")}
              src="/assets/dojo/spritesheet.png"
              style={
                {
                  "--sheet-index": meta.sheetIndex
                } as CSSProperties
              }
            />
          </span>
        ) : null}
        <span className="dojo-sprite__head" />
        <span className="dojo-sprite__mask" />
        <span className="dojo-sprite__body" />
        <span className="dojo-sprite__prop" />
      </div>
      <div className="dojo-sprite__plate">
        <strong>{agent.name}</strong>
        <span>{agent.role}</span>
      </div>
    </motion.div>
  );
}
