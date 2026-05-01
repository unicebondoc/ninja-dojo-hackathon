"use client";

import { AgentRoom } from "@/components/cockpit/AgentRoom";
import { TycheSprite } from "@/components/cockpit/TycheSprite";
import type { AgentId, AgentStatus } from "@/lib/agent-registry";
import { agentRegistry } from "@/lib/agent-registry";

type DojoMapProps = {
  activeHandoff?: { from: AgentId; to: AgentId };
  latestLines: Record<AgentId, string>;
  onOpenAgent: (id: AgentId) => void;
  statuses: Record<AgentId, AgentStatus>;
};

const roomOrder: AgentId[] = ["moji", "miji", "maji", "meji", "muji", "meowts"];

export function DojoMap({
  activeHandoff,
  latestLines,
  onOpenAgent,
  statuses
}: DojoMapProps) {
  return (
    <section className="dojo-map" aria-label="Isometric dojo mission map">
      <div className="dojo-map__rail" aria-label="Mission stage rail">
        {[
          ["01", "Scroll"],
          ["02", "Plan"],
          ["03", "Build"],
          ["04", "Attack"],
          ["05", "Review"],
          ["06", "Deploy"],
          ["07", "Judge"],
          ["08", "Receipt"]
        ].map(([num, label], index) => (
          <span data-active={index < 3} key={label}>
            <i>{num}</i>
            {label}
          </span>
        ))}
      </div>
      <div className="dojo-map__stage">
        <div className="dojo-map__floor" aria-hidden="true" />
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
