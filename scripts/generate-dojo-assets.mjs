#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import OpenAI from "openai";
import sharp from "sharp";

const MODEL = "gpt-image-2";
const MAX_IMAGES_PER_RUN = 11;
const BUDGET_CAP_USD = 15;
const outputDir = path.join(process.cwd(), "public", "assets", "dojo");
const rawOutputDir = path.join(outputDir, "raw");
const organization = process.env.OPENAI_ORG_ID || process.env.OPENAI_ORGANIZATION;

const spritePrefix =
  "Final-production 2D tactical RPG character sprite on a flat pure green chroma key background (#00FF00), one full-body character only, centered, no text, no logo, no label, no frame, no scenery, no background texture. Top-down/isometric hybrid 3/4 view, facing slightly toward camera, chibi proportions with large head and compact body, crisp silhouette, subtle dark outline, dramatic warm rim light, small shadow under feet, readable at 72-96px, painterly pixel-art inspired cel shading, original character, game-ready sprite asset, not sticker, not portrait, not illustration, avoid green clothing or green glow.";

const walkingSpritePrefix =
  "Final-production 2D tactical RPG walking spritesheet on flat pure green chroma key background (#00FF00), one original chibi ninja character repeated in 4 animation frames in a single horizontal row, consistent scale and outfit across all frames, top-down/isometric hybrid 3/4 view, readable at 72-96px, crisp silhouette, subtle outline, painterly pixel-art inspired cel shading, no text, no logo, no label, no UI frame. Frames left to right: idle standing, left foot forward walking, idle standing, right foot forward walking. Avoid green clothing or green glow.";

