# Design Document

## Overview

The Ball Animation Library is a lightweight, configurable 2D animation system that simulates a ball moving "above" a web page. The library uses Canvas 2D rendering to draw a ball with dynamic radius and soft shadows that convey height through visual depth cues. The system supports both time-driven and scroll-driven animations, with optional interactive zones for user engagement.

The architecture follows a modular design with clear separation of concerns: canvas management, timeline/progress drivers, curve computation, shadow rendering, and interaction handling. A companion React-based Config UI provides a visual wizard for generating configuration objects.

## Architecture

### High-Level Component Structure

```
┌─────────────────────────────────────────────────────────────┐
│                     Public API Layer                         │
│  createBallAnimation(config) → AnimationInstance             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   Core Engine Modules                        │
├──────────────┬──────────────┬──────────────┬────────────────┤
│ Canvas       │ Timeline     │ Curves       │ Shadow         │
│ - Init       │ - Time       │ - Presets    │ - Light model  │
│ - Resize     │ - Scroll     │ - Custom fn  │ - Blur/opacity │
│ - Transform  │ - Progress   │ - Keypoints  │ - Projection   │
└──────────────┴──────────────┴──────────────┴────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Render Loop                               │
│  requestAnimationFrame → update → draw shadow → draw ball    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                 Interactions Module                          │
│  Hit testing → Zone events → Callbacks                       │
└─────────────────────────────────────────────────────────────┘
```

### Module Responsibilities

**core/canvas**
- Initialize canvas element with proper dimensions
- Handle resize events with ResizeObserver
- Manage device pixel ratio scaling
- Provide coordinate transformation utilities (CSS px ↔ world units)
- Support fit modes: contain, cover, stretch

**core/timeline**
- Abstract progress driver interface (0→1 normalized time)
- Time driver: tracks elapsed time, handles duration and looping
- Scroll driver: maps scroll position to progress with debouncing
- Easing/normalization of progress values

**core/curves**
- Preset curve implementations (sine, cosine, easeInOut, linear, bezier)
- Custom function adapter with validation and clamping
- Keypoint smoothing using cubic interpolation
- Height computation: t → z (where t and z are both in [0,1])

**core/shadow**
- Single-light shadow model
- Shadow offset calculation based on light position and ball height
- Blur radius scaling with height
- Opacity scaling with height
- Configurable softness, opacityAtGround, minScale parameters

**core/render**
- Main render loop using requestAnimationFrame
- Draw shadow (radial gradient with blur simulation)
- Draw ball (circle with configurable fill/stroke)
- Debug mode rendering (guides, zones, light position)

**core/interactions**
- Hit testing for circular and rectangular zones
- Track ball position relative to zones
- Trigger onEnter/onExit events with state tracking
- Handle onClick events with coordinate mapping
- Detect peaks/valleys in Z values for onPeak/onValley triggers

**api/config**
- TypeScript interfaces for all configuration types
- Schema validation with descriptive error messages
- Default value application
- Runtime warnings for edge cases
- Configuration patching for updateConfig()

**ui/companion**
- React-based wizard UI with step navigation
- Live preview embedding the core engine
- Configuration state management
- Export functionality (JSON + JS snippet)
- Round-trip validation

## Components and Interfaces

### Core Types

```typescript
// Progress driver abstraction
interface ProgressDriver {
  start(): void;
  stop(): void;
  pause(): void;
  resume(): void;
  getProgress(): number; // 0→1
  destroy(): void;
}

// Curve function signature
type CurveFn = (t: number) => number; // t in [0,1] → z in [0,1]

// Canvas manager
interface CanvasManager {
  element: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  width: number;  // logical width
  height: number; // logical height
  dpr: number;    // device pixel ratio
  resize(width?: number, height?: number): void;
  toWorldCoords(cssX: number, cssY: number): { x: number; y: number };
  toCSSCoords(worldX: number, worldY: number): { x: number; y: number };
  destroy(): void;
}

// Shadow calculator
interface ShadowCalculator {
  compute(ballPos: Vec3, lightPos: Vec3): ShadowParams;
}

interface ShadowParams {
  offsetX: number;
  offsetY: number;
  blur: number;
  opacity: number;
  scale: number;
}

// Interaction manager
interface InteractionManager {
  addZone(zone: InteractiveZone): void;
  removeZone(id: string): void;
  update(ballPos: Vec2, ballZ: number): void;
  handleClick(event: MouseEvent): void;
  destroy(): void;
}
```

### Configuration Schema

