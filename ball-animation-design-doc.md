# Ball Motion Animation Library — Design & Delivery Doc

## 0) Executive Summary
Build a lightweight, configurable 2D animation library that simulates a ball moving “above” a web page. Height is conveyed via **circle radius** and **soft shadow** under a **single configurable light source**. Motion follows a **user-defined curve** (presets + custom), can be driven by **time** or **scroll progress**, and optionally includes **interactive zones**. A **companion Config UI** (left settings panel + right live preview) generates a JSON/JS config snippet for the library.

**Delivery model:** Engine and docs move in **parallel tracks**. Each milestone ships working code + tests + docs updates (README/API/Examples).

---

## 1) Scope & Non-Goals

### 1.1 In-Scope (MVP → Extended)
- Canvas engine (coordinate system, responsive anchoring)
- Motion curves (presets + custom function, keypoint smoothing)
- Light & shadow (single light source, soft shadow varying with height)
- Config API (typed, validated, extendable)
- Playback modes: **time-based** (duration/loop) and **scroll-based** (progress mapping)
- Companion Config UI (wizard steps; export config)
- Optional: interactive zones (spatial/temporal triggers), export to JSON/JS

### 1.2 Non-Goals (v1)
- Multi-light models, PBR shading
- Physics collisions, multi-ball orchestration
- 3D rendering/WebGL
- Advanced accessibility narration (basic ARIA only in v1)
- Audio sync beyond simple event callbacks

---

## 2) Priorities (What we build first and why)
1. **Canvas & Layout Configuration** (foundation)  
2. **Curve & Movement System** (core behavior)  
3. **Typed Config API** (public interface, stability)  
4. **Light & Shadow** (visual depth)  
5. **Preview in Companion UI** (fast feedback)  
6. **Preset Curves in UI** (onboarding)  
7. **Scroll Control** (storytelling / interactive feel)  
8. **Looping & Duration** (playback control)  
9. **Wizarded Config UI Steps** (usability polish)  
10. **Interactive Zones** (optional engagement)  
11. **Config Export** (DX)  
12. **Styling Hooks** (theme, gradients)  
13. **Accessibility hooks** (ARIA on interactables)  
14. **Audio hooks** (optional)

---

## 3) Architecture Overview

### 3.1 Modules
- `core/canvas` — init, resize handling, coordinate transforms (CSS px → world units)
- `core/timeline` — time & scroll drivers, easing normalization (t: 0→1)
- `core/curves` — presets + custom function adapter + keypoint smoothing
- `core/shadow` — single-light soft shadow model (blur/offset/opacity vs height)
- `core/render` — render loop (requestAnimationFrame), draw ball & shadow (Canvas2D or SVG path)
- `core/interactions` — hit testing for zones, click/enter/exit events
- `api/config` — schema validation, defaults, runtime warnings
- `ui/companion` — wizard UI (React), live preview embedding the same render engine

### 3.2 Rendering Choice
- Default: **Canvas 2D** (performance, simple draw calls)
- Optional: **SVG** adapter for accessibility/theming (post-MVP)

### 3.3 Coordinate System
- Canvas space: origin top-left, x→right, y→down.
- Conceptual world axes: X (horizontal), Y (vertical along page), Z (height above plane).  
- Radius `r(z)` and shadow parameters are functions of Z; position is (x,y).

---

## 4) Public API (Developer-facing)

```ts
type CurveFn = (t: number) => number;           // t in [0,1] → normalized height in [0,1]
type ProgressDriver = 'time' | 'scroll';

interface LightSource {
  x: number;    // 0..1 relative to canvas width
  y: number;    // 0..1 relative to canvas height
  z: number;    // relative height of light above plane (suggest 0.5..3)
}

interface ShadowOptions {
  softness?: number;      // 0..1, maps to blur
  opacityAtGround?: number; // 0..1 at z=0
  minScale?: number;      // clamp for very high z
}

interface Keypoint {
  y: number;        // 0..1 along vertical path (or along chosen axis)
  zMin: number;     // 0..1 lowest bound at this y
  zMax: number;     // 0..1 highest bound at this y
}

interface InteractiveZone {
  id: string;
  shape: 'circle' | 'rect';
  bounds: { x: number; y: number; r?: number; w?: number; h?: number }; // 0..1 rel coords
  triggers?: Array<'onEnter'|'onExit'|'onClick'|'onPeak'|'onValley'>;
  onEnter?(): void;
  onExit?(): void;
  onClick?(evt: MouseEvent): void;
  onPeak?(): void;
  onValley?(): void;
}

interface BallStyle {
  fill?: string;      // CSS color or gradient id
  stroke?: string;
  strokeWidth?: number;
}

interface AnimationConfig {
  mount: HTMLElement;              // container or canvas element
  canvasSize?: { width?: number; height?: number; fit?: 'contain'|'cover'|'stretch' };
  driver: ProgressDriver;
  durationMs?: number;             // required if driver='time'
  loop?: boolean | number;         // true=infinite | n iterations
  scrollTarget?: HTMLElement;      // required if driver='scroll'
  curvePreset?: 'sine'|'cosine'|'easeInOut'|'linear'|'bezier';
  curveFunction?: CurveFn;         // overrides preset
  keypoints?: Keypoint[];          // optional; smooth interpolation
  initialOffset?: number;          // z0 in [0,1]
  path?: {                         // 2D motion path along canvas
    xFn?: CurveFn;                 // optional x(t)
    yFn?: CurveFn;                 // optional y(t)
  };
  light: LightSource;
  shadow?: ShadowOptions;
  ballStyle?: BallStyle;
  interactiveZones?: InteractiveZone[];
  debug?: boolean;                 // draws guides, zones
}

interface AnimationInstance {
  play(): void;
  pause(): void;
  stop(): void;
  setProgress(t: number): void; // 0..1
  updateConfig(patch: Partial<AnimationConfig>): void;
  destroy(): void;
}

export function createBallAnimation(config: AnimationConfig): AnimationInstance;
```