const assets = [
  {
    filename: "dojo-background.png",
    size: "1536x1024",
    quality: "high",
    background: "opaque",
    removeChroma: false,
    prompt:
      "Wide 16:9 final-production 2D action-RPG game environment, dark Japanese ninja dojo interior at night, top-down/isometric hybrid camera, handcrafted wooden floor with rich planks and subtle tatami structure, shoji walls with layered paper texture, warm orange lantern light, dramatic shadows, moonlight spilling through a circular moon window on the right wall, cherry blossom branches visible outside, weapon racks, low tables, scrolls, cushions, training props, atmospheric depth, cinematic composition, empty central play area for characters, black ivory muted gold warm orange and blood red palette, painterly pixel-art inspired detail, crisp game-map readability, no characters, no text, no logo, no UI overlay, not a diagram, not a website hero image."
  },
  {
    filename: "moji.png",
    size: "1024x1024",
    quality: "medium",
    background: "opaque",
    removeChroma: true,
    prompt: `${spritePrefix} Dark ninja outfit, muted gold headband, small gold sash, holding a parchment scroll, calm strategist pose, wise planner energy.`
  },
  {
    filename: "miji.png",
    size: "1024x1024",
    quality: "medium",
    background: "opaque",
    removeChroma: true,
    prompt: `${spritePrefix} Dark ninja outfit, blood-red scarf trailing slightly, holding a small builder hammer or wrench, ready-to-build stance, focused builder energy.`
  },
  {
    filename: "maji.png",
    size: "1024x1024",
    quality: "medium",
    background: "opaque",
    removeChroma: true,
    prompt: `${spritePrefix} Dark ninja outfit, blood-red flame accent, twin short blades, aggressive attack stance, one blade raised, dynamic adversary energy, strong action silhouette.`
  },
  {
    filename: "meji.png",
    size: "1024x1024",
    quality: "medium",
    background: "opaque",
    removeChroma: true,
    prompt: `${spritePrefix} White-gray robe layered over dark ninja outfit, holding a small scroll or short staff, calm architect pose, still and wise, elegant mentor silhouette.`
  },
  {
    filename: "muji.png",
    size: "1024x1024",
    quality: "medium",
    background: "opaque",
    removeChroma: true,
    prompt: `${spritePrefix} Dark ninja outfit with deep blue accent scarf, holding checklist tablet and tiny deploy tool, precise deployer stance, focused and reliable.`
  },
  {
    filename: "meowts.png",
    size: "1024x1024",
    quality: "medium",
    background: "opaque",
    removeChroma: true,
    prompt: `${spritePrefix} Small chibi ninja cat, dark hood, pink and muted gold accents, tiny judge bell or scroll, mischievous wise expression, catlike judge pose, readable silhouette.`
  },
  {
    filename: "scroll.png",
    size: "1024x1024",
    quality: "medium",
    background: "opaque",
    removeChroma: true,
    prompt:
      "Final-production 2D RPG item asset on flat pure green chroma key background (#00FF00), one parchment scroll only, centered, no text, no logo, no label, no frame, warm ivory paper, red ribbon seal, slight top-down 3/4 angle, crisp silhouette, subtle dark outline, painterly pixel-art inspired cel shading, game-ready item asset."
  },
  {
    filename: "moon.png",
    size: "1024x1024",
    quality: "medium",
    background: "opaque",
    removeChroma: true,
    prompt:
      "Final-production 2D RPG UI asset on flat pure green chroma key background (#00FF00), one glowing full moon only, centered, no text, no logo, no label, no frame, warm ivory-gold glow, subtle crater texture, soft bloom, dramatic moonlight, crisp circular silhouette, game-ready UI asset."
  },
  {
    filename: "slash.png",
    size: "1024x1024",
    quality: "medium",
    background: "opaque",
    removeChroma: true,
    prompt:
      "Final-production 2D RPG combat VFX asset on flat pure green chroma key background (#00FF00), one diagonal blood-red katana slash only, centered, no text, no logo, no label, no frame, bright core, soft red glow, dynamic motion trail, crisp arc silhouette, game-ready VFX asset."
  },
  {
    filename: "petal.png",
    size: "1024x1024",
    quality: "medium",
    background: "opaque",
    removeChroma: true,
    prompt:
      "Final-production 2D RPG particle asset on flat pure green chroma key background (#00FF00), one cherry blossom petal only, centered, no text, no logo, no label, no frame, soft pink petal, slight rotation, delicate highlight, crisp silhouette, game-ready particle asset."
  },
  {
    filename: "moji-walk.png",
    size: "1536x1024",
    quality: "medium",
    background: "opaque",
    removeChroma: true,
    prompt: `${walkingSpritePrefix} Character: dark ninja outfit, muted gold headband, small gold sash, holding parchment scroll.`
  },
  {
    filename: "miji-walk.png",
    size: "1536x1024",
    quality: "medium",
    background: "opaque",
    removeChroma: true,
    prompt: `${walkingSpritePrefix} Character: dark ninja outfit, blood-red scarf, holding small builder hammer or wrench.`
  },
  {
    filename: "maji-walk.png",
    size: "1536x1024",
    quality: "medium",
    background: "opaque",
    removeChroma: true,
    prompt: `${walkingSpritePrefix} Character: dark ninja outfit, blood-red flame accent, twin short blades.`
  },
  {
    filename: "meji-walk.png",
    size: "1536x1024",
    quality: "medium",
    background: "opaque",
    removeChroma: true,
    prompt: `${walkingSpritePrefix} Character: white-gray robe over dark ninja outfit, holding short staff or scroll.`
  },
  {
    filename: "muji-walk.png",
    size: "1536x1024",
    quality: "medium",
    background: "opaque",
    removeChroma: true,
    prompt: `${walkingSpritePrefix} Character: dark ninja outfit with deep blue accent scarf, holding checklist tablet.`
  },
  {
    filename: "meowts-walk.png",
    size: "1536x1024",
    quality: "medium",
    background: "opaque",
    removeChroma: true,
    prompt: `${walkingSpritePrefix} Character: small chibi ninja cat, dark hood, pink and muted gold accents, judge bell or scroll.`
  }
];

const requestedFilenames = process.argv.slice(2);
const unknownFilenames = requestedFilenames.filter(
  (filename) => !assets.some((asset) => asset.filename === filename)
);

if (unknownFilenames.length > 0) {
  console.error(`Unknown asset filename(s): ${unknownFilenames.join(", ")}`);
  process.exit(1);
}

const selectedAssets =
  requestedFilenames.length > 0
    ? assets.filter((asset) => requestedFilenames.includes(asset.filename))
    : assets;

let cumulativeCostUsd = 0;
let hasCostEstimate = false;
const results = [];

if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY is required. No images were generated.");
  process.exit(1);
}

if (selectedAssets.length > MAX_IMAGES_PER_RUN) {
  console.error(
    `Refusing to run: ${selectedAssets.length} images exceeds max ${MAX_IMAGES_PER_RUN}.`
  );
  process.exit(1);
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  ...(organization ? { organization } : {})
});
await mkdir(outputDir, { recursive: true });
await mkdir(rawOutputDir, { recursive: true });

