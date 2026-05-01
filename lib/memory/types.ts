import type { AgentId } from "@/lib/agent-registry";
import type { RunManifestStatus } from "@/lib/runs/types";

export type MemoryStatus = "active" | "archived" | "blocked" | "idle" | "shipped";

export type ApprovalStatus = "approved" | "pending" | "rejected";

export type ApprovalGate = {
  decidedAt?: string;
  decidedBy?: string;
  id: string;
  missionId: string;
  notes?: string;
  requestedAt: string;
  status: ApprovalStatus;
};

export type ProjectMemoryEntry = {
  id: string;
  createdAt: string;
  lastMissionId?: string;
  lastReceiptId?: string;
  name: string;
  nextAction: string;
  status: MemoryStatus;
  updatedAt: string;
};

export type MissionMemoryEntry = {
  id: string;
  createdAt: string;
  projectId: string;
  runId: string;
  scrollText: string;
  status: RunManifestStatus;
  summary: string;
  updatedAt: string;
};

export type ReceiptMemoryEntry = {
  id: string;
  createdAt: string;
  missionId: string;
  projectId: string;
  receiptUrl: string;
  runId: string;
  score: number;
  summary: string;
  verdict: string;
};

export type AssetMemoryEntry = {
  id: string;
  createdAt: string;
  label: string;
  missionId?: string;
  projectId?: string;
  prompt?: string;
  type: "image" | "prompt" | "receipt" | "url" | "other";
  url?: string;
};

export type DecisionMemoryEntry = {
  id: string;
  createdAt: string;
  decision: string;
  missionId?: string;
  projectId?: string;
  reason?: string;
  title: string;
};

export type AgentMemoryEntry = {
  id: string;
  agent: AgentId | "dojo" | "moonrise";
  artifacts: string[];
  createdAt: string;
  logs: string[];
  missionId?: string;
  status: string;
  summary: string;
};
