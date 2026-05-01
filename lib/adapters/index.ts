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
        const filesChanged = await getChangedFiles();
        return {
          agent: "codex",
          artifacts: uniqueStrings([...extractArtifactLines(output), ...filesChanged]),
          exitCode: 0,
          logs: [...logs, ...splitOutput(output)],
          stderr,
          status: "complete",
          stdout,
          summary: summarizeOutput(output),
          taskId: task.id
        };
      } catch (error) {
        const failed = error as Partial<Error> & {
          code?: number | string;
          stderr?: string;
          stdout?: string;
        };
        const stdout = failed.stdout ?? "";
        const stderr = failed.stderr ?? "";
        const output = [stdout.trim(), stderr.trim()].filter(Boolean).join("\n\n");
        const message = failed.message ?? "Codex execution failed.";
        const filesChanged = await getChangedFiles();
        return {
          agent: "codex",
          artifacts: uniqueStrings([...extractArtifactLines(output), ...filesChanged]),
          exitCode: typeof failed.code === "number" ? failed.code : 1,
          logs: [...logs, ...splitOutput(output), message],
          stderr,
          status: "failed",
          stdout,
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

export const claudeAdapter = createClaudeAdapter();

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

function createClaudeAdapter(): AgentAdapter {
  return {
    canHandle(task) {
      const prompt = `${task.title} ${task.prompt}`.toLowerCase();
      return (
        ["auditor", "researcher", "strategist"].includes(task.department) ||
        ["analyze", "debug", "plan", "review", "risk", "critique"].some((term) =>
          prompt.includes(term)
        )
      );
    },
    async execute(task) {
      const kind = claudeTypeFor(task);
      const insights = claudeInsights(task, kind);
      const risks = claudeRisks(task);
      const recommendations = claudeRecommendations(task, kind);
      return {
        agent: "claude",
        artifacts: [],
        exitCode: null,
        insights,
        logs: [
          `claude adapter received approved ${kind} task ${task.id}.`,
          "No shell commands were run.",
          "No files were edited.",
          "Structured review returned from local analysis layer."
        ],
        recommendations,
        risks,
        status: "complete",
        stderr: "",
        stdout: "",
        summary: `${kindLabel(kind)} complete: ${recommendations[0]}`,
        taskId: task.id,
        type: kind
      };
    },
    id: "claude"
  };
}

function claudeTypeFor(task: MissionTask): "analysis" | "plan" | "review" {
  const text = `${task.title} ${task.prompt}`.toLowerCase();
  if (text.includes("plan") || task.department === "strategist") return "plan";
  if (text.includes("review") || text.includes("audit") || task.department === "auditor") {
    return "review";
  }
  return "analysis";
}

function claudeInsights(task: MissionTask, kind: "analysis" | "plan" | "review") {
  const contextHint = task.context ? "Run context is available for comparison." : "No run context was supplied.";
  return [
    `${kindLabel(kind)} scope is ${task.department}: ${task.title}.`,
    contextHint,
    task.prompt.length > 240
      ? "Task prompt is detailed enough to derive concrete checks."
      : "Task prompt is short; output should be treated as a first-pass review."
  ];
}

function claudeRisks(task: MissionTask) {
  const text = `${task.title} ${task.prompt}`.toLowerCase();
  return [
    text.includes("deploy")
      ? "Deployment claims need separate verification before release."
      : "No deployment action should be inferred from this review.",
    text.includes("api") || text.includes("backend")
      ? "Backend behavior needs route-level validation and error handling checks."
      : "Main risk is product clarity rather than backend correctness.",
    "Approval only authorizes analysis here; it does not authorize file edits."
  ];
}

function claudeRecommendations(task: MissionTask, kind: "analysis" | "plan" | "review") {
  const text = `${task.title} ${task.prompt}`.toLowerCase();
  return [
    kind === "plan"
      ? "Convert the scroll into small, testable implementation steps."
      : "Compare the output against the original scroll and acceptance criteria.",
    text.includes("codex")
      ? "Use this review to scope the next Codex worker task, not to replace execution."
      : "Keep this as a decision note before assigning implementation work.",
    "Capture the result in the Moonrise Receipt before any future execution."
  ];
}

function kindLabel(kind: "analysis" | "plan" | "review") {
  if (kind === "plan") return "Plan";
  if (kind === "review") return "Review";
  return "Analysis";
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

async function getChangedFiles() {
  try {
    const { stdout } = await execFileAsync("git", ["diff", "--name-only"], {
      cwd: process.cwd(),
      maxBuffer: 1024 * 256,
      timeout: 5000
    });
    return stdout
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 80);
  } catch {
    return [];
  }
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}
