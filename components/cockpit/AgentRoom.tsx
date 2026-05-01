"use client";

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
  return (
    <button
      className="agent-room"
      data-handoff={isHandoffActive}
      data-room={agent.room}
      data-status={status}
      onClick={() => onOpen(agent.id)}
      type="button"
    >
      <span className="agent-room__node" aria-hidden="true">
        <i />
      </span>
      <span className="agent-room__meta">
        <strong>{agent.name}</strong>
        <em>{agent.role}</em>
      </span>
      <span className="agent-room__status">{status}</span>
      <span className="agent-room__line">{latestLine}</span>
    </button>
  );
}
