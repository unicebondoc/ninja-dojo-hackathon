"use client";

import type { CSSProperties } from "react";
import type { RunManifest } from "@/lib/runs/types";

type MoonPanelProps = {
  currentStage: number;
  isComplete: boolean;
  isRunning: boolean;
  prompt?: string;
  run?: RunManifest | null;
};

export function MoonPanel({
  currentStage,
  isComplete,
  isRunning,
  prompt,
  run
}: MoonPanelProps) {
  const phase = isComplete
    ? 1
    : isRunning
      ? Math.max(0.125, Math.min(1, (currentStage + 1) / 8))
      : 0;
  const status = isComplete
    ? "The moon rises."
    : isRunning
      ? "Build in progress."
      : "Awaiting scroll...";

  return (
    <aside
      className="rpg-moon-panel"
      data-complete={isComplete}
      data-running={isRunning}
      style={
        {
          "--deploy-glow-opacity": phase * 0.86,
          "--deploy-glow-scale": 0.62 + phase * 0.36,
          "--deploy-progress": phase
        } as CSSProperties
      }
    >
      <div className="rpg-panel-title">
        <span>Mission Status</span>
        <i />
      </div>
      <div className="rpg-moon-panel__orb" data-visible={isRunning || isComplete}>
        <span aria-hidden="true" className="rpg-moon-panel__charge" />
        <img alt="" draggable={false} src="/assets/dojo/moon.png" />
      </div>
      <h2>{status}</h2>
      <p>
        {isComplete
          ? `Moonrise Receipt produced${prompt ? ` for: ${summarizePrompt(prompt)}` : ""}.`
          : isRunning
            ? "The receipt forms as each plugin handoff and stage result lands."
            : "Awaiting a scroll. The dojo will track mission state and receipt evidence."}
      </p>
      <div className="rpg-moon-panel__stats">
        <span>
          <strong>Mission Type</strong>
          {run ? run.productType : "Dojo Preview"}
        </span>
        <span>
          <strong>Receipt</strong>
          {isComplete ? "Ready to open" : "Ready after run"}
        </span>
        <span>
          <strong>Status</strong>
          {isComplete ? "Ready" : isRunning ? "Running" : "Idle"}
        </span>
        {isComplete && run ? (
          <span>
          <strong>Meowts</strong>
            {run.judgeResult.score}/100 · {run.judgeResult.verdict}
          </span>
        ) : null}
      </div>
    </aside>
  );
}

function summarizePrompt(prompt: string) {
  const clean = prompt.trim().replace(/\s+/g, " ");
  return clean.length > 74 ? `${clean.slice(0, 71)}...` : clean;
}
