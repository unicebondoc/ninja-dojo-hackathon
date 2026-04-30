import type { GeneratedPreview, ProductType } from "@/lib/runs/types";

const stopWords = new Set([
  "a",
  "an",
  "and",
  "app",
  "build",
  "for",
  "landing",
  "me",
  "page",
  "the",
  "with"
]);

const localServiceWords = [
  "barber",
  "cleaning",
  "clinic",
  "coach",
  "dentist",
  "gym",
  "lawyer",
  "photographer",
  "plumber",
  "restaurant",
  "salon",
  "shop",
  "spa",
  "studio"
];

export function generatePreview(prompt: string): GeneratedPreview {
  const cleanPrompt = sanitizePrompt(prompt);
  const lower = cleanPrompt.toLowerCase();
  const productType = inferProductType(lower);
  const subject = extractSubject(cleanPrompt);
  const brandName = inferBrandName(subject, lower, productType);
  const tone = inferTone(lower);
  const isRamen = lower.includes("ramen");
  const isBooking = hasRequested(lower, ["book", "booking", "reservation", "appointment", "schedule"]);
  const wantsPricing = hasRequested(lower, ["price", "pricing", "menu", "plans", "tiers", "cost", "packages"]);
  const wantsTestimonials = hasRequested(lower, ["testimonial", "testimonials", "review", "reviews", "social proof", "quote", "quotes"]);
  const wantsContact = hasRequested(lower, ["contact", "inquiry", "lead", "call"]);
  const isDashboard = productType === "dashboard";

  const primaryCta = primaryCtaFor({
    isBooking,
    productType,
    wantsContact
  });
  const secondaryCta = secondaryCtaFor({ isRamen, productType, wantsContact });

  return {
    brandName,
    eyebrow: productTypeLabel(productType),
    features: featureSetFor({
      brandName,
      isBooking,
      isRamen,
      productType,
      tone,
      wantsPricing,
      wantsTestimonials
    }),
    headline: headlineFor({ brandName, isRamen, productType, subject, tone }),
    palette: paletteFor(lower, productType),
    primaryCta,
    productType,
    secondaryCta,
    sections: buildSections({
      brandName,
      isBooking,
      isDashboard,
      isRamen,
      productType,
      subject,
      wantsPricing,
      wantsTestimonials
    }),
    subheadline: subheadlineFor({
      brandName,
      isRamen,
      productType,
      prompt: cleanPrompt,
      tone
    }),
    tone,
    ...(wantsPricing || isRamen || productType === "product"
      ? { pricing: pricingFor({ isRamen, productType }) }
      : {}),
    ...(wantsTestimonials || isRamen || productType === "local-service"
      ? { testimonials: testimonialsFor({ brandName, isRamen, productType }) }
      : {}),
    ...(isDashboard ? { metrics: dashboardMetrics(brandName) } : {})
  };
}

export function sanitizePrompt(prompt: string) {
  return prompt.trim().replace(/\s+/g, " ");
}

export function inferProductType(lower: string): ProductType {
  if (lower.includes("dashboard") || lower.includes("analytics") || lower.includes("console")) {
    return "dashboard";
  }
  if (lower.includes("portfolio") || lower.includes("case studies")) return "portfolio";
  if (lower.includes("waitlist") || lower.includes("prelaunch")) return "waitlist";
  if (lower.includes("product page") || lower.includes("checkout") || lower.includes("ecommerce")) {
    return "product";
  }
  if (localServiceWords.some((word) => lower.includes(word))) return "local-service";
  return "landing";
}

export function inferRequirements(prompt: string) {
  const lower = prompt.toLowerCase();
  const requirements = [
    hasRequested(lower, ["book", "booking", "reservation", "appointment", "schedule"]) &&
      "Booking or scheduling CTA",
    hasRequested(lower, ["price", "pricing", "menu", "plans", "tiers", "cost", "packages"]) &&
      "Pricing, menu, plans, or packages",
    hasRequested(lower, ["testimonial", "testimonials", "review", "reviews", "social proof"]) &&
      "Testimonials or social proof",
    hasRequested(lower, ["email", "waitlist", "signup", "sign up"]) &&
      "Lead capture or waitlist form",
    hasRequested(lower, ["dashboard", "analytics", "metrics"]) &&
      "Metrics or dashboard cards",
    hasRequested(lower, ["contact", "portfolio", "case studies"]) &&
      "Contact path and proof sections"
  ].filter(Boolean) as string[];

  return requirements.length > 0
    ? requirements
    : ["Clear hero", "Offer story", "Primary CTA", "Moonrise-ready preview"];
}

