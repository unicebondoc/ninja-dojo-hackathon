"use client";

type MoonPanelProps = {
  isComplete: boolean;
  isRunning: boolean;
};

export function MoonPanel({ isComplete, isRunning }: MoonPanelProps) {
  const status = isComplete
    ? "The moon rises."
    : isRunning
      ? "Build in progress."
      : "Standing by.";

  return (
    <aside className="rpg-moon-panel" data-complete={isComplete}>
      <div className="rpg-panel-title">
        <span>Moonrise Status</span>
        <i />
      </div>
      <div className="rpg-moon-panel__orb" data-visible={isComplete}>
        <img alt="" draggable={false} src="/assets/dojo/moon.png" />
      </div>
      <h2>{status}</h2>
      <p>
        {isComplete
          ? "Moonrise: shipped. The oracle page is ready to open."
          : isRunning
            ? "The dojo is coordinating the scroll through every station."
            : "Drop the scroll and watch the ninjas move through the workflow."}
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
