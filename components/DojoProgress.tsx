"use client";

import type { DojoAgent } from "@/lib/types";

type DojoProgressProps = {
  agents: DojoAgent[];
  isComplete: boolean;
  isRunning: boolean;
};

const steps = [
  "Scroll",
  "Moji",
  "Miji",
  "Renegade",
  "Sensei",
  "Tester",
  "Meowts",
  "Moon"
];

export function DojoProgress({
  agents,
  isComplete,
  isRunning
}: DojoProgressProps) {
  const completedNames = new Set(
    agents
      .filter((agent) => agent.status === "complete")
      .map((agent) => agent.name)
  );

  return (
    <div className="dojo-progress" aria-label="Dojo run progress">
      {steps.map((step) => {
        const isDone =
          step === "Scroll"
            ? isRunning || isComplete || completedNames.size > 0
            : step === "Moon"
              ? isComplete
              : completedNames.has(step);
        const isActive = agents.some(
          (agent) => agent.name === step && agent.status === "working"
        );

        return (
          <span data-active={isActive} data-complete={isDone} key={step}>
            {step}
          </span>
        );
      })}
    </div>
  );
}
