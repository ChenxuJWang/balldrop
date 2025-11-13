# Open-Source Libraries for a 2D Bouncing Ball Animation System

This study compiles open-source libraries worth reviewing before building a custom 2D animation library (ball motion with configurable curves, shadows, interactivity, and time/scroll playback). Each entry notes what it’s good for, standout features, typical maintenance posture, and why it’s relevant.

---

## Easing & Curve Libraries

### [D3-ease](https://github.com/d3/d3-ease)
- **What it is:** A collection of time-distortion functions (easings) used across D3.
- **Highlights:** Classic Penner-style easings; consistent `ease(t)` interface; well-understood behaviors.
- **Maintenance:** Mature and widely used within the D3 ecosystem.
- **Why relevant:** Establishes a clear contract for timing functions; great baseline (and reference) for your curve system.

### [bezier-easing](https://github.com/gre/bezier-easing)
- **What it is:** Small utility to create cubic-bezier timing functions (like CSS `cubic-bezier`).
- **Highlights:** Fast, precise solver; mirrors CSS mental model for custom easings.
- **Maintenance:** Stable and popular across many animation stacks.
- **Why relevant:** Ideal for user-authored custom curves in the helper UI and config API.

---

## Canvas / SVG Rendering

### [Konva.js](https://konvajs.org/)
- **What it is:** High-level 2D canvas framework (scene graph, layers, hit-testing).
- **Highlights:** Efficient shape management, filters, events; React/Vue bindings.
- **Maintenance:** Actively maintained and production-proven.
- **Why relevant:** Architectural reference for layers, interactivity, and performance patterns on Canvas 2D.

### [Two.js](https://two.js.org/)
- **What it is:** Renderer-agnostic vector engine (SVG/Canvas/WebGL) with a unified API.
- **Highlights:** Scenegraph, animation loop, path support, multiple renderers.
- **Maintenance:** Actively maintained; approachable API surface.
- **Why relevant:** Lets you compare Canvas vs SVG rendering paths and timeline patterns.

### [Paper.js](http://paperjs.org/)
- **What it is:** Vector graphics scripting framework atop Canvas 2D.
- **Highlights:** Powerful Bézier/path APIs, scene graph, SVG import/export.
- **Maintenance:** Stable; feature development slower but solid.
- **Why relevant:** Useful for path-based motion, keypoint smoothing, and vector math.

