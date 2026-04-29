export type AgentStatus = "idle" | "working" | "complete" | "failed";

export type DojoAgent = {
  name: string;
  role: string;
  status: AgentStatus;
  output: string;
};

export type DojoDemoOutput = {
  scroll: string;
  status: "queued" | "running" | "shipped" | "failed";
  previewPath: string;
  agents: DojoAgent[];
  meowtsRoast: string;
  verdict: string;
};
