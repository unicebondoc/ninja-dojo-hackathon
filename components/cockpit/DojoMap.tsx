"use client";

import { AgentRoom } from "@/components/cockpit/AgentRoom";
import { TycheSprite } from "@/components/cockpit/TycheSprite";
import type { AgentId, AgentStatus } from "@/lib/agent-registry";
import { agentRegistry } from "@/lib/agent-registry";
import type { RunManifestStage } from "@/lib/runs/types";

type DojoMapProps = {
  activeHandoff?: { from: AgentId; to: AgentId };
  activeStage: RunManifestStage["id"] | null;
  completedStages: RunManifestStage["id"][];
  latestLines: Record<AgentId, string>;
  onOpenAgent: (id: AgentId) => void;
  statuses: Record<AgentId, AgentStatus>;
};

const roomOrder: AgentId[] = ["moji", "miji", "maji", "meji", "muji", "meowts"];
const stages: Array<[string, RunManifestStage["id"], string]> = [
  ["01", "scroll", "Scroll"],
  ["02", "plan", "Plan"],
  ["03", "build", "Build"],
  ["04", "attack", "Attack"],
  ["05", "review", "Review"],
  ["06", "deploy", "Deploy"],
  ["07", "judge", "Judge"],
  ["08", "moonrise", "Receipt"]
];

export function DojoMap({
  activeHandoff,
  activeStage,
  completedStages,
  latestLines,
  onOpenAgent,
  statuses
}: DojoMapProps) {
  return (
    <section className="dojo-map" aria-label="Isometric dojo mission map">
      <div className="dojo-map__rail" aria-label="Mission stage rail">
        {stages.map(([num, id, label]) => (
          <span
            data-active={activeStage === id}
            data-complete={completedStages.includes(id)}
            key={id}
          >
            <i>{num}</i>
            {label}
          </span>
        ))}
      </div>
      <div className="dojo-map__stage">
        <div className="dojo-map__art" aria-hidden="true" />
        <div className="dojo-map__handoff" data-active={Boolean(activeHandoff)} />
        <TycheSprite />
        {roomOrder.map((id) => {
          const agent = agentRegistry.find((item) => item.id === id)!;
          const isHandoffActive =
            activeHandoff?.from === id || activeHandoff?.to === id;
          return (
            <AgentRoom
              agent={agent}
              isHandoffActive={isHandoffActive}
              key={agent.id}
              latestLine={latestLines[id]}
              onOpen={onOpenAgent}
              status={statuses[id]}
            />
          );
        })}
      </div>
      <div className="dojo-map__mobile-list" aria-label="Agent list">
        {roomOrder.map((id) => {
          const agent = agentRegistry.find((item) => item.id === id)!;
          return (
            <AgentRoom
              agent={agent}
              isHandoffActive={false}
              key={`mobile-${id}`}
              latestLine={latestLines[id]}
              onOpen={onOpenAgent}
              status={statuses[id]}
            />
          );
        })}
      </div>
    </section>
  );
}
