import type { RunManifest } from "@/lib/runs/types";

export function formatRunBrief(run: RunManifest) {
  const requested = run.judgeResult.requestedItems
    .filter((item) => item.requested)
    .map((item) => `- ${item.label}: ${item.included ? "included" : "needs follow-up"}`)
    .join("\n");

  return [
    `NINJA DOJO RUN BRIEF`,
    ``,
    `Run: ${run.runId}`,
    `Created: ${run.createdAt}`,
    `Status: ${run.status}`,
    ``,
    `Scroll`,
    run.scrollText,
    ``,
    `Inferred Product`,
    `- Type: ${run.productType}`,
    `- Name: ${run.inferredName}`,
    `- Preview: ${run.moonriseUrl}`,
    ``,
    `Requirements`,
    ...run.requirements.map((requirement) => `- ${requirement}`),
    ``,
    `Stage Summaries`,
    ...run.stages.map(
      (stage) => `- ${stage.label} (${stage.ninja} / ${stage.role}): ${stage.summary}`
    ),
    ``,
    `Moonrise Preview`,
    `- Headline: ${run.generatedPreview.headline}`,
    `- CTA: ${run.generatedPreview.primaryCta}`,
    `- Tone: ${run.generatedPreview.tone}`,
    ``,
    `Judge Result`,
    `- Verdict: ${run.judgeResult.verdict}`,
    `- Score: ${run.judgeResult.score}/100`,
    `- Matched:`,
    ...run.judgeResult.matched.map((item) => `  - ${item}`),
    `- Suggested improvements:`,
    ...run.judgeResult.improvements.map((item) => `  - ${item}`),
    requested ? `- Requested item checks:\n${requested}` : `- Requested item checks: no special items requested`,
    ``,
    `Next recommended action`,
    `Request a real Dojo Run to turn this Moonrise preview into a deploy-ready product page or app.`
  ].join("\n");
}

export function mailtoForRun(run: RunManifest) {
  const subject = `Request a real Dojo Run: ${run.inferredName}`;
  const body = formatRunBrief(run);
  return `mailto:hello@ninja-dojo.app?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
