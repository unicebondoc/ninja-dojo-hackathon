#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import OpenAI from "openai";
import sharp from "sharp";

const MODEL = "gpt-image-2";
const outputRoots = {
  backgrounds: path.join(process.cwd(), "public", "backgrounds"),
  brand: path.join(process.cwd(), "public", "brand"),
  icons: path.join(process.cwd(), "public", "icons")
};
const rawRoot = path.join(process.cwd(), "public", "brand", "raw");
const organization = process.env.OPENAI_ORG_ID || process.env.OPENAI_ORGANIZATION;

await loadLocalEnv();

const assets = [
  {
    filename: "ninja-cat-mark.png",
    outputDir: outputRoots.brand,
    rawDir: rawRoot,
    size: "1024x1024",
    quality: "medium",
    background: "opaque",
    removeChroma: true,
    prompt:
      "Final-production premium app logo mark on flat pure green chroma key background (#00FF00), centered white ninja cat mascot inspired by a moonlit fantasy tactical RPG, soft white fur, teal eyes, small pink hair tuft, black ninja hood, muted gold bell, tiny red scarf, crescent moon and subtle shuriken silhouette behind the cat, compact readable brand icon, polished game product identity, dark cozy fantasy ninja mood, black ivory muted gold blood red moonlight teal palette, no text, no letters, no logo frame, no existing game or anime IP."
  },
  {
    filename: "ninja-dojo-wordmark.png",
    outputDir: outputRoots.brand,
    rawDir: rawRoot,
    size: "1536x1024",
    quality: "medium",
    background: "opaque",
    removeChroma: true,
    trim: true,
    prompt:
      "Final-production fantasy game wordmark on flat pure green chroma key background (#00FF00), exact readable text: NINJA DOJO, only those two words, no mascot, no extra letters, no subtitle, no small text, no logo frame. Premium moonlit ninja RPG title lettering, ivory fill, muted gold bevel, thin dark outline, tiny blood red katana underline flourish, compact horizontal composition, transparent-ready asset, no existing game or anime IP."
  },
  {
    filename: "fantasy-dojo-landing-bg.png",
    outputDir: outputRoots.backgrounds,
    rawDir: path.join(outputRoots.backgrounds, "raw"),
    size: "1536x1024",
    quality: "high",
    background: "opaque",
    removeChroma: false,
    prompt:
      "Wide 16:9 premium fantasy ninja product landing page background, moonlit cozy Japanese dojo courtyard at night, soft cherry blossoms, lantern glow, teal moonlight mist, faint shuriken constellations, parchment scroll shapes in the distance, whimsical tactical RPG atmosphere, warm and magical rather than deadly serious, black charcoal ivory muted gold blood red moonlight teal palette, lots of dark negative space for UI, no text, no logos, no characters, no UI panels, no existing game or anime IP."
  },
  {
    filename: "fantasy-brand-accents.png",
    outputDir: outputRoots.icons,
    rawDir: path.join(outputRoots.icons, "raw"),
    size: "1024x1024",
    quality: "medium",
    background: "opaque",
    removeChroma: true,
    prompt:
      "Final-production 2D game UI decorative asset sheet on flat pure green chroma key background (#00FF00), separate small elements with clear space between them: crescent moon, tiny shuriken, parchment scroll, red katana slash, lantern spark, cherry blossom petal, moonlit paw print. Premium cozy fantasy ninja RPG style, black ivory muted gold blood red moonlight teal palette, no text, no logos, no labels, no existing game or anime IP."
  }
];

const requestedFilenames = process.argv.slice(2);
const unknownFilenames = requestedFilenames.filter(
  (filename) => !assets.some((asset) => asset.filename === filename)
);

if (unknownFilenames.length > 0) {
  console.error(`Unknown brand asset filename(s): ${unknownFilenames.join(", ")}`);
  process.exit(1);
}

const selectedAssets =
  requestedFilenames.length > 0
    ? assets.filter((asset) => requestedFilenames.includes(asset.filename))
    : assets;

if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY is required. No brand assets were generated.");
  process.exit(1);
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  ...(organization ? { organization } : {})
});

for (const asset of selectedAssets) {
  await mkdir(asset.outputDir, { recursive: true });
  await mkdir(asset.rawDir, { recursive: true });
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
  const rawPath = path.join(asset.rawDir, asset.filename);
  const finalPath = path.join(asset.outputDir, asset.filename);
  await writeFile(rawPath, rawBuffer);

  let finalBuffer = asset.removeChroma
    ? await removeGreenChroma(rawBuffer)
    : rawBuffer;
  if (asset.trim) {
    finalBuffer = await sharp(finalBuffer)
      .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
  }

  await writeFile(finalPath, finalBuffer);
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
