"use client";

import type { CSSProperties } from "react";
import type { AgentDefinition, AgentStatus } from "@/lib/agent-registry";

type AgentRoomProps = {
  agent: AgentDefinition;
  isHandoffActive: boolean;
  latestLine: string;
  onOpen: (id: AgentDefinition["id"]) => void;
  status: AgentStatus;
};

export function AgentRoom({
  agent,
  isHandoffActive,
  latestLine,
  onOpen,
  status
}: AgentRoomProps) {
  const positionStyle = {
    "--agent-x": `${agent.mapX}%`,
    "--agent-y": `${agent.mapY}%`
  } as CSSProperties;

  return (
    <button
      className="agent-room"
      data-handoff={isHandoffActive}
      data-label={agent.labelSide}
      data-room={agent.room}
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
        <span className="agent-room__status">{status}</span>
        <span className="agent-room__line">{latestLine}</span>
      </span>
    </button>
  );
}
