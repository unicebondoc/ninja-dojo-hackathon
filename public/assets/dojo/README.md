# Ninja Dojo Original Asset Prompts

These prompts are for GPT Image 2 generation. They create original Ninja Dojo assets only. WorldX was used as broad visual inspiration for a live-world/game feel; no WorldX code, sprites, maps, filenames, layouts, images, or assets are copied.

The repo also includes a local generator that creates original PNG assets without an OpenAI API key:

```bash
npm run generate:local-assets
```

Run generation when `OPENAI_API_KEY` is configured:

```bash
node scripts/generate-assets.mjs
```

Expected generated files:

- `public/assets/dojo/dojo-background.png`
- `public/assets/dojo/spritesheet.png`
- `public/assets/dojo/scroll.png`
- `public/assets/dojo/moon.png`
- `public/assets/dojo/slash.png`

If generation is unavailable, the app uses CSS/SVG fallback sprites and effects.

## Dojo Background Prompt

“High-resolution 2D pixel-art inspired game background of a dark ninja dojo interior at night, cinematic top-down/isometric hybrid, wooden dojo floor, tatami grid lines, shoji walls, warm lanterns, cherry blossoms outside, circular moon window on right side, empty central floor for characters, black/red/ivory/gold palette, polished indie game UI quality, no text, no logos, 16:9 composition.”

## Base Sprite Prompt

“Small chibi ninja game sprite, transparent background, front-facing/top-down-isometric hybrid, dark outfit, simple readable silhouette, soft cel-shaded game asset, no text, no logo.”

## Spritesheet Prompt

“Transparent PNG spritesheet, one row of six small chibi/pixel-art game sprites, consistent scale and lighting, top-down/isometric hybrid, dark ninja dojo theme, no text, no logos. Characters left to right: Moji with gold headband and scroll, Miji with red scarf and builder tool, Renegade with red flame accent and twin blades, Sensei with white-gray robe and calm pose, Tester with blue accent and checklist/tool, Meowts as a small ninja cat with pink/gold accent. Polished readable game sprites.”

## Sprite Variants

- Moji: gold headband, small scroll
- Miji: red scarf, builder tool
- Renegade: red flame accent, twin blades
- Sensei: white/gray robe, calm pose
- Tester: blue accent, checklist/tool
- Meowts: small cat ninja, gold/pink accent

## Scroll Prompt

“Transparent PNG 2D game item, parchment scroll with red ribbon, warm ivory paper, polished pixel-art inspired game asset, no text, no logo.”

## Moon Prompt

“Transparent PNG glowing full moon game UI asset, warm ivory gold glow, soft bloom, polished pixel-art inspired, no text, no logo.”

## Slash Prompt

“Transparent PNG red katana slash VFX, diagonal energy stroke, polished 2D game effect, no text, no logo.”