The public API configuration (AnimationConfig) is defined in the requirements. Internally, the system validates and normalizes this into:

```typescript
interface NormalizedConfig {
  canvas: CanvasManager;
  driver: ProgressDriver;
  curve: CurveFn;
  pathX: CurveFn;  // defaults to t → 0.5 (center)
  pathY: CurveFn;  // defaults to t → t (top to bottom)
  light: LightSource;
  shadow: Required<ShadowOptions>;
  ballStyle: Required<BallStyle>;
  zones: InteractiveZone[];
  debug: boolean;
}
```

## Data Models

### Coordinate Systems

**Canvas Space (2D)**
- Origin: top-left corner
- X-axis: left to right (0 to canvas.width)
- Y-axis: top to bottom (0 to canvas.height)
- Units: CSS pixels (logical), scaled by DPR for rendering

**World Space (Normalized)**
- All positions expressed as fractions (0→1)
- X: 0 = left edge, 1 = right edge
- Y: 0 = top edge, 1 = bottom edge
- Z: 0 = ground level, 1 = maximum height

**Transformations**
- World → Canvas: `canvasX = worldX * canvas.width`
- Canvas → World: `worldX = canvasX / canvas.width`

### Ball State

```typescript
interface BallState {
  t: number;        // current progress [0,1]
  x: number;        // world X position [0,1]
  y: number;        // world Y position [0,1]
  z: number;        // height [0,1]
  radius: number;   // canvas pixels, function of z
  shadow: ShadowParams;
}
```

### Curve Presets

**Sine**: `z(t) = (sin(t * 2π - π/2) + 1) / 2`
- Smooth oscillation, starts and ends at mid-height

**Cosine**: `z(t) = (cos(t * 2π) + 1) / 2`
- Smooth oscillation, starts and ends at maximum height

**EaseInOut**: `z(t) = t < 0.5 ? 2t² : 1 - 2(1-t)²`
- Accelerates then decelerates

**Linear**: `z(t) = t`
- Constant rate of change

**Bezier**: Cubic Bezier with configurable control points
- Default: `P0=(0,0), P1=(0.25,0.1), P2=(0.75,0.9), P3=(1,1)`

### Keypoint Interpolation

When keypoints are provided, the system:
1. Sorts keypoints by y value
2. For each segment between keypoints, creates a smooth curve
3. Uses cubic Hermite interpolation for C1 continuity
4. Computes tangents at keypoints based on adjacent segments
5. Evaluates the piecewise curve at runtime based on current y position

## Error Handling

### Validation Errors (Thrown at initialization)

- Missing required fields: `mount`, `driver`, `light`
- Invalid driver type: must be 'time' or 'scroll'
- Missing durationMs when driver='time'
- Missing scrollTarget when driver='scroll'
- Invalid light coordinates: must be numbers
- Invalid curve preset name

### Runtime Warnings (Console warnings, graceful degradation)

- Custom curve returns NaN/Infinity → clamp to [0,1], warn once
- Custom curve returns out-of-range → clamp to [0,1], warn once
- Scroll target not scrollable → treat as progress=0
- Zone callback throws error → catch, log, continue
- Performance degradation (frame time >16ms) → log warning in debug mode

### Cleanup and Destruction

- `destroy()` removes all event listeners
- Cancels pending requestAnimationFrame
- Clears canvas
- Nullifies references to prevent memory leaks
- Safe to call multiple times (idempotent)

## Testing Strategy

### Unit Tests (Vitest)

Unit tests are designed to test individual modules in isolation without requiring a browser environment where possible. We use Vitest as the test runner for its speed, TypeScript support, and compatibility with modern tooling.

**Test Organization**
```
/tests/unit/
  canvas.test.ts
  curves.test.ts
  shadow.test.ts
  timeline.test.ts
  config.test.ts
  interactions.test.ts
```

**Testing Approach**

1. **Pure Function Testing**: Most modules expose pure functions that can be tested directly
   - Curve functions: input t → output z
   - Shadow calculations: input (ball pos, light pos) → output (shadow params)
   - Coordinate transforms: input (x, y) → output (x', y')

2. **Mocking Strategy**
   - Mock Canvas API using `vitest-canvas-mock` or `jsdom-canvas`
   - Mock requestAnimationFrame with `vi.useFakeTimers()`
   - Mock ResizeObserver with custom implementation
   - Mock scroll events with synthetic event objects

