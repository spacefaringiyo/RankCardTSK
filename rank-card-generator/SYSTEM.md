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

Card visual design is completely decoupled from the React components. A "Rank" is just a pure JSON data object (`config`) that tells `<BaseCard>` which layers to pull from the `src/registry/`. `BaseCard` itself is a thin compositor — it handles the SVG canvas, clipping, and layer ordering, but delegates *all* structural rendering (borders, text) to the Layout layer.

Every card `config` is composed of 6 layers:

1. **`themeColors`** (Palette) — The color constants (e.g., `#000000` canvas, `#d07070` accents).
2. **`background`** — The base SVG gradient, shape, or fill (e.g., `RadialGlow`).
3. **`texture`** — SVG Noise or grain filters applied via `mixBlendMode` (e.g., `FineNoise`).
4. **`motif`** — Vector decorations (e.g., `Butterflies`, geometric shapes). These are *always* clipped to the inner border bounds.
5. **`holo`** — Dynamic shimmer shaders linked to mouse physics via `lightX`/`lightY` (e.g., `RainbowFoil`). Only renders when `BaseCard` receives `isShiny={true}`.
6. **`layout`** — A Render Function that returns the structural SVG elements (borders, text labels, logo). Each layout file owns its own coordinate dictionary *and* its own `renderForeground()` function, so different layouts can add, remove, or rearrange structural elements freely. `BaseCard` delegates layers 5 & 6 entirely to `layout.renderForeground()`.

---

## File System & The Registry

```text
src/
├── App.jsx                  # Main page (form, export pipelines, mode selector)
├── Studio.jsx               # Motif Sandbox Studio (dynamic visual previewer)
├── components/
│   ├── BaseCard.jsx                 # Thin Layer Compositor (delegates structure to Layout)
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
│   ├── holo/                 # SVG Layer 4 components (RainbowFoil.jsx)
│   └── layouts/              # SVG Layers 5 & 6 render functions (StandardLayout.jsx)
└── utils/
    ├── exportImage.js        # SVG → Canvas → PNG
    └── exportVideo.js        # SVG frames → Canvas → MP4 (ffmpeg.wasm)
```

---

## How to Create a New Rank Design

Because of the Composition Architecture, you rarely need to write React components to make a new rank.

### Method 1: The Studio Sandbox (Visual)
1. Run `npm run dev` and open the **Motif Studio ✨**.
2. Select your desired Palette, Background, Motif, Texture, Holographic, and **Layout** from the dynamic dropdowns.
3. Preview the interactive results immediately.
4. Click **📋 Copy Config JSON**.
5. Open `src/configs/rankConfigs.js` and paste your new object into the exports list. It is now a permanent rank profile.

### Method 2: Creating New Art Layers (Code)
If the existing visual puzzle pieces aren't enough, you build a new layer:
1. Create a file in `src/layers/[type]/MyNewLayer.jsx`.
2. Write a pure SVG renderer function (e.g., `export const renderMyNewLayer = (bounds, colors, uid, etc) => (<g>...</g>)`).
3. **Crucial:** Export it in `src/registry/index.js`.
4. The Sandbox Studio will auto-discover it via Vite `import.meta.glob`. You can now select it in the dropdowns!

### Method 3: Creating a New Layout (Structural)
Layouts control borders, text positions, and structural elements. To create a new one:
1. Create `src/layers/layouts/MyLayout.jsx`.
2. Define a `layoutProps` dictionary with `canvas`, `paddingOffset`, `card`, `innerBorder`, `outerBorder`, and text position objects.
3. Export an object with:
   - `props` — the coordinate dictionary (used by `BaseCard` for canvas sizing, clipping, and layer bounds).
   - `renderForeground(colors, config, playerName, formattedMemberNumber, displayDate, showMemberNumber, showDate)` — a function returning the structural SVG elements (borders, text, logo, or any custom decorative elements unique to this layout).
4. Export it in `src/registry/index.js`. It will auto-appear in the Layout dropdown.

```jsx
// Example: A minimal layout that omits the date and member number entirely
export const MinimalLayout = {
    props: { canvas: {...}, card: {...}, ... },
    renderForeground: (colors, config, playerName) => (
        <>
            <text ...>{config?.displayName?.toUpperCase()}</text>
            <text ...>{playerName}</text>
        </>
    )
};
```

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
    
    {/* 3. BaseCard composites all layers using the config JSON */}
    <BaseCard config={MyRankConfig} isShiny={true} lightX={lightX} lightY={lightY} />

    {/* Internally, BaseCard does:
        Layer 1: config.layers.background(layoutProps.card, uid, colors)
        Layer 2: config.layers.texture(layoutProps.card, uid, colors, fx)
        Layer 3: config.layers.holo(layoutProps.card, uid, lightX, lightY, fx)  // only if isShiny
        Layer 4: config.layers.motif(layoutProps.card, uid, colors)             // clipped to inner border
        Layer 5+6: config.layout.renderForeground(colors, config, playerName, ...) 
    */}
  )}
</InteractiveCardWrapper>
```

## Running

```bash
npm install          # First time
npm run dev          # Dev server (localhost:5173)
npm run build        # Production build
```
