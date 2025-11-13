# Getting Started with BallFX

This guide will help you get up and running with BallFX, from installation to creating your first animation.

## Installation

Install BallFX using your preferred package manager:

```bash
# npm
npm install @ballfx/core

# yarn
yarn add @ballfx/core

# pnpm
pnpm add @ballfx/core
```

### CDN Usage

You can also use BallFX directly from a CDN:

```html
<script type="module">
  import { createBallAnimation } from 'https://cdn.jsdelivr.net/npm/@ballfx/core/dist/index.esm.js';
  // Your code here
</script>
```

## Your First Animation

Let's create a simple bouncing ball animation. You'll need:
1. A container element for the canvas
2. A configuration object
3. A call to `createBallAnimation()`

### Step 1: Create the HTML Container

```html
<div id="ball-container" style="width: 100%; height: 400px;"></div>
```

The canvas will be created inside this container and sized to fill it.

### Step 2: Import and Configure

```javascript
import { createBallAnimation } from '@ballfx/core';

const animation = createBallAnimation({
  mount: document.getElementById('ball-container'),
  driver: 'time',
  durationMs: 2000,
  loop: true,
  curvePreset: 'sine',
  light: { x: 0.5, y: 0.5, z: 2.0 }
});
```

### Step 3: Start the Animation

```javascript
animation.play();
```

## Canvas Setup

The canvas management system handles all the complexity of device pixel ratios, responsive sizing, and coordinate transformations for you.

### Basic Canvas Configuration

```javascript
const animation = createBallAnimation({
  mount: document.getElementById('container'),
  // Canvas will automatically size to fill the container
  driver: 'time',
  durationMs: 2000,
  light: { x: 0.5, y: 0.5, z: 2.0 }
});
```

### Explicit Canvas Dimensions

You can specify explicit dimensions if needed:

```javascript
const animation = createBallAnimation({
  mount: document.getElementById('container'),
  width: 800,    // Logical width in CSS pixels
  height: 600,   // Logical height in CSS pixels
  driver: 'time',
  durationMs: 2000,
  light: { x: 0.5, y: 0.5, z: 2.0 }
});
```

### Fit Modes

Control how the canvas fits within its container:

#### Contain (Default)

Fits the canvas inside the container while maintaining aspect ratio:

```javascript
const animation = createBallAnimation({
  mount: document.getElementById('container'),
  width: 800,
  height: 600,
  fitMode: 'contain',  // Fits inside, maintains aspect ratio
  driver: 'time',
  durationMs: 2000,
  light: { x: 0.5, y: 0.5, z: 2.0 }
});
```

Use this when you want the entire animation visible without cropping.

#### Cover

Fills the container while maintaining aspect ratio (may crop):

```javascript
const animation = createBallAnimation({
  mount: document.getElementById('container'),
  width: 800,
  height: 600,
  fitMode: 'cover',  // Fills container, may crop edges
  driver: 'time',
  durationMs: 2000,
  light: { x: 0.5, y: 0.5, z: 2.0 }
});
```

Use this when you want the animation to fill the entire container.

#### Stretch

Stretches the canvas to fill the container, ignoring aspect ratio:

```javascript
const animation = createBallAnimation({
  mount: document.getElementById('container'),
  width: 800,
  height: 600,
  fitMode: 'stretch',  // Fills container, ignores aspect ratio
  driver: 'time',
  durationMs: 2000,
  light: { x: 0.5, y: 0.5, z: 2.0 }
});
```

Use this when you want the animation to exactly match the container dimensions.

### Responsive Sizing

The canvas automatically responds to container size changes using ResizeObserver:

```html
<style>
  #responsive-container {
    width: 100%;
    height: 50vh;
    /* Canvas will automatically resize when viewport changes */
  }
</style>

<div id="responsive-container"></div>

<script type="module">
  import { createBallAnimation } from '@ballfx/core';

  const animation = createBallAnimation({
    mount: document.getElementById('responsive-container'),
    fitMode: 'contain',
    driver: 'time',
    durationMs: 2000,
    loop: true,
    curvePreset: 'sine',
    light: { x: 0.5, y: 0.5, z: 2.0 }
  });

  animation.play();
</script>
```

