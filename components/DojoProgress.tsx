"use client";

type DojoProgressProps = {
  currentStage: number;
  isComplete: boolean;
  isRunning: boolean;
};

const steps = [
  "Scroll",
  "Plan",
  "Build",
  "Attack",
  "Review",
  "Deploy",
  "Judge",
  "Moonrise"
];

export function DojoProgress({
  currentStage,
  isComplete,
  isRunning
}: DojoProgressProps) {
  return (
    <div className="rpg-progress" aria-label="Dojo run progress">
      {steps.map((label, index) => {
        const isDone = isComplete || currentStage > index;
        const isActive =
          currentStage === index || (isComplete && index === steps.length - 1);

        return (
          <span
            data-active={isActive}
            data-complete={isDone}
            data-running={isRunning}
            key={label}
          >
            <i>{String(index + 1).padStart(2, "0")}</i>
            {label}
          </span>
        );
      })}
    </div>
  );
}
