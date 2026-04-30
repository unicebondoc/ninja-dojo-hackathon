export type AgentStatus = "idle" | "working" | "complete" | "failed";

export type DojoAgent = {
  name: string;
  role: string;
  status: AgentStatus;
  output: string;
};

export type DojoArtifactKind =
  | "plan"
  | "build"
  | "attack"
  | "review"
  | "deploy"
  | "judge";

export type DojoArtifact = {
  kind: DojoArtifactKind;
  title: string;
  summary: string;
  body: string[];
};

export type DojoDemoOutput = {
  scroll: string;
  status: "queued" | "running" | "shipped" | "failed";
  previewPath: string;
  agents: DojoAgent[];
  artifacts?: DojoArtifact[];
  meowtsRoast: string;
  verdict: string;
};

export type DojoRun = DojoDemoOutput & {
  id: string;
  createdAt: string;
  completedAt?: string;
  source: "cached" | "local-live" | "live-stub";
  streamPath?: string;
};

export type ScrollRequest = {
  prompt: string;
  createdAt: string;
  runId: string;
};

export type DojoRunResult = {
  runId: string;
  prompt: string;
  status: "idle" | "running" | "shipped" | "failed";
  moonriseUrl?: string;
};

export type DojoDialogue = {
  id: string;
  speaker: string;
  role: string;
  message: string;
  createdAt: string;
};

export type DojoRunEventType =
  | "run_started"
  | "agent_started"
  | "agent_message"
  | "agent_completed"
  | "artifact_ready"
  | "run_completed"
  | "run_failed";

export type DojoRunEvent = {
  id: string;
  type: DojoRunEventType;
  at: number;
  runId: string;
  agentName?: string;
  role?: string;
  message?: string;
  artifactKind?: DojoArtifactKind;
  run?: DojoRun;
};
