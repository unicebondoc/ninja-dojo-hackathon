import type { GeneratedPreview, JudgeResult } from "@/lib/runs/types";

const checks = [
  { label: "Booking", terms: ["book", "booking", "reservation", "appointment", "schedule"] },
  { label: "Pricing", terms: ["price", "pricing", "menu", "plans", "tiers", "cost", "packages"] },
  { label: "Testimonials", terms: ["testimonial", "testimonials", "review", "reviews", "social proof"] },
  { label: "Waitlist", terms: ["waitlist", "signup", "sign up", "email capture"] },
  { label: "Dashboard metrics", terms: ["dashboard", "analytics", "metrics", "revenue"] },
  { label: "Contact path", terms: ["contact", "inquiry", "quote", "lead"] }
];

export function judgeRun(scrollText: string, preview: GeneratedPreview): JudgeResult {
  const lower = scrollText.toLowerCase();
  const requestedItems = checks.map((check) => {
    const requested = check.terms.some((term) => lower.includes(term));
    const included = requested ? previewIncludes(check.label, preview) : false;
    return {
      included,
      label: check.label,
      requested
    };
  });

  const requested = requestedItems.filter((item) => item.requested);
  const matchedRequested = requested.filter((item) => item.included);
  const baseScore = 72;
  const requestScore =
    requested.length === 0
      ? 18
      : Math.round((matchedRequested.length / requested.length) * 22);
  const completenessScore =
    preview.sections.length >= 3 && preview.features.length >= 3 ? 6 : 2;
  const score = Math.min(96, baseScore + requestScore + completenessScore);

  return {
    improvements: improvementsFor(requestedItems, preview),
    matched: matchedFor(requestedItems, preview),
    requestedItems,
    score,
    verdict: score >= 82 ? "shipped" : score >= 62 ? "needs polish" : "blocked"
  };
}

function previewIncludes(label: string, preview: GeneratedPreview) {
  if (label === "Booking") return /book|schedule|quote|table|appointment/i.test(preview.primaryCta);
  if (label === "Pricing") return Boolean(preview.pricing?.length);
  if (label === "Testimonials") return Boolean(preview.testimonials?.length);
  if (label === "Waitlist") return /waitlist|signup|sign up|email/i.test(preview.primaryCta);
  if (label === "Dashboard metrics") return Boolean(preview.metrics?.length);
  if (label === "Contact path") return /contact|quote|work/i.test(`${preview.primaryCta} ${preview.secondaryCta}`);
  return false;
}

function matchedFor(
  requestedItems: JudgeResult["requestedItems"],
  preview: GeneratedPreview
) {
  const matched = requestedItems
    .filter((item) => item.requested && item.included)
    .map((item) => `${item.label} was requested and included.`);

  return [
    `${preview.brandName} matches the inferred ${preview.productType} direction.`,
    `${preview.primaryCta} gives the page a clear conversion path.`,
    ...matched
  ].slice(0, 3);
}

function improvementsFor(
  requestedItems: JudgeResult["requestedItems"],
  preview: GeneratedPreview
) {
  const missing = requestedItems
    .filter((item) => item.requested && !item.included)
    .map((item) => `Add a stronger ${item.label.toLowerCase()} section.`);

  return [
    ...missing,
    `Replace local placeholder data with real ${preview.brandName} content.`,
    "Connect the CTA to a production form, booking tool, or checkout.",
    "Run a human copy pass before deploying to customers."
  ].slice(0, 3);
}
