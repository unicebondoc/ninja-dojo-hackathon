"use client";

import { useEffect, useRef, useState } from "react";
import { LiveDojo } from "@/components/LiveDojo";
import { demoOutput } from "@/lib/demo-output";
import type { DojoAgent, DojoDialogue } from "@/lib/types";

const timeline = [
  {
    activeAgent: undefined,
    at: 0,
    message: "00:00 Scroll received.",
    role: "Scroll",
    speaker: "Dojo",
    stage: 0
  },
  {
    activeAgent: "Moji",
    at: 1500,
    message: "00:01 Moji is writing the plan...",
    role: "Plan",
    speaker: "Moji",
    stage: 1
  },
  {
    activeAgent: "Miji",
    at: 3500,
    message: "00:03 Miji is building...",
    role: "Build",
    speaker: "Miji",
    stage: 2
  },
  {
    activeAgent: "Renegade",
    at: 6000,
    message: "00:06 Renegade is attacking...",
    role: "Attack",
    speaker: "Renegade",
    stage: 3
  },
  {
    activeAgent: "Sensei",
    at: 9000,
    message: "00:09 Sensei is reviewing...",
    role: "Review",
    speaker: "Sensei",
    stage: 4
  },
  {
    activeAgent: "Tester",
    at: 11000,
    message: "00:11 Tester is running checks...",
    role: "Deploy",
    speaker: "Tester",
    stage: 5
  },
  {
    activeAgent: "Meowts",
    at: 13000,
    message: "00:13 Meowts is judging...",
    role: "Judge",
    speaker: "Meowts",
    stage: 6
  },
  {
    activeAgent: undefined,
    at: 15000,
    message: "00:15 The moon rises. The build is complete.",
    role: "Moonrise",
    speaker: "Dojo",
    stage: 7
  }
];

function getIdleAgents(): DojoAgent[] {
  return demoOutput.agents.map((agent) => ({
    ...agent,
    output: "",
    status: "idle"
  }));
}

function completeAgent(agent: DojoAgent): DojoAgent {
  const demoAgent = demoOutput.agents.find((item) => item.name === agent.name);

  return {
    ...agent,
    output: demoAgent?.output ?? agent.output,
    status: "complete"
  };
}

export function DojoDashboard() {
  const [agents, setAgents] = useState<DojoAgent[]>(getIdleAgents);
  const [currentStage, setCurrentStage] = useState(0);
  const [dialogue, setDialogue] = useState<DojoDialogue[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showScroll, setShowScroll] = useState(false);
  const [showSlash, setShowSlash] = useState(false);
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
    setCurrentStage(0);
    setDialogue([]);
    setIsComplete(false);
    setIsRunning(false);
    setShowScroll(false);
    setShowSlash(false);
  }

  function setAgentActivity(activeAgent?: string) {
    setAgents((current) =>
      current.map((agent) => {
        if (agent.name === activeAgent) {
          return {
            ...agent,
            output:
              demoOutput.agents.find((item) => item.name === activeAgent)
                ?.output ?? "",
            status: "working"
          };
        }

        return agent.status === "working" ? completeAgent(agent) : agent;
      })
    );
  }

  function sendScroll() {
    clearTimers();
    setAgents(getIdleAgents());
    setCurrentStage(0);
    setDialogue([]);
    setIsComplete(false);
    setIsRunning(true);
    setShowScroll(false);
    setShowSlash(false);

    timeline.forEach((item) => {
      const timer = window.setTimeout(() => {
        setCurrentStage(item.stage);
        setDialogue((current) =>
          [
            ...current,
            {
              createdAt: new Date().toISOString(),
              id: `cached-${item.at}`,
              message: item.message,
              role: item.role,
              speaker: item.speaker
            }
          ].slice(-24)
        );

        if (item.role === "Scroll") {
          setShowScroll(true);
        }

        if (item.activeAgent) {
          setAgentActivity(item.activeAgent);
        }

        if (item.activeAgent === "Renegade") {
          setShowSlash(true);
          const slashTimer = window.setTimeout(() => setShowSlash(false), 1250);
          timersRef.current.push(slashTimer);
        }

        if (item.role === "Moonrise") {
          setAgents((current) => current.map(completeAgent));
          setIsComplete(true);
          setIsRunning(false);
          setShowSlash(false);
        }
      }, item.at);

      timersRef.current.push(timer);
    });
  }

  return (
    <section className="rpg-page-shell">
      <LiveDojo
        agents={agents}
        currentStage={currentStage}
        dialogue={dialogue}
        isComplete={isComplete}
        isRunning={isRunning}
        onReset={resetDojo}
        onRun={sendScroll}
        previewPath={demoOutput.previewPath}
        showScroll={showScroll}
        showSlash={showSlash}
      />

      <section className="rpg-info-grid">
        <article>
          <p>What happened in the dojo?</p>
          <h2>The scroll became a shipped page.</h2>
          <span>
            The cached run moves from scroll intake through planning, building,
            adversarial attack, architecture review, deployment checks, and
            Meowts judgment before opening the oracle landing page.
          </span>
        </article>
        <article>
          <p>Codex-native proof</p>
          <h2>Built around the way Codex actually works.</h2>
          <span>
            Ninja Dojo keeps AGENTS.md, six Codex Skills, and cached
            /api/train output in the repo today, with room for future App
            Server and worktree streaming when the live orchestration layer is
            ready.
          </span>
        </article>
      </section>
    </section>
  );
}
