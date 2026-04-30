#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import OpenAI from "openai";
import sharp from "sharp";

const MODEL = "gpt-image-2";
const BUDGET_CAP_USD = 15;
const MAX_IMAGES_PER_RUN = 18;
const rawDir = path.join(process.cwd(), "public", "brand", "raw");
const org = process.env.OPENAI_ORG_ID || process.env.OPENAI_ORGANIZATION;

await loadLocalEnv();

if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY is required. No images were generated.");
  process.exit(1);
}

const transparentPrefix =
  "Final production transparent PNG asset on flat pure green chroma key background (#00FF00), centered, no extra background texture, no frame, no mockup, no watermark.";

const palette =
  "Palette: void black #050505, dojo charcoal #11100E, blood red #EF3434, lantern gold #E8C66A, scroll cream #F4E8C1, moonlight teal #78F0D4, muted ash #8B8982.";

const assets = [
  {
    filename: "public/brand/logo-mark.png",
    size: "1024x1024",
    quality: "high",
    background: "opaque",
    removeChroma: true,
    prompt: `${transparentPrefix} Premium minimal Ninja Dojo logo mark, moon and dojo gate combined with subtle katana slash and shuriken geometry, dark arcade product demo plus moonlit RPG feel, sharp vector-like edges, premium tech game brand, memorable but not cartoonish, no text, no letters, no logo watermark. ${palette}`
  },
  {
    filename: "public/brand/logo-lockup.png",
    size: "1536x1024",
    quality: "high",
    background: "opaque",
    removeChroma: true,
    prompt: `${transparentPrefix} Premium horizontal brand lockup for Ninja Dojo, left side moon-dojo-gate-katana mark, right side clean readable wordmark text exactly "NINJA DOJO", dark arcade product demo plus moonlit RPG feel, minimal and premium, no subtitle, no extra words, no mockup, no watermark. ${palette}`
  },
  {
    filename: "public/backgrounds/moonlit-command-bg.png",
    size: "1536x1024",
    quality: "high",
    background: "opaque",
    removeChroma: false,
    prompt: `Final production abstract moonlit AI game/product landing page background, dark ink wash, faint dojo roof silhouettes, moon glow, subtle workflow constellation lines, tiny dust and petal particles, premium arcade command center mood, low contrast so UI can sit on top, no characters, no text, no logo, no UI panels, no mockup. ${palette}`
  },
  {
    filename: "public/cursors/moon-shuriken-cursor.png",
    size: "1024x1024",
    quality: "medium",
    background: "opaque",
    removeChroma: true,
    resize: 64,
    prompt: `${transparentPrefix} Small custom cursor asset shaped like a moonlit shuriken pointer, premium minimal, sharp silhouette, slight lantern gold edge and blood red center cut, readable at 24px, no text, no logo. ${palette}`
  },
  {
    filename: "public/cursors/ninja-pointer.png",
    size: "1024x1024",
    quality: "medium",
    background: "opaque",
    removeChroma: true,
    resize: 96,
    prompt: `${transparentPrefix} Small in-game hover pointer marker for selecting a ninja character, moonlit shuriken arrow pointer with lantern gold edge, blood red center slash, subtle teal moon glint, readable at 32px, premium tactical RPG UI marker, no text, no logo. ${palette}`
  },
  {
    filename: "public/icons/scroll-input.png",
    size: "1024x1024",
    quality: "medium",
    background: "opaque",
    removeChroma: true,
    prompt: `${transparentPrefix} Premium section icon, parchment scroll entering a dark dojo gate with a thin red ribbon slash, moonlit RPG product style, simple readable silhouette, no text, no logo. ${palette}`
  },
  {
    filename: "public/icons/six-ninja-agents.png",
    size: "1024x1024",
    quality: "medium",
    background: "opaque",
    removeChroma: true,
    prompt: `${transparentPrefix} Premium section icon showing six small ninja agent crests arranged around a moonlit command node, abstract not character portraits, dark arcade AI workflow style, no text, no logo. ${palette}`
  },
  {
    filename: "public/icons/workflow-timeline.png",
    size: "1024x1024",
    quality: "medium",
    background: "opaque",
    removeChroma: true,
    prompt: `${transparentPrefix} Premium section icon, glowing workflow timeline from scroll to moonrise with small dojo station nodes, dark arcade AI command center style, no text, no logo. ${palette}`
  },
  {
    filename: "public/icons/moonrise-shipped.png",
    size: "1024x1024",
    quality: "medium",
    background: "opaque",
    removeChroma: true,
    prompt: `${transparentPrefix} Premium section icon, full deploy moon rising over a minimal dojo gate with teal moonlight and lantern gold glow, shipped success feeling, no text, no logo. ${palette}`
  },
  {
    filename: "public/icons/decor-elements.png",
    size: "1536x1024",
    quality: "medium",
    background: "opaque",
    removeChroma: true,
    prompt: `${transparentPrefix} Premium decorative asset sheet containing separate isolated elements: full moon, shuriken, parchment scroll, katana slash, tiny cherry petal, lantern spark. Arrange with clear spacing on green background, no text, no logo, no labels. ${palette}`
  },
  ...[
    ["moji", "Moji", "planner crest, parchment scroll, muted gold headband energy"],
    ["miji", "Miji", "builder crest, red scarf, tiny hammer and forge spark"],
    ["maji", "Maji", "attack crest, twin blades, blood red slash energy"],
    ["meji", "Meji", "review crest, white-gray robe, calm scroll seal"],
    ["muji", "Muji", "deploy crest, gate opening, moonlight teal signal"],
    ["meowts", "Meowts", "judge crest, small ninja cat silhouette, moon bell"]
  ].map(([slug, name, detail]) => ({
    filename: `public/cast/${slug}-crest.png`,
    size: "1024x1024",
    quality: "medium",
    background: "opaque",
    removeChroma: true,
    prompt: `${transparentPrefix} Premium cast card crest for ${name}, ${detail}, moonlit ninja dojo emblem, minimal dark arcade product style, readable small, not cartoonish, no text, no letters, no logo watermark. ${palette}`
  }))
];

