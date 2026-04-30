"use client";

import type { CSSProperties } from "react";

type MoonPanelProps = {
  currentStage: number;
  isComplete: boolean;
  isRunning: boolean;
  prompt?: string;
};

export function MoonPanel({
  currentStage,
  isComplete,
  isRunning,
  prompt
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
        <span>Deploy Moon</span>
        <i />
      </div>
      <div className="rpg-moon-panel__orb" data-visible={isRunning || isComplete}>
        <span aria-hidden="true" className="rpg-moon-panel__charge" />
        <img alt="" draggable={false} src="/assets/dojo/moon.png" />
      </div>
      <h2>{status}</h2>
      <p>
        {isComplete
          ? `The dojo shipped a first pass${prompt ? ` for: ${summarizePrompt(prompt)}` : ""}.`
          : isRunning
            ? "The deploy moon fills as the scroll passes through every station."
            : "Two moons watch every build. One eternal, one earned."}
      </p>
      <div className="rpg-moon-panel__stats">
        <span>
          <strong>Run Type</strong>
          Dojo Preview
        </span>
        <span>
          <strong>Moonrise</strong>
          {isComplete ? "Ready to open" : "Ready after run"}
        </span>
        <span>
          <strong>Status</strong>
          {isComplete ? "Ready" : isRunning ? "Running" : "Idle"}
        </span>
      </div>
    </aside>
  );
}

function summarizePrompt(prompt: string) {
  const clean = prompt.trim().replace(/\s+/g, " ");
  return clean.length > 74 ? `${clean.slice(0, 71)}...` : clean;
}