for (const asset of selectedAssets) {
  if (hasCostEstimate && cumulativeCostUsd > BUDGET_CAP_USD) {
    console.error("BUDGET CAP HIT");
    process.exit(1);
  }

  const result = await tryGenerateAsset(asset);
  results.push(result);

  if (result.costUsd !== null) {
    hasCostEstimate = true;
    cumulativeCostUsd += result.costUsd;
  }

  if (hasCostEstimate && cumulativeCostUsd > BUDGET_CAP_USD) {
    console.error("BUDGET CAP HIT");
    process.exit(1);
  }
}

printSummary();

async function tryGenerateAsset(asset) {
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
    if (!b64) {
      throw new Error("Image response did not include b64_json.");
    }

    const rawBuffer = Buffer.from(b64, "base64");
    const rawPath = path.join(rawOutputDir, asset.filename);
    const finalPath = path.join(outputDir, asset.filename);
    await writeFile(rawPath, rawBuffer);

    const finalBuffer = asset.removeChroma
      ? await removeGreenChroma(rawBuffer)
      : rawBuffer;
    await writeFile(finalPath, finalBuffer);

    const costUsd = extractCostUsd(response);
    const costLabel = costUsd === null ? "usage unavailable" : money(costUsd);
    console.log(
      `${asset.filename} | raw ${rawBuffer.byteLength} bytes | final ${finalBuffer.byteLength} bytes | ${MODEL} | ${costLabel}`
    );

    return {
      ok: true,
      filename: asset.filename,
      model: MODEL,
      rawBytes: rawBuffer.byteLength,
      bytes: finalBuffer.byteLength,
      costUsd,
      error: null
    };
  } catch (error) {
    logFailure(asset.filename, MODEL, error);
    return {
      ok: false,
      filename: asset.filename,
      model: MODEL,
      rawBytes: 0,
      bytes: 0,
      costUsd: null,
      error
    };
  }
}

async function removeGreenChroma(inputBuffer) {
  const image = sharp(inputBuffer).ensureAlpha();
  const metadata = await image.metadata();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

  for (let index = 0; index < data.length; index += 4) {
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    const isGreenScreen =
      green > 120 &&
      green - red > 45 &&
      green - blue > 45 &&
      red < 135 &&
      blue < 135;

    if (isGreenScreen) {
      data[index + 3] = 0;
      continue;
    }

    const isGreenSpill =
      green > red &&
      green > blue &&
      green - Math.max(red, blue) > 16;

    if (isGreenSpill) {
      data[index + 1] = Math.max(red, blue);
    }
  }

  return sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  })
    .png()
    .withMetadata({
      density: metadata.density
    })
    .toBuffer();
}

function extractCostUsd(response) {
  const usage = response?.usage;
  if (!usage) {
    return null;
  }

  const directCost =
    usage.total_cost_usd ??
    usage.cost_usd ??
    usage.estimated_cost_usd ??
    usage.total_cost;

  const numericCost = Number(directCost);
  return Number.isFinite(numericCost) ? numericCost : null;
}

function logFailure(filename, model, error) {
  const status = error?.status ?? error?.statusCode ?? "unknown";
  const code = error?.code ?? error?.type ?? "unknown";
  const message = error?.message ?? String(error);
  console.error(`${filename} failed with ${model}: [${status}/${code}] ${message}`);
}

function printSummary() {
  const successes = results.filter((result) => result.ok);
  const failures = results.filter((result) => !result.ok);
  const totalCostLabel = hasCostEstimate ? money(cumulativeCostUsd) : "usage unavailable";

  console.log("\nNinja Dojo asset generation summary");
  console.table(
    results.map((result) => ({
      file: result.filename,
      status: result.ok ? "success" : "failure",
      model: result.model,
      rawBytes: result.rawBytes,
      finalBytes: result.bytes,
      cost: result.costUsd === null ? "usage unavailable" : money(result.costUsd)
    }))
  );
  console.log(`successes: ${successes.length}`);
  console.log(`failures: ${failures.length}`);
  console.log(`total cost estimate: ${totalCostLabel}`);
}

function money(value) {
  return `$${value.toFixed(4)} USD`;
}
