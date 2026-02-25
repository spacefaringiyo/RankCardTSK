# AimTSK Rank Card Generator — System Reference

> **Purpose:** Quick-start context doc. If you're an AI reading this cold, this is everything you need to understand the system before touching code.

## What This Is

A React + Vite app that generates SVG-based rank cards for community members. Cards can be designed visually using the **Motif Sandbox Studio**, then generated on the main page with two views: a **static card** (PNG export) and an **interactive holographic card** (MP4 export with 3D tilt + shimmer engine).

## Tech Stack

- React 19, Vite 7, Vanilla CSS
- All visuals are **pure SVG** — no canvas for rendering, only for export rasterization
- MP4 export uses `@ffmpeg/ffmpeg` (WASM, ~25MB, cached by browser)
- Vite serves with COOP/COEP headers for `SharedArrayBuffer` (see `vite.config.js`)

---

## Architecture at a Glance

```
App.jsx                          ← Main page: Member Form + Generated Cards
├── Mode Selector                ← Choose "Use Profile" vs "Mix & Match Sandbox"
├── BaseCard (Static)            ← Loops through config layers, PNG export
│   └── InteractiveCardWrapper   ← Physics engine: tilt, spring, drag
│       └── BaseCard (Holo)      ← Loops through config layers + evaluates Holo layer, MP4 export
└── Studio.jsx                   ← Motif Sandbox Studio (visual mix-and-match tool)
```

### The 6-Layer Composition Architecture

Card visual design is completely decoupled from the React components. A "Rank" is just a pure JSON data object (`config`) that tells `<BaseCard>` which layers to pull from the `src/registry/`.

Every card `config` is composed of 6 layers:

1. **`themeColors`** (Palette) — The color constants (e.g., `#000000` canvas, `#d07070` accents).
2. **`background`** — The base SVG gradient, shape, or fill (e.g., `RadialGlow`).
3. **`texture`** — SVG Noise or grain filters applied via `mixBlendMode` (e.g., `FineNoise`).
4. **`motif`** — Vector decorations (e.g., `Butterflies`, geometric shapes). These are *always* clipped to the inner border bounds.
5. **`holo`** — Dynamic shimmer shaders linked to mouse physics via `lightX`/`lightY` (e.g., `RainbowFoil`). Only renders when `BaseCard` receives `isShiny={true}`.
6. **`BaseCard`** (Layout) — The foundational framework. Handles the actual scaling (1600x850), border strokes, typography, clipping masks, and mapping the config pieces into the final SVG.

---

## File System & The Registry

```text
src/
├── App.jsx                  # Main page (form, export pipelines, mode selector)
├── Studio.jsx               # Motif Sandbox Studio (dynamic visual previewer)
├── components/
│   ├── BaseCard.jsx                 # The Layout Framework & Layer Compositor
│   └── InteractiveCardWrapper.jsx   # Physics engine & DOM Wrapper
├── configs/
│   └── rankConfigs.js        # The official "Profiles" (JSON recipes building Ranks)
├── registry/                 
│   └── index.js              # Exports all layer functions for easy importing
├── layers/                   # THE PUZZLE PIECES
│   ├── palettes/             # Color constants files
│   ├── backgrounds/          # SVG Layer 1 components (RadialGlow.jsx)
│   ├── motifs/               # SVG Layer 2 components (Butterflies.jsx)
│   ├── textures/             # SVG Layer 3 components (FineNoise.jsx)
│   └── holo/                 # SVG Layer 4 components (RainbowFoil.jsx)
└── utils/
    ├── exportImage.js        # SVG → Canvas → PNG
    └── exportVideo.js        # SVG frames → Canvas → MP4 (ffmpeg.wasm)
```

---

## How to Create a New Rank Design

Because of the Composition Architecture, you rarely need to write React components to make a new rank.

### Method 1: The Studio Sandbox (Visual)
1. Run `npm run dev` and open the **Motif Studio ✨**.
2. Select your desired Palette, Background, Motif, Texture, and Holographic style from the dynamic dropdowns.
3. Preview the interactive results immediately.
4. Click **📋 Copy Config JSON**.
5. Open `src/configs/rankConfigs.js` and paste your new object into the exports list. It is now a permanent rank profile.

### Method 2: Creating New Layers (Code)
If the existing puzzle pieces aren't enough, you build a new layer:
1. Create a file in `src/layers/[type]/MyNewLayer.jsx`.
2. Write a pure SVG renderer function (e.g., `export const renderMyNewLayer = (bounds, colors, uid, etc) => (<g>...</g>)`).
3. **Crucial:** Export it in `src/registry/index.js`.
4. The Sandbox Studio will auto-discover it via Vite `import.meta.glob`. You can now select it in the dropdowns!

---

## SVG Editing Rules

- **All `<defs>` IDs must be scoped** — When looping layers, you must pass the `uid` string to ensure gradients and clipping paths don't collide if multiple cards are on the screen.
  ```jsx
  // Inside a Motif renderer:
  <linearGradient id={`myGrad-${uid}`}>...</linearGradient>
  <path fill={`url(#myGrad-${uid})`} />
  ```
- **Layer render props receive bounds** — Most functions receive `layout` or `bounds` (an object with `{ width, height, rx, ry, cx, cy }`). Use these for sizing gradients. Do not hardcode dimensions.
- **Backgrounds are 1200x800**, Motif & Holo are smaller (clipped to inner bounds).
- **Holographics receive physics** — Any holographic layer exported must accept `lightX` and `lightY` props (0 to 1 floats) bounding the mouse position. Transform your gradient stops based on these inputs.

---

## Interactive Physics Flow

```jsx
// 1. The Wrapper tracks the mouse/touch across the DOM element bounding box
<InteractiveCardWrapper>
  {/* 2. It passes normalized 0-1 physics coordinates down to the BaseCard */}
  {({ lightX, lightY }) => (
    
    {/* 3. BaseCard loops through the config JSON... */}
    <BaseCard config={MyRankConfig} isShiny={true} lightX={lightX} lightY={lightY}>
      
      {/* 4. If isShiny is true, it passes the physics to the Holographic layer! */}
      {config.layers.holo(bounds, colors, uid, lightX, lightY)}
      
    </BaseCard>
  )}
</InteractiveCardWrapper>
```

## Running

```bash
npm install          # First time
npm run dev          # Dev server (localhost:5173)
npm run build        # Production build
```
