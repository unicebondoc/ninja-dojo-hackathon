"use client";

import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import type { AgentStatus } from "@/lib/types";

type ShojiPanelProps = {
  name: string;
  role: string;
  status: AgentStatus;
  output: string;
  index: number;
};

const statusCopy: Record<AgentStatus, string> = {
  idle: "idle",
  working: "working",
  complete: "complete",
  failed: "failed"
};

export function ShojiPanel({
  name,
  role,
  status,
  output,
  index
}: ShojiPanelProps) {
  const isWorking = status === "working";
  const isComplete = status === "complete";

  return (
    <motion.article
      animate={{
        opacity: status === "idle" ? 0.55 : 1,
        y: status === "idle" ? 10 : 0,
        scale: isWorking ? 1.025 : 1
      }}
      className={[
        "shoji-pattern relative min-h-52 overflow-hidden rounded-lg border p-5 shadow-shoji transition",
        isWorking
          ? "border-blood/75 shadow-blood"
          : isComplete
            ? "border-moon/30"
            : "border-white/10"
      ].join(" ")}
      transition={{ duration: 0.42, ease: "easeOut" }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black/72 via-zinc-950/64 to-black/82" />
      <div className="absolute right-3 top-3 rounded-full border border-white/10 bg-black/45 px-2.5 py-1 text-xs text-zinc-300">
        {String(index + 1).padStart(2, "0")}
      </div>
      <div className="katana-slash" data-complete={isComplete} />

      <div className="relative z-10 flex h-full flex-col justify-between gap-8">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-gold">
                {role}
              </p>
              <h3 className="mt-2 text-3xl font-black text-white">{name}</h3>
            </div>
            <StatusIcon status={status} />
          </div>
          <div className="mt-5 h-px w-full bg-gradient-to-r from-blood/70 via-moon/20 to-transparent" />
        </div>

        <p className="min-h-16 text-base leading-7 text-zinc-200">
          {output || "Awaiting the scroll."}
        </p>

        <div className="flex items-center justify-between gap-3">
          <span
            className={[
              "rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.2em]",
              isWorking
                ? "border-blood/70 bg-blood/15 text-red-100"
                : isComplete
                  ? "border-moon/35 bg-moon/10 text-moon"
                  : status === "failed"
                    ? "border-red-500 bg-red-950 text-red-200"
                    : "border-white/10 bg-white/5 text-zinc-400"
            ].join(" ")}
          >
            {statusCopy[status]}
          </span>
          {isWorking ? (
            <span className="h-2 w-2 rounded-full bg-blood shadow-blood" />
          ) : null}
        </div>
      </div>
    </motion.article>
  );
}

function StatusIcon({ status }: { status: AgentStatus }) {
  if (status === "working") {
    return <Loader2 className="h-6 w-6 animate-spin text-blood" />;
  }

  if (status === "complete") {
    return <CheckCircle2 className="h-6 w-6 text-moon" />;
  }

  if (status === "failed") {
    return <XCircle className="h-6 w-6 text-red-400" />;
  }

  return <Circle className="h-6 w-6 text-zinc-600" />;
}
