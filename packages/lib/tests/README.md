# Test Suite Documentation

This directory contains the comprehensive test suite for the Ball Animation Library.

## Test Structure

### Unit Tests (`tests/*.test.ts`)
Unit tests verify individual modules in isolation using Vitest and jsdom.

**Test Files:**
- `canvas.test.ts` - Canvas management, DPR scaling, coordinate transforms, fit modes
- `config.test.ts` - Configuration validation and default application
- `curves.test.ts` - Curve presets, custom functions, keypoint interpolation
- `interactions.test.ts` - Hit testing, zone events, peak/valley detection
- `render.test.ts` - Render loop, shadow drawing, ball drawing, debug mode
- `shadow.test.ts` - Shadow calculations, blur/opacity scaling
- `timeline.test.ts` - Time driver with looping and playback controls
- `scroll-driver.test.ts` - Scroll driver with progress mapping
- `integration.test.ts` - Full API integration tests
- `test-helpers.test.ts` - Test utility function verification

**Coverage:** 94.61% (exceeds 85% requirement)

### Integration Tests (`tests/e2e/*.test.ts`)
Integration tests verify end-to-end behavior in real browsers using Playwright.

**Test Files:**
- `setup.test.ts` - Playwright environment verification
- `time-animation.test.ts` - Time-based animation timing and progress
- `scroll-animation.test.ts` - Scroll-based animation progress mapping
- `interactive-zones.test.ts` - Zone callbacks and event triggering
- `visual-regression.test.ts` - Visual appearance at different Z heights

**Test Fixtures:**
- `fixtures/time-animation.html` - Time-driven animation demo
- `fixtures/scroll-animation.html` - Scroll-driven animation demo
- `fixtures/interactive-zones.html` - Interactive zones demo
- `fixtures/visual-regression.html` - Visual regression test page

## Running Tests

### Unit Tests
```bash
# Run all unit tests
npm test

# Run in watch mode
npm run test:watch

# Run with coverage report
npm run test:coverage
```

### Integration Tests
```bash
# Run Playwright tests
npm run test:e2e

# Run with UI mode
npm run test:e2e:ui

# Run in debug mode
npm run test:e2e:debug
```

## Test Utilities

### Unit Test Helpers (`test-helpers.ts`)
Provides utility functions for creating mock objects and test scenarios:

- `createMockCanvas()` - Creates mock canvas elements
- `createMockContainer()` - Creates mock container elements
- `createMockConfig()` - Creates valid AnimationConfig objects
- `createMockLight()` - Creates mock light sources
- `createMockShadowOptions()` - Creates mock shadow options
- `createMockBallStyle()` - Creates mock ball styles
- `mockScrollPosition()` - Mocks scroll properties on elements
- `createMockMouseEvent()` - Creates mock mouse events
- `createMockRect()` - Creates mock DOMRect objects
- `mockElementRect()` - Mocks getBoundingClientRect
- `cleanupContainer()` - Cleans up DOM elements

### Integration Test Helpers (`e2e/helpers.ts`)
Provides utility functions for Playwright tests:

- `waitForAnimation()` - Waits for animation initialization
- `getCanvas()` - Gets canvas element
- `scrollToPosition()` - Simulates scrolling
- `scrollToProgress()` - Scrolls to specific progress
- `waitForTime()` - Waits for time-based animations
- `getAnimationProgress()` - Gets current progress
- `expectCanvasVisible()` - Asserts canvas visibility
- `getCanvasDimensions()` - Gets canvas dimensions
- `clickCanvas()` - Clicks at canvas position
- `expectCanvasMatchesBaseline()` - Visual regression comparison
- `measureFrameRate()` - Measures animation FPS
- `waitForCallback()` - Waits for callback triggers

## Test Configuration

### Vitest (`vitest.config.ts`)
- Environment: jsdom
- Coverage provider: v8
- Coverage threshold: 85%
- Setup file: `tests/setup.ts`
- Excludes: e2e tests, node_modules, dist

### Playwright (`playwright.config.ts`)
- Test directory: `tests/e2e`
- Browser: Chromium
- Base URL: http://localhost:5173
- Web server: Vite dev server
- Screenshots: On failure
- Trace: On first retry

## Coverage Requirements

Per requirements 10.1 and 10.2:
- ✅ Overall coverage: 94.61% (target: 85%+)
- ✅ Unit tests for all modules
- ✅ Integration tests for time-based animations
- ✅ Integration tests for scroll-based animations
- ✅ Integration tests for interactive zones
- ✅ Visual regression tests for rendering

## Best Practices

1. **Isolation**: Unit tests should not depend on each other
2. **Cleanup**: Always clean up DOM elements and event listeners
3. **Mocking**: Use test helpers for consistent mock objects
4. **Assertions**: Use descriptive expect messages
5. **Coverage**: Focus on critical paths and edge cases
6. **Performance**: Keep tests fast and focused
7. **Visual Tests**: Use baseline screenshots for regression detection

## Continuous Integration

Tests run automatically on:
- Pull requests
- Pushes to main branch
- Version tags

CI pipeline includes:
- Lint and type checking
- Unit tests with coverage
- Integration tests
- Visual regression tests
- Bundle size checks
