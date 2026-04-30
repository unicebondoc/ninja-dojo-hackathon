export type MoonrisePreview = {
  brandName: string;
  pageType: "dashboard" | "landing" | "portfolio" | "product" | "waitlist";
  eyebrow: string;
  headline: string;
  subheadline: string;
  primaryCta: string;
  secondaryCta: string;
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

const stopWords = new Set([
  "a",
  "an",
  "and",
  "app",
  "for",
  "me",
  "page",
  "the",
  "with"
]);

export function generateMoonrisePreview(prompt: string): MoonrisePreview {
  const cleanPrompt = sanitizePrompt(prompt);
  const lower = cleanPrompt.toLowerCase();
  const pageType = inferPageType(lower);
  const subject = extractSubject(cleanPrompt);
  const brandName = inferBrandName(subject, lower, pageType);
  const isRamen = lower.includes("ramen");
  const isBooking = /\b(book|booking|reservation|appointment|schedule)\b/i.test(lower);
  const wantsPricing = /\b(price|pricing|menu|plans|tiers|cost)\b/i.test(lower);
  const wantsTestimonials = /\b(testimonials?|reviews?|social proof|quotes?)\b/i.test(lower);
  const isDashboard = pageType === "dashboard";

  const primaryCta = isBooking
    ? "Book a Table"
    : pageType === "waitlist"
      ? "Join the Waitlist"
      : pageType === "portfolio"
        ? "View Work"
        : isDashboard
          ? "Open Dashboard"
          : "Get Started";

  const secondaryCta = isRamen
    ? "See the Menu"
    : pageType === "portfolio"
      ? "Contact Me"
      : isDashboard
        ? "View Metrics"
        : "Explore Preview";

  return {
    brandName,
    eyebrow: pageTypeLabel(pageType),
    headline: headlineFor({ brandName, isRamen, pageType, subject }),
    pageType,
    palette: paletteFor(lower, pageType),
    primaryCta,
    secondaryCta,
    sections: buildSections({
      brandName,
      isBooking,
      isDashboard,
      isRamen,
      pageType,
      prompt: cleanPrompt,
      subject,
      wantsPricing,
      wantsTestimonials
    }),
    subheadline: subheadlineFor({ brandName, isRamen, pageType, prompt: cleanPrompt }),
    ...(wantsPricing || isRamen ? { pricing: pricingFor({ brandName, isRamen, pageType }) } : {}),
    ...(wantsTestimonials
      ? { testimonials: testimonialsFor({ brandName, isRamen, pageType }) }
      : {}),
    ...(isDashboard ? { metrics: dashboardMetrics(brandName) } : {})
  };
}

export function sanitizePrompt(prompt: string) {
  return prompt.trim().replace(/\s+/g, " ");
}

function inferPageType(lower: string): MoonrisePreview["pageType"] {
  if (lower.includes("dashboard") || lower.includes("analytics")) return "dashboard";
  if (lower.includes("portfolio")) return "portfolio";
  if (lower.includes("waitlist")) return "waitlist";
  if (lower.includes("product page") || lower.includes("checkout")) return "product";
  return "landing";
}

function extractSubject(prompt: string) {
  const patterns = [
    /\bfor\s+(?:a|an|the)?\s*([^,.]+?)(?:\s+with\b|\s+that\b|\s+including\b|$)/i,
    /\babout\s+(?:a|an|the)?\s*([^,.]+?)(?:\s+with\b|\s+that\b|\s+including\b|$)/i
  ];

  for (const pattern of patterns) {
    const match = prompt.match(pattern);
    if (match?.[1]) return cleanupSubject(match[1]);
  }

  return cleanupSubject(
    prompt
      .replace(/^build\s+(me\s+)?/i, "")
      .replace(/\b(landing page|waitlist app|portfolio|product page|dashboard)\b/gi, "")
  );
}

function cleanupSubject(subject: string) {
  return subject
    .replace(/\b(online booking|pricing|testimonials|reviews|cta|with)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.!,;:]+$/g, "");
}

