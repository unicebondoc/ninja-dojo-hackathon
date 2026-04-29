"use client";

import { ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

type MoonDeployProps = {
  isVisible: boolean;
  previewPath: string;
  verdict: string;
};

export function MoonDeploy({ isVisible, previewPath, verdict }: MoonDeployProps) {
  const router = useRouter();

  return (
    <div className="relative min-h-64 overflow-hidden rounded-lg border border-white/10 bg-black/55 p-6 shadow-shoji">
      <div className="absolute inset-0 bg-gradient-to-t from-blood/16 via-transparent to-moon/8" />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black to-transparent" />
      <div className="absolute bottom-6 left-0 right-0 mx-auto h-24 w-[84%] rounded-[100%] border-t border-moon/15 bg-gradient-to-b from-moon/8 to-transparent" />

      <div
        className={[
          "absolute left-1/2 top-10 h-24 w-24 -translate-x-1/2 rounded-full bg-moon shadow-[0_0_60px_rgba(246,231,177,0.72)]",
          isVisible ? "moon-rise" : "opacity-0"
        ].join(" ")}
        aria-hidden="true"
      />

      <div className="relative z-10 flex min-h-52 flex-col justify-end gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-gold">
            Moon deploy
          </p>
          <h2 className="mt-2 text-3xl font-black text-white">
            {isVisible ? verdict : "Awaiting final judgment"}
          </h2>
        </div>
        <button
          className={[
            "inline-flex w-full items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] transition sm:w-fit",
            isVisible
              ? "bg-moon text-zinc-950 hover:bg-white"
              : "cursor-not-allowed bg-zinc-800 text-zinc-500"
          ].join(" ")}
          disabled={!isVisible}
          onClick={() => router.push(previewPath)}
          type="button"
        >
          <ExternalLink className="h-4 w-4" />
          Open shipped page
        </button>
      </div>
    </div>
  );
}