**Notes**
- Users either provide `curvePreset` or `curveFunction`.  
- `keypoints` (optional) allow “peaks/valleys per position”; engine smooths to a continuous curve.  
- `driver='scroll'` maps scroll progress to animation progress (0..1), with clamp & hysteresis handled internally.

---

## 5) Shadow/Light Model (v1)
- **Single point light** at `(lx, ly, lz)`.
- Shadow offset ≈ project (ball center → plane) towards light; magnitude grows with Z.  
- Shadow **blur** and **opacity** scale with Z: higher Z → larger, softer, lighter shadow.  
- Provide simple tunables: `softness`, `opacityAtGround`, `minScale`.

---

## 6) Validation & Testing Strategy

### 6.1 Unit Tests (Vitest/Jest)
- Curve presets: deterministic outputs for sample `t`.
- Custom curve adapter: clamps NaN/∞, warns on out-of-range.
- Shadow math: blur/opacity monotonic vs Z.
- Config schema: defaults, required fields, descriptive errors.

### 6.2 Integration Tests (Playwright/Cypress)
- Renders ball on mount; resizes with container.
- Time driver: reaches `t≈1` at ~durationMs (tolerance ±2%).
- Scroll driver: progress follows `scrollTop` (debounced).
- Zones: onEnter/onExit/onClick triggers fire at correct frames.

### 6.3 Visual Regression (Chromatic/Playwright screenshots)
- Golden images for: low Z, high Z, soft vs hard shadow, presets.

### 6.4 Performance
- 60fps target on mid-range laptop; frame budget < 16ms.
- Avoid excessive allocations; reuse buffers.
- Test at 1x, 2x DPR.

**Definition of Done (per milestone)**
- All unit/integration tests green
- Example demos updated
- API docs updated
- CHANGELOG entry added
- Bundle size checked

---

## 7) Companion Config UI (Wizard)

**Layout:** Left panel (controls) / Right panel (live preview).

**Steps**
1. **Canvas** — width/height or fit mode; anchoring.
2. **Light & Shadow** — draggable light (top-down), sliders for `z`, softness, opacity.
3. **Curve** — choose preset OR draw/edit curve; optional keypoints editor (YZ pane: set zMin/zMax by y); smoothing on.
4. **Playback** — time vs scroll; duration; loop count.
5. **Interactivity** — define zones (rect/circle), attach callbacks (stub names).
6. **Export** — show JSON + JS snippet; copy button.

**Validation**
- Live preview always uses the same engine build as the package.
- Exported config round-trips: importing it recreates the same preview (hash compare of key outputs).

---

## 8) Milestones & Parallel Documentation

> **Docs are parallel**: each milestone ships code + tests + docs updates.  
> The table makes this explicit (no linear doc backlog).

