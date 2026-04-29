"use client";

import { useEffect, useRef, useState } from "react";
import { ArtifactPacket } from "@/components/ArtifactPacket";
import { LiveDojo } from "@/components/LiveDojo";
import { ShojiPanel } from "@/components/ShojiPanel";
import { demoOutput } from "@/lib/demo-output";
import { defaultArtifacts } from "@/lib/run-factory";
import type { DojoAgent, DojoDialogue, DojoRun } from "@/lib/types";

const initialRun: DojoRun = {
  ...demoOutput,
  id: "scroll-cached-demo",
  createdAt: "2026-04-29T00:00:00.000Z",
  source: "cached",
  artifacts: defaultArtifacts
};

const timeline = [
  {
    at: 0,
    speaker: "Dojo",
    role: "Scroll",
    message: "00:00 Scroll received."
  },
  {
    at: 1000,
    speaker: "Moji",
    role: "Plan",
    message: "00:01 Moji is writing the plan..."
  },
  {
    at: 3000,
    speaker: "Miji",
    role: "Build",
    message: "00:03 Miji is building..."
  },
  {
    at: 6000,
    speaker: "Renegade",
    role: "Attack",
    message: "00:06 Renegade is attacking..."
  },
  {
    at: 9000,
    speaker: "Sensei",
    role: "Review",
    message: "00:09 Sensei is reviewing..."
  },
  {
    at: 11000,
    speaker: "Tester",
    role: "Deploy",
    message: "00:11 Tester is running checks..."
  },
  {
    at: 13000,
    speaker: "Meowts",
    role: "Judge",
    message: "00:13 Meowts is judging..."
  },
  {
    at: 15000,
    speaker: "Dojo",
    role: "Moonrise",
    message: "00:15 The moon rises. The build is complete."
  }
];

function getIdleAgents(): DojoAgent[] {
  return demoOutput.agents.map((agent) => ({
    ...agent,
    status: "idle",
    output: ""
  }));
}

function completeAgent(agent: DojoAgent): DojoAgent {
  const demoAgent = demoOutput.agents.find((item) => item.name === agent.name);

  return {
    ...agent,
    status: "complete",
    output: demoAgent?.output ?? agent.output
  };
}

export function DojoDashboard() {
  const [agents, setAgents] = useState<DojoAgent[]>(getIdleAgents);
  const [dialogue, setDialogue] = useState<DojoDialogue[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    return () => clearTimers();
  }, []);

  function clearTimers() {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }

  function resetDojo() {
    clearTimers();
    setAgents(getIdleAgents());
    setDialogue([]);
    setIsRunning(false);
    setIsComplete(false);
  }

  function sendScroll() {
    clearTimers();
    setAgents(getIdleAgents());
    setDialogue([]);
    setIsRunning(true);
    setIsComplete(false);

    timeline.forEach((item) => {
      const timer = window.setTimeout(() => {
        setDialogue((current) =>
          [
            ...current,
            {
              id: `cached-${item.at}`,
              speaker: item.speaker,
              role: item.role,
              message: item.message,
              createdAt: new Date().toISOString()
            }
          ].slice(-24)
        );

        if (item.speaker !== "Dojo") {
          setAgents((current) =>
            current.map((agent) => {
              if (agent.name === item.speaker) {
                return {
                  ...agent,
                  status: "working",
                  output: item.message
                };
              }

              return agent.status === "working" ? completeAgent(agent) : agent;
            })
          );
        }

        if (item.role === "Moonrise") {
          setAgents((current) => current.map(completeAgent));
          setIsRunning(false);
          setIsComplete(true);
        }
      }, item.at);

      timersRef.current.push(timer);
    });
  }

  const currentRun: DojoRun = {
    ...initialRun,
    status: isComplete ? "shipped" : isRunning ? "running" : "queued",
    agents: isComplete ? demoOutput.agents : agents
  };

  return (
    <section className="flex flex-col gap-8 pb-10">
      <LiveDojo
        agents={agents}
        dialogue={dialogue}
        isComplete={isComplete}
        isRunning={isRunning}
        onReset={resetDojo}
        onRun={sendScroll}
        previewPath={currentRun.previewPath}
        scroll={demoOutput.scroll}
      />

      <section className="artifact-section">
        <div className="artifact-section__header">
          <p>Artifact Packet</p>
          <h2>Proof from the completed dojo run</h2>
        </div>
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <ArtifactPacket isComplete={isComplete} run={currentRun} />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {agents.map((agent, index) => (
              <ShojiPanel
                index={index}
                key={agent.name}
                name={agent.name}
                output={agent.output}
                role={agent.role}
                status={agent.status}
              />
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}
