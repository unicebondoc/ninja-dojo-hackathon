export type ProductType =
  | "dashboard"
  | "landing"
  | "local-service"
  | "portfolio"
  | "product"
  | "waitlist";

export type RunManifestStatus = "idle" | "running" | "shipped" | "failed";

export type RunStageStatus = "queued" | "working" | "complete" | "failed";

export type RunDepartment =
  | "auditor"
  | "builder"
  | "creator"
  | "marketer"
  | "meowts"
  | "researcher"
  | "scribe"
  | "strategist";

export type RunManifestStage = {
  id: "scroll" | "plan" | "build" | "attack" | "review" | "deploy" | "judge" | "moonrise";
  department: RunDepartment;
  label: string;
  ninja: "Dojo" | "Moji" | "Miji" | "Maji" | "Meji" | "Muji" | "Meowts";
  role: string;
  status: RunStageStatus;
  summary: string;
};

export type RunManifestAgent = {
  id: "dojo" | "moji" | "miji" | "maji" | "meji" | "muji" | "meowts" | "moonrise";
  department: RunDepartment;
  name: RunManifestStage["ninja"];
  role: string;
  summary: string;
};

export type RunManifestLog = {
  id: string;
  at: string;
  department: RunDepartment;
  message: string;
  stage: RunManifestStage["id"];
};

export type GeneratedPreviewFeature = {
  title: string;
  body: string;
};

export type GeneratedPreview = {
  brandName: string;
  productType: ProductType;
  eyebrow: string;
  headline: string;
  subheadline: string;
  primaryCta: string;
  secondaryCta: string;
  tone: string;
  features: GeneratedPreviewFeature[];
  sections: Array<{
    title: string;
    body: string;
    items: string[];
  }>;
  pricing?: Array<{
    name: string;
    price: string;
    detail: string;
  }>;
  testimonials?: Array<{
    quote: string;
    name: string;
  }>;
  metrics?: Array<{
    label: string;
    value: string;
  }>;
  palette: {
    accent: string;
    glow: string;
    surface: string;
  };
};

export type RequestedItemCheck = {
  label: string;
  requested: boolean;
  included: boolean;
};

export type JudgeResult = {
  verdict: "shipped" | "needs polish" | "blocked";
  score: number;
  matched: string[];
  improvements: string[];
  requestedItems: RequestedItemCheck[];
};

export type RunManifest = {
  id: string;
  runId: string;
  agents: RunManifestAgent[];
  createdAt: string;
  scrollText: string;
  productType: ProductType;
  inferredName: string;
  requirements: string[];
  stages: RunManifestStage[];
  logs: RunManifestLog[];
  generatedPreview: GeneratedPreview;
  status: RunManifestStatus;
  moonriseUrl: string;
  receiptUrl: string;
  judgeResult: JudgeResult;
};
