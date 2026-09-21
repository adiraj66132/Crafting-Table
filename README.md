# Minecraft Crafting Table

A fast, searchable web recipe book for **Minecraft** (Java Edition data, 1.20 – 26.1).
Browse 1,684 crafting recipes, preview them on an interactive 3×3 workstation, and copy genuine `/give` commands.

## Features

* **Instant search** — debounced, matches names, ingredients, categories (press `/` to focus)
* **Category filters** — All, Tools, Combat & Armor, Redstone, Building, Food, Utility, Decoration, plus newest-drop grouping
* **Era filters** — Wooden, Stone, Copper, Iron, Golden, Diamond, Netherite Ages; combines with every other filter
* **Interactive 3×3 workstation** — click any ingredient to jump to its recipe; variant switcher for multi-pattern items
* **Craft simulation** — step-by-step slot reveal with sound
* **`/give` commands** — one click copies the genuine command (with output count); hover previews it
* **Favorites** — persisted in localStorage
* **Advancement-style toasts** with sounds (Web Audio synth, zero audio files)
* **Version filter + sorting** (A–Z / Z–A / yield), result cap with "Show more" for smooth scrolling
* **Item sprites** with tiered CDN fallback and pixel-crisp rendering
* Responsive, keyboard-accessible, dark Minecraft-inspired UI in the Mojangles typeface

## Tech Stack

* React 19 + TypeScript + Vite 6
* Tailwind CSS v4
* `lucide-react` icons
* Zero runtime audio/image assets — sounds synthesized, sprites hotlinked with local fallback

## Project Structure

```text
 index.html
 public/
    favicon.png            # Crafting Table icon (ChrisL21, CC BY-NC-ND 4.0)
    fonts/                 # Self-hosted Mojangles v2 (OFL 1.1, see OFL.txt)
 scripts/
    generate_data.js       # Fetches minecraft-data (26.1) → regenerates src/data
 src/
    App.tsx                # Search, filters, catalog
    components/            # CraftingGrid, RecipeCard, ItemSprite, ToastSystem, 
    data/                  # Generated: recipes.ts, materials.ts (do not edit by hand)
    utils/                 # assetUrl (tiered sprite CDN), audio (synth)
```

## Getting Started

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint     # tsc --noEmit
npm run build
```

### Refreshing recipe data

```bash
node scripts/generate_data.js
```

Pulls items + crafting recipes for `MC_VERSION` from PrismarineJS/minecraft-data and rewrites `src/data/`. Header counts, version options, and era counts derive from the data automatically.

## Credits

* Item textures: [TinyTank800/MinecraftAllImages](https://github.com/TinyTank800/MinecraftAllImages)
* Favicon: Crafting Table icon by ChrisL21 (Chris) via Icon-Icons.com (CC BY-NC-ND 4.0)
* Font: Mojangles v2 by PhuWorks (SIL OFL 1.1)
* Recipe data: [PrismarineJS/minecraft-data](https://github.com/PrismarineJS/minecraft-data)

## Disclaimer

Not an official Minecraft product. Not approved by or associated with Mojang or Microsoft.

## License

No `LICENSE` file in the repo yet — add one (MIT suggested); third-party assets follow their own licenses above regardless.
