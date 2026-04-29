"use client";

import { Play, ScrollText } from "lucide-react";

type ScrollInputProps = {
  value: string;
  isRunning: boolean;
  onChange: (value: string) => void;
  onRun: () => void;
};

export function ScrollInput({
  value,
  isRunning,
  onChange,
  onRun
}: ScrollInputProps) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-moon/15 bg-black/55 p-4 shadow-shoji backdrop-blur md:p-5">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blood to-transparent" />
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-gold">
        <ScrollText className="h-4 w-4" />
        Product scroll
      </div>
      <textarea
        className="min-h-28 w-full resize-none rounded-md border border-moon/15 bg-zinc-950/80 p-4 text-lg leading-7 text-white outline-none ring-0 transition focus:border-blood/70 focus:shadow-blood"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
      />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-400">
          Launch a live local run. The backend streams agent dialogue into the
          dojo while the product artifact takes shape.
        </p>
        <button
          className="inline-flex items-center gap-2 rounded-md bg-blood px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white shadow-blood transition hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400 disabled:shadow-none"
          disabled={isRunning}
          onClick={onRun}
          type="button"
        >
          <Play className="h-4 w-4" />
          {isRunning ? "Dojo running" : "Launch live dojo"}
        </button>
      </div>
    </div>
  );
}
