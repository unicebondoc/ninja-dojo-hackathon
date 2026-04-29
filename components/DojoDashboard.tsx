"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MoonDeploy } from "@/components/MoonDeploy";
import { MeowtsRoast } from "@/components/MeowtsRoast";
import { ScrollInput } from "@/components/ScrollInput";
import { ShojiPanel } from "@/components/ShojiPanel";
import { demoOutput } from "@/lib/demo-output";
import type { AgentStatus, DojoAgent } from "@/lib/types";

type TimelineStep = {
  at: number;
  agentIndexes: number[];
  status: AgentStatus;
};

const timeline: TimelineStep[] = [
  { at: 0, agentIndexes: [0], status: "working" },
  { at: 1350, agentIndexes: [0], status: "complete" },
  { at: 1500, agentIndexes: [1], status: "working" },
  { at: 3100, agentIndexes: [1], status: "complete" },
  { at: 3300, agentIndexes: [2, 3, 4], status: "working" },
  { at: 5400, agentIndexes: [2], status: "complete" },
  { at: 6100, agentIndexes: [3], status: "complete" },
  { at: 7000, agentIndexes: [4], status: "complete" },
  { at: 7200, agentIndexes: [5], status: "working" },
  { at: 8800, agentIndexes: [5], status: "complete" }
];

const initialAgents: DojoAgent[] = demoOutput.agents.map((agent) => ({
  ...agent,
  status: "idle",
  output: ""
}));

export function DojoDashboard() {
  const [scroll, setScroll] = useState(demoOutput.scroll);
  const [agents, setAgents] = useState<DojoAgent[]>(initialAgents);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [panelsOpen, setPanelsOpen] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const activeCount = useMemo(
    () => agents.filter((agent) => agent.status !== "idle").length,
    [agents]
  );

  useEffect(() => {
    return () => {
      timers.current.forEach(clearTimeout);
    };
  }, []);

  function runCachedScroll() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setIsRunning(true);
    setIsComplete(false);
    setPanelsOpen(false);
    setAgents(initialAgents);

    timers.current.push(
      setTimeout(() => {
        setPanelsOpen(true);
      }, 350)
    );

    timeline.forEach((step) => {
      const timer = setTimeout(() => {
        setAgents((current) =>
          current.map((agent, index) => {
            if (!step.agentIndexes.includes(index)) {
              return agent;
            }

            const source = demoOutput.agents[index];
            return {
              ...agent,
              status: step.status,
              output: step.status === "complete" ? source.output : "Working..."
            };
          })
        );
      }, step.at);
      timers.current.push(timer);
    });

    timers.current.push(
      setTimeout(() => {
        setAgents(demoOutput.agents);
        setIsRunning(false);
        setIsComplete(true);
      }, 9800)
    );
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
          roast={demoOutput.meowtsRoast}
        />

        <MoonDeploy
          isVisible={isComplete}
          previewPath={demoOutput.previewPath}
          verdict={demoOutput.verdict}
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
