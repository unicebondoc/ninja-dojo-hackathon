"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArtifactPacket } from "@/components/ArtifactPacket";
import { LiveDojo } from "@/components/LiveDojo";
import { MoonDeploy } from "@/components/MoonDeploy";
import { MeowtsRoast } from "@/components/MeowtsRoast";
import { RunArchive } from "@/components/RunArchive";
import { ScrollInput } from "@/components/ScrollInput";
import { ShojiPanel } from "@/components/ShojiPanel";
import { demoOutput } from "@/lib/demo-output";
import {
  completeDojoRun,
  createLiveDojoRun,
  defaultArtifacts
} from "@/lib/run-factory";
import { loadStoredRuns, saveStoredRun } from "@/lib/run-storage";
import type {
  DojoAgent,
  DojoDialogue,
  DojoRun,
  DojoRunEvent
} from "@/lib/types";

const initialRun: DojoRun = {
  ...demoOutput,
  id: "scroll-cached-demo",
  createdAt: "2026-04-29T00:00:00.000Z",
  source: "cached",
  artifacts: defaultArtifacts
};

function getIdleAgents(run: DojoRun): DojoAgent[] {
  return run.agents.map((agent) => ({
    ...agent,
    status: "idle",
    output: ""
  }));
}

export function DojoDashboard() {
  const [scroll, setScroll] = useState(demoOutput.scroll);
  const [currentRun, setCurrentRun] = useState<DojoRun>(initialRun);
  const [agents, setAgents] = useState<DojoAgent[]>(getIdleAgents(initialRun));
  const [storedRuns, setStoredRuns] = useState<DojoRun[]>([]);
  const [dialogue, setDialogue] = useState<DojoDialogue[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [panelsOpen, setPanelsOpen] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const activeCount = useMemo(
    () => agents.filter((agent) => agent.status !== "idle").length,
    [agents]
  );

  useEffect(() => {
    setStoredRuns(loadStoredRuns());

    return () => {
      eventSourceRef.current?.close();
    };
  }, []);

  async function runCachedScroll() {
    eventSourceRef.current?.close();
    const run = await createLiveRunFromScroll(scroll);

    setCurrentRun(run);
    setIsRunning(true);
    setIsComplete(false);
    setPanelsOpen(false);
    setAgents(getIdleAgents(run));
    setDialogue([]);

    const source = new EventSource(run.streamPath ?? "/api/train");
    eventSourceRef.current = source;

    source.addEventListener("dojo", (message) => {
      const event = JSON.parse(
        (message as MessageEvent<string>).data
      ) as DojoRunEvent;
      applyRunEvent(event, run);
    });

    source.addEventListener("done", () => {
      source.close();
    });

    source.onerror = () => {
      source.close();
      setIsRunning(false);
    };
  }

  function loadRun(run: DojoRun) {
    eventSourceRef.current?.close();
    setScroll(run.scroll);
    setCurrentRun(run);
    setAgents(run.agents);
    setIsRunning(false);
    setIsComplete(run.status === "shipped");
    setPanelsOpen(true);
    setDialogue([
      {
        id: `${run.id}-loaded`,
        speaker: "Dojo",
        role: "Archive",
        message: "Loaded a completed run from this browser.",
        createdAt: new Date().toISOString()
      }
    ]);
  }

  function applyRunEvent(event: DojoRunEvent, run: DojoRun) {
    if (event.type === "run_started") {
      setPanelsOpen(true);
    }

    const eventMessage = event.message;

    if (eventMessage) {
      setDialogue((current) =>
        [
          ...current,
          {
            id: event.id,
            speaker: event.agentName ?? "Dojo",
            role: event.role ?? "Backend",
            message: eventMessage,
            createdAt: new Date().toISOString()
          }
        ].slice(-24)
      );
    }

    if (event.type === "agent_started" || event.type === "agent_message") {
      setAgents((current) =>
        current.map((agent) =>
          agent.name === event.agentName
            ? {
                ...agent,
                status: "working",
                output: event.message ?? "Working..."
              }
            : agent
        )
      );
    }

    if (event.type === "agent_completed") {
      setAgents((current) =>
        current.map((agent) =>
          agent.name === event.agentName
            ? {
                ...agent,
                status: "complete",
                output: event.message ?? agent.output
              }
            : agent
        )
      );
    }

    if (event.type === "run_completed") {
      const completedRun = event.run ?? completeDojoRun(run);
      setCurrentRun(completedRun);
      setAgents(completedRun.agents);
      setIsRunning(false);
      setIsComplete(true);
      saveStoredRun(completedRun);
      setStoredRuns(loadStoredRuns());
      eventSourceRef.current?.close();
    }
  }

  return (
    <section className="grid gap-5 pb-10 lg:grid-cols-[0.82fr_1.18fr]">
      <div className="flex flex-col gap-5">
        <ScrollInput
          isRunning={isRunning}
          onChange={setScroll}
          onRun={runCachedScroll}
          value={scroll}
        />

        <LiveDojo
          agents={agents}
          dialogue={dialogue}
          isComplete={isComplete}
          isRunning={isRunning}
        />

        <motion.div
          animate={{ opacity: panelsOpen ? 1 : 0.72 }}
          className="overflow-hidden rounded-lg border border-white/10 bg-black/45 p-5 shadow-shoji"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold">
            Shoji gate
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((panel) => (
              <motion.div
                animate={{
                  x: panelsOpen ? (panel % 2 === 0 ? -10 : 10) : 0,
                  opacity: panelsOpen ? 0.68 : 1
                }}
                className="h-24 rounded-md border border-moon/15 bg-gradient-to-br from-moon/10 to-white/[0.03]"
                key={panel}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between gap-4">
            <span className="text-sm text-zinc-400">
              {activeCount}/6 ninjas activated
            </span>
            <span className="h-2 flex-1 rounded-full bg-white/10">
              <span
                className="block h-2 rounded-full bg-blood transition-all duration-500"
                style={{ width: `${(activeCount / 6) * 100}%` }}
              />
            </span>
          </div>
        </motion.div>

        <MeowtsRoast
          isVisible={isComplete}
          roast={currentRun.meowtsRoast}
        />

        <MoonDeploy
          isVisible={isComplete}
          previewPath={currentRun.previewPath}
          verdict={currentRun.verdict}
        />

        <ArtifactPacket isComplete={isComplete} run={currentRun} />

        <RunArchive
          activeRunId={currentRun.id}
          onSelect={loadRun}
          runs={storedRuns}
        />
      </div>

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
    </section>
  );
}

async function createLiveRunFromScroll(scroll: string): Promise<DojoRun> {
  try {
    const response = await fetch("/api/runs", {
      body: JSON.stringify({ scroll }),
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST"
    });

    if (!response.ok) {
      throw new Error("Live run request failed");
    }

    return (await response.json()) as DojoRun;
  } catch {
    return createLiveDojoRun(scroll);
  }
}