const requested = process.argv.slice(2);
const selected =
  requested.length > 0
    ? assets.filter((asset) => requested.includes(path.basename(asset.filename)) || requested.includes(asset.filename))
    : assets;

const unknown = requested.filter(
  (name) => !assets.some((asset) => name === asset.filename || name === path.basename(asset.filename))
);

if (unknown.length > 0) {
  console.error(`Unknown asset(s): ${unknown.join(", ")}`);
  process.exit(1);
}

if (selected.length > MAX_IMAGES_PER_RUN) {
  console.error(`Refusing to run ${selected.length} images; max is ${MAX_IMAGES_PER_RUN}.`);
  process.exit(1);
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  ...(org ? { organization: org } : {})
});

let hasCost = false;
let totalCost = 0;
const results = [];

await mkdir(rawDir, { recursive: true });

for (const asset of selected) {
  if (hasCost && totalCost > BUDGET_CAP_USD) {
    console.error("BUDGET CAP HIT");
    process.exit(1);
  }

  const result = await generateAsset(asset);
  results.push(result);
  if (result.costUsd !== null) {
    hasCost = true;
    totalCost += result.costUsd;
  }

  if (hasCost && totalCost > BUDGET_CAP_USD) {
    console.error("BUDGET CAP HIT");
    process.exit(1);
  }
}

console.log("\nNinja Dojo brand asset generation summary");
console.table(
  results.map((result) => ({
    file: result.file,
    status: result.ok ? "success" : "failure",
    model: result.model,
    bytes: result.bytes,
    cost: result.costUsd === null ? "usage unavailable" : `$${result.costUsd.toFixed(4)} USD`
  }))
);
console.log(`total cost estimate: ${hasCost ? `$${totalCost.toFixed(4)} USD` : "usage unavailable"}`);

async function generateAsset(asset) {
  try {
    const response = await client.images.generate({
      model: MODEL,
      prompt: asset.prompt,
      size: asset.size,
      quality: asset.quality,
      background: asset.background,
      output_format: "png"
    });

    const b64 = response.data?.[0]?.b64_json;
    if (!b64) throw new Error("Image response did not include b64_json.");

    const rawBuffer = Buffer.from(b64, "base64");
    const rawPath = path.join(rawDir, asset.filename.replaceAll("/", "__"));
    await mkdir(path.dirname(asset.filename), { recursive: true });
    await writeFile(rawPath, rawBuffer);

    let finalBuffer = asset.removeChroma
      ? await removeGreenChroma(rawBuffer)
      : rawBuffer;

    if (asset.resize) {
      finalBuffer = await sharp(finalBuffer)
        .resize(asset.resize, asset.resize, { fit: "contain" })
        .png()
        .toBuffer();
    }

    await writeFile(asset.filename, finalBuffer);
    const costUsd = extractCostUsd(response);
    console.log(
      `${asset.filename} | ${finalBuffer.byteLength} bytes | ${MODEL} | ${costUsd === null ? "usage unavailable" : `$${costUsd.toFixed(4)} USD`}`
    );

    return {
      bytes: finalBuffer.byteLength,
      costUsd,
      file: asset.filename,
      model: MODEL,
      ok: true
    };
  } catch (error) {
    const status = error?.status ?? error?.statusCode ?? "unknown";
    const code = error?.code ?? error?.type ?? "unknown";
    const message = error?.message ?? String(error);
    console.error(`${asset.filename} failed with ${MODEL}: [${status}/${code}] ${message}`);
    return {
      bytes: 0,
      costUsd: null,
      file: asset.filename,
      model: MODEL,
      ok: false
    };
  }
}

async function removeGreenChroma(inputBuffer) {
  const image = sharp(inputBuffer).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

  for (let index = 0; index < data.length; index += 4) {
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    const isGreenScreen =
      green > 120 &&
      green - red > 45 &&
      green - blue > 45 &&
      red < 145 &&
      blue < 145;

    if (isGreenScreen) {
      data[index + 3] = 0;
      continue;
    }

    const isGreenSpill = green > red && green > blue && green - Math.max(red, blue) > 16;
    if (isGreenSpill) {
      data[index + 1] = Math.max(red, blue);
    }
  }

  return sharp(data, {
    raw: {
      channels: 4,
      height: info.height,
      width: info.width
    }
  })
    .png()
    .toBuffer();
}

function extractCostUsd(response) {
  const usage = response?.usage;
  if (!usage) return null;
  const value =
    usage.total_cost_usd ??
    usage.cost_usd ??
    usage.estimated_cost_usd ??
    usage.total_cost;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

async function loadLocalEnv() {
  if (process.env.OPENAI_API_KEY) return;
  for (const filename of [".env.local", ".env"]) {
    try {
      const contents = await readFile(path.join(process.cwd(), filename), "utf8");
      for (const line of contents.split(/\r?\n/)) {
        const match = line.match(/^\s*OPENAI_API_KEY\s*=\s*(.+?)\s*$/);
        if (match?.[1]) {
          process.env.OPENAI_API_KEY = match[1].replace(/^["']|["']$/g, "");
          return;
        }
      }
    } catch {}
  }
}
