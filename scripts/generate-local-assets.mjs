#!/usr/bin/env node
import { mkdir } from "node:fs/promises";
import path from "node:path";

const outputDir = path.join(process.cwd(), "public", "assets", "dojo");

const palette = {
  ink: "#050506",
  floor: "#241407",
  wood: "#3a1d12",
  red: "#dc2626",
  gold: "#f6e7b1",
  mutedGold: "#c9a84e",
  ivory: "#fff2c2",
  blue: "#93c5fd",
  pink: "#f9a8d4"
};

async function main() {
  const sharp = await import("sharp").catch(() => null);
  await mkdir(outputDir, { recursive: true });

  const assets = [
    {
      name: "dojo-background.png",
      svg: dojoBackgroundSvg(),
      width: 1792,
      height: 1024
    },
    {
      name: "spritesheet.png",
      svg: spritesheetSvg(),
      width: 1536,
      height: 256
    },
    {
      name: "scroll.png",
      svg: scrollSvg(),
      width: 512,
      height: 512
    },
    {
      name: "moon.png",
      svg: moonSvg(),
      width: 512,
      height: 512
    },
    {
      name: "katana-slash.png",
      svg: slashSvg(),
      width: 1024,
      height: 512
    }
  ];

  if (!sharp) {
    throw new Error("sharp is unavailable. Install sharp or use the CSS fallback assets.");
  }

  for (const asset of assets) {
    await sharp
      .default(Buffer.from(asset.svg))
      .resize(asset.width, asset.height)
      .png()
      .toFile(path.join(outputDir, asset.name));
    console.log(`Generated ${asset.name}`);
  }
}

function dojoBackgroundSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1792 1024">
  <defs>
    <radialGradient id="moonGlow" cx="78%" cy="18%" r="35%">
      <stop offset="0%" stop-color="${palette.ivory}" stop-opacity="0.5"/>
      <stop offset="38%" stop-color="${palette.gold}" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="${palette.ink}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="floor" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stop-color="#120b07"/>
      <stop offset="52%" stop-color="${palette.floor}"/>
      <stop offset="100%" stop-color="#0a0705"/>
    </linearGradient>
  </defs>
  <rect width="1792" height="1024" fill="${palette.ink}"/>
  <rect width="1792" height="1024" fill="url(#moonGlow)"/>
  <rect x="106" y="110" width="1580" height="252" rx="12" fill="#16100c" stroke="#5d3219" stroke-width="10"/>
  ${Array.from({ length: 13 }, (_, index) => {
    const x = 150 + index * 120;
    return `<path d="M${x} 116v238" stroke="${palette.gold}" stroke-opacity="0.2" stroke-width="5"/>`;
  }).join("")}
  <path d="M112 205h1568M112 285h1568" stroke="${palette.gold}" stroke-opacity="0.16" stroke-width="4"/>
  <rect x="0" y="350" width="1792" height="674" fill="url(#floor)"/>
  ${Array.from({ length: 18 }, (_, index) => {
    const x = index * 112;
    return `<path d="M${x} 350l${-170 + index * 16} 674" stroke="${palette.gold}" stroke-opacity="0.1" stroke-width="3"/>`;
  }).join("")}
  ${Array.from({ length: 9 }, (_, index) => {
    const y = 440 + index * 68;
    return `<path d="M0 ${y}h1792" stroke="${palette.gold}" stroke-opacity="0.08" stroke-width="3"/>`;
  }).join("")}
  <ellipse cx="896" cy="688" rx="520" ry="210" fill="none" stroke="${palette.gold}" stroke-opacity="0.24" stroke-width="9" stroke-dasharray="26 22"/>
  <circle cx="1390" cy="164" r="94" fill="${palette.gold}" opacity="0.72"/>
  <rect x="216" y="178" width="56" height="102" rx="28" fill="${palette.red}" opacity="0.7" stroke="${palette.gold}" stroke-opacity="0.35" stroke-width="7"/>
  <rect x="1520" y="178" width="56" height="102" rx="28" fill="${palette.red}" opacity="0.7" stroke="${palette.gold}" stroke-opacity="0.35" stroke-width="7"/>
  <path d="M0 0h1792v1024H0z" fill="none" stroke="#000" stroke-opacity="0.55" stroke-width="48"/>
</svg>`;
}

function spritesheetSvg() {
  const sprites = [
    spriteSvg(128, "Moji", palette.gold, "scroll"),
    spriteSvg(384, "Miji", palette.red, "hammer"),
    spriteSvg(640, "Renegade", "#fb923c", "blades"),
    spriteSvg(896, "Sensei", "#cbd5e1", "robe"),
    spriteSvg(1152, "Tester", palette.blue, "check"),
    catSpriteSvg(1408)
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1536 256">
  <rect width="1536" height="256" fill="none"/>
  ${sprites.join("")}
</svg>`;
}

function spriteSvg(cx, _name, accent, prop) {
  const robe = prop === "robe" ? "#d4d4d8" : "#14141a";
  return `<g transform="translate(${cx - 72} 22)">
    <ellipse cx="72" cy="194" rx="54" ry="15" fill="#000" opacity="0.35"/>
    <path d="M38 72c2-35 22-56 34-56s32 21 34 56l-10 30H48z" fill="#060609"/>
    <ellipse cx="72" cy="76" rx="35" ry="38" fill="#f2bf9e" stroke="#09090b" stroke-width="8"/>
    <path d="M39 61c18-24 48-31 69 3-14-8-30-9-47-4-8 2-15 3-22 1z" fill="#060609"/>
    <rect x="37" y="83" width="70" height="19" rx="9" fill="${accent}"/>
    <circle cx="58" cy="79" r="6" fill="#101014"/>
    <circle cx="86" cy="79" r="6" fill="#101014"/>
    <path d="M44 112h56l22 74H22z" fill="${robe}" stroke="#09090b" stroke-width="8"/>
    <path d="M69 113h8v73h-8z" fill="${accent}"/>
    <path d="M28 128l-26 25M116 128l26 25" stroke="#09090b" stroke-width="14" stroke-linecap="round"/>
    ${propSvg(prop, accent)}
  </g>`;
}

