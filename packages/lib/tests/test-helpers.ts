/**
 * Test Utility Functions
 * 
 * Common helper functions for creating mock objects and test scenarios.
 */

import type { AnimationConfig, LightSource, ShadowOptions, BallStyle } from '../src/types';

/**
 * Creates a mock canvas element with specified dimensions
 */
export function createMockCanvas(width = 800, height = 600): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

/**
 * Creates a mock container element with specified dimensions
 */
export function createMockContainer(width = 800, height = 600): HTMLElement {
  const container = document.createElement('div');
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  document.body.appendChild(container);
  return container;
}

/**
 * Creates a minimal valid AnimationConfig for testing
 */
export function createMockConfig(overrides?: Partial<AnimationConfig>): AnimationConfig {
  const container = createMockContainer();
  
  const defaultConfig: AnimationConfig = {
    mount: container,
    driver: 'time',
    durationMs: 1000,
    curvePreset: 'linear',
    light: { x: 0.5, y: 0.5, z: 2.0 },
  };
  
  return {
    ...defaultConfig,
    ...overrides,
  };
}

/**
 * Creates a mock light source
 */
export function createMockLight(overrides?: Partial<LightSource>): LightSource {
  return {
    x: 0.5,
    y: 0.5,
    z: 2.0,
    ...overrides,
  };
}

/**
 * Creates mock shadow options
 */
export function createMockShadowOptions(overrides?: Partial<ShadowOptions>): ShadowOptions {
  return {
    softness: 0.5,
    opacityAtGround: 0.3,
    minScale: 0.5,
    ...overrides,
  };
}

/**
 * Creates mock ball style options
 */
export function createMockBallStyle(overrides?: Partial<BallStyle>): BallStyle {
  return {
    fill: '#3b82f6',
    stroke: '#1e40af',
    strokeWidth: 2,
    ...overrides,
  };
}

/**
 * Advances fake timers by specified milliseconds
 */
export function advanceTimeBy(ms: number): void {
  vi.advanceTimersByTime(ms);
}

/**
 * Mocks scroll position on an element
 */
export function mockScrollPosition(
  element: HTMLElement,
  scrollTop: number,
  scrollHeight: number,
  clientHeight = 600
): void {
  Object.defineProperty(element, 'scrollTop', {
    value: scrollTop,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(element, 'scrollHeight', {
    value: scrollHeight,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(element, 'clientHeight', {
    value: clientHeight,
    writable: true,
    configurable: true,
  });
}

/**
 * Creates a mock MouseEvent with specified coordinates
 */
export function createMockMouseEvent(
  type: string,
  clientX: number,
  clientY: number
): MouseEvent {
  return new MouseEvent(type, {
    clientX,
    clientY,
    bubbles: true,
    cancelable: true,
  });
}

/**
 * Waits for next animation frame (for use with fake timers)
 */
export async function waitForAnimationFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

/**
 * Cleans up a container element from the DOM
 */
export function cleanupContainer(container: HTMLElement): void {
  if (container.parentElement) {
    container.parentElement.removeChild(container);
  }
}

/**
 * Creates a mock getBoundingClientRect result
 */
export function createMockRect(
  x = 0,
  y = 0,
  width = 800,
  height = 600
): DOMRect {
  return {
    x,
    y,
    width,
    height,
    top: y,
    left: x,
    right: x + width,
    bottom: y + height,
    toJSON: () => ({}),
  } as DOMRect;
}

/**
 * Mocks getBoundingClientRect on an element
 */
export function mockElementRect(
  element: HTMLElement,
  rect: Partial<DOMRect>
): void {
  const fullRect = createMockRect(
    rect.x,
    rect.y,
    rect.width,
    rect.height
  );
  
  element.getBoundingClientRect = vi.fn(() => fullRect);
}

// Re-export vi for convenience
export { vi } from 'vitest';
