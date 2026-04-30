"use client";

import type { CSSProperties } from "react";

type MoonPanelProps = {
  currentStage: number;
  isComplete: boolean;
  isRunning: boolean;
};

export function MoonPanel({
  currentStage,
  isComplete,
  isRunning
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
      style={{ "--deploy-clip": `${(1 - phase) * 100}%` } as CSSProperties}
    >
      <div className="rpg-panel-title">
        <span>Deploy Moon</span>
        <i />
      </div>
      <div className="rpg-moon-panel__orb" data-visible={isRunning || isComplete}>
        <img alt="" draggable={false} src="/assets/dojo/moon.png" />
        <img
          alt=""
          aria-hidden="true"
          className="rpg-moon-panel__phase"
          draggable={false}
          src="/assets/dojo/moon.png"
        />
      </div>
      <h2>{status}</h2>
      <p>
        {isComplete
          ? "The second moon is full. The oracle page is ready to open."
          : isRunning
            ? "The deploy moon fills as the scroll passes through every station."
            : "Two moons watch every build. One eternal, one earned."}
      </p>
      <div className="rpg-moon-panel__stats">
        <span>
          <strong>Mode</strong>
          Cached-first
        </span>
        <span>
          <strong>Route</strong>
          /demo/oracle
        </span>
        <span>
          <strong>Signal</strong>
          {isComplete ? "Ready" : isRunning ? "Running" : "Idle"}
        </span>
      </div>
    </aside>
  );
}