3. **Test Structure** (AAA Pattern: Arrange, Act, Assert)
   ```typescript
   describe('CurvePresets', () => {
     describe('sine', () => {
       it('should return 0.5 at t=0 (starting mid-height)', () => {
         // Arrange
         const curve = getCurvePreset('sine');
         
         // Act
         const result = curve(0);
         
         // Assert
         expect(result).toBeCloseTo(0.5, 2);
       });
       
       it('should return 1.0 at t=0.25 (peak)', () => {
         const curve = getCurvePreset('sine');
         expect(curve(0.25)).toBeCloseTo(1.0, 2);
       });
     });
   });
   ```

4. **Snapshot Testing**: For complex objects like shadow parameters
   ```typescript
   it('should produce consistent shadow params for known inputs', () => {
     const shadow = calculateShadow(
       { x: 0.5, y: 0.5, z: 0.5 },
       { x: 0.75, y: 0.25, z: 2.0 }
     );
     expect(shadow).toMatchSnapshot();
   });
   ```

5. **Property-Based Testing**: For mathematical invariants
   ```typescript
   it('shadow blur should increase monotonically with Z', () => {
     const zValues = [0, 0.25, 0.5, 0.75, 1.0];
     const blurs = zValues.map(z => 
       calculateShadow({ x: 0.5, y: 0.5, z }, light).blur
     );
     
     // Assert monotonic increase
     for (let i = 1; i < blurs.length; i++) {
       expect(blurs[i]).toBeGreaterThanOrEqual(blurs[i-1]);
     }
   });
   ```

**Module-Specific Test Details**

**Canvas Module**
- Mock HTMLCanvasElement and CanvasRenderingContext2D
- Test initialization with various fit modes (contain/cover/stretch)
- Verify DPR scaling: `canvas.width === logicalWidth * dpr`
- Test coordinate transformations with known values
- Mock ResizeObserver and verify resize handling
- Test cleanup: verify event listeners removed

**Curve Module**
- Test each preset at key points: t=0, 0.25, 0.5, 0.75, 1
- Verify output range: all results in [0, 1]
- Test custom function adapter:
  - Returns NaN → clamps to 0.5, logs warning
  - Returns Infinity → clamps to 1, logs warning
  - Returns negative → clamps to 0, logs warning
- Test keypoint interpolation:
  - Empty keypoints → returns 0
  - Single keypoint → returns constant value
  - Multiple keypoints → smooth interpolation
  - Duplicate y values → handles gracefully
- Verify C1 continuity at keypoint boundaries

**Shadow Module**
- Test shadow offset calculation:
  - Light directly above (x=0.5, y=0.5, z=high) → minimal offset
  - Light to the side → offset points away from light
  - Higher Z → larger offset magnitude
- Test blur scaling: verify monotonic increase with Z
- Test opacity scaling: verify monotonic decrease with Z
- Test minScale clamping: verify shadow doesn't shrink below threshold
- Test edge cases: Z=0, Z=1, light at extreme positions

**Timeline Module**
- Use `vi.useFakeTimers()` to control time
- Test time driver:
  - Advance time by durationMs → progress reaches 1.0 (±2%)
  - Test loop=true → progress resets to 0 after reaching 1
  - Test loop=3 → stops after 3 iterations
  - Test pause/resume → maintains state
- Test scroll driver:
  - Mock scrollTop and scrollHeight
  - Verify progress = scrollTop / (scrollHeight - clientHeight)
  - Test edge cases: not scrollable, negative scroll

**Config Module**
- Test validation:
  - Missing required fields → throws with descriptive message
  - Invalid driver → throws with valid options
  - driver='time' without durationMs → throws
  - driver='scroll' without scrollTarget → throws
- Test default application:
  - Omitted optional fields → uses defaults
  - Partial shadow config → merges with defaults
- Test error messages:
  - Verify messages include field name and expected type
  - Verify messages suggest fixes

**Interactions Module**
- Mock canvas getBoundingClientRect()
- Test hit testing:
  - Ball inside circular zone → returns true
  - Ball outside circular zone → returns false
  - Ball inside rectangular zone → returns true
  - Ball at zone boundary → handles correctly
- Test event triggering:
  - Enter zone → onEnter called once
  - Exit zone → onExit called once
  - Re-enter zone → onEnter called again
  - Click inside zone → onClick called with event
- Test peak/valley detection:
  - Local maximum Z → onPeak called
  - Local minimum Z → onValley called
  - Monotonic Z → no peak/valley events

**Test Utilities**

Create helper functions for common test scenarios:

