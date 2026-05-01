"use client";

type MoonGaugeProps = {
  earnedProgress: number;
  eternalHealth: number;
  sprintLabel: string;
};

export function MoonGauge({
  earnedProgress,
  eternalHealth,
  sprintLabel
}: MoonGaugeProps) {
  return (
    <div className="moon-gauges" aria-label="Twin moon status gauges">
      <div className="moon-gauge" title={`Eternal Moon health · ${eternalHealth}%`}>
        <span
          className="moon-gauge__orb moon-gauge__orb--eternal"
          style={{ opacity: 0.35 + eternalHealth / 160 }}
        />
        <em>Eternal</em>
        <strong>{eternalHealth}%</strong>
      </div>
      <div className="moon-gauge" title={`${sprintLabel} · ${earnedProgress}%`}>
        <span className="moon-gauge__orb moon-gauge__orb--earned">
          <i style={{ height: `${earnedProgress}%` }} />
        </span>
        <em>{sprintLabel}</em>
        <strong>{earnedProgress}%</strong>
      </div>
    </div>
  );
}
