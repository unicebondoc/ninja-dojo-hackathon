import { EventBus } from "@/game/events";

export type AgentId =
  | "Moji"
  | "Miji"
  | "Maji"
  | "Meji"
  | "Muji"
  | "Meowts";

export type RunStage =
  | "idle"
  | "plan"
  | "build"
  | "attack"
  | "review"
  | "deploy"
  | "judge"
  | "moonrise";

export type RunStageEvent = {
  agent?: AgentId;
  index: number;
  message: string;
  role: string;
  stage: RunStage;
};

type Step = {
  agent: AgentId;
  duration: number;
  effect: "plan" | "build" | "attack" | "review" | "deploy" | "judge";
  message: string;
  role: string;
  stage: RunStage;
};

const steps: Step[] = [
  {
    agent: "Moji",
    duration: 3600,
    effect: "plan",
    message: "Moji is writing the plan...",
    role: "Plan",
    stage: "plan"
  },
  {
    agent: "Miji",
    duration: 4200,
    effect: "build",
    message: "Miji is building the oracle page...",
    role: "Build",
    stage: "build"
  },
  {
    agent: "Maji",
    duration: 3600,
    effect: "attack",
    message: "Maji is attacking weak spots...",
    role: "Attack",
    stage: "attack"
  },
  {
    agent: "Meji",
    duration: 3600,
    effect: "review",
    message: "Meji is reviewing architecture...",
    role: "Review",
    stage: "review"
  },
  {
    agent: "Muji",
    duration: 3600,
    effect: "deploy",
    message: "Muji is running build checks...",
    role: "Deploy",
    stage: "deploy"
  },
  {
    agent: "Meowts",
    duration: 3600,
    effect: "judge",
    message: "Meowts is judging the dojo run...",
    role: "Judge",
    stage: "judge"
  }
];

export class RunStateMachine {
  private running = false;
  private timers: Array<ReturnType<typeof setTimeout>> = [];

  constructor(_scene: unknown) {}

  isRunning() {
    return this.running;
  }

  start() {
    if (this.running) return;
    this.running = true;

    EventBus.emit<RunStageEvent>("run-stage", {
      index: 0,
      message: "Scroll received.",
      role: "Scroll",
      stage: "idle"
    });
    EventBus.emit("run-started");

    let cursor = 900;
    steps.forEach((step, index) => {
      this.timers.push(
        setTimeout(() => {
          EventBus.emit<RunStageEvent>("run-stage", {
            agent: step.agent,
            index: index + 1,
            message: step.message,
            role: step.role,
            stage: step.stage
          });
        }, cursor)
      );
      cursor += step.duration;
    });

    this.timers.push(
      setTimeout(() => {
        EventBus.emit<RunStageEvent>("run-stage", {
          index: steps.length + 1,
          message: "The moon rises. The build is complete.",
          role: "Moonrise",
          stage: "moonrise"
        });
        EventBus.emit("run-completed");
        this.running = false;
      }, cursor + 800)
    );
  }

  reset() {
    this.clearTimers();
    EventBus.emit("run-reset");
  }

  dispose() {
    this.clearTimers();
  }

  private clearTimers() {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers = [];
    this.running = false;
  }
}

export const runSteps = steps;