```typescript
// tests/utils/test-helpers.ts

export function createMockCanvas(width = 800, height = 600) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

export function createMockConfig(overrides?: Partial<AnimationConfig>): AnimationConfig {
  return {
    mount: createMockCanvas(),
    driver: 'time',
    durationMs: 1000,
    curvePreset: 'linear',
    light: { x: 0.5, y: 0.5, z: 2.0 },
    ...overrides
  };
}

export function advanceTimeBy(ms: number) {
  vi.advanceTimersByTime(ms);
}

export function mockScrollPosition(element: HTMLElement, scrollTop: number, scrollHeight: number) {
  Object.defineProperty(element, 'scrollTop', { value: scrollTop, writable: true });
  Object.defineProperty(element, 'scrollHeight', { value: scrollHeight, writable: true });
  Object.defineProperty(element, 'clientHeight', { value: 600, writable: true });
}
```

**Coverage Requirements**

- Overall coverage: 85%+
- Critical paths (curve computation, shadow calculation): 100%
- Error handling paths: 90%+
- Use `vitest --coverage` to generate reports
- Fail CI if coverage drops below threshold

**Running Tests**

```bash
# Run all unit tests
npm run test:unit

# Run with coverage
npm run test:unit -- --coverage

# Run in watch mode during development
npm run test:unit -- --watch

# Run specific test file
npm run test:unit curves.test.ts
```

### Integration Tests (Playwright)

**Rendering**
- Ball appears on mount
- Ball position updates each frame
- Shadow renders beneath ball
- Canvas resizes with container

**Time-Based Animation**
- Animation completes in expected duration
- Looping works (infinite and counted)
- Play/pause/stop controls work

**Scroll-Based Animation**
- Progress follows scroll position
- Debouncing prevents excessive updates
- Works with different scroll containers

**Interactions**
- onEnter fires when ball enters zone
- onExit fires when ball leaves zone
- onClick fires on zone click
- onPeak/onValley fire at local extrema

### Visual Regression Tests (Playwright Screenshots)

Golden images for:
- Ball at Z=0 (ground level, dark shadow)
- Ball at Z=0.5 (mid-height)
- Ball at Z=1 (maximum height, light shadow)
- Different shadow softness values
- Each curve preset at t=0.5
- Debug mode rendering

Compare with perceptual diff threshold (e.g., 0.1%)

### Performance Tests

- Measure frame time over 1000 frames
- Assert 95th percentile < 16ms
- Test at 1x and 2x DPR
- Test with 0, 5, 10 interactive zones

## Implementation Notes

### Shadow Rendering Technique

Canvas 2D doesn't have native soft shadows, so we simulate using radial gradients:

```typescript
function drawShadow(ctx: CanvasRenderingContext2D, params: ShadowParams, pos: Vec2) {
  const gradient = ctx.createRadialGradient(
    pos.x + params.offsetX, pos.y + params.offsetY, 0,
    pos.x + params.offsetX, pos.y + params.offsetY, params.blur * params.scale
  );
  gradient.addColorStop(0, `rgba(0,0,0,${params.opacity})`);
  gradient.addColorStop(0.5, `rgba(0,0,0,${params.opacity * 0.5})`);
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(/* bounding box */);
}
```

### Scroll Performance Optimization

```typescript
let scrollRAF: number | null = null;
let lastScrollY = 0;

function onScroll() {
  if (scrollRAF !== null) return; // already scheduled
  
  scrollRAF = requestAnimationFrame(() => {
    const progress = computeScrollProgress(scrollTarget);
    if (Math.abs(progress - lastProgress) > 0.001) { // hysteresis
      updateAnimation(progress);
      lastProgress = progress;
    }
    scrollRAF = null;
  });
}

scrollTarget.addEventListener('scroll', onScroll, { passive: true });
```

### Keypoint Smoothing Algorithm

Use Catmull-Rom splines for smooth interpolation:

```typescript
function interpolateKeypoints(keypoints: Keypoint[], y: number): number {
  // Find segment containing y
  const segment = findSegment(keypoints, y);
  if (!segment) return 0;
  
  // Compute local t within segment
  const localT = (y - segment.y0) / (segment.y1 - segment.y0);
  
  // Catmull-Rom interpolation
  const z = catmullRom(
    segment.z_prev, segment.z0, segment.z1, segment.z_next,
    localT
  );
  
  return clamp(z, 0, 1);
}
```

### Config UI Architecture

**State Management**
- Use React Context for wizard state
- Separate contexts for: canvas config, light config, curve config, playback config, zones
- Merge contexts into final AnimationConfig on export

