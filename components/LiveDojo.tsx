"use client";

import { RotateCcw, Send } from "lucide-react";
import type { CSSProperties } from "react";
import { DojoEventLog } from "@/components/DojoEventLog";
import { DojoProgress } from "@/components/DojoProgress";
import { DojoSprite } from "@/components/DojoSprite";
import { MoonPanel } from "@/components/MoonPanel";
import type { DojoAgent, DojoDialogue } from "@/lib/types";

type LiveDojoProps = {
  agents: DojoAgent[];
  dialogue: DojoDialogue[];
  isComplete: boolean;
  isRunning: boolean;
  onReset: () => void;
  onRun: () => void;
  previewPath?: string;
  scroll: string;
};

type BoardStation = {
  label: string;
  x: number;
  y: number;
};

const stations: Record<string, BoardStation> = {
  Scroll: { label: "Scroll", x: 50, y: 45 },
  Moji: { label: "MOJI / Plan", x: 26, y: 42 },
  Miji: { label: "MIJI / Build", x: 42, y: 67 },
  Renegade: { label: "RENEGADE / Attack", x: 69, y: 43 },
  Sensei: { label: "SENSEI / Review", x: 60, y: 68 },
  Tester: { label: "TESTER / Deploy", x: 28, y: 75 },
  Meowts: { label: "MEOWTS / Judge", x: 78, y: 74 },
  Moon: { label: "Moonrise", x: 84, y: 24 }
};

const idlePositions: Record<string, BoardStation> = {
  Moji: { label: "Moji", x: 17, y: 77 },
  Miji: { label: "Miji", x: 32, y: 79 },
  Renegade: { label: "Renegade", x: 74, y: 77 },
  Sensei: { label: "Sensei", x: 58, y: 80 },
  Tester: { label: "Tester", x: 43, y: 82 },
  Meowts: { label: "Meowts", x: 86, y: 81 }
};

export function LiveDojo({
  agents,
  dialogue,
  isComplete,
  isRunning,
  onReset,
  onRun,
  previewPath = "/demo/oracle",
  scroll
}: LiveDojoProps) {
  const latestLine = dialogue.at(-1);
  const speaker = latestLine?.speaker;
  const statusLabel = isComplete
    ? "Moonrise: shipped"
    : isRunning
      ? "Scroll in motion"
      : "Ready for scroll";

  return (
    <section className="live-world" aria-label="Live Ninja Dojo game world">
      <header className="live-world__header">
        <div>
          <p className="live-world__kicker">Ninja Dojo</p>
          <h1>One scroll in. Five Codex worktrees out.</h1>
          <span>A live dojo for coordinating AI agents.</span>
        </div>
        <DojoProgress
          agents={agents}
          isComplete={isComplete}
          isRunning={isRunning}
        />
      </header>

      <div className="live-world__body">
        <DojoEventLog dialogue={dialogue} />

        <div className="dojo-game-board" data-complete={isComplete} data-running={isRunning}>
          <div className="dojo-game-board__asset-bg" />
          <div className="dojo-game-board__fallback-bg" />
          <div className="dojo-game-board__moon" />

          <div className="dojo-game-board__status">
            <strong>{statusLabel}</strong>
            <span>Scroll → Plan → Build → Attack → Review → Deploy → Judge → Moonrise</span>
          </div>

          <div className="dojo-game-board__scroll" data-active={isRunning || isComplete}>
            <span>{scroll}</span>
          </div>

          <div className="dojo-game-board__path" aria-hidden="true">
            {Object.entries(stations).map(([name, station]) => (
              <i
                key={name}
                style={
                  {
                    "--station-x": `${station.x}%`,
                    "--station-y": `${station.y}%`
                } as CSSProperties
                }
              />
            ))}
          </div>

          <div className="dojo-game-board__stations">
            {Object.entries(stations).map(([name, station]) => (
              <span
                key={name}
                style={
                  {
                    "--station-x": `${station.x}%`,
                    "--station-y": `${station.y}%`
                  } as CSSProperties
                }
              >
                {station.label}
              </span>
            ))}
          </div>

          <div className="dojo-game-board__sprites">
            {agents.map((agent) => {
              const isSpeaking = speaker === agent.name;
              const target =
                isComplete && agent.name === "Meowts"
                  ? stations.Moon
                  : isComplete
                    ? stations.Meowts
                    : agent.status === "idle"
                      ? idlePositions[agent.name]
                      : stations[agent.name] ?? idlePositions[agent.name];

              return (
                <DojoSprite
                  agent={agent}
                  isSpeaking={isSpeaking}
                  key={agent.name}
                  x={target.x}
                  y={target.y}
                />
              );
            })}
          </div>

          <div
            className="dojo-game-board__slash"
            data-visible={isRunning && speaker === "Renegade"}
          />

          <div className="dojo-game-board__speech">
            <strong>{latestLine?.speaker ?? "Dojo"}</strong>
            <span>
              {latestLine?.message ??
                "Drop the scroll. The ninjas will move when the run begins."}
            </span>
          </div>
        </div>

        <MoonPanel
          isComplete={isComplete}
          isRunning={isRunning}
          previewPath={previewPath}
        />
      </div>

      <div className="live-world__controls">
        <button disabled={isRunning} onClick={onRun} type="button">
          <Send className="h-5 w-5" />
          {isRunning ? "Scroll running" : "Send Scroll"}
        </button>
        <button className="is-secondary" onClick={onReset} type="button">
          <RotateCcw className="h-5 w-5" />
          Reset Dojo
        </button>
      </div>
    </section>
  );
}