function hasRequested(lower: string, terms: string[]) {
  return terms.some((term) => lower.includes(term));
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

function inferBrandName(subject: string, lower: string, productType: ProductType) {
  if (lower.includes("moonlit ramen")) return "Moonlit Ramen";
  if (lower.includes("ramen")) return `${titleCase(keywordBefore(subject, "ramen") || "Moonlit")} Ramen`;
  if (productType === "portfolio") {
    return titleCase(subject.replace(/\b(freelance|for)\b/gi, "")) || "Moonlit Studio";
  }
  if (productType === "dashboard") {
    return `${titleCase(primaryKeywords(subject).slice(0, 2).join(" ")) || "Founder"} Console`;
  }
  if (productType === "waitlist") {
    return titleCase(primaryKeywords(subject).slice(0, 3).join(" ")) || "Moonrise Waitlist";
  }
  if (productType === "local-service") {
    return titleCase(primaryKeywords(subject).slice(0, 3).join(" ")) || "Lantern Studio";
  }
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

function inferTone(lower: string) {
  if (lower.includes("moonlit")) return "moonlit";
  if (lower.includes("luxury") || lower.includes("premium")) return "luxury";
  if (lower.includes("cyberpunk") || lower.includes("neon")) return "neon";
  if (lower.includes("cozy") || lower.includes("warm")) return "cozy";
  if (lower.includes("saas") || lower.includes("b2b")) return "saas";
  if (lower.includes("fantasy") || lower.includes("magical")) return "fantasy";
  return "premium";
}

function productTypeLabel(productType: ProductType) {
  const labels: Record<ProductType, string> = {
    dashboard: "Shipped dashboard preview",
    landing: "Shipped landing page",
    "local-service": "Shipped service page",
    portfolio: "Shipped portfolio preview",
    product: "Shipped product page",
    waitlist: "Shipped waitlist page"
  };
  return labels[productType];
}

function primaryCtaFor({
  isBooking,
  productType,
  wantsContact
}: {
  isBooking: boolean;
  productType: ProductType;
  wantsContact: boolean;
}) {
  if (isBooking) return "Book a Table";
  if (productType === "waitlist") return "Join the Waitlist";
  if (productType === "portfolio") return "View Work";
  if (productType === "dashboard") return "Open Dashboard";
  if (wantsContact || productType === "local-service") return "Request a Quote";
  return "Get Started";
}

function secondaryCtaFor({
  isRamen,
  productType,
  wantsContact
}: {
  isRamen: boolean;
  productType: ProductType;
  wantsContact: boolean;
}) {
  if (isRamen) return "See the Menu";
  if (productType === "portfolio") return "Contact Me";
  if (productType === "dashboard") return "View Metrics";
  if (wantsContact || productType === "local-service") return "See Packages";
  return "Explore Preview";
}

function headlineFor({
  brandName,
  isRamen,
  productType,
  subject,
  tone
}: {
  brandName: string;
  isRamen: boolean;
  productType: ProductType;
  subject: string;
  tone: string;
}) {
  if (isRamen) return "Moonlit bowls, warm lanterns, and a table waiting.";
  if (productType === "portfolio") return `${brandName} turns sharp ideas into polished digital work.`;
  if (productType === "dashboard") return `See ${brandName.replace(/ Console$/, "").toLowerCase()} clearly before the day gets loud.`;
  if (productType === "waitlist") return `Be first in line for ${brandName}.`;
  if (productType === "product") return `${brandName} is ready for its first customers.`;
  if (productType === "local-service") return `${brandName} makes it easy to choose, trust, and book.`;
  if (tone === "cozy") return `A warmer way to discover ${subject || brandName}.`;
  if (tone === "neon") return `${brandName} lights up the offer before competitors wake up.`;
  return `Launch ${subject || brandName} with a page that feels ready.`;
}

function subheadlineFor({
  brandName,
  isRamen,
  productType,
  prompt,
  tone
}: {
  brandName: string;
  isRamen: boolean;
  productType: ProductType;
  prompt: string;
  tone: string;
}) {
  if (isRamen) {
    return `${brandName} is a cinematic restaurant page with booking, menu pricing, and diner proof shaped from your scroll.`;
  }
  if (productType === "dashboard") {
    return "A focused command view with the core metrics, tasks, and signals a solo operator needs first.";
  }
  if (productType === "portfolio") {
    return "A polished first-pass portfolio with case-study framing, trust signals, and a clear contact path.";
  }
  if (productType === "local-service") {
    return "A service-first landing page with packages, trust signals, and a conversion path that feels practical.";
  }
  if (tone === "saas") {
    return "A B2B product page structure with features, proof, pricing cues, and a direct call to action.";
  }
  return `A Moonrise preview generated locally from: "${prompt}"`;
}

function featureSetFor({
  brandName,
  isBooking,
  isRamen,
  productType,
  tone,
  wantsPricing,
  wantsTestimonials
}: {
  brandName: string;
  isBooking: boolean;
  isRamen: boolean;
  productType: ProductType;
  tone: string;
  wantsPricing: boolean;
  wantsTestimonials: boolean;
}) {
  if (isRamen) {
    return [
      { title: "Lantern-lit booking", body: "Reserve a table in two taps from the hero." },
      { title: "Menu clarity", body: "Three signature bowls with simple pricing." },
      { title: "Diner proof", body: "Short testimonials make the mood believable." }
    ];
  }
  if (productType === "dashboard") {
    return [
      { title: "Signal first", body: "Revenue, user, and task cards sit above the fold." },
      { title: "Operator queue", body: "The next work items are visible without digging." },
      { title: "Risk readout", body: "Launch health is summarized in one glance." }
    ];
  }
  return [
    {
      title: isBooking ? "Booking path" : "Primary action",
      body: isBooking ? "Visitors see the scheduling path immediately." : `${brandName} gets one clear next step.`
    },
    {
      title: wantsPricing ? "Pricing included" : "Offer framing",
      body: wantsPricing ? "Cards make the commercial shape scannable." : "Benefits are grouped into a readable story."
    },
    {
      title: wantsTestimonials ? "Proof included" : `${titleCase(tone)} tone`,
      body: wantsTestimonials ? "The preview includes social proof." : "The visual and copy direction follows the scroll."
    }
  ];
}

function buildSections({
  brandName,
  isBooking,
  isDashboard,
  isRamen,
  productType,
  subject,
  wantsPricing,
  wantsTestimonials
}: {
  brandName: string;
  isBooking: boolean;
  isDashboard: boolean;
  isRamen: boolean;
  productType: ProductType;
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
      },
      {
        body: "The closing panel shows what to do next instead of hiding the work in reports.",
        items: ["Action queue", "Owner clarity", "Risk status"],
        title: "Next action path"
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
      title: productType === "portfolio" ? "Work and proof" : "Offer story"
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
  productType
}: {
  isRamen: boolean;
  productType: ProductType;
}) {
  if (isRamen) {
    return [
      { detail: "Soy broth, roasted mushrooms, spring onion.", name: "Moon Shoyu", price: "$18" },
      { detail: "Slow broth, chili oil, soft egg, black garlic.", name: "Lantern Tonkotsu", price: "$22" },
      { detail: "Sesame tare, tofu, corn, seasonal greens.", name: "Garden Miso", price: "$19" }
    ];
  }
  if (productType === "product") {
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
  productType
}: {
  brandName: string;
  isRamen: boolean;
  productType: ProductType;
}) {
  if (isRamen) {
    return [
      { name: "Ari, night-shift designer", quote: "The black garlic bowl tasted like the city finally exhaled." },
      { name: "Mina, regular", quote: "Booked in two taps and had a window seat under the lanterns." },
      { name: "Theo, ramen hunter", quote: "The menu is small, confident, and exactly what I wanted." }
    ];
  }
  if (productType === "local-service") {
    return [
      { name: "Local customer", quote: `${brandName} made the next step obvious and easy.` },
      { name: "Repeat client", quote: "The packages were clear before I had to ask." },
      { name: "Referral lead", quote: "It felt trustworthy in the first ten seconds." }
    ];
  }
  return [
    { name: "Early user", quote: `${brandName} made the offer instantly easier to understand.` },
    { name: "Founder friend", quote: productType === "portfolio" ? "The case studies finally feel premium." : "The page tells me what to do next." },
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

function paletteFor(lower: string, productType: ProductType) {
  if (lower.includes("ramen")) {
    return { accent: "#f97316", glow: "#facc15", surface: "#1c0f0a" };
  }
  if (lower.includes("cyberpunk") || lower.includes("neon")) {
    return { accent: "#78f0d4", glow: "#e879f9", surface: "#071016" };
  }
  if (lower.includes("cozy")) {
    return { accent: "#fb923c", glow: "#f4e8c1", surface: "#17100b" };
  }
  if (productType === "dashboard") {
    return { accent: "#78f0d4", glow: "#38bdf8", surface: "#071417" };
  }
  if (productType === "portfolio") {
    return { accent: "#c4b5fd", glow: "#f4e8c1", surface: "#111016" };
  }
  if (productType === "waitlist") {
    return { accent: "#f4a9d8", glow: "#78f0d4", surface: "#160b14" };
  }
  if (productType === "local-service") {
    return { accent: "#e8c66a", glow: "#78f0d4", surface: "#10100c" };
  }
  return { accent: "#ef3434", glow: "#e8c66a", surface: "#11100e" };
}
