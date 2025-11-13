# Configuration Guide

This guide covers all configuration options for the Ball Animation Library, with detailed examples and best practices.

## Table of Contents

- [Time-Based Playback](#time-based-playback)
  - [Basic Time Driver](#basic-time-driver)
  - [Looping Options](#looping-options)
  - [Playback Controls](#playback-controls)
- [Curve Configuration](#curve-configuration)
  - [Preset Curves](#preset-curves)
  - [Curve Examples](#curve-examples)

---

## Time-Based Playback

The time-based progress driver (`driver: 'time'`) animates the ball based on elapsed time using `requestAnimationFrame` for smooth, frame-rate independent motion. This is ideal for auto-playing animations, hero sections, and decorative effects.

### Basic Time Driver

To create a time-based animation, set `driver: 'time'` and specify the duration in milliseconds:

```typescript
import { createBallAnimation } from '@ballfx/core';

const animation = createBallAnimation({
  mount: document.getElementById('container'),
  driver: 'time',
  durationMs: 3000, // 3 second animation
  curvePreset: 'sine',
  light: { x: 0.5, y: 0.5, z: 2.0 }
});

// Start the animation
animation.play();
```

**Key properties:**
- `driver: 'time'` - Enables time-based animation
- `durationMs` - Animation duration in milliseconds (required)
- `loop` - Looping behavior (optional, default: `false`)

### Looping Options

The `loop` property controls whether and how the animation repeats:

#### Play Once (No Loop)

```typescript
const animation = createBallAnimation({
  mount: document.getElementById('container'),
  driver: 'time',
  durationMs: 2000,
  loop: false, // or omit entirely
  curvePreset: 'easeInOut',
  light: { x: 0.5, y: 0.5, z: 2.0 }
});

animation.play();
```

**Result**: Animation plays once and stops at progress 1.0.

---

#### Infinite Loop

```typescript
const animation = createBallAnimation({
  mount: document.getElementById('container'),
  driver: 'time',
  durationMs: 3000,
  loop: true, // Loop forever
  curvePreset: 'sine',
  light: { x: 0.5, y: 0.5, z: 2.0 }
});

animation.play();
```

**Result**: Animation repeats continuously until stopped.

**Best for**: Background animations, loading indicators, decorative effects.

---

#### Loop N Times

```typescript
const animation = createBallAnimation({
  mount: document.getElementById('container'),
  driver: 'time',
  durationMs: 2000,
  loop: 3, // Play 3 times total
  curvePreset: 'cosine',
  light: { x: 0.5, y: 0.5, z: 2.0 }
});

animation.play();
```

**Result**: Animation plays 3 times, then stops at progress 1.0.

**Best for**: Attention-grabbing effects, onboarding sequences.

---

### Playback Controls

The animation instance provides methods to control playback at runtime:

#### Play

Start or resume the animation:

```typescript
const animation = createBallAnimation({
  mount: document.getElementById('container'),
  driver: 'time',
  durationMs: 3000,
  curvePreset: 'sine',
  light: { x: 0.5, y: 0.5, z: 2.0 }
});

// Start the animation
animation.play();
```

---

#### Pause

Pause the animation, maintaining current progress:

```typescript
// Pause after 1.5 seconds
setTimeout(() => {
  animation.pause();
}, 1500);

// Resume later
setTimeout(() => {
  animation.play(); // Continues from where it paused
}, 3000);
```

**Use cases**: User interactions, conditional animations, debugging.

---

#### Stop

Stop the animation and reset progress to 0:

```typescript
// Stop and reset
animation.stop();

// Can restart from beginning
animation.play();
```

**Use cases**: Resetting animations, cleanup before navigation.

---

#### Manual Progress Control

Set the animation progress manually:

```typescript
// Jump to 50% progress
animation.setProgress(0.5);

// Jump to end
animation.setProgress(1.0);

// Jump to start
animation.setProgress(0);
```

**Use cases**: Scrubbing, synchronized animations, testing.

---

### Complete Playback Example

```typescript
const animation = createBallAnimation({
  mount: document.getElementById('container'),
  driver: 'time',
  durationMs: 4000,
  loop: true,
  curvePreset: 'sine',
  light: { x: 0.5, y: 0.5, z: 2.0 }
});

// Control buttons
document.getElementById('play-btn').addEventListener('click', () => {
  animation.play();
});

document.getElementById('pause-btn').addEventListener('click', () => {
  animation.pause();
});

document.getElementById('stop-btn').addEventListener('click', () => {
  animation.stop();
});

// Progress slider
document.getElementById('progress-slider').addEventListener('input', (e) => {
  const progress = parseFloat(e.target.value);
  animation.setProgress(progress);
});

// Start automatically
animation.play();
```

---

### Timing Accuracy

The time driver maintains timing accuracy within ±2% using `performance.now()` for high-resolution timestamps. This ensures:

- Consistent animation speed across different devices
- Frame-rate independent motion (works at 30fps, 60fps, 120fps, etc.)
- Smooth playback even under system load

---

### Best Practices

**Duration Selection:**
- **Short (500-1500ms)**: Quick attention-grabbers, micro-interactions
- **Medium (1500-3000ms)**: Standard animations, hero sections
- **Long (3000-5000ms)**: Ambient effects, background animations
- **Very long (5000ms+)**: Slow, subtle movements

**Looping Guidelines:**
- Use `loop: true` for decorative, non-intrusive animations
- Use `loop: false` for one-time effects (page load, transitions)
- Use `loop: N` for counted sequences (onboarding, tutorials)

**Performance Tips:**
- Time-based animations use `requestAnimationFrame` for optimal performance
- Multiple animations on one page are fine (each uses one RAF callback)
- Call `destroy()` when removing animations to clean up resources

---

## Curve Configuration

Curves control the ball's height (Z position) over the animation timeline. The library provides several preset curves and supports custom curve functions.

### Preset Curves

All preset curves map progress `t` in the range [0,1] to height `z` in the range [0,1], where:
- `t=0`: Animation start
- `t=1`: Animation end
- `z=0`: Ground level (maximum shadow)
- `z=1`: Maximum height (minimum shadow)

#### Available Presets

**`linear`** - Constant rate of change
- The ball rises steadily from ground to maximum height
- Formula: `z(t) = t`
- Use case: Simple, predictable motion

**`sine`** - Smooth oscillation starting and ending at mid-height
- Creates one complete wave cycle
- Formula: `z(t) = (sin(2πt) + 1) / 2`
- Key points:
  - `t=0`: Mid-height (z=0.5)
  - `t=0.25`: Peak (z=1.0)
  - `t=0.5`: Mid-height (z=0.5)
  - `t=0.75`: Valley (z=0.0)
  - `t=1.0`: Mid-height (z=0.5)
- Use case: Bouncing or wave-like motion

**`cosine`** - Smooth oscillation starting and ending at maximum height
- Creates one complete wave cycle starting at peak
- Formula: `z(t) = (cos(2πt) + 1) / 2`
- Key points:
  - `t=0`: Peak (z=1.0)
  - `t=0.25`: Mid-height (z=0.5)
  - `t=0.5`: Valley (z=0.0)
  - `t=0.75`: Mid-height (z=0.5)
  - `t=1.0`: Peak (z=1.0)
- Use case: Floating or hovering effects

**`easeInOut`** - Accelerates then decelerates
- Slow start, fast middle, slow end
- Formula: `z(t) = t < 0.5 ? 2t² : 1 - 2(1-t)²`
- Use case: Natural, organic motion

**`bezier`** - Smooth cubic Bezier curve
- Default control points: P1=(0.25, 0.1), P2=(0.75, 0.9)
- Creates a smooth S-curve
- Use case: Elegant, CSS-like easing

### Curve Examples

#### Example 1: Linear Rise

```typescript
import { createBallAnimation } from '@ballfx/core';

const animation = createBallAnimation({
  mount: document.getElementById('container'),
  driver: 'time',
  durationMs: 2000,
  curvePreset: 'linear',
  light: { x: 0.5, y: 0.5, z: 2.0 }
});

animation.play();
```

**Result**: The ball rises steadily from ground level to maximum height over 2 seconds.

---

#### Example 2: Bouncing Ball (Sine Wave)

```typescript
const animation = createBallAnimation({
  mount: document.getElementById('container'),
  driver: 'time',
  durationMs: 3000,
  loop: true,
  curvePreset: 'sine',
  light: { x: 0.5, y: 0.5, z: 2.0 }
});

animation.play();
```

**Result**: The ball bounces continuously, starting at mid-height, reaching a peak, dropping to ground level, and returning to mid-height in a smooth cycle.

---

#### Example 3: Floating Effect (Cosine Wave)

```typescript
const animation = createBallAnimation({
  mount: document.getElementById('container'),
  driver: 'scroll',
  scrollTarget: document.scrollingElement,
  curvePreset: 'cosine',
  light: { x: 0.75, y: 0.25, z: 2.5 }
});

animation.play();
```

**Result**: As the user scrolls, the ball floats down from maximum height, touches the ground at mid-scroll, then rises back to maximum height at the bottom of the page.

---

#### Example 4: Smooth Ease (Bezier)

```typescript
const animation = createBallAnimation({
  mount: document.getElementById('container'),
  driver: 'time',
  durationMs: 2500,
  curvePreset: 'bezier',
  light: { x: 0.5, y: 0.5, z: 2.0 },
  ballStyle: {
    fill: '#8b5cf6',
    radiusAtGround: 25,
    radiusAtMax: 50
  }
});

animation.play();
```

**Result**: The ball rises with a smooth, elegant motion that starts slowly, accelerates in the middle, and slows down at the end.

---

#### Example 5: Comparing All Presets

```typescript
const presets = ['linear', 'sine', 'cosine', 'easeInOut', 'bezier'];
const containers = document.querySelectorAll('.curve-demo');

presets.forEach((preset, index) => {
  const animation = createBallAnimation({
    mount: containers[index],
    driver: 'time',
    durationMs: 3000,
    loop: true,
    curvePreset: preset,
    light: { x: 0.5, y: 0.5, z: 2.0 }
  });
  
  animation.play();
});
```

**Result**: Five animations running side-by-side, each demonstrating a different curve preset.

---

### Choosing the Right Curve

| Curve | Best For | Visual Effect |
|-------|----------|---------------|
| `linear` | Simple demos, technical visualizations | Steady, predictable |
| `sine` | Bouncing, oscillating, wave effects | Rhythmic, periodic |
| `cosine` | Floating, hovering, gentle motion | Smooth, ethereal |
| `easeInOut` | Natural motion, UI transitions | Organic, polished |
| `bezier` | Elegant animations, hero sections | Sophisticated, smooth |

---

## Custom Curve Functions

For advanced use cases, you can provide your own curve function instead of using presets. Custom curves give you complete control over the ball's height animation.

### Creating a Custom Curve

A custom curve is a function that takes progress `t` in [0,1] and returns height `z` in [0,1]:

```typescript
type CurveFn = (t: number) => number;
```

The library automatically validates custom curves and handles edge cases:
- **NaN values** → Clamped to 0.5 (mid-height)
- **Infinity** → Clamped to 1.0 (max height)
- **-Infinity** → Clamped to 0.0 (ground level)
- **Out-of-range values** → Clamped to [0,1]

Developer warnings are issued once per curve when invalid values are detected.

### Custom Curve Examples

#### Example 1: Quadratic Curve

```typescript
const animation = createBallAnimation({
  mount: document.getElementById('container'),
  driver: 'time',
  durationMs: 2000,
  customCurve: (t) => t * t, // Quadratic ease-in
  light: { x: 0.5, y: 0.5, z: 2.0 }
});

animation.play();
```

**Result**: The ball starts slowly and accelerates as it rises.

---

#### Example 2: Bounce Effect

```typescript
const bounceCurve = (t: number): number => {
  // Create a bouncing effect with decreasing amplitude
  const bounces = 3;
  const decay = 0.6;
  
  const phase = t * bounces * Math.PI * 2;
  const amplitude = Math.pow(decay, t * bounces);
  
  return Math.abs(Math.sin(phase)) * amplitude;
};

const animation = createBallAnimation({
  mount: document.getElementById('container'),
  driver: 'time',
  durationMs: 3000,
  customCurve: bounceCurve,
  light: { x: 0.5, y: 0.5, z: 2.0 }
});

animation.play();
```

**Result**: The ball bounces multiple times with decreasing height.

---

#### Example 3: Step Function

```typescript
const stepCurve = (t: number): number => {
  // Create discrete height levels
  if (t < 0.25) return 0.2;
  if (t < 0.5) return 0.5;
  if (t < 0.75) return 0.8;
  return 1.0;
};

const animation = createBallAnimation({
  mount: document.getElementById('container'),
  driver: 'scroll',
  scrollTarget: document.scrollingElement,
  customCurve: stepCurve,
  light: { x: 0.5, y: 0.5, z: 2.0 }
});

animation.play();
```

**Result**: The ball jumps between discrete height levels as the user scrolls.

---

#### Example 4: Exponential Growth

```typescript
const exponentialCurve = (t: number): number => {
  // Exponential growth, normalized to [0,1]
  const k = 5; // Growth rate
  return (Math.exp(k * t) - 1) / (Math.exp(k) - 1);
};

const animation = createBallAnimation({
  mount: document.getElementById('container'),
  driver: 'time',
  durationMs: 2500,
  customCurve: exponentialCurve,
  light: { x: 0.5, y: 0.5, z: 2.0 }
});

animation.play();
```

**Result**: The ball rises very slowly at first, then rapidly accelerates.

---

#### Example 5: Elastic Effect

```typescript
const elasticCurve = (t: number): number => {
  // Elastic overshoot effect
  if (t === 0 || t === 1) return t;
  
  const p = 0.3;
  const s = p / 4;
  
  return Math.pow(2, -10 * t) * Math.sin((t - s) * (2 * Math.PI) / p) + 1;
};

const animation = createBallAnimation({
  mount: document.getElementById('container'),
  driver: 'time',
  durationMs: 2000,
  customCurve: elasticCurve,
  light: { x: 0.5, y: 0.5, z: 2.0 }
});

animation.play();
```

**Result**: The ball overshoots and oscillates before settling at maximum height.

---

### Custom Curve Best Practices

1. **Always return values in [0,1]**: While the library will clamp out-of-range values, it's better to design your curve correctly from the start.

2. **Test edge cases**: Verify your curve behaves correctly at `t=0` and `t=1`.

3. **Avoid discontinuities**: Sudden jumps in height can look jarring. Use smooth transitions when possible.

4. **Consider performance**: Your curve function is called 60 times per second. Keep it efficient.

5. **Handle special values**: Be careful with operations that might produce NaN or Infinity (e.g., division by zero).

### Debugging Custom Curves

If your custom curve isn't working as expected:

1. **Check the console**: The library logs warnings for invalid values
2. **Test in isolation**: Call your curve function with test values (0, 0.25, 0.5, 0.75, 1)
3. **Visualize it**: Plot your curve function to see its shape
4. **Enable debug mode**: Set `debug: true` to see visual guides

```typescript
// Test your curve before using it
const myCurve = (t: number) => /* your implementation */;

console.log('t=0:', myCurve(0));    // Should be in [0,1]
console.log('t=0.5:', myCurve(0.5)); // Should be in [0,1]
console.log('t=1:', myCurve(1));    // Should be in [0,1]
```

---

## Keypoint Interpolation

For the most control over your animation, you can define keypoints that specify the ball's height range at specific Y positions. The library smoothly interpolates between keypoints using cubic Hermite interpolation for C1 continuity.

### Understanding Keypoints

A keypoint defines:
- `y`: The Y position (0=top, 1=bottom) where this keypoint applies
- `zMin`: The minimum height at this Y position when progress t=0
- `zMax`: The maximum height at this Y position when progress t=1

The actual Z value at each keypoint is computed by linearly interpolating between `zMin` and `zMax` based on the animation progress.

### Keypoint Examples

#### Example 1: Bouncing Ball Path

```typescript
const animation = createBallAnimation({
  mount: document.getElementById('container'),
  driver: 'time',
  durationMs: 4000,
  loop: true,
  keypoints: [
    { y: 0.0, zMin: 0.0, zMax: 0.1 },  // Start near ground
    { y: 0.2, zMin: 0.7, zMax: 0.9 },  // First bounce (high)
    { y: 0.4, zMin: 0.0, zMax: 0.1 },  // Touch ground
    { y: 0.6, zMin: 0.5, zMax: 0.7 },  // Second bounce (lower)
    { y: 0.8, zMin: 0.0, zMax: 0.1 },  // Touch ground
    { y: 1.0, zMin: 0.0, zMax: 0.1 }   // End near ground
  ],
  light: { x: 0.5, y: 0.5, z: 2.0 }
});

animation.play();
```

**Result**: The ball bounces with decreasing amplitude as it moves down the screen.

---

#### Example 2: Mountain Path

```typescript
const animation = createBallAnimation({
  mount: document.getElementById('container'),
  driver: 'scroll',
  scrollTarget: document.scrollingElement,
  keypoints: [
    { y: 0.0, zMin: 0.2, zMax: 0.4 },   // Start at moderate height
    { y: 0.25, zMin: 0.8, zMax: 1.0 },  // Climb to peak
    { y: 0.5, zMin: 0.3, zMax: 0.5 },   // Descend to valley
    { y: 0.75, zMin: 0.6, zMax: 0.8 },  // Climb smaller peak
    { y: 1.0, zMin: 0.1, zMax: 0.3 }    // Descend to end
  ],
  light: { x: 0.75, y: 0.25, z: 2.5 }
});

animation.play();
```

**Result**: As the user scrolls, the ball follows a mountain-like path with peaks and valleys.

---

#### Example 3: Floating Effect with Variation

```typescript
const animation = createBallAnimation({
  mount: document.getElementById('container'),
  driver: 'time',
  durationMs: 5000,
  loop: true,
  keypoints: [
    { y: 0.0, zMin: 0.6, zMax: 0.8 },   // Start high
    { y: 0.33, zMin: 0.4, zMax: 0.6 },  // Dip slightly
    { y: 0.66, zMin: 0.7, zMax: 0.9 },  // Rise higher
    { y: 1.0, zMin: 0.6, zMax: 0.8 }    // Return to start height
  ],
  light: { x: 0.5, y: 0.5, z: 2.0 },
  ballStyle: {
    fill: '#10b981',
    radiusAtGround: 20,
    radiusAtMax: 45
  }
});

animation.play();
```

**Result**: The ball floats with gentle height variations, creating an organic floating effect.

---

#### Example 4: Staircase Effect

```typescript
const animation = createBallAnimation({
  mount: document.getElementById('container'),
  driver: 'scroll',
  scrollTarget: document.scrollingElement,
  keypoints: [
    { y: 0.0, zMin: 0.1, zMax: 0.2 },
    { y: 0.2, zMin: 0.1, zMax: 0.2 },   // Flat step
    { y: 0.25, zMin: 0.3, zMax: 0.4 },  // Rise
    { y: 0.45, zMin: 0.3, zMax: 0.4 },  // Flat step
    { y: 0.5, zMin: 0.5, zMax: 0.6 },   // Rise
    { y: 0.7, zMin: 0.5, zMax: 0.6 },   // Flat step
    { y: 0.75, zMin: 0.7, zMax: 0.8 },  // Rise
    { y: 1.0, zMin: 0.7, zMax: 0.8 }    // Flat step
  ],
  light: { x: 0.5, y: 0.5, z: 2.0 }
});

animation.play();
```

**Result**: The ball climbs a staircase as the user scrolls.

---

#### Example 5: Wave Pattern

```typescript
// Generate wave keypoints programmatically
const keypoints = [];
const numWaves = 3;
const steps = 20;

for (let i = 0; i <= steps; i++) {
  const y = i / steps;
  const phase = y * numWaves * Math.PI * 2;
  const amplitude = 0.3;
  const offset = 0.5;
  
  const z = Math.sin(phase) * amplitude + offset;
  
  keypoints.push({
    y: y,
    zMin: z - 0.1,
    zMax: z + 0.1
  });
}

const animation = createBallAnimation({
  mount: document.getElementById('container'),
  driver: 'scroll',
  scrollTarget: document.scrollingElement,
  keypoints: keypoints,
  light: { x: 0.5, y: 0.5, z: 2.0 }
});

animation.play();
```

**Result**: The ball follows a smooth wave pattern with three complete cycles.

---

### Keypoint Best Practices

1. **Sort by Y position**: The library automatically sorts keypoints, but it's clearer to define them in order.

2. **Use enough keypoints**: For smooth curves, use at least 3-5 keypoints. For complex paths, use more.

3. **Avoid tight clusters**: Space keypoints reasonably apart (at least 0.1 Y units) for smooth interpolation.

4. **Consider the range**: The difference between `zMin` and `zMax` controls how much the height varies with progress.

5. **Test edge cases**: Verify behavior at the start (y=0) and end (y=1) of your animation.

6. **Combine with path functions**: Keypoints work with custom `pathX` and `pathY` functions for complex 2D motion.

### Keypoint vs Custom Curves

| Feature | Keypoints | Custom Curves |
|---------|-----------|---------------|
| Complexity | High (multiple control points) | Medium (single function) |
| Flexibility | Very high (per-position control) | High (mathematical control) |
| Ease of use | Visual/intuitive | Requires math knowledge |
| Performance | Slightly slower | Faster |
| Best for | Complex paths, bouncing | Smooth mathematical curves |

**When to use keypoints:**
- You want different behavior at different Y positions
- You're creating bouncing or staircase effects
- You need precise control over specific points
- You're designing visually rather than mathematically

**When to use custom curves:**
- You have a mathematical formula in mind
- You want consistent behavior across the entire animation
- Performance is critical (though the difference is minimal)
- You prefer code over configuration

---

## Tips and Best Practices

### Performance Considerations

- All preset curves are optimized for real-time rendering
- Curves are evaluated once per frame (typically 60 times per second)
- No performance difference between preset curves

### Visual Design

- **Match the curve to your content**: Use `sine` for playful content, `bezier` for professional sites
- **Consider the shadow**: Higher Z values create lighter, more diffuse shadows
- **Test with your light position**: Different light angles create different shadow effects

### Animation Duration

- **Short animations (1-2s)**: Use `linear` or `easeInOut` for clarity
- **Medium animations (2-4s)**: Any curve works well
- **Long animations (4s+)**: `sine` or `cosine` add visual interest

---

## Next Steps

- Learn about [custom curve functions](#) (coming soon)
- Explore [keypoint interpolation](#) (coming soon)
- See the [API Reference](./api-reference.md) for complete configuration options
- Check out [Advanced Topics](./advanced-topics.md) for lighting and shadow techniques
