# BallFX 🎾

A lightweight, configurable 2D animation library that simulates a ball moving "above" a web page with realistic shadow effects.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

## Overview

BallFX provides a canvas-based animation system that conveys height through dynamic circle radius and soft shadows under a configurable light source. Motion follows user-defined curves and can be driven by time or scroll progress, with optional interactive zones for user engagement.

## Features

- 🎨 **Canvas-based rendering** with device pixel ratio support
- 📐 **Flexible motion curves** (presets and custom functions)
- 💡 **Realistic shadow rendering** with configurable light source
- ⏱️ **Time-based or scroll-based** animation drivers
- 🎯 **Interactive zones** with event callbacks
- 📦 **TypeScript-first** with full type definitions
- 🪶 **Lightweight** (<50KB gzipped)
- ♿ **Accessible** with ARIA support and reduced motion handling

## Installation

```bash
# npm
npm install @ballfx/core

# yarn
yarn add @ballfx/core

# pnpm
pnpm add @ballfx/core
```

## Quick Start

### Hello Ball

Get started with a simple bouncing ball animation in just a few lines:

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    #ball-container {
      width: 100%;
      height: 400px;
      background: linear-gradient(to bottom, #e0f7fa, #ffffff);
    }
  </style>
</head>
<body>
  <div id="ball-container"></div>
  
  <script type="module">
    import { createBallAnimation } from '@ballfx/core';

    const animation = createBallAnimation({
      mount: document.getElementById('ball-container'),
      driver: 'time',
      durationMs: 2000,
      loop: true,
      curvePreset: 'sine',
      light: { x: 0.5, y: 0.5, z: 2.0 },
    });

    animation.play();
  </script>
</body>
</html>
```

That's it! You now have a ball bouncing with realistic shadows.

## More Examples

### Scroll-Based Animation

Create an animation that follows the page scroll:

```typescript
import { createBallAnimation } from '@ballfx/core';

const animation = createBallAnimation({
  mount: document.getElementById('ball-container'),
  driver: 'scroll',
  scrollTarget: document.scrollingElement,
  curvePreset: 'easeInOut',
  light: { x: 0.75, y: 0.25, z: 2.5 },
  ballStyle: {
    fill: '#ef4444',
    radiusAtGround: 25,
    radiusAtMax: 50
  }
});

animation.play();
```

### Interactive Zones

Add interactive zones with callbacks:

```typescript
const animation = createBallAnimation({
  mount: document.getElementById('ball-container'),
  driver: 'time',
  durationMs: 4000,
  loop: true,
  curvePreset: 'sine',
  light: { x: 0.5, y: 0.5, z: 2.0 },
  zones: [
    {
      id: 'cta-zone',
      shape: 'circle',
      bounds: { x: 0.5, y: 0.3, radius: 0.15 },
      onEnter: () => {
        console.log('Ball entered zone!');
        document.getElementById('tooltip').style.display = 'block';
      },
      onExit: () => {
        console.log('Ball left zone!');
        document.getElementById('tooltip').style.display = 'none';
      },
      onClick: () => {
        window.location.href = '/learn-more';
      }
    }
  ]
});

animation.play();
```

### Custom Curves

Define custom height curves:

```typescript
const animation = createBallAnimation({
  mount: document.getElementById('ball-container'),
  driver: 'time',
  durationMs: 3000,
  loop: true,
  customCurve: (t) => {
    // Quadratic ease-in-out
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  },
  light: { x: 0.5, y: 0.5, z: 2.0 }
});

animation.play();
```

### Playback Control

Control animation playback programmatically:

```typescript
const animation = createBallAnimation({
  mount: document.getElementById('ball-container'),
  driver: 'time',
  durationMs: 3000,
  curvePreset: 'sine',
  light: { x: 0.5, y: 0.5, z: 2.0 }
});

// Play/pause/stop controls
document.getElementById('play-btn').addEventListener('click', () => {
  animation.play();
});

document.getElementById('pause-btn').addEventListener('click', () => {
  animation.pause();
});

document.getElementById('stop-btn').addEventListener('click', () => {
  animation.stop();
});

// Manual progress control
document.getElementById('progress-slider').addEventListener('input', (e) => {
  const progress = parseFloat(e.target.value) / 100;
  animation.setProgress(progress);
});

// Runtime configuration updates
document.getElementById('theme-toggle').addEventListener('click', () => {
  animation.updateConfig({
    ballStyle: { fill: '#10b981' },
    light: { x: 0.7, y: 0.3, z: 2.5 }
  });
});

// Cleanup
window.addEventListener('beforeunload', () => {
  animation.destroy();
});
```

## Documentation

- [Getting Started](docs/getting-started.md) - Setup and basic usage
- [Configuration Guide](docs/configuration-guide.md) - All configuration options
- [API Reference](docs/api-reference.md) - Complete API documentation
- [Advanced Topics](docs/advanced-topics.md) - Lighting, shadows, and performance
- [Architecture Decisions](docs/architecture-decisions.md) - Design decisions and rationale

## Packages

This monorepo contains:

- **@ballfx/core** - Core animation library
- **@ballfx/ui-config** - Visual configuration wizard (coming soon)

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build all packages
npm run build

# Lint and format
npm run lint
npm run format
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before participating.

## License

MIT © [BallFX Contributors](LICENSE)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history.
