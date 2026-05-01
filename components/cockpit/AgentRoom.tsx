"use client";

import type { CSSProperties } from "react";
import type { AgentDefinition, AgentStatus } from "@/lib/agent-registry";

export type AgentVisualState = "active" | "blocked" | "complete" | "idle";

type AgentRoomProps = {
  agent: AgentDefinition;
  isHandoffActive: boolean;
  latestLine: string;
  mapX?: number;
  mapY?: number;
  onOpen: (id: AgentDefinition["id"]) => void;
  status: AgentStatus;
  visualState?: AgentVisualState;
  zoneLabel?: string;
};

function visualStateFor(status: AgentStatus): AgentVisualState {
  if (status === "complete") return "complete";
  if (status === "stuck") return "blocked";
  if (status === "working" || status === "waiting") return "active";
  return "idle";
}

export function AgentRoom({
  agent,
  isHandoffActive,
  latestLine,
  mapX,
  mapY,
  onOpen,
  status,
  visualState,
  zoneLabel
}: AgentRoomProps) {
  const state = visualState ?? visualStateFor(status);
  const positionStyle = {
    "--agent-x": `${mapX ?? agent.mapX}%`,
    "--agent-y": `${mapY ?? agent.mapY}%`
  } as CSSProperties;

  return (
    <button
      className="agent-room"
      data-handoff={isHandoffActive}
      data-label={agent.labelSide}
      data-room={agent.room}
      data-state={state}
      data-status={status}
      onClick={() => onOpen(agent.id)}
      style={positionStyle}
      type="button"
    >
      <span className="agent-room__sprite-wrap" aria-hidden="true">
        <span className="agent-room__shadow" />
        <img alt="" className="agent-room__sprite" draggable={false} src={agent.spriteSrc} />
      </span>
      <span className="agent-room__plate">
        <span className="agent-room__meta">
          <strong>{agent.name}</strong>
          <em>{agent.role}</em>
        </span>
        <span className="agent-room__status">{state}</span>
        {zoneLabel ? <span className="agent-room__zone">{zoneLabel}</span> : null}
        <span className="agent-room__line">{latestLine}</span>
      </span>
    </button>
  );
}
