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
  source: "cached" | "live-stub";
};
