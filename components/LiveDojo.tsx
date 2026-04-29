"use client";

import {
  Cat,
  Eye,
  Hammer,
  Rocket,
  ScrollText,
  ShieldAlert
} from "lucide-react";
import { motion } from "framer-motion";
import type { DojoAgent, DojoDialogue } from "@/lib/types";

type LiveDojoProps = {
  agents: DojoAgent[];
  dialogue: DojoDialogue[];
  isComplete: boolean;
  isRunning: boolean;
};

const icons = {
  Moji: ScrollText,
  Miji: Hammer,
  Renegade: ShieldAlert,
  Sensei: Eye,
  Tester: Rocket,
  Meowts: Cat
};

export function LiveDojo({
  agents,
  dialogue,
  isComplete,
  isRunning
}: LiveDojoProps) {
  const latestSpeaker = dialogue.at(-1)?.speaker;
  const visibleDialogue = dialogue.slice(-6);

  return (
    <div className="relative overflow-hidden rounded-lg border border-white/10 bg-black/55 p-5 shadow-shoji">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(246,231,177,0.12),transparent_28rem),linear-gradient(180deg,rgba(220,38,38,0.08),transparent)]" />
      <div className="relative z-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold">
              Live dojo
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">
              {isComplete
                ? "Council complete"
                : isRunning
                  ? "Ninjas are talking"
                  : "Ready to open the floor"}
            </h2>
          </div>
          <span className="rounded-full border border-blood/40 bg-blood/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-red-100 shadow-blood">
            SSE live stream
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {agents.map((agent, index) => (
            <DojoAvatar
              agent={agent}
              index={index}
              isSpeaking={latestSpeaker === agent.name}
              key={agent.name}
            />
          ))}
        </div>

        <div className="mt-5 rounded-md border border-moon/15 bg-zinc-950/70 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
              Dojo comms
            </p>
            <span className="h-2 w-2 rounded-full bg-blood shadow-blood" />
          </div>
          <div className="mt-4 space-y-3">
            {visibleDialogue.length === 0 ? (
              <p className="text-sm leading-6 text-zinc-500">
                Start a scroll and the council will narrate the run in real
                time.
              </p>
            ) : (
              visibleDialogue.map((line) => (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-md border border-white/10 bg-black/45 p-3"
                  initial={{ opacity: 0, y: 8 }}
                  key={line.id}
                  transition={{ duration: 0.25 }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-black text-white">
                      {line.speaker}
                      <span className="ml-2 text-xs font-bold uppercase tracking-[0.16em] text-gold">
                        {line.role}
                      </span>
                    </p>
                    <time className="text-xs text-zinc-600">
                      {formatTime(line.createdAt)}
                    </time>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-300">
                    {line.message}
                  </p>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DojoAvatar({
  agent,
  index,
  isSpeaking
}: {
  agent: DojoAgent;
  index: number;
  isSpeaking: boolean;
}) {
  const Icon = icons[agent.name as keyof typeof icons] ?? ScrollText;
  const isActive = agent.status === "working" || isSpeaking;
  const isComplete = agent.status === "complete";

  return (
    <motion.div
      animate={{
        scale: isActive ? 1.04 : 1,
        y: isActive ? -2 : 0
      }}
      className={[
        "relative overflow-hidden rounded-md border bg-zinc-950/75 p-3 transition",
        isActive
          ? "border-blood/80 shadow-blood"
          : isComplete
            ? "border-moon/35"
            : "border-white/10"
      ].join(" ")}
      transition={{ duration: 0.25 }}
    >
      <div className="flex items-center gap-3">
        <div
          className={[
            "grid h-11 w-11 place-items-center rounded-md border",
            agent.name === "Meowts"
              ? "border-moon/40 bg-moon/10 text-moon"
              : "border-blood/35 bg-blood/10 text-red-100"
          ].join(" ")}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-white">{agent.name}</p>
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
            {agent.role}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
          {agent.status}
        </span>
        <span className="text-xs text-zinc-700">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
    </motion.div>
  );
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "now";
  }

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit"
  });
}
