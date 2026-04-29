"use client";

import Link from "next/link";
import { ExternalLink, Play } from "lucide-react";
import { DojoEventLog } from "@/components/DojoEventLog";
import { DojoProgress } from "@/components/DojoProgress";
import { DojoSprite } from "@/components/DojoSprite";
import type { DojoAgent, DojoDialogue } from "@/lib/types";

type LiveDojoProps = {
  agents: DojoAgent[];
  dialogue: DojoDialogue[];
  isComplete: boolean;
  isRunning: boolean;
  onRun?: () => void;
  previewPath?: string;
  scroll?: string;
};

type BoardStation = {
  label: string;
  x: number;
  y: number;
};

const stations: Record<string, BoardStation> = {
  Scroll: { label: "Scroll", x: 50, y: 42 },
  Moji: { label: "Moji plans", x: 22, y: 44 },
  Miji: { label: "Miji builds", x: 38, y: 66 },
  Renegade: { label: "Renegade attacks", x: 68, y: 45 },
  Sensei: { label: "Sensei reviews", x: 58, y: 69 },
  Tester: { label: "Tester deploys", x: 25, y: 76 },
  Meowts: { label: "Meowts judges", x: 78, y: 74 },
  Moon: { label: "Moonrise", x: 84, y: 25 }
};

const idlePositions: Record<string, BoardStation> = {
  Moji: { label: "Moji", x: 15, y: 74 },
  Miji: { label: "Miji", x: 28, y: 78 },
  Renegade: { label: "Renegade", x: 73, y: 76 },
  Sensei: { label: "Sensei", x: 60, y: 80 },
  Tester: { label: "Tester", x: 39, y: 82 },
  Meowts: { label: "Meowts", x: 86, y: 82 }
};

export function LiveDojo({
  agents,
  dialogue,
  isComplete,
  isRunning,
  onRun,
  previewPath = "/demo/oracle",
  scroll
}: LiveDojoProps) {
  const latestLine = dialogue.at(-1);
  const speaker = latestLine?.speaker;
  const statusLabel = isComplete
    ? "Moonrise: shipped"
    : isRunning
      ? "Live run in progress"
      : "Ready for scroll";

  return (
    <section className="live-game-shell" aria-label="Live Ninja Dojo game board">
      <div className="live-game-shell__topbar">
        <div>
          <p>Live Dojo World</p>
          <h2>{statusLabel}</h2>
        </div>
        <div className="live-game-shell__actions">
          {onRun ? (
            <button disabled={isRunning} onClick={onRun} type="button">
              <Play className="h-4 w-4" />
              {isRunning ? "Running" : "Launch"}
            </button>
          ) : null}
          <Link
            aria-disabled={!isComplete}
            className={!isComplete ? "is-disabled" : undefined}
            href={previewPath}
            tabIndex={!isComplete ? -1 : undefined}
          >
            <ExternalLink className="h-4 w-4" />
            Open shipped page
          </Link>
        </div>
      </div>

      <div className="live-game-layout">
        <div className="dojo-game-board" data-complete={isComplete} data-running={isRunning}>
          <div className="dojo-game-board__asset-bg" />
          <div className="dojo-game-board__fallback-bg" />
          <div className="dojo-game-board__moon" />
          <div className="dojo-game-board__scroll">
            <span>{scroll || "Build a shipped page from this scroll."}</span>
          </div>

          <div className="dojo-game-board__path" aria-hidden="true">
            {Object.entries(stations).map(([name, station]) => (
              <i
                key={name}
                style={
                  {
                    "--station-x": `${station.x}%`,
                    "--station-y": `${station.y}%`
                  } as React.CSSProperties
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
                  } as React.CSSProperties
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
                isComplete
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

          <div className="dojo-game-board__slash" data-visible={isRunning && !isComplete} />

          {latestLine ? (
            <div className="dojo-game-board__speech">
              <strong>{latestLine.speaker}</strong>
              <span>{latestLine.message}</span>
            </div>
          ) : (
            <div className="dojo-game-board__speech">
              <strong>Dojo</strong>
              <span>Drop the scroll. The ninjas will move when the run begins.</span>
            </div>
          )}
        </div>

        <div className="dojo-game-sidepanel">
          <DojoProgress
            agents={agents}
            isComplete={isComplete}
            isRunning={isRunning}
          />
          <DojoEventLog dialogue={dialogue} />
        </div>
      </div>
    </section>
  );
}
