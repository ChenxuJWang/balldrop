# API Reference

Complete API documentation for the Ball Animation Library.

## Table of Contents

- [AnimationConfig](#animationconfig)
  - [Required Fields](#required-fields)
  - [Driver-Specific Fields](#driver-specific-fields)
  - [Optional Fields](#optional-fields)
  - [Default Values](#default-values)
- [AnimationInstance](#animationinstance)
  - [play()](#play)
  - [pause()](#pause)
  - [stop()](#stop)
  - [setProgress()](#setprogress)
  - [updateConfig()](#updateconfig)
  - [destroy()](#destroy)

---

## AnimationConfig

The `AnimationConfig` interface is the primary configuration object used to create a ball animation. It defines all aspects of the animation behavior, appearance, and interaction.

```typescript
interface AnimationConfig {
  // Required fields
  mount: HTMLElement;
  driver: 'time' | 'scroll';
  light: LightSource;
  
  // Driver-specific fields
  durationMs?: number;
  scrollTarget?: HTMLElement | null;
  
  // Optional fields
  loop?: boolean | number;
  width?: number;
  height?: number;
  fitMode?: 'contain' | 'cover' | 'stretch';
  curvePreset?: 'sine' | 'cosine' | 'easeInOut' | 'linear' | 'bezier';
  customCurve?: (t: number) => number;
  keypoints?: Keypoint[];
  pathX?: (t: number) => number;
  pathY?: (t: number) => number;
  shadow?: ShadowOptions;
  ballStyle?: BallStyle;
  zones?: InteractiveZone[];
  debug?: boolean;
}
```

---

### Required Fields

#### mount

The DOM element to mount the canvas into. The canvas will be sized to fill this container.

**Type:** `HTMLElement`

**Example:**
```typescript
const config: AnimationConfig = {
  mount: document.getElementById('canvas-container'),
  driver: 'time',
  durationMs: 3000,
  light: { x: 0.5, y: 0.5, z: 2.0 }
};
```

---

#### driver

Animation driver type that determines how progress is calculated.

**Type:** `'time' | 'scroll'`

**Options:**
- `'time'`: Progress based on elapsed time (requires `durationMs`)
- `'scroll'`: Progress based on scroll position (requires `scrollTarget`)

**Example:**
```typescript
// Time-based animation
const timeConfig: AnimationConfig = {
  mount: element,
  driver: 'time',
  durationMs: 3000,
  light: { x: 0.5, y: 0.5, z: 2.0 }
};

// Scroll-based animation
const scrollConfig: AnimationConfig = {
  mount: element,
  driver: 'scroll',
  scrollTarget: document.scrollingElement,
  light: { x: 0.5, y: 0.5, z: 2.0 }
};
```

---

#### light

Light source configuration for shadow calculations. Coordinates are in normalized world space where (0,0) is top-left and (1,1) is bottom-right. The Z coordinate represents height above the canvas plane.

**Type:** `LightSource`

```typescript
interface LightSource {
  x: number;  // Horizontal position [0,1]
  y: number;  // Vertical position [0,1]
  z: number;  // Height above canvas (typically 1-3)
}
```

**Example:**
```typescript
const config: AnimationConfig = {
  mount: element,
  driver: 'time',
  durationMs: 3000,
  light: {
    x: 0.5,  // centered horizontally
    y: 0.5,  // centered vertically
    z: 2.0   // twice the canvas height above the plane
  }
};
```

---

### Driver-Specific Fields

#### durationMs

Animation duration in milliseconds. **Required when `driver` is `'time'`.**

**Type:** `number`

**Validation:** Must be a positive number.

**Example:**
```typescript
const config: AnimationConfig = {
  mount: element,
  driver: 'time',
  durationMs: 3000,  // 3 second animation
  light: { x: 0.5, y: 0.5, z: 2.0 }
};
```

---

#### scrollTarget

Scroll container element for scroll-based animations. **Required when `driver` is `'scroll'`.**

**Type:** `HTMLElement | null`

**Note:** Use `null` or `document.scrollingElement` for the main page scroll.

**Example:**
```typescript
// Main page scroll
const config: AnimationConfig = {
  mount: element,
  driver: 'scroll',
  scrollTarget: document.scrollingElement,
  light: { x: 0.5, y: 0.5, z: 2.0 }
};

// Custom scroll container
const scrollContainer = document.getElementById('scroll-area');
const config2: AnimationConfig = {
  mount: element,
  driver: 'scroll',
  scrollTarget: scrollContainer,
  light: { x: 0.5, y: 0.5, z: 2.0 }
};
```

---

### Optional Fields

#### loop

Looping behavior for time-based animations.

**Type:** `boolean | number`

**Default:** `false`

**Options:**
- `false`: Play once and stop
- `true`: Loop infinitely
- `number`: Loop N times (e.g., `3` plays the animation 3 times)

**Example:**
```typescript
// Play once
const config1: AnimationConfig = {
  mount: element,
  driver: 'time',
  durationMs: 3000,
  loop: false,
  light: { x: 0.5, y: 0.5, z: 2.0 }
};

// Loop infinitely
const config2: AnimationConfig = {
  mount: element,
  driver: 'time',
  durationMs: 3000,
  loop: true,
  light: { x: 0.5, y: 0.5, z: 2.0 }
};

// Loop 5 times
const config3: AnimationConfig = {
  mount: element,
  driver: 'time',
  durationMs: 3000,
  loop: 5,
  light: { x: 0.5, y: 0.5, z: 2.0 }
};
```

---

#### width / height

Canvas dimensions in CSS pixels. If omitted, the canvas uses the container's dimensions.

**Type:** `number`

**Default:** Container dimensions

**Example:**
```typescript
const config: AnimationConfig = {
  mount: element,
  driver: 'time',
  durationMs: 3000,
  width: 800,
  height: 600,
  light: { x: 0.5, y: 0.5, z: 2.0 }
};
```

---

#### fitMode

How the canvas should fit within its container.

**Type:** `'contain' | 'cover' | 'stretch'`

**Default:** `'contain'`

**Options:**
- `'contain'`: Fit inside container, maintain aspect ratio
- `'cover'`: Fill container, maintain aspect ratio (may crop)
- `'stretch'`: Fill container, ignore aspect ratio

**Example:**
```typescript
const config: AnimationConfig = {
  mount: element,
  driver: 'time',
  durationMs: 3000,
  fitMode: 'cover',
  light: { x: 0.5, y: 0.5, z: 2.0 }
};
```

---

#### curvePreset

Preset curve name for height animation.

**Type:** `'sine' | 'cosine' | 'easeInOut' | 'linear' | 'bezier'`

**Default:** `'linear'`

**Example:**
```typescript
const config: AnimationConfig = {
  mount: element,
  driver: 'time',
  durationMs: 3000,
  curvePreset: 'sine',
  light: { x: 0.5, y: 0.5, z: 2.0 }
};
```

---

#### customCurve

Custom curve function for height animation. Takes progress `t` in [0,1] and returns height `z` in [0,1]. If provided, overrides `curvePreset`.

**Type:** `(t: number) => number`

**Example:**
```typescript
const config: AnimationConfig = {
  mount: element,
  driver: 'time',
  durationMs: 3000,
  customCurve: (t) => t * t,  // Quadratic curve
  light: { x: 0.5, y: 0.5, z: 2.0 }
};
```

---

#### keypoints

Keypoints for defining height curve based on Y position. If provided, overrides `curvePreset` and `customCurve`.

**Type:** `Keypoint[]`

```typescript
interface Keypoint {
  y: number;     // Y position [0,1]
  zMin: number;  // Minimum Z height [0,1]
  zMax: number;  // Maximum Z height [0,1]
}
```

**Example:**
```typescript
const config: AnimationConfig = {
  mount: element,
  driver: 'time',
  durationMs: 3000,
  keypoints: [
    { y: 0.0, zMin: 0.0, zMax: 0.2 },  // start low
    { y: 0.5, zMin: 0.8, zMax: 1.0 },  // peak in middle
    { y: 1.0, zMin: 0.0, zMax: 0.2 }   // end low
  ],
  light: { x: 0.5, y: 0.5, z: 2.0 }
};
```

---

#### pathX / pathY

Custom functions for horizontal and vertical position over time. Take progress `t` in [0,1] and return position in [0,1].

**Type:** `(t: number) => number`

**Defaults:**
- `pathX`: `(t) => 0.5` (centered horizontally)
- `pathY`: `(t) => t` (top to bottom)

**Example:**
```typescript
const config: AnimationConfig = {
  mount: element,
  driver: 'time',
  durationMs: 3000,
  pathX: (t) => 0.5 + 0.3 * Math.sin(t * Math.PI * 2),  // Sine wave
  pathY: (t) => t,  // Linear top to bottom
  light: { x: 0.5, y: 0.5, z: 2.0 }
};
```

---

#### shadow

Shadow rendering options that control the appearance of the ball's shadow.

**Type:** `ShadowOptions`

```typescript
interface ShadowOptions {
  softness?: number;         // Shadow blur [0,1], default: 0.5
  opacityAtGround?: number;  // Max opacity at Z=0 [0,1], default: 0.3
  minScale?: number;         // Min shadow scale [0,1], default: 0.1
}
```

**Defaults:**
```typescript
{
  softness: 0.5,
  opacityAtGround: 0.3,
  minScale: 0.1
}
```

**Example:**
```typescript
const config: AnimationConfig = {
  mount: element,
  driver: 'time',
  durationMs: 3000,
  shadow: {
    softness: 0.7,
    opacityAtGround: 0.4,
    minScale: 0.2
  },
  light: { x: 0.5, y: 0.5, z: 2.0 }
};
```

---

#### ballStyle

Visual styling options for the ball.

**Type:** `BallStyle`

```typescript
interface BallStyle {
  fill?: string;           // Fill color, default: '#3b82f6'
  stroke?: string;         // Stroke color, default: 'none'
  strokeWidth?: number;    // Stroke width in pixels, default: 0
  radiusAtGround?: number; // Radius at Z=0 in pixels, default: 20
  radiusAtMax?: number;    // Radius at Z=1 in pixels, default: 40
}
```

**Defaults:**
```typescript
{
  fill: '#3b82f6',
  stroke: 'none',
  strokeWidth: 0,
  radiusAtGround: 20,
  radiusAtMax: 40
}
```

**Example:**
```typescript
const config: AnimationConfig = {
  mount: element,
  driver: 'time',
  durationMs: 3000,
  ballStyle: {
    fill: '#ff6b6b',
    stroke: '#c92a2a',
    strokeWidth: 2,
    radiusAtGround: 30,
    radiusAtMax: 60
  },
  light: { x: 0.5, y: 0.5, z: 2.0 }
};
```

---

#### zones

Interactive zones for user interaction. Zones can be circular or rectangular and trigger callbacks when the ball enters, exits, or reaches peaks/valleys.

**Type:** `InteractiveZone[]`

**Default:** `[]`

```typescript
interface InteractiveZone {
  id: string;
  shape: 'circle' | 'rect';
  bounds: {
    x: number;
    y: number;
    radius?: number;    // For circles
    width?: number;     // For rectangles
    height?: number;    // For rectangles
  };
  onEnter?: (zone: InteractiveZone) => void;
  onExit?: (zone: InteractiveZone) => void;
  onClick?: (event: MouseEvent, zone: InteractiveZone) => void;
  onPeak?: (z: number, zone: InteractiveZone) => void;
  onValley?: (z: number, zone: InteractiveZone) => void;
}
```

**Example:**
```typescript
const config: AnimationConfig = {
  mount: element,
  driver: 'time',
  durationMs: 3000,
  zones: [
    {
      id: 'cta-zone',
      shape: 'circle',
      bounds: { x: 0.5, y: 0.3, radius: 0.15 },
      onEnter: () => console.log('Ball entered zone'),
      onExit: () => console.log('Ball left zone'),
      onClick: (event) => console.log('Zone clicked', event)
    }
  ],
  light: { x: 0.5, y: 0.5, z: 2.0 }
};
```

---

#### debug

Enable debug mode to visualize zones, light position, and guides.

**Type:** `boolean`

**Default:** `false`

**Example:**
```typescript
const config: AnimationConfig = {
  mount: element,
  driver: 'time',
  durationMs: 3000,
  debug: true,
  light: { x: 0.5, y: 0.5, z: 2.0 }
};
```

---

### Default Values

The library applies sensible defaults for all optional fields. You can import the defaults object to see or reference them:

```typescript
import { CONFIG_DEFAULTS } from '@ballfx/core';

console.log(CONFIG_DEFAULTS);
// {
//   fitMode: 'contain',
//   loop: false,
//   debug: false,
//   curvePreset: 'linear',
//   shadow: {
//     softness: 0.5,
//     opacityAtGround: 0.3,
//     minScale: 0.1
//   },
//   ballStyle: {
//     fill: '#3b82f6',
//     stroke: 'none',
//     strokeWidth: 0,
//     radiusAtGround: 20,
//     radiusAtMax: 40
//   },
//   zones: [],
//   pathX: (t) => 0.5,
//   pathY: (t) => t
// }
```

---

## AnimationInstance

The `AnimationInstance` is returned by `createBallAnimation()` and provides methods to control the animation at runtime.

```typescript
interface AnimationInstance {
  play(): void;
  pause(): void;
  stop(): void;
  setProgress(progress: number): void;
  updateConfig(config: Partial<AnimationConfig>): void;
  destroy(): void;
}
```

---

### play()

Start or resume the animation.

**Signature:**
```typescript
play(): void
```

**Behavior:**
- For time-based animations: Begins the timeline or resumes from paused state
- For scroll-based animations: Enables scroll tracking
- If already playing: No effect (idempotent)
- If paused: Resumes from current progress

**Example:**
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

**Use cases:**
- Starting animations on page load
- Resuming after pause
- Triggering animations on user interaction

---

### pause()

Pause the animation, maintaining current progress.

**Signature:**
```typescript
pause(): void
```

**Behavior:**
- Stops animation updates but preserves current progress
- Can be resumed with `play()`
- For time-based animations: Stops the timeline
- For scroll-based animations: Disables scroll tracking
- If not running: No effect (idempotent)

**Example:**
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

// Pause after 1.5 seconds
setTimeout(() => {
  animation.pause();
  console.log('Animation paused');
}, 1500);

// Resume after 3 seconds
setTimeout(() => {
  animation.play();
  console.log('Animation resumed');
}, 3000);
```

**Use cases:**
- Pausing on user interaction (hover, click)
- Conditional animations based on app state
- Debugging and development

---

### stop()

Stop the animation and reset progress to 0.

**Signature:**
```typescript
stop(): void
```

**Behavior:**
- Stops animation updates
- Resets progress to 0
- Clears internal state (loop counters, timestamps)
- Can be restarted with `play()` (starts from beginning)

**Example:**
```typescript
const animation = createBallAnimation({
  mount: document.getElementById('container'),
  driver: 'time',
  durationMs: 3000,
  curvePreset: 'sine',
  light: { x: 0.5, y: 0.5, z: 2.0 }
});

animation.play();

// Stop and reset after 2 seconds
setTimeout(() => {
  animation.stop();
  console.log('Animation stopped and reset');
}, 2000);

// Restart from beginning
setTimeout(() => {
  animation.play();
  console.log('Animation restarted');
}, 4000);
```

**Use cases:**
- Resetting animations
- Cleanup before navigation
- Restarting sequences

**Difference from pause():**
| Method | Progress | State | Resume Behavior |
|--------|----------|-------|-----------------|
| `pause()` | Preserved | Paused | Continues from pause point |
| `stop()` | Reset to 0 | Stopped | Starts from beginning |

---

### setProgress()

Manually set the animation progress.

**Signature:**
```typescript
setProgress(progress: number): void
```

**Parameters:**
- `progress` (number): Progress value in range [0, 1]
  - `0`: Animation start
  - `0.5`: Halfway through
  - `1`: Animation end

**Behavior:**
- Immediately updates the animation to the specified progress
- Works for both time-based and scroll-based animations
- Values outside [0, 1] are clamped
- Does not affect play/pause state

**Example:**
```typescript
const animation = createBallAnimation({
  mount: document.getElementById('container'),
  driver: 'time',
  durationMs: 3000,
  curvePreset: 'sine',
  light: { x: 0.5, y: 0.5, z: 2.0 }
});

// Jump to 50% progress
animation.setProgress(0.5);

// Jump to end
animation.setProgress(1.0);

// Jump to start
animation.setProgress(0);
```

**Interactive scrubbing example:**
```typescript
const animation = createBallAnimation({
  mount: document.getElementById('container'),
  driver: 'time',
  durationMs: 3000,
  curvePreset: 'sine',
  light: { x: 0.5, y: 0.5, z: 2.0 }
});

// Create a progress slider
const slider = document.getElementById('progress-slider');
slider.addEventListener('input', (e) => {
  const progress = parseFloat(e.target.value) / 100;
  animation.setProgress(progress);
});
```

**Use cases:**
- Scrubbing through animations
- Synchronizing multiple animations
- Testing specific animation states
- Creating custom progress controls

---

### updateConfig()

Update configuration at runtime.

**Signature:**
```typescript
updateConfig(config: Partial<AnimationConfig>): void
```

**Parameters:**
- `config` (Partial<AnimationConfig>): Configuration properties to update

**Updatable properties:**
- `light`: Light source position
- `shadow`: Shadow rendering options
- `ballStyle`: Ball visual styling
- `zones`: Interactive zones
- `debug`: Debug mode

**Non-updatable properties:**
- `mount`: Cannot change container
- `driver`: Cannot change driver type
- `durationMs`: Cannot change duration (restart required)
- `scrollTarget`: Cannot change scroll target

**Example:**
```typescript
const animation = createBallAnimation({
  mount: document.getElementById('container'),
  driver: 'time',
  durationMs: 3000,
  loop: true,
  curvePreset: 'sine',
  light: { x: 0.5, y: 0.5, z: 2.0 },
  ballStyle: {
    fill: '#3b82f6',
    radiusAtGround: 20,
    radiusAtMax: 40
  }
});

animation.play();

// Update light position after 2 seconds
setTimeout(() => {
  animation.updateConfig({
    light: { x: 0.75, y: 0.25, z: 2.5 }
  });
}, 2000);

// Update ball color after 4 seconds
setTimeout(() => {
  animation.updateConfig({
    ballStyle: {
      fill: '#ef4444',
      radiusAtGround: 25,
      radiusAtMax: 50
    }
  });
}, 4000);
```

**Use cases:**
- Dynamic theming
- Responsive light positions
- Interactive styling changes
- A/B testing different configurations

---

### destroy()

Destroy the animation instance and clean up all resources.

**Signature:**
```typescript
destroy(): void
```

**Behavior:**
- Removes event listeners
- Cancels animation frames
- Clears the canvas
- Releases all internal references
- Safe to call multiple times (idempotent)

**Example:**
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

// Clean up when navigating away
window.addEventListener('beforeunload', () => {
  animation.destroy();
});

// Or when removing from DOM
document.getElementById('remove-btn').addEventListener('click', () => {
  animation.destroy();
  document.getElementById('container').remove();
});
```

**Use cases:**
- Cleanup before page navigation
- Removing animations dynamically
- Memory management in SPAs
- Preventing memory leaks

**Important:** Always call `destroy()` when you're done with an animation to prevent memory leaks, especially in single-page applications.

---

## Complete Example

Here's a complete example demonstrating all playback control methods:

```typescript
import { createBallAnimation } from '@ballfx/core';

// Create animation
const animation = createBallAnimation({
  mount: document.getElementById('container'),
  driver: 'time',
  durationMs: 4000,
  loop: true,
  curvePreset: 'sine',
  light: { x: 0.5, y: 0.5, z: 2.0 },
  ballStyle: {
    fill: '#3b82f6',
    radiusAtGround: 20,
    radiusAtMax: 40
  }
});

// Play button
document.getElementById('play-btn').addEventListener('click', () => {
  animation.play();
});

// Pause button
document.getElementById('pause-btn').addEventListener('click', () => {
  animation.pause();
});

// Stop button
document.getElementById('stop-btn').addEventListener('click', () => {
  animation.stop();
});

// Progress slider
document.getElementById('progress-slider').addEventListener('input', (e) => {
  const progress = parseFloat(e.target.value) / 100;
  animation.setProgress(progress);
});

// Theme toggle
document.getElementById('theme-toggle').addEventListener('click', () => {
  const isDark = document.body.classList.toggle('dark');
  animation.updateConfig({
    ballStyle: {
      fill: isDark ? '#60a5fa' : '#3b82f6'
    },
    light: {
      x: isDark ? 0.25 : 0.75,
      y: isDark ? 0.75 : 0.25,
      z: 2.0
    }
  });
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  animation.destroy();
});

// Start automatically
animation.play();
```

---

## Next Steps

- Learn about [configuration options](./configuration-guide.md)
- Explore [advanced topics](./advanced-topics.md)
- See [getting started guide](./getting-started.md) for setup instructions
