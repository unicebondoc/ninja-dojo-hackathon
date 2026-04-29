"use client";

import { History, RotateCcw } from "lucide-react";
import type { DojoRun } from "@/lib/types";

type RunArchiveProps = {
  runs: DojoRun[];
  activeRunId: string;
  onSelect: (run: DojoRun) => void;
};

export function RunArchive({ runs, activeRunId, onSelect }: RunArchiveProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/45 p-5 shadow-shoji">
      <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.25em] text-gold">
        <History className="h-4 w-4" />
        Run archive
      </p>
      <div className="mt-4 space-y-3">
        {runs.length === 0 ? (
          <p className="text-sm leading-6 text-zinc-500">
            Completed scrolls will persist here in this browser.
          </p>
        ) : (
          runs.map((run) => (
            <button
              className={[
                "w-full rounded-md border p-3 text-left transition",
                run.id === activeRunId
                  ? "border-blood/70 bg-blood/10"
                  : "border-white/10 bg-zinc-950/55 hover:border-moon/30"
              ].join(" ")}
              key={run.id}
              onClick={() => onSelect(run)}
              type="button"
            >
              <span className="flex items-center justify-between gap-3">
                <span className="line-clamp-1 text-sm font-semibold text-white">
                  {run.scroll}
                </span>
                <RotateCcw className="h-4 w-4 shrink-0 text-zinc-500" />
              </span>
              <span className="mt-2 block text-xs uppercase tracking-[0.16em] text-zinc-500">
                {formatRunTime(run.completedAt ?? run.createdAt)}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function formatRunTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Saved run";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}
