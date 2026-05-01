"use client";

import type { CSSProperties } from "react";
import { AgentRoom } from "@/components/cockpit/AgentRoom";
import { TycheSprite } from "@/components/cockpit/TycheSprite";
import type { AgentId, AgentStatus } from "@/lib/agent-registry";
import {
  agentRegistry,
  agentZoneByStage,
  dojoZones,
  zoneById,
  type DojoZoneId
} from "@/lib/agent-registry";
import type { RunManifestStage } from "@/lib/runs/types";

type DojoMapProps = {
  activeHandoff?: { from: AgentId; to: AgentId };
  activeStage: RunManifestStage["id"] | null;
  completedStages: RunManifestStage["id"][];
  latestLines: Record<AgentId, string>;
  onOpenAgent: (id: AgentId) => void;
  orchestratorStage?: RunManifestStage["id"] | null;
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

const specialistStations: Array<{
  id: string;
  label: string;
  stages: RunManifestStage["id"][];
  zone: DojoZoneId;
}> = [
  {
    id: "research-scout",
    label: "Research scout",
    stages: ["attack", "review"],
    zone: "content"
  },
  {
    id: "launch-runner",
    label: "Launch runner",
    stages: ["deploy"],
    zone: "marketing"
  },
  {
    id: "receipt-scribe",
    label: "Receipt scribe",
    stages: ["moonrise"],
    zone: "archive"
  }
];

function stateForAgent({
  activeAgent,
  completedStages,
  id,
  status
}: {
  activeAgent?: AgentId;
  completedStages: RunManifestStage["id"][];
  id: AgentId;
  status: AgentStatus;
}) {
  if (status === "stuck") return "blocked";
  if (activeAgent === id) return "active";
  if (status === "complete" || completedStages.length === stages.length) return "complete";
  return "idle";
}

export function DojoMap({
  activeHandoff,
  activeStage,
  completedStages,
  latestLines,
  onOpenAgent,
  orchestratorStage,
  statuses
}: DojoMapProps) {
  const mapStage = orchestratorStage ?? activeStage;
  const activeRoute = mapStage ? agentZoneByStage[mapStage] : undefined;
  const activeZoneId = activeRoute?.zone;

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
        <div className="dojo-map__zones" aria-hidden="true">
          {dojoZones.map((zone) => {
            const style = {
              "--zone-x": `${zone.x}%`,
              "--zone-y": `${zone.y}%`
            } as CSSProperties;
            return (
              <span
                className="dojo-map__zone"
                data-active={activeZoneId === zone.id}
                key={zone.id}
                style={style}
              >
                <b>{zone.label}</b>
                <em>{zone.purpose}</em>
              </span>
            );
          })}
        </div>
        <div className="dojo-map__handoff" data-active={Boolean(activeHandoff)} />
        <TycheSprite />
        {specialistStations
          .filter((station) => mapStage && station.stages.includes(mapStage))
          .map((station) => {
            const zone = zoneById[station.zone];
            const style = {
              "--specialist-x": `${zone.x + 4}%`,
              "--specialist-y": `${zone.y - 5}%`
            } as CSSProperties;
            return (
              <span className="dojo-map__specialist" key={station.id} style={style}>
                {station.label}
              </span>
            );
          })}
        {roomOrder.map((id) => {
          const agent = agentRegistry.find((item) => item.id === id)!;
          const isHandoffActive =
            activeHandoff?.from === id || activeHandoff?.to === id;
          const activeAgentZone =
            activeRoute?.agent === id ? zoneById[activeRoute.zone] : undefined;
          const homeZone = zoneById[agent.homeZone];
          const mapX = activeAgentZone?.x ?? agent.mapX ?? homeZone.x;
          const mapY = activeAgentZone?.y ?? agent.mapY ?? homeZone.y;
          const zoneLabel = activeAgentZone?.label ?? homeZone.label;
          return (
            <AgentRoom
              agent={agent}
              isHandoffActive={isHandoffActive}
              key={agent.id}
              latestLine={latestLines[id]}
              mapX={mapX}
              mapY={mapY}
              onOpen={onOpenAgent}
              status={statuses[id]}
              visualState={stateForAgent({
                activeAgent: activeRoute?.agent,
                completedStages,
                id,
                status: statuses[id]
              })}
              zoneLabel={zoneLabel}
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
              visualState={stateForAgent({
                activeAgent: activeRoute?.agent,
                completedStages,
                id,
                status: statuses[id]
              })}
              zoneLabel={zoneById[agent.homeZone].label}
            />
          );
        })}
      </div>
    </section>
  );
}
