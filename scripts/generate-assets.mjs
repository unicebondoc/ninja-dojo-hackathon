#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const outputDir = path.join(process.cwd(), "public", "assets", "dojo");
const model = process.env.GPT_IMAGE_MODEL ?? "gpt-image-2";
const apiKey = process.env.OPENAI_API_KEY;

const prompts = [
  {
    name: "dojo-background.png",
    size: "1792x1024",
    background: "opaque",
    prompt:
      "Top-down 2D game background of a dark ninja dojo interior at night, tatami grid floor, shoji walls, warm lanterns, moonlight window, subtle red accents, cinematic pixel-art inspired but high resolution, empty center floor for characters, no text, no logos, 16:9."
  },
  {
    name: "spritesheet.png",
    size: "1536x256",
    background: "transparent",
    prompt:
      "Single transparent PNG spritesheet with six small chibi game sprites in one row: Moji with gold headband and small scroll, Miji with red scarf and builder tool, Renegade with red flame accent and twin blades, Sensei in white and gray robe calm pose, Tester with blue accent and checklist tool, Meowts small cat ninja with gold and pink accent. Consistent scale, same lighting, same camera angle, front-facing/top-down-isometric hybrid, dark ninja dojo style, no text, no logo, transparent background."
  },
  {
    name: "scroll.png",
    size: "512x512",
    background: "transparent",
    prompt:
      "Parchment scroll game item, transparent background, warm ivory paper, red ribbon, 2D game asset, no text."
  },
  {
    name: "moon.png",
    size: "512x512",
    background: "transparent",
    prompt:
      "Glowing full moon game UI asset, transparent background, warm ivory glow, soft bloom, no text."
  },
  {
    name: "katana-slash.png",
    size: "1024x512",
    background: "transparent",
    prompt:
      "Red katana slash VFX, transparent background, diagonal energy stroke, 2D game effect, no text."
  }
];

if (!apiKey) {
  console.log("OPENAI_API_KEY is not set. Skipping GPT Image 2 generation.");
  console.log(`Prompts are documented in ${path.join(outputDir, "README.md")}`);
  process.exit(0);
}

await mkdir(outputDir, { recursive: true });

for (const item of prompts) {
  console.log(`Generating ${item.name} with ${model}...`);
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      prompt: item.prompt,
      n: 1,
      size: item.size,
      background: item.background
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Image generation failed for ${item.name}: ${text}`);
  }

  const json = await response.json();
  const b64 = json.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error(`Image generation response for ${item.name} did not include b64_json.`);
  }

  await writeFile(path.join(outputDir, item.name), Buffer.from(b64, "base64"));
}

console.log(`Generated assets in ${outputDir}`);
