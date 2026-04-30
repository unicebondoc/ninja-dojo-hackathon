"use client";

type MoonPanelProps = {
  isComplete: boolean;
  isRunning: boolean;
};

export function MoonPanel({ isComplete, isRunning }: MoonPanelProps) {
  return (
    <aside className="rpg-moon-panel">
      <div className="rpg-panel-title">
        <span>Moonrise Status</span>
        <i />
      </div>
      <div className="rpg-moon-panel__orb" data-visible={isComplete}>
        <img alt="" draggable={false} src="/assets/dojo/moon.png" />
      </div>
      <h2>
        {isComplete
          ? "Moonrise: shipped."
          : isRunning
            ? "Judgment pending."
            : "Awaiting final judgment"}
      </h2>
      <p>
        {isComplete
          ? "The run cleared plan, build, attack, review, deploy, and judge."
          : "Meowts will approve the scroll only after every station reports in."}
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
          {isComplete ? "Ready" : "Waiting"}
        </span>
      </div>
    </aside>
  );
}
