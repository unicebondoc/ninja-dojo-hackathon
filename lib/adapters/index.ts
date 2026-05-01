import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { AgentAdapter, AgentReceipt, MissionTask } from "@/lib/adapters/types";

const execFileAsync = promisify(execFile);
const CODEX_TIMEOUT_MS = 1000 * 60 * 5;
const CODEX_MAX_BUFFER = 1024 * 1024 * 2;

function placeholderReceipt(adapterId: string, task: MissionTask): AgentReceipt {
  return {
    agent: adapterId,
    artifacts: [],
    logs: [
      `${adapterId} adapter received task ${task.id}.`,
      "No external service call was made.",
      "Placeholder receipt saved for future integration."
    ],
    status: "placeholder",
    summary: `${adapterId} can be wired later for ${task.department} work.`,
    taskId: task.id
  };
}

function createCodexAdapter(): AgentAdapter {
  return {
    canHandle(task) {
      const prompt = task.prompt.toLowerCase();
      return (
        ["builder", "creator"].includes(task.department) ||
        ["build", "code", "repo"].some((term) => prompt.includes(term))
      );
    },
    async execute(task) {
      const prompt = createCodexPrompt(task);
      const logs = [
        `codex adapter received approved task ${task.id}.`,
        "Launching: codex exec <guarded task prompt>."
      ];

      try {
        const { stderr, stdout } = await execFileAsync("codex", ["exec", prompt], {
          cwd: process.cwd(),
          env: {
            ...process.env,
            NINJA_DOJO_AGENT: "codex",
            NINJA_DOJO_TASK_ID: task.id
          },
          maxBuffer: CODEX_MAX_BUFFER,
          timeout: CODEX_TIMEOUT_MS
        });
        const output = [stdout.trim(), stderr.trim()].filter(Boolean).join("\n\n");
        return {
          agent: "codex",
          artifacts: extractArtifactLines(output),
          logs: [...logs, ...splitOutput(output)],
          status: "complete",
          summary: summarizeOutput(output),
          taskId: task.id
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Codex execution failed.";
        return {
          agent: "codex",
          artifacts: [],
          logs: [...logs, message],
          status: "failed",
          summary: message,
          taskId: task.id
        };
      }
    },
    id: "codex"
  };
}

function createPlaceholderAdapter(
  id: string,
  departments: string[],
  promptTerms: string[] = []
): AgentAdapter {
  return {
    canHandle(task) {
      const prompt = task.prompt.toLowerCase();
      return (
        departments.includes(task.department) ||
        promptTerms.some((term) => prompt.includes(term))
      );
    },
    async execute(task) {
      return placeholderReceipt(id, task);
    },
    id
  };
}

export const codexAdapter = createCodexAdapter();

export const claudeAdapter = createPlaceholderAdapter("claude", ["auditor", "researcher"], [
  "review",
  "critique",
  "analyze"
]);

export const notionAdapter = createPlaceholderAdapter("notion", ["scribe", "strategist"], [
  "memory",
  "brain",
  "docs"
]);

export const discordAdapter = createPlaceholderAdapter("discord", ["marketer"], [
  "announce",
  "community",
  "discord"
]);

export const openclawAdapter = createPlaceholderAdapter("openclaw", ["creator", "marketer"], [
  "browser",
  "action",
  "local"
]);

export const placeholderAdapters = [
  codexAdapter,
  claudeAdapter,
  notionAdapter,
  discordAdapter,
  openclawAdapter
];

export type { AgentAdapter, AgentReceipt, MissionTask };

function createCodexPrompt(task: MissionTask) {
  return [
    "You are running as the gated Codex worker for Ninja Dojo.",
    "",
    "Hard safety rules:",
    "- Do not commit.",
    "- Do not push.",
    "- Do not deploy.",
    "- Do not run destructive commands.",
    "- Do not touch secrets or .env files.",
    "- Keep changes scoped to the approved task.",
    "",
    `Task ID: ${task.id}`,
    `Department: ${task.department}`,
    `Title: ${task.title}`,
    task.runId ? `Run ID: ${task.runId}` : undefined,
    task.context ? `Context:\n${task.context}` : undefined,
    "",
    "Task prompt:",
    task.prompt
  ]
    .filter(Boolean)
    .join("\n");
}

function splitOutput(output: string) {
  if (!output.trim()) return ["Codex completed without terminal output."];
  return output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(-80);
}

function summarizeOutput(output: string) {
  const lines = splitOutput(output);
  return lines[lines.length - 1] ?? "Codex execution completed.";
}

function extractArtifactLines(output: string) {
  return output
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^(changed|created|updated|wrote|file|artifact|path):/i.test(line))
    .slice(0, 20);
}
