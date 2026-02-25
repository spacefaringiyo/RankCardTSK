# AimTSK Rank Card Generator — System Reference

> **Purpose:** Quick-start context doc. If you're an AI reading this cold, this is everything you need to understand the system before touching code.

## What This Is

A React + Vite app that generates SVG-based rank cards for community members. Cards are designed visually using a Motif Draft Studio, then generated on the main page with two views: a **static card** (PNG export) and an **interactive holographic card** (MP4 export with 3D tilt + shimmer).

## Tech Stack

- React 19, Vite 7, vanilla CSS
- All visuals are **pure SVG** — no canvas for rendering, only for export rasterization
- MP4 export uses `@ffmpeg/ffmpeg` (WASM, ~25MB, cached by browser)
- Vite serves with COOP/COEP headers for `SharedArrayBuffer` (see `vite.config.js`)

---

## Architecture at a Glance

```
App.jsx                          ← Main page: form + generated cards
├── BlessedRank (static)         ← PNG export
├── InteractiveCardWrapper       ← Physics: tilt, spring, drag
│   └── BlessedRank (isShiny)   ← Holographic, MP4 export
└── Studio.jsx                   ← Motif Draft Studio (design tool)
```

### The Two-Layer Card System

Every card is composed of:

1. **`BaseCard.jsx`** — The layout foundation. Manages SVG canvas (1600×850), text positions, borders, clipping. **Rarely edited.**
2. **Rank file** (e.g. `BlessedRank.jsx`) — The visual theme. Passes `themeColors` + three render props to BaseCard:
   - `renderBackground(cardBounds)` — base gradient/fill (canvas: 1200×800)
   - `renderOverlay(cardBounds)` — noise textures, holographic effects
   - `renderMotif(innerBounds)` — decorative elements (butterflies, shapes), clipped to inner border

### Interactive System (3 modules)

| Module | Role | Key Props |
|--------|------|-----------|
| `InteractiveCardWrapper.jsx` | DOM physics engine: mouse → tilt + spring animation | `children` render prop: `({ lightX, lightY, isHovering, isGrabbing })` |
| `HolographicOverlay.jsx` | Pure SVG shimmer effect | `lightX`, `lightY` (0–1 each), `cardBounds`, `type` |
| `useSpring.js` | Damped spring physics hook | `target`, `{ stiffness, damping, mass }` |

### Export Pipeline

| Format | Flow | File |
|--------|------|------|
| PNG | SVG → `XMLSerializer` → base64 → Image → Canvas → `toDataURL` → download | `utils/exportImage.js` |
| MP4 | Sweep lightX/Y over 120 frames → SVG→Canvas per frame → ffmpeg.wasm H.264 encode → download | `utils/exportVideo.js` |

---

## File Map

```
src/
├── App.jsx                  # Main page (form + dual card view)
├── App.css                  # Layout, export progress bar
├── Studio.jsx               # Motif Draft Studio (auto-discovers drafts)
├── Studio.css
├── components/
│   ├── BaseCard.jsx          # SVG layout foundation (DO NOT EDIT lightly)
│   ├── InteractiveCardWrapper.jsx  # Physics engine
│   ├── InteractiveCardWrapper.css
│   └── HolographicOverlay.jsx     # SVG holographic effect
├── hooks/
│   └── useSpring.js          # Spring physics
├── ranks/
│   ├── BlessedRank.jsx       # Final "Blessed" rank (red theme, butterflies)
│   └── drafts/               # WIP designs (auto-discovered by Studio)
│       ├── BlessedDraftInteractive.jsx   # PoC: mouse-driven shimmer
│       └── BlessedDraftHolographic.jsx   # PoC: CSS-animated shimmer
└── utils/
    ├── exportImage.js        # SVG → PNG
    └── exportVideo.js        # SVG frames → MP4 (ffmpeg.wasm)
```

---

## How to Create a New Rank Design

1. Create `src/ranks/drafts/MyNewDraft.jsx` (copy an existing draft as template)
2. Define `themeColors` + the three render props (`renderBackground`, `renderOverlay`, `renderMotif`)
3. It auto-appears in Studio via `import.meta.glob` — no registration needed
4. When finalized, move to `src/ranks/` and wire into `App.jsx`

## SVG Editing Rules

- **All `<defs>` IDs must be scoped** — use `useId()` to generate unique prefixes. Multiple cards render simultaneously in Studio comparison view, and SVG defs share a global namespace.
  ```jsx
  const uid = useId().replace(/:/g, '');
  // Then: id={`myGradient${uid}`}
  ```
- **Render props receive `cardBounds`** — an object with `{ width, height, rx, ry }`. Use these for sizing, not hardcoded values.
- **Background canvas is 1200×800** within a 1600×850 SVG (200px horizontal padding, 25px vertical).
- **Motifs are clipped** to the inner border rect. Anything drawn outside will be cut.
- **`mixBlendMode`** is your friend for overlays. Use `'screen'` for additive light effects, `'overlay'` for texture.
- **Holographic effects** go in `renderOverlay` via `<HolographicOverlay>`. Pass `isShiny` + `lightX`/`lightY` from parent.

## How to Add Interactive Effects to a New Rank

```jsx
// In App.jsx or wherever the card is used:
<InteractiveCardWrapper>
  {({ lightX, lightY }) => (
    <MyNewRank isShiny={true} lightX={lightX} lightY={lightY} />
  )}
</InteractiveCardWrapper>

// Inside MyNewRank's renderOverlay:
{isShiny && <HolographicOverlay lightX={lightX} lightY={lightY} cardBounds={cardBounds} />}
```

## Running

```bash
npm install          # First time
npm run dev          # Dev server (localhost:5173)
npm run build        # Production build
```
