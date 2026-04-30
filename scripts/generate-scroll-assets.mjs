#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import OpenAI from "openai";
import sharp from "sharp";

const MODEL = "gpt-image-2";
const outputDir = path.join(process.cwd(), "public", "scroll");
const rawDir = path.join(outputDir, "raw");
const organization = process.env.OPENAI_ORG_ID || process.env.OPENAI_ORGANIZATION;

await loadLocalEnv();

const assets = [
  {
    filename: "parchment-panel.png",
    size: "1536x1024",
    quality: "high",
    background: "opaque",
    removeChroma: false,
    prompt:
      "Final-production premium parchment scroll UI panel background for a fantasy ninja app input, horizontal wide scroll parchment, warm ivory paper, subtle paper grain, darker toasted edges, faint moonlit teal magic dust, small red ribbon corners, empty center area for readable typed text, no text, no letters, no logos, no UI labels, no characters, dark ninja dojo product aesthetic, black ivory muted gold blood red moonlight teal palette."
  },
  {
    filename: "wax-moon-seal.png",
    size: "1024x1024",
    quality: "medium",
    background: "opaque",
    removeChroma: true,
    prompt:
      "Final-production transparent-ready 2D UI seal on flat pure green chroma key background (#00FF00), blood red wax seal stamped with a crescent moon and tiny shuriken mark, premium fantasy ninja app style, centered single object, crisp silhouette, subtle warm highlights, no text, no letters, no logo, no frame."
  },
  {
    filename: "scroll-send-icon.png",
    size: "1024x1024",
    quality: "medium",
    background: "opaque",
    removeChroma: true,
    prompt:
      "Final-production transparent-ready 2D game UI icon on flat pure green chroma key background (#00FF00), small parchment scroll flying forward with a red ribbon trail and moonlight teal sparkle, send action icon, premium fantasy ninja product UI, centered single object, no text, no letters, no logo, no frame."
  },
  {
    filename: "scroll-sent-compact.png",
    size: "1024x1024",
    quality: "medium",
    background: "opaque",
    removeChroma: true,
    prompt:
      "Final-production transparent-ready compact sealed scroll state on flat pure green chroma key background (#00FF00), rolled parchment scroll tied with blood red ribbon and moon-shuriken wax seal, premium moonlit ninja UI item, centered single object, readable small, no text, no letters, no logo, no frame."
  },
  {
    filename: "paper-grain.png",
    size: "1024x1024",
    quality: "medium",
    background: "opaque",
    removeChroma: false,
    prompt:
      "Seamless subtle warm ivory parchment paper grain texture, premium UI background texture, soft fibers, faint speckles, very low contrast, no text, no symbols, no logos, no objects."
  }
];

if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY is required. No scroll assets were generated.");
  process.exit(1);
}

const requested = process.argv.slice(2);
const unknown = requested.filter(
  (filename) => !assets.some((asset) => asset.filename === filename)
);

if (unknown.length > 0) {
  console.error(`Unknown scroll asset filename(s): ${unknown.join(", ")}`);
  process.exit(1);
}

const selected =
  requested.length > 0
    ? assets.filter((asset) => requested.includes(asset.filename))
    : assets;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  ...(organization ? { organization } : {})
});

await mkdir(outputDir, { recursive: true });
await mkdir(rawDir, { recursive: true });

for (const asset of selected) {
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
    throw new Error(`${asset.filename} did not include b64_json.`);
  }

  const rawBuffer = Buffer.from(b64, "base64");
  const finalBuffer = asset.removeChroma
    ? await removeGreenChroma(rawBuffer)
    : rawBuffer;

  await writeFile(path.join(rawDir, asset.filename), rawBuffer);
  await writeFile(path.join(outputDir, asset.filename), finalBuffer);
  console.log(
    `${asset.filename} | raw ${rawBuffer.byteLength} bytes | final ${finalBuffer.byteLength} bytes | ${MODEL}`
  );
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
