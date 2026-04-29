# Ninja Dojo Original Asset Prompts

These prompts are for GPT Image 2 generation. They create original Ninja Dojo assets only. WorldX was used as broad visual inspiration for a live-world/game feel; no WorldX code, sprites, maps, filenames, layouts, images, or assets are copied.

Run generation when `OPENAI_API_KEY` is configured:

```bash
node scripts/generate-assets.mjs
```

Expected generated files:

- `public/assets/dojo/dojo-background.png`
- `public/assets/dojo/spritesheet.png`
- `public/assets/dojo/scroll.png`
- `public/assets/dojo/moon.png`
- `public/assets/dojo/katana-slash.png`

If generation is unavailable, the app uses CSS/SVG fallback sprites and effects.

## Dojo Background Prompt

“Top-down 2D game background of a dark ninja dojo interior at night, tatami grid floor, shoji walls, warm lanterns, moonlight window, subtle red accents, cinematic pixel-art inspired but high resolution, empty center floor for characters, no text, no logos, 16:9.”

## Base Sprite Prompt

“Small chibi ninja game sprite, transparent background, front-facing/top-down-isometric hybrid, dark outfit, simple readable silhouette, soft cel-shaded game asset, no text, no logo.”

## Spritesheet Prompt

“Single transparent PNG spritesheet with six small chibi game sprites in one row: Moji with gold headband and small scroll, Miji with red scarf and builder tool, Renegade with red flame accent and twin blades, Sensei in white and gray robe calm pose, Tester with blue accent and checklist tool, Meowts small cat ninja with gold and pink accent. Consistent scale, same lighting, same camera angle, front-facing/top-down-isometric hybrid, dark ninja dojo style, no text, no logo, transparent background.”

## Sprite Variants

- Moji: gold headband, small scroll
- Miji: red scarf, builder tool
- Renegade: red flame accent, twin blades
- Sensei: white/gray robe, calm pose
- Tester: blue accent, checklist/tool
- Meowts: small cat ninja, gold/pink accent

## Scroll Prompt

“Parchment scroll game item, transparent background, warm ivory paper, red ribbon, 2D game asset, no text.”

## Moon Prompt

“Glowing full moon game UI asset, transparent background, warm ivory glow, soft bloom, no text.”

## Slash Prompt

“Red katana slash VFX, transparent background, diagonal energy stroke, 2D game effect, no text.”
