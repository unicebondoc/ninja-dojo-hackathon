export type ProductType =
  | "dashboard"
  | "landing"
  | "local-service"
  | "portfolio"
  | "product"
  | "waitlist";

export type RunManifestStatus = "idle" | "running" | "shipped" | "failed";

export type RunStageStatus = "queued" | "working" | "complete" | "failed";

export type RunManifestStage = {
  id: "scroll" | "plan" | "build" | "attack" | "review" | "deploy" | "judge" | "moonrise";
  label: string;
  ninja: "Dojo" | "Moji" | "Miji" | "Maji" | "Meji" | "Muji" | "Meowts";
  role: string;
  status: RunStageStatus;
  summary: string;
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
  runId: string;
  createdAt: string;
  scrollText: string;
  productType: ProductType;
  inferredName: string;
  requirements: string[];
  stages: RunManifestStage[];
  generatedPreview: GeneratedPreview;
  status: RunManifestStatus;
  moonriseUrl: string;
  judgeResult: JudgeResult;
};
