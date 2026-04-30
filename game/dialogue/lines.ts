import type { AgentId, RunStage } from "@/game/run/RunStateMachine";

type AgentState = "idle" | "working" | "done";

type DialogueTree = Record<AgentState, string[]>;

const trees: Record<AgentId, DialogueTree> = {
  Maji: {
    done: ["Attack path cleared."],
    idle: ["I'm sharpening the attack plan.", "Attack path ready."],
    working: ["Looking for weak spots.", "Cutting through the fragile parts."]
  },
  Meji: {
    done: ["Review complete. The structure holds."],
    idle: ["Reviewing quietly.", "Listening for architecture tension."],
    working: ["Reviewing the scroll.", "Checking the shape of the build."]
  },
  Meowts: {
    done: ["Approved. The moon may rise."],
    idle: ["Judging with moonlight precision.", "The verdict waits on the roof."],
    working: ["Judging under moonlight.", "Watching every move."]
  },
  Miji: {
    done: ["First pass built. Ready for review."],
    idle: ["Busy building. Watch your step.", "Tools sharp. Worktree clean."],
    working: ["Building the first pass.", "Assembling the preview."]
  },
  Moji: {
    done: ["Plan complete. The route is clear."],
    idle: ["Mapping the scroll route.", "A new scroll is waiting at center floor."],
    working: ["Mapping the scroll route.", "Writing the plan before blades move."]
  },
  Muji: {
    done: ["Deploy route is clear."],
    idle: ["Checking the deploy path.", "No ship without proof."],
    working: ["Deploy route is clear.", "Running checks before moonrise."]
  }
};

export type AgentDialogueState = AgentState;

export function linesFor(agent: AgentId, state: AgentState): string[] {
  return trees[agent][state];
}

export function stageToAgentState(
  stage: RunStage,
  agent: AgentId
): AgentState {
  if (stage === "idle") return "idle";
  if (stage === "moonrise") return "done";

  const order: RunStage[] = [
    "plan",
    "build",
    "attack",
    "review",
    "deploy",
    "judge"
  ];
  const agentStage: Record<AgentId, RunStage> = {
    Maji: "attack",
    Meji: "review",
    Meowts: "judge",
    Miji: "build",
    Moji: "plan",
    Muji: "deploy"
  };

  const myIndex = order.indexOf(agentStage[agent]);
  const currentIndex = order.indexOf(stage);

  if (currentIndex < myIndex) return "idle";
  if (currentIndex === myIndex) return "working";
  return "done";
}