function inferBrandName(subject: string, lower: string, pageType: MoonrisePreview["pageType"]) {
  if (lower.includes("moonlit ramen")) return "Moonlit Ramen";
  if (lower.includes("ramen")) return `${titleCase(keywordBefore(subject, "ramen") || "Moonlit")} Ramen`;
  if (pageType === "portfolio") return titleCase(subject.replace(/\b(freelance|for)\b/gi, "")) || "Moonlit Studio";
  if (pageType === "dashboard") return `${titleCase(primaryKeywords(subject).slice(0, 2).join(" ")) || "Founder"} Console`;
  if (pageType === "waitlist") return titleCase(primaryKeywords(subject).slice(0, 3).join(" ")) || "Moonrise Waitlist";
  return titleCase(primaryKeywords(subject).slice(0, 3).join(" ")) || "Moonrise Product";
}

function primaryKeywords(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));
}

function keywordBefore(subject: string, keyword: string) {
  const words = primaryKeywords(subject);
  const index = words.indexOf(keyword);
  return index > 0 ? words[index - 1] : "";
}

function titleCase(text: string) {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => `${word[0]?.toUpperCase() ?? ""}${word.slice(1)}`)
    .join(" ");
}

function pageTypeLabel(pageType: MoonrisePreview["pageType"]) {
  const labels = {
    dashboard: "Shipped dashboard preview",
    landing: "Shipped landing page",
    portfolio: "Shipped portfolio preview",
    product: "Shipped product page",
    waitlist: "Shipped waitlist page"
  };
  return labels[pageType];
}

function headlineFor({
  brandName,
  isRamen,
  pageType,
  subject
}: {
  brandName: string;
  isRamen: boolean;
  pageType: MoonrisePreview["pageType"];
  subject: string;
}) {
  if (isRamen) return "Moonlit bowls, warm lanterns, and a table waiting.";
  if (pageType === "portfolio") return `${brandName} turns sharp ideas into polished digital work.`;
  if (pageType === "dashboard") return `See ${brandName.replace(/ Console$/, "").toLowerCase()} clearly before the day gets loud.`;
  if (pageType === "waitlist") return `Be first in line for ${brandName}.`;
  if (pageType === "product") return `${brandName} is ready for its first customers.`;
  return `Launch ${subject || brandName} with a page that feels ready.`;
}

function subheadlineFor({
  brandName,
  isRamen,
  pageType,
  prompt
}: {
  brandName: string;
  isRamen: boolean;
  pageType: MoonrisePreview["pageType"];
  prompt: string;
}) {
  if (isRamen) {
    return `${brandName} is a cinematic ramen landing page with booking, menu pricing, and diner proof shaped from your scroll.`;
  }
  if (pageType === "dashboard") {
    return "A focused command view with the core metrics, tasks, and signals a solo operator needs first.";
  }
  if (pageType === "portfolio") {
    return "A polished first-pass portfolio with case-study framing, trust signals, and a clear contact path.";
  }
  return `A deterministic Moonrise preview generated locally from: "${prompt}"`;
}

