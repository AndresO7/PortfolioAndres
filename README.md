# Andres Ortiz — Systems Reel 2026

A brutalist, motion-first portfolio. The page is cut like a motion reel: a
viewfinder HUD (scroll-driven timecode, live FPS, a 128 BPM beat, scene
counter), eleven scenes and one continuous scroll.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm run lint
```

## Stack

Next.js 16 (App Router) · React 19 · Three.js via React Three Fiber + drei ·
GSAP ScrollTrigger · Lenis · Tailwind CSS 4 · Archivo (variable width 62–125%)
and JetBrains Mono, self-hosted through Fontsource.

## Scenes

| # | Scene | What moves |
|---|-------|------------|
| 00 | Slate loader | Clapperboard counts to 100 while the statue and fonts load, claps, wipes up |
| 01 | Title | 1-bit Bayer-dithered statue (custom shader), text rings, name stretching 125% → 62% |
| 02 | Kinetic type | Seven rows of one word; scroll velocity drives skew and an SVG motion blur |
| 03 | The record | Odometer digits scrubbed by scroll, vertical motion blur |
| 04 | Profile | Halftone portrait shader with an RGB-split lens under the pointer |
| 05 | Selected work | Pinned stage with six procedural 3D figures (khipu, seeded maze, house, apply grid, UI layers, service mesh) |
| 06 | Method | Variable-font width wave on the title |
| 07 | Context | Token bars filling a 200k window, direct vs through the gateway |
| 08 | Lab | Experiment notebook accordion |
| 09 | Lineage | Horizontal edit timeline with a playhead |
| 10 | Harness | RFC-style task packet typed out on scroll |
| 11 | Handshake | Contact, then end credits and "Fin." |

## Languages

English and Spanish. The EN / ES switch sits in the top-right of the HUD (and in
the scene index); it cuts over behind an acid wipe and keeps you at the same
point of the same scene. A visitor's choice is remembered in `localStorage`; on a
first visit, Spanish-language browsers start in Spanish. The server always
renders English and the client swaps before the slate lifts.

All copy lives in `app/lib/content.ts` as two dictionaries; `es` is typed as
`typeof en`, so a missing translation fails the build.

## Layout

- `app/lib/content.ts` — all copy, in English and Spanish
- `app/lib/i18n.ts` — the language store (`useT()`, `setLocale()`)
- `app/lib/reel.ts` — shared scroll/pointer state, the beat clock, one-shot signals
- `app/components/sections/` — one file per scene
- `app/components/three/` — WebGL: hero, portrait and work canvases, shared dither shaders
- `public/statue.glb` — the statue, textures stripped, simplified to ~88k triangles and meshopt-compressed (375 KB)

Every canvas stops rendering when it leaves the viewport, and `prefers-reduced-motion` turns off smooth scrolling and the scroll-driven type animations.