### High-DPI Display Support

BallFX automatically handles high-DPI displays (Retina, 4K, etc.) by:
- Detecting the device pixel ratio
- Scaling the canvas internal resolution accordingly
- Maintaining crisp rendering at any pixel density

No configuration needed - it just works!

## Understanding Coordinates

BallFX uses normalized world coordinates for all positions:

- **X-axis**: 0 (left edge) to 1 (right edge)
- **Y-axis**: 0 (top edge) to 1 (bottom edge)
- **Z-axis**: 0 (ground level) to 1 (maximum height)

This means your animations work at any canvas size without modification.

### Example: Centered Light Source

```javascript
const animation = createBallAnimation({
  mount: document.getElementById('container'),
  driver: 'time',
  durationMs: 2000,
  light: {
    x: 0.5,  // Centered horizontally
    y: 0.5,  // Centered vertically
    z: 2.0   // Twice the canvas height above the plane
  }
});
```

### Example: Light from Top-Right

```javascript
const animation = createBallAnimation({
  mount: document.getElementById('container'),
  driver: 'time',
  durationMs: 2000,
  light: {
    x: 0.75,  // 75% to the right
    y: 0.25,  // 25% from the top
    z: 2.5    // High above the canvas
  }
});
```

## Next Steps

Now that you have a basic animation running, explore:

- [Configuration Guide](./configuration-guide.md) - Learn about all configuration options
- [API Reference](./api-reference.md) - Complete API documentation
- [Advanced Topics](./advanced-topics.md) - Curves, shadows, and interactions

## Troubleshooting

### Canvas Not Appearing

Make sure your container element:
- Has explicit dimensions (width and height)
- Is visible in the DOM
- Has a valid ID that matches your selector

### Blurry on High-DPI Displays

This should be handled automatically. If you see blurriness:
- Check that you're not manually setting canvas width/height attributes
- Verify the canvas is being created by BallFX (not manually)
- Check browser console for any errors

### Animation Not Starting

Make sure you call `animation.play()` after creating the animation:

```javascript
const animation = createBallAnimation(config);
animation.play();  // Don't forget this!
```

## Complete Example

Here's a complete, working example you can copy and paste:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BallFX - Getting Started</title>
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: system-ui, -apple-system, sans-serif;
      background: #f5f5f5;
    }
    
    h1 {
      text-align: center;
      color: #333;
    }
    
    #ball-container {
      width: 100%;
      max-width: 800px;
      height: 400px;
      margin: 0 auto;
      background: linear-gradient(to bottom, #e0f7fa, #ffffff);
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .controls {
      text-align: center;
      margin-top: 20px;
    }
    
    button {
      padding: 10px 20px;
      margin: 0 5px;
      font-size: 16px;
      cursor: pointer;
      border: none;
      border-radius: 4px;
      background: #3b82f6;
      color: white;
      transition: background 0.2s;
    }
    
    button:hover {
      background: #2563eb;
    }
  </style>
</head>
<body>
  <h1>🎾 BallFX Demo</h1>
  <div id="ball-container"></div>
  
  <div class="controls">
    <button id="play">Play</button>
    <button id="pause">Pause</button>
    <button id="stop">Stop</button>
  </div>
  
  <script type="module">
    import { createBallAnimation } from '@ballfx/core';

    const animation = createBallAnimation({
      mount: document.getElementById('ball-container'),
      driver: 'time',
      durationMs: 2000,
      loop: true,
      curvePreset: 'sine',
      light: { x: 0.5, y: 0.5, z: 2.0 },
      ballStyle: {
        fill: '#3b82f6',
        radiusAtGround: 20,
        radiusAtMax: 40
      },
      shadow: {
        softness: 0.7,
        opacityAtGround: 0.4
      }
    });

    // Control buttons
    document.getElementById('play').addEventListener('click', () => {
      animation.play();
    });
    
    document.getElementById('pause').addEventListener('click', () => {
      animation.pause();
    });
    
    document.getElementById('stop').addEventListener('click', () => {
      animation.stop();
    });

    // Start automatically
    animation.play();
  </script>
</body>
</html>
```

Save this as `index.html` and open it in a browser to see your first BallFX animation!
