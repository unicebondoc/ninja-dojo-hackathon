import type { DojoDemoOutput } from "@/lib/types";

export const demoOutput: DojoDemoOutput = {
  scroll: "Build me a landing page for a moonlit ramen shop with online booking, pricing, and testimonials.",
  status: "shipped",
  previewPath: "/moonrise",
  agents: [
    {
      name: "Moji",
      role: "Plan",
      status: "complete",
      output:
        "Spec created: hero, product story, proof sections, and conversion CTA."
    },
    {
      name: "Miji",
      role: "Build",
      status: "complete",
      output: "Built a personalized Moonrise preview with a clear CTA."
    },
    {
      name: "Maji",
      role: "Attack",
      status: "complete",
      output: "Flagged vague CTA and weak mobile spacing. Fixed before ship."
    },
    {
      name: "Meji",
      role: "Review",
      status: "complete",
      output:
        "Architecture approved. Live SSE backend, clean Tailwind, adapter-ready orchestration."
    },
    {
      name: "Muji",
      role: "Deploy",
      status: "complete",
      output: "Build passed. Live stream and Moonrise preview ready."
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