**Live Preview**
- Embed the actual library (not a mock)
- Update config on every state change (debounced 100ms)
- Use same AnimationInstance.updateConfig() API

**Export Format**
```javascript
// Generated code
import { createBallAnimation } from '@ballfx/core';

const config = {
  mount: document.getElementById('container'),
  driver: 'scroll',
  scrollTarget: document.scrollingElement,
  // ... rest of config
};

const animation = createBallAnimation(config);
```

## Deployment and Build

### Package Structure

```
@ballfx/core/
  dist/
    index.esm.js      # ES modules
    index.cjs.js      # CommonJS
    index.umd.js      # UMD for CDN
    index.d.ts        # TypeScript definitions
  src/
  package.json

@ballfx/ui-config/
  dist/
  src/
  package.json
```

### Build Pipeline (Vite/Rollup)

1. TypeScript compilation with strict mode
2. Bundle ESM, CJS, UMD formats
3. Minification with terser
4. Generate source maps
5. Extract TypeScript definitions
6. Bundle size check (fail if >50KB gzipped for core)

### CI/CD (GitHub Actions)

```yaml
on: [push, pull_request]

jobs:
  test:
    - Install dependencies
    - Lint (ESLint + Prettier)
    - Type check (tsc --noEmit)
    - Unit tests (Vitest)
    - Integration tests (Playwright)
    - Visual regression (Playwright + Chromatic)
    - Build
    - Bundle size check
  
  deploy-docs:
    if: github.ref == 'refs/heads/main'
    - Build docs site
    - Deploy to GitHub Pages
  
  publish:
    if: startsWith(github.ref, 'refs/tags/v')
    - Build packages
    - Publish to npm
    - Create GitHub release
```

## Accessibility Considerations

### Interactive Zones

- Apply `role="button"` to clickable zones
- Add `aria-label` describing the zone purpose
- Support keyboard focus with `tabindex="0"`
- Trigger onClick on Enter/Space key
- Provide visible focus indicator

### Reduced Motion

```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  // Option 1: Disable animation entirely
  // Option 2: Use static position at t=0.5
  // Option 3: Slow down animation by 10x
}
```

### Screen Reader Support

- Provide `aria-live="polite"` region for animation state changes
- Announce zone interactions
- Allow disabling decorative animations

## Security Considerations

- Sanitize any user-provided HTML in Config UI
- Validate all numeric inputs to prevent injection
- Use Content Security Policy in docs site
- No eval() or Function() constructor usage
- Audit dependencies regularly

## Performance Budget

- Core library: <50KB gzipped
- Config UI: <200KB gzipped
- Frame time: <16ms (60fps) on mid-range laptop
- Time to interactive (Config UI): <3s on 3G
- Lighthouse score: >90 for docs site

## Third-Party Library Considerations

Based on the open-source libraries study, we should consider:

**Potential Dependencies:**
- **bezier-easing**: For cubic-bezier curve implementation (small, stable, CSS-compatible)
- **d3-ease**: Reference implementation for standard easing functions (optional dependency or inspiration)
- **Leva**: For Config UI control panel (React-based, excellent DX)

**Reference Implementations to Study:**
- **Konva.js**: Hit-testing patterns, layer management, performance optimizations
- **ScrollMagic/Locomotive Scroll**: Scroll-to-progress mapping patterns
- **GSAP/Motion One**: Timeline architecture and precision timing
- **Illuminated.js**: Advanced shadow casting techniques (for future enhancements)

**Decision Criteria:**
- Keep core library dependency-free for maximum flexibility
- Use proven utilities (bezier-easing) where they add value without bloat
- Study patterns from mature libraries but implement custom solutions for our specific use case
- Config UI can have more dependencies since it's a separate package

## Open Questions and Future Considerations

1. **SVG Renderer**: Post-v1, offer SVG as alternative to Canvas for better accessibility and theming
2. **Multi-ball**: How to orchestrate multiple balls without N² complexity?
3. **Physics**: Should we add optional gravity/bounce simulation?
4. **Audio Sync**: How to sync with Web Audio API timeline?
5. **WebGL**: For 100+ balls, would WebGL be worth the complexity (study PixiJS patterns)?
6. **Plugin Architecture**: Consider GSAP-style plugin system for extensibility

## Success Metrics

- Install via npm works in <10 lines of code
- 85%+ unit test coverage
- All integration tests green
- Visual regression tests stable
- Bundle size within budget
- 60fps on target hardware
- Config UI exports valid configs 100% of the time
- Documentation complete for all public APIs
