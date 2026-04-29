"use client";

import { Clipboard, FileText, PackageCheck } from "lucide-react";
import { useMemo, useState } from "react";
import type { DojoArtifact, DojoRun } from "@/lib/types";

type ArtifactPacketProps = {
  run: DojoRun;
  isComplete: boolean;
};

export function ArtifactPacket({ run, isComplete }: ArtifactPacketProps) {
  const artifacts = run.artifacts ?? [];
  const [selectedKind, setSelectedKind] = useState(artifacts[0]?.kind);
  const selectedArtifact = useMemo(
    () =>
      artifacts.find((artifact) => artifact.kind === selectedKind) ??
      artifacts[0],
    [artifacts, selectedKind]
  );

  return (
    <div className="rounded-lg border border-white/10 bg-black/45 p-5 shadow-shoji">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.25em] text-gold">
            <PackageCheck className="h-4 w-4" />
            Artifact packet
          </p>
          <h2 className="mt-2 text-2xl font-black text-white">
            {isComplete ? "Ready for handoff" : "Assembling run packet"}
          </h2>
        </div>
        <span className="rounded-full border border-moon/20 bg-moon/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-moon">
          {run.source}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <PacketStat label="Run" value={run.id.replace("scroll-", "#")} />
        <PacketStat label="Preview" value={run.previewPath} />
        <PacketStat label="Services" value="0 required" />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {artifacts.map((artifact) => (
          <button
            className={[
              "rounded-md border px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] transition",
              selectedArtifact?.kind === artifact.kind
                ? "border-blood bg-blood/20 text-white shadow-blood"
                : "border-white/10 bg-white/5 text-zinc-400 hover:border-moon/30 hover:text-moon"
            ].join(" ")}
            key={artifact.kind}
            onClick={() => setSelectedKind(artifact.kind)}
            type="button"
          >
            {artifact.kind}
          </button>
        ))}
      </div>

      {selectedArtifact ? <ArtifactBody artifact={selectedArtifact} /> : null}
    </div>
  );
}

function PacketStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-zinc-950/65 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-semibold text-zinc-100">
        {value}
      </p>
    </div>
  );
}

function ArtifactBody({ artifact }: { artifact: DojoArtifact }) {
  return (
    <div className="mt-5 rounded-md border border-moon/15 bg-zinc-950/65 p-4">
      <div className="mb-4 flex items-start gap-3">
        <div className="rounded-md border border-moon/20 bg-moon/10 p-2 text-moon">
          <FileText className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-lg font-black text-white">{artifact.title}</h3>
          <p className="mt-1 text-sm leading-6 text-zinc-400">
            {artifact.summary}
          </p>
        </div>
      </div>
      <ul className="space-y-3 text-sm leading-6 text-zinc-200">
        {artifact.body.map((item) => (
          <li className="flex gap-3" key={item}>
            <Clipboard className="mt-0.5 h-4 w-4 shrink-0 text-blood" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