function propSvg(prop, accent) {
  if (prop === "scroll") {
    return `<rect x="104" y="116" width="38" height="28" rx="4" fill="${palette.ivory}" stroke="#5d2d12" stroke-width="5"/><path d="M113 130h20" stroke="${accent}" stroke-width="5"/>`;
  }
  if (prop === "hammer") {
    return `<path d="M100 125l44 44" stroke="#9ca3af" stroke-width="9" stroke-linecap="round"/><rect x="128" y="158" width="34" height="18" rx="4" fill="${accent}" transform="rotate(45 145 167)"/>`;
  }
  if (prop === "blades") {
    return `<path d="M106 119l58-34M38 119l-58-34" stroke="#f8fafc" stroke-width="7" stroke-linecap="round"/><path d="M108 119l30-18M36 119l-30-18" stroke="${accent}" stroke-width="10" stroke-linecap="round" opacity="0.8"/>`;
  }
  if (prop === "check") {
    return `<rect x="106" y="112" width="36" height="48" rx="5" fill="#f8fafc" stroke="${accent}" stroke-width="5"/><path d="M114 133l8 8 14-19" fill="none" stroke="${accent}" stroke-width="6" stroke-linecap="round"/>`;
  }
  return `<path d="M105 128l50 0" stroke="#f8fafc" stroke-width="7" stroke-linecap="round"/><path d="M105 128l34 0" stroke="${accent}" stroke-width="10" stroke-linecap="round" opacity="0.8"/>`;
}

function catSpriteSvg(cx) {
  return `<g transform="translate(${cx - 72} 30)">
    <ellipse cx="72" cy="186" rx="50" ry="14" fill="#000" opacity="0.35"/>
    <path d="M41 61l-22-25 34 8M103 61l22-25-34 8" fill="${palette.pink}" stroke="#09090b" stroke-width="7"/>
    <ellipse cx="72" cy="82" rx="43" ry="40" fill="${palette.pink}" stroke="#09090b" stroke-width="8"/>
    <rect x="32" y="88" width="80" height="16" rx="8" fill="${palette.gold}"/>
    <circle cx="56" cy="80" r="6" fill="#101014"/>
    <circle cx="88" cy="80" r="6" fill="#101014"/>
    <path d="M66 94l6 6 6-6" fill="none" stroke="#101014" stroke-width="4" stroke-linecap="round"/>
    <path d="M39 118h66l17 58H22z" fill="#111116" stroke="#09090b" stroke-width="8"/>
    <path d="M68 119h8v57h-8z" fill="${palette.gold}"/>
    <path d="M106 135c35-5 50 10 36 30" fill="none" stroke="${palette.pink}" stroke-width="12" stroke-linecap="round"/>
  </g>`;
}

function scrollSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="none"/>
  <rect x="82" y="160" width="348" height="194" rx="26" fill="${palette.ivory}" stroke="#5d2d12" stroke-width="22"/>
  <circle cx="96" cy="257" r="36" fill="${palette.mutedGold}" stroke="#5d2d12" stroke-width="16"/>
  <circle cx="416" cy="257" r="36" fill="${palette.mutedGold}" stroke="#5d2d12" stroke-width="16"/>
  <path d="M156 246h200" stroke="${palette.red}" stroke-width="18" stroke-linecap="round"/>
  <path d="M156 294h144" stroke="${palette.red}" stroke-opacity="0.55" stroke-width="14" stroke-linecap="round"/>
</svg>`;
}

function moonSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="moon" cx="38%" cy="34%" r="62%">
      <stop offset="0%" stop-color="#fff"/>
      <stop offset="50%" stop-color="${palette.gold}"/>
      <stop offset="100%" stop-color="#b48a35"/>
    </radialGradient>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="32" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="512" height="512" fill="none"/>
  <circle cx="256" cy="256" r="160" fill="url(#moon)" filter="url(#glow)" opacity="0.96"/>
  <circle cx="205" cy="202" r="34" fill="#d8c178" opacity="0.18"/>
  <circle cx="302" cy="294" r="46" fill="#9f8036" opacity="0.12"/>
</svg>`;
}

function slashSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 512">
  <defs>
    <filter id="slashGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="18" result="blur"/>
      <feColorMatrix in="blur" values="1 0 0 0 0.86 0 1 0 0 0.12 0 0 1 0 0.12 0 0 0 0.95 0"/>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="1024" height="512" fill="none"/>
  <path d="M92 382C326 210 590 112 932 74C690 184 430 302 124 422Z" fill="${palette.red}" opacity="0.78" filter="url(#slashGlow)"/>
  <path d="M148 356C372 236 580 158 844 112" stroke="#fff" stroke-width="22" stroke-linecap="round" opacity="0.9"/>
  <path d="M270 408C470 306 660 234 884 178" stroke="${palette.red}" stroke-width="16" stroke-linecap="round" opacity="0.72"/>
</svg>`;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