| # | Milestone | Code Deliverables | Tests/Validation | Docs Deliverables (in parallel) |
|---|-----------|-------------------|------------------|----------------------------------|
| 1 | **Core Canvas Engine** | canvas init, resize, DPR handling | unit: transforms; integration: render circle | README Quickstart (hello ball), `/docs/getting-started.md` |
| 2 | **Curve Engine** | presets, custom fn adapter, keypoint smoothing | unit: curves; visual snapshots | `/docs/configuration-guide.md` (curves), examples: presets |
| 3 | **Config API** | schema, defaults, error messages | unit: invalid/partial configs | API reference draft (`/docs/api-reference.md`) |
| 4 | **Light & Shadow** | light model, soft shadow, params | unit: monotonicity; snapshots | `/docs/advanced-topics.md` (lighting), demo page |
| 5 | **Playback (time/scroll)** | duration/loop, scroll mapping | integration: timing accuracy, scroll sim | README section: playback modes; scroll demo |
| 6 | **Interactive Zones** (opt) | zones, hit-test, callbacks | integration: click/enter/exit | Docs: zones cookbook; example modal trigger |
| 7 | **Companion Config UI** | React wizard + live preview + export | e2e: wizard flow; round-trip export | Docs site (Docusaurus/VitePress) with screenshots |
| 8 | **Packaging & CDN** | ESM/CJS build, minified, typings | bundle size, E2E CDN demo | README install matrix; CHANGELOG; version badge |
| 9 | **Hardening & A11y** | ARIA roles for interactables, focus mgmt | keyboard nav tests | A11y guide; contribution checklists |

---

## 9) Open-Source Standards (Repo & Process)

**Repo Structure**
```
/packages/lib
  /src
  /tests
  /examples
  /types
  package.json
/packages/ui-config
  /src (React)
  /tests (e2e)
  /public
/docs
README.md
CONTRIBUTING.md
CODE_OF_CONDUCT.md
CHANGELOG.md
LICENSE (MIT)
```

**Engineering Conventions**
- TypeScript across lib + UI
- ESLint + Prettier; commit hooks (lint-staged)
- Conventional Commits (`feat:`, `fix:`, `docs:` …)
- SemVer; GitHub Releases with `CHANGELOG.md`
- CI (GitHub Actions): install → lint → typecheck → test → build → visual tests → deploy docs (on release)

**Comment Style (JSDoc)**
```ts
/**
 * Create and mount a ball animation.
 * @param config - Validated configuration object (see AnimationConfig)
 * @returns AnimationInstance control API
 */
export function createBallAnimation(config: AnimationConfig): AnimationInstance { ... }
```
- Inline comments explain **why**, not what.
- Public APIs fully documented; examples in code blocks are runnable.

**Contribution Workflow**
- PR must include: tests + docs updates (API or examples) for any public change.
- Issue templates: bug report, feature request, doc fix.
- Labels for triage; response SLA (e.g., 5 business days).

---

## 10) Example Config & Usage

```ts
import { createBallAnimation } from '@ballfx/core';

const anim = createBallAnimation({
  mount: document.getElementById('hero')!,
  canvasSize: { fit: 'cover' },
  driver: 'scroll',
  scrollTarget: document.scrollingElement as HTMLElement,
  loop: false,
  curvePreset: 'easeInOut',
  initialOffset: 0.1,
  keypoints: [
    { y: 0.0, zMin: 0.05, zMax: 0.25 },
    { y: 0.5, zMin: 0.1,  zMax: 0.9  },
    { y: 1.0, zMin: 0.05, zMax: 0.3  },
  ],
  light: { x: 0.75, y: 0.1, z: 2.0 },
  shadow: { softness: 0.8, opacityAtGround: 0.6, minScale: 0.7 },
  ballStyle: { fill: '#ff5a5f' },
  interactiveZones: [
    { id:'cta', shape:'circle', bounds:{ x:0.5, y:0.6, r:0.08 }, triggers:['onClick'], onClick(){ /* open modal */ } }
  ],
  debug: false
});
```

---

## 11) Risks & Mitigations
- **Scroll perf on heavy pages** → passive listeners, requestAnimationFrame batching, throttle.
- **Hi-DPI blur artifacts** → scale canvas by DPR; snapshot tests at DPR=1/2.
- **Custom curve edge cases** → clamp outputs, dev warnings, safe defaults.
- **Responsive layout mismatch** → `fit: contain|cover|stretch` modes, resize observer.

---

## 12) Acceptance Criteria (Release v1.0.0)
- Install via npm; minimal example works in <10 lines.
- README shows animated GIF + three runnable examples (time, scroll, interactive zone).
- 85%+ unit coverage; green CI; basic visual snapshots stable.
- Docs site live with API reference and tutorial.
- Companion Config UI exports a config that reproduces the preview within 5% visual tolerance.

---

## 13) Roadmap (Post-v1)
- SVG renderer option, theming tokens
- Multi-ball scenes & sequencing
- Keyframe timeline editor in UI
- Plugin system (e.g., trails, glow)
- Deeper accessibility (narration, reduced-motion)

---

### TL;DR for the team
- Build **canvas → curves → config → light/shadow → playback** in that order.
- Ship **docs and examples with every milestone** (parallel, not afterthought).
- Enforce tests + docs in CI for every public change.
- Keep the API surface stable, typed, and well-documented.
