export type MissionTask = {
  id: string;
  agent?: string;
  context?: string;
  department: string;
  prompt: string;
  runId?: string;
  title: string;
};

export type AgentReceipt = {
  taskId: string;
  agent: string;
  status: string;
  logs: string[];
  artifacts: string[];
  summary: string;
};

export interface AgentAdapter {
  id: string;
  canHandle(task: MissionTask): boolean;
  execute(task: MissionTask): Promise<AgentReceipt>;
}
