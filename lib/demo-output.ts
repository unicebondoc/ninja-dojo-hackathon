import type { DojoDemoOutput } from "@/lib/types";

export const demoOutput: DojoDemoOutput = {
  scroll: "Build a landing page for a magical oracle deck with a waitlist CTA.",
  status: "shipped",
  previewPath: "/demo/oracle",
  agents: [
    {
      name: "Moji",
      role: "Plan",
      status: "complete",
      output:
        "Spec created: hero, product story, oracle deck benefits, waitlist CTA."
    },
    {
      name: "Miji",
      role: "Build",
      status: "complete",
      output: "Built a dark mystical landing page with waitlist CTA."
    },
    {
      name: "Renegade",
      role: "Attack",
      status: "complete",
      output: "Flagged vague CTA and weak mobile spacing. Fixed before ship."
    },
    {
      name: "Sensei",
      role: "Review",
      status: "complete",
      output:
        "Architecture approved. Live SSE backend, clean Tailwind, adapter-ready orchestration."
    },
    {
      name: "Tester",
      role: "Deploy",
      status: "complete",
      output: "Build passed. Live stream and preview ready at /demo/oracle."
    },
    {
      name: "Meowts",
      role: "Judge",
      status: "complete",
      output: "Approved. Boss, acceptable. The moon may rise."
    }
  ],
  meowtsRoast:
    "Boss. You finally shipped before adding twelve more features. The moon approves.",
  verdict: "Moonrise: shipped."
};