function buildSections({
  brandName,
  isBooking,
  isDashboard,
  isRamen,
  pageType,
  prompt,
  subject,
  wantsPricing,
  wantsTestimonials
}: {
  brandName: string;
  isBooking: boolean;
  isDashboard: boolean;
  isRamen: boolean;
  pageType: MoonrisePreview["pageType"];
  prompt: string;
  subject: string;
  wantsPricing: boolean;
  wantsTestimonials: boolean;
}) {
  if (isDashboard) {
    return [
      {
        body: "The top row keeps the essentials visible before decisions drift.",
        items: ["Revenue pulse", "Active users", "Launch tasks"],
        title: "Operator snapshot"
      },
      {
        body: "Every card is tuned for scanning, comparing, and acting quickly.",
        items: ["Trend deltas", "Priority queue", "Risk notes"],
        title: "Built for daily review"
      }
    ];
  }

  return [
    {
      body: isRamen
        ? "Guests land on the mood first: lantern light, late-night broth, and a booking path that is impossible to miss."
        : `The hero introduces ${brandName} with a clear promise and primary conversion action.`,
      items: [
        isBooking ? "Booking CTA above the fold" : "Primary CTA above the fold",
        wantsPricing ? "Pricing or offer cards included" : "Offer framing included",
        wantsTestimonials ? "Trust proof included" : "Benefit proof included"
      ],
      title: "Hero and conversion path"
    },
    {
      body: `The middle of the page turns the original scroll into tangible product sections for ${subject || brandName}.`,
      items: ["How it works", "What you get", "Why it matters"],
      title: pageType === "portfolio" ? "Work and proof" : "Offer story"
    },
    {
      body: "The final section gives visitors one clean next step instead of leaving them at the bottom of the page.",
      items: [isBooking ? "Book a table" : "Start the next step", "Low-friction form", "Clear expectation setting"],
      title: "Closing action"
    }
  ];
}

function pricingFor({
  isRamen,
  pageType
}: {
  brandName: string;
  isRamen: boolean;
  pageType: MoonrisePreview["pageType"];
}) {
  if (isRamen) {
    return [
      { detail: "Soy broth, roasted mushrooms, spring onion.", name: "Moon Shoyu", price: "$18" },
      { detail: "Slow broth, chili oil, soft egg, black garlic.", name: "Lantern Tonkotsu", price: "$22" },
      { detail: "Sesame tare, tofu, corn, seasonal greens.", name: "Garden Miso", price: "$19" }
    ];
  }
  if (pageType === "product") {
    return [
      { detail: "Everything needed to try the product.", name: "Starter", price: "$19" },
      { detail: "The main offer for serious users.", name: "Core", price: "$49" },
      { detail: "Hands-on help and premium support.", name: "Concierge", price: "$149" }
    ];
  }
  return [
    { detail: "A quick way to validate demand.", name: "Preview", price: "Free" },
    { detail: "The recommended launch package.", name: "Launch", price: "$29" },
    { detail: "A fuller build with extra polish.", name: "Studio", price: "$79" }
  ];
}

function testimonialsFor({
  brandName,
  isRamen,
  pageType
}: {
  brandName: string;
  isRamen: boolean;
  pageType: MoonrisePreview["pageType"];
}) {
  if (isRamen) {
    return [
      { name: "Ari, night-shift designer", quote: "The black garlic bowl tasted like the city finally exhaled." },
      { name: "Mina, regular", quote: "Booked in two taps and had a window seat under the lanterns." },
      { name: "Theo, ramen hunter", quote: "The menu is small, confident, and exactly what I wanted." }
    ];
  }
  return [
    { name: "Early user", quote: `${brandName} made the offer instantly easier to understand.` },
    { name: "Founder friend", quote: pageType === "portfolio" ? "The case studies finally feel premium." : "The page tells me what to do next." },
    { name: "Beta tester", quote: "It feels like a real first pass, not a blank template." }
  ];
}

function dashboardMetrics(brandName: string) {
  return [
    { label: "Pipeline", value: "$12.4k" },
    { label: "Active users", value: "1,284" },
    { label: `${brandName.replace(/ Console$/, "")} tasks`, value: "18" },
    { label: "Launch risk", value: "Low" }
  ];
}

function paletteFor(lower: string, pageType: MoonrisePreview["pageType"]) {
  if (lower.includes("ramen")) {
    return { accent: "#f97316", glow: "#facc15", surface: "#1c0f0a" };
  }
  if (pageType === "dashboard") {
    return { accent: "#78f0d4", glow: "#38bdf8", surface: "#071417" };
  }
  if (pageType === "portfolio") {
    return { accent: "#c4b5fd", glow: "#f4e8c1", surface: "#111016" };
  }
  if (pageType === "waitlist") {
    return { accent: "#f4a9d8", glow: "#78f0d4", surface: "#160b14" };
  }
  return { accent: "#ef3434", glow: "#e8c66a", surface: "#11100e" };
}