*(Also consider: [PixiJS](https://pixijs.com/) for WebGL-accelerated 2D; great filter pipeline and performance.)*

---

## Scroll-Driven Animation

### [ScrollMagic](http://scrollmagic.io/)
- **What it is:** Scroll controller to pin elements, trigger scenes, and scrub timelines.
- **Highlights:** “Scenes” + “Controller” model; integrates nicely with GSAP.
- **Maintenance:** Classic; updates are slower but patterns still instructive.
- **Why relevant:** Good reference if you implement your own scroll→progress mapping.

### [Locomotive Scroll](https://github.com/locomotivemtl/locomotive-scroll)
- **What it is:** Smooth scrolling + viewport detection/parallax utilities.
- **Highlights:** Inertial scrolling, reveal-on-scroll hooks.
- **Maintenance:** Moderate; widely used on modern marketing sites.
- **Why relevant:** Study custom scroll containers and rAF-tied event emission.

*(Also see **GSAP ScrollTrigger** if you evaluate GSAP; it’s an excellent modern scroll–animation bridge.)*

---

## General Animation Frameworks

### [GSAP](https://gsap.com/)
- **What it is:** Full-featured tween/timeline engine with plugins (e.g., ScrollTrigger).
- **Highlights:** Robust timelines, high performance, extensive easing and plugins.
- **Maintenance:** Very active with a large community.
- **Why relevant:** Gold standard design for timelines, precision, and extensibility.

### [Popmotion](https://popmotion.io/)
- **What it is:** Modular, low-level animator’s toolbox (tween, spring, keyframes, inertia).
- **Highlights:** Composable primitives; drives numbers, CSS, SVG, or arbitrary objects.
- **Maintenance:** Stable; core ideas live on in Motion One / Framer Motion.
- **Why relevant:** Great inspiration for a lightweight, composable core engine.

### [Motion One](https://motion.dev/)
- **What it is:** WAAPI-powered, tiny animation library with timelines & springs.
- **Highlights:** Uses native browser animation engine; small bundle; modern API.
- **Maintenance:** Active; part of the Motion ecosystem.
- **Why relevant:** Reference for leveraging WAAPI while adding missing ergonomics.

### [Anime.js](https://animejs.com/)
- **What it is:** All-in-one animation engine (DOM/SVG/Canvas/Objects), timelines, easings.
- **Highlights:** Simple API, scroll observer, draggable helpers, keyframes, staggering.
- **Maintenance:** Active; widely adopted.
- **Why relevant:** Excellent model for a concise and expressive configuration surface.

---

## Visual Config / Playground UI

### [Leva](https://github.com/pmndrs/leva)
- **What it is:** React-based, auto-generated control panel for variables.
- **Highlights:** Beautiful defaults, folders, custom inputs, plugin model.
- **Maintenance:** Active (pmndrs); great DX.
- **Why relevant:** Ideal for your companion Config UI (left panel controls).

### [dat.GUI](https://github.com/dataarts/dat.gui)
- **What it is:** Minimal vanilla GUI for real-time parameter tweaking.
- **Highlights:** Zero-deps, tiny, fast to integrate; presets & folders.
- **Maintenance:** Stable; slower updates.
- **Why relevant:** Perfect for quick prototyping and live demos.

### [Tweakpane](https://github.com/cocopon/tweakpane)
- **What it is:** Modern alternative to dat.GUI with themes and plugins.
- **Highlights:** Graphs, blades, fine-grained inputs, extensibility.
- **Maintenance:** Active.
- **Why relevant:** Great option if you prefer non-React playground tooling.

*(Consider **Storybook** for interactive documentation: props controls double as parameter knobs for your demos.)*

---

## Shadow & Light Helpers

### [Illuminated.js](https://github.com/gre/Illuminated.js)
- **What it is:** 2D lighting and shadow casting on Canvas (ray-casting style).
- **Highlights:** Dynamic soft shadows, multiple light sources, glow effects.
- **Maintenance:** Older; conceptually valuable despite age.
- **Why relevant:** Excellent reference if you explore more realistic ground shadows.

### Platform/Library Features
- **Canvas 2D:** `shadowBlur`, `shadowOffsetX/Y`, `globalAlpha` for simple soft shadows.
- **Konva/Pixi filters:** Built-in drop shadow and blur filters for fast, stylable shadows.
- **CSS only (for DOM targets):** `filter: drop-shadow(...)` as a quick baseline.

---

## How to Use This Study

- **Adopt directly:** Use small utilities (e.g., bezier-easing) as building blocks.
- **Design inspiration:** Mirror robust patterns (GSAP timelines, ScrollTrigger concepts).
- **Prototyping:** Pair your engine with Leva/dat.GUI for rapid tuning.
- **Performance:** Borrow buffer reuse, rAF loops, and DPR scaling techniques from Konva/Pixi.
- **Extensibility:** Consider plugin-style architecture modeled after GSAP/Anime.js.

---

## Shortlist Cheat Sheet

- Curves: **d3-ease**, **bezier-easing**  
- Rendering: **Konva**, **Two.js** (and **PixiJS** if you need WebGL speed)  
- Scroll: **ScrollMagic**, **Locomotive Scroll** (or **ScrollTrigger** with GSAP)  
- Engines: **GSAP**, **Motion One**, **Anime.js**, **Popmotion**  
- UI: **Leva**, **dat.GUI**, **Tweakpane**  
- Shadows: **Illuminated.js**, Canvas/**Konva**/**Pixi** filters

---

*Licensing note:* Most listed libraries are MIT or similarly permissive. Always verify current licenses before bundling or deriving code.
