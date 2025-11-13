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

## Documentation

Full documentation coming soon. For now, see:
- [Requirements](.kiro/specs/ball-animation-library/requirements.md)
- [Design Document](.kiro/specs/ball-animation-library/design.md)
- [Architecture Decisions](docs/architecture-decisions.md)

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
