"use client";

import type { DojoAgent } from "@/lib/types";

type DojoProgressProps = {
  agents: DojoAgent[];
  isComplete: boolean;
  isRunning: boolean;
};

const steps = [
  { label: "Scroll", agent: null },
  { label: "Plan", agent: "Moji" },
  { label: "Build", agent: "Miji" },
  { label: "Attack", agent: "Renegade" },
  { label: "Review", agent: "Sensei" },
  { label: "Deploy", agent: "Tester" },
  { label: "Judge", agent: "Meowts" },
  { label: "Moonrise", agent: null }
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
      {steps.map((step, index) => {
        const agentName = step.agent;
        const isDone =
          step.label === "Scroll"
            ? isRunning || isComplete || completedNames.size > 0
            : step.label === "Moonrise"
              ? isComplete
              : Boolean(agentName && completedNames.has(agentName));
        const isActive =
          step.label === "Scroll"
            ? isRunning && completedNames.size === 0
            : Boolean(
                agentName &&
                  agents.some(
                    (agent) =>
                      agent.name === agentName && agent.status === "working"
                  )
              );

        return (
          <span
            data-active={isActive}
            data-complete={isDone}
            key={step.label}
          >
            <i>{String(index + 1).padStart(2, "0")}</i>
            {step.label}
          </span>
        );
      })}
    </div>
  );
}
