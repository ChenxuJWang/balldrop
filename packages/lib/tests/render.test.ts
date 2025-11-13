/**
 * Tests for the render loop and drawing system
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Renderer } from '../src/core/render';
import type { RendererConfig, BallState } from '../src/core/render';
import type { CanvasManager, ProgressDriver, ShadowCalculator, Vec3, LightSource } from '../src/types';

// Mock canvas manager
function createMockCanvasManager(): CanvasManager {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  
  const context = canvas.getContext('2d')!;
  
  return {
    element: canvas,
    context,
    width: 800,
    height: 600,
    dpr: 1,
    resize: vi.fn(),
    toWorldCoords: vi.fn((x, y) => ({ x: x / 800, y: y / 600 })),
    toCSSCoords: vi.fn((x, y) => ({ x: x * 800, y: y * 600 })),
    destroy: vi.fn(),
  };
}

// Mock progress driver
function createMockDriver(progress: number = 0): ProgressDriver {
  let currentProgress = progress;
  
  return {
    start: vi.fn(),
    stop: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    getProgress: vi.fn(() => currentProgress),
    destroy: vi.fn(),
    setProgress: (p: number) => { currentProgress = p; },
  };
}

// Mock shadow calculator
function createMockShadowCalculator(): ShadowCalculator {
  return {
    compute: vi.fn((ballPos: Vec3, lightPos: Vec3) => ({
      offsetX: 10,
      offsetY: 10,
      blur: 20,
      opacity: 0.3,
      scale: 0.8,
    })),
  };
}

// Create a basic renderer config for testing
function createTestConfig(overrides?: Partial<RendererConfig>): RendererConfig {
  return {
    canvas: createMockCanvasManager(),
    driver: createMockDriver(0),
    curveFn: (t) => t, // Linear
    pathX: (t) => 0.5, // Centered
    pathY: (t) => t, // Top to bottom
    shadowCalculator: createMockShadowCalculator(),
    light: { x: 0.5, y: 0.5, z: 2.0 },
    ballStyle: {
      fill: '#3b82f6',
      stroke: 'none',
      strokeWidth: 0,
      radiusAtGround: 20,
      radiusAtMax: 40,
    },
    zones: [],
    debug: false,
    ...overrides,
  };
}

describe('Renderer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });
  
  describe('Lifecycle', () => {
    it('should start and stop the render loop', () => {
      const config = createTestConfig();
      const renderer = new Renderer(config);
      
      // Should not be running initially
      expect(renderer['isRunning']).toBe(false);
      
      // Start should begin the loop
      renderer.start();
      expect(renderer['isRunning']).toBe(true);
      expect(renderer['rafId']).not.toBeNull();
      
      // Stop should halt the loop
      renderer.stop();
      expect(renderer['isRunning']).toBe(false);
      expect(renderer['rafId']).toBeNull();
    });
    
    it('should not start multiple times', () => {
      const config = createTestConfig();
      const renderer = new Renderer(config);
      
      renderer.start();
      const firstRafId = renderer['rafId'];
      
      renderer.start(); // Try to start again
      const secondRafId = renderer['rafId'];
      
      expect(firstRafId).toBe(secondRafId);
      
      renderer.stop();
    });
    
    it('should clean up resources on destroy', () => {
      const config = createTestConfig();
      const renderer = new Renderer(config);
      
      renderer.start();
      renderer.destroy();
      
      expect(renderer['isRunning']).toBe(false);
      expect(renderer['rafId']).toBeNull();
      expect(renderer['frameTimes']).toEqual([]);
      expect(renderer['currentState']).toBeNull();
    });
  });
  
  describe('Update Logic', () => {
    it('should compute ball state from progress', () => {
      const driver = createMockDriver(0.5);
      const config = createTestConfig({ driver });
      const renderer = new Renderer(config);
      
      // Manually call update
      renderer['update']();
      
      const state = renderer.getCurrentState();
      expect(state).not.toBeNull();
      expect(state!.t).toBe(0.5);
      expect(state!.x).toBe(0.5); // pathX returns 0.5
      expect(state!.y).toBe(0.5); // pathY returns t
      expect(state!.z).toBe(0.5); // curveFn returns t
    });
    
    it('should calculate radius based on Z height', () => {
      const driver = createMockDriver(0);
      const config = createTestConfig({ driver });
      const renderer = new Renderer(config);
      
      // At Z=0 (ground level)
      renderer['update']();
      let state = renderer.getCurrentState();
      expect(state!.radius).toBe(20); // radiusAtGround
      
      // At Z=1 (max height)
      (driver as any).setProgress(1);
      renderer['update']();
      state = renderer.getCurrentState();
      expect(state!.radius).toBe(40); // radiusAtMax
      
      // At Z=0.5 (mid height)
      (driver as any).setProgress(0.5);
      renderer['update']();
      state = renderer.getCurrentState();
      expect(state!.radius).toBe(30); // Midpoint
    });
    
    it('should use custom path functions', () => {
      const driver = createMockDriver(0.5);
      const config = createTestConfig({
        driver,
        pathX: (t) => t * 0.8, // Custom X path
        pathY: (t) => 1 - t, // Reverse Y path
      });
      const renderer = new Renderer(config);
      
      renderer['update']();
      
      const state = renderer.getCurrentState();
      expect(state!.x).toBe(0.4); // 0.5 * 0.8
      expect(state!.y).toBe(0.5); // 1 - 0.5
    });
    
    it('should call shadow calculator with correct positions', () => {
      const driver = createMockDriver(0.5);
      const shadowCalculator = createMockShadowCalculator();
      const light: LightSource = { x: 0.75, y: 0.25, z: 2.5 };
      const config = createTestConfig({ driver, shadowCalculator, light });
      const renderer = new Renderer(config);
      
      renderer['update']();
      
      expect(shadowCalculator.compute).toHaveBeenCalledWith(
        { x: 0.5, y: 0.5, z: 0.5 }, // Ball position
        light // Light position
      );
    });
  });
  
  describe('Frame Timing', () => {
    it('should track frame times', () => {
      const config = createTestConfig();
      const renderer = new Renderer(config);
      
      // Manually call tick with controlled timestamps
      // First frame initializes lastTimestamp
      renderer['isRunning'] = true;
      renderer['tick'](0);
      
      // Subsequent frames should have 16ms delta
      renderer['tick'](16);
      renderer['tick'](32);
      renderer['tick'](48);
      
      const stats = renderer.getPerformanceStats();
      expect(stats.lastFrameTime).toBe(16);
      // Average should be 16ms (ignoring the first frame's 0ms)
      expect(stats.avgFrameTime).toBeGreaterThan(10);
      expect(stats.avgFrameTime).toBeLessThan(20);
      expect(stats.fps).toBeGreaterThan(50);
      expect(stats.fps).toBeLessThan(100);
    });
    
    it('should warn when frame budget exceeded in debug mode', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const config = createTestConfig({ debug: true });
      const renderer = new Renderer(config);
      
      renderer.start();
      
      // Simulate slow frame (>16ms)
      vi.setSystemTime(0);
      renderer['tick'](0);
      
      vi.setSystemTime(20); // 20ms frame time
      renderer['tick'](20);
      
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Frame time exceeded budget')
      );
      
      renderer.stop();
      consoleWarnSpy.mockRestore();
    });
    
    it('should not warn about frame budget when debug is disabled', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const config = createTestConfig({ debug: false });
      const renderer = new Renderer(config);
      
      renderer.start();
      
      // Simulate slow frame
      vi.setSystemTime(0);
      renderer['tick'](0);
      
      vi.setSystemTime(20);
      renderer['tick'](20);
      
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      
      renderer.stop();
      consoleWarnSpy.mockRestore();
    });
    
    it('should limit frame time samples to MAX_FRAME_SAMPLES', () => {
      const config = createTestConfig();
      const renderer = new Renderer(config);
      
      renderer.start();
      
      // Simulate 100 frames
      for (let i = 0; i < 100; i++) {
        vi.setSystemTime(i * 16);
        renderer['tick'](i * 16);
      }
      
      // Should only keep last 60 samples
      expect(renderer['frameTimes'].length).toBe(60);
      
      renderer.stop();
    });
  });
  
  describe('Render Loop Integration', () => {
    it('should update and draw on each frame', () => {
      const config = createTestConfig();
      const renderer = new Renderer(config);
      
      const updateSpy = vi.spyOn(renderer as any, 'update');
      const drawSpy = vi.spyOn(renderer as any, 'draw');
      
      // Manually trigger tick to test update and draw
      renderer['isRunning'] = true;
      renderer['tick'](16);
      
      expect(updateSpy).toHaveBeenCalled();
      expect(drawSpy).toHaveBeenCalled();
      
      renderer.stop();
    });
    
    it('should clear canvas before drawing', () => {
      const canvas = createMockCanvasManager();
      const clearRectSpy = vi.spyOn(canvas.context, 'clearRect');
      const config = createTestConfig({ canvas });
      const renderer = new Renderer(config);
      
      renderer.start();
      renderer['update']();
      renderer['draw']();
      
      expect(clearRectSpy).toHaveBeenCalledWith(0, 0, 800, 600);
      
      renderer.stop();
    });
    
    it('should schedule next frame with requestAnimationFrame', () => {
      const config = createTestConfig();
      const renderer = new Renderer(config);
      
      renderer.start();
      
      const firstRafId = renderer['rafId'];
      expect(firstRafId).not.toBeNull();
      
      // Trigger frame
      vi.setSystemTime(16);
      renderer['tick'](16);
      
      const secondRafId = renderer['rafId'];
      expect(secondRafId).not.toBeNull();
      expect(secondRafId).not.toBe(firstRafId);
      
      renderer.stop();
    });
  });
  
  describe('Progress Integration', () => {
    it('should animate from 0 to 1 over time', () => {
      const driver = createMockDriver(0);
      const config = createTestConfig({ driver });
      const renderer = new Renderer(config);
      
      renderer.start();
      
      // Progress at 0
      (driver as any).setProgress(0);
      renderer['update']();
      expect(renderer.getCurrentState()!.t).toBe(0);
      
      // Progress at 0.5
      (driver as any).setProgress(0.5);
      renderer['update']();
      expect(renderer.getCurrentState()!.t).toBe(0.5);
      
      // Progress at 1
      (driver as any).setProgress(1);
      renderer['update']();
      expect(renderer.getCurrentState()!.t).toBe(1);
      
      renderer.stop();
    });
    
    it('should handle different curve functions', () => {
      const driver = createMockDriver(0.5);
      
      // Test with sine curve
      const sineCurve = (t: number) => (Math.sin(t * 2 * Math.PI) + 1) / 2;
      const config = createTestConfig({ driver, curveFn: sineCurve });
      const renderer = new Renderer(config);
      
      renderer['update']();
      const state = renderer.getCurrentState();
      
      expect(state!.z).toBeCloseTo(sineCurve(0.5), 5);
    });
  });
  
  describe('Shadow Rendering', () => {
    it('should create radial gradient for shadow', () => {
      const canvas = createMockCanvasManager();
      const createRadialGradientSpy = vi.spyOn(canvas.context, 'createRadialGradient');
      const config = createTestConfig({ canvas });
      const renderer = new Renderer(config);
      
      renderer['update']();
      renderer['drawShadow'](renderer.getCurrentState()!);
      
      expect(createRadialGradientSpy).toHaveBeenCalled();
    });
    
    it('should skip drawing shadow with zero opacity', () => {
      const canvas = createMockCanvasManager();
      const shadowCalculator = createMockShadowCalculator();
      
      // Mock shadow with zero opacity
      shadowCalculator.compute = vi.fn(() => ({
        offsetX: 10,
        offsetY: 10,
        blur: 20,
        opacity: 0,
        scale: 0.8,
      }));
      
      const config = createTestConfig({ canvas, shadowCalculator });
      const renderer = new Renderer(config);
      
      const createRadialGradientSpy = vi.spyOn(canvas.context, 'createRadialGradient');
      
      renderer['update']();
      renderer['drawShadow'](renderer.getCurrentState()!);
      
      // Should not create gradient for invisible shadow
      expect(createRadialGradientSpy).not.toHaveBeenCalled();
    });
    
    it('should skip drawing shadow with zero radius', () => {
      const canvas = createMockCanvasManager();
      const shadowCalculator = createMockShadowCalculator();
      
      // Mock shadow with zero scale and blur
      shadowCalculator.compute = vi.fn(() => ({
        offsetX: 10,
        offsetY: 10,
        blur: 0,
        opacity: 0.3,
        scale: 0,
      }));
      
      const config = createTestConfig({ canvas, shadowCalculator });
      const renderer = new Renderer(config);
      
      const createRadialGradientSpy = vi.spyOn(canvas.context, 'createRadialGradient');
      
      renderer['update']();
      renderer['drawShadow'](renderer.getCurrentState()!);
      
      // Should not create gradient for zero-size shadow
      expect(createRadialGradientSpy).not.toHaveBeenCalled();
    });
    
    it('should apply shadow offset to ball position', () => {
      const canvas = createMockCanvasManager();
      const shadowCalculator = createMockShadowCalculator();
      
      // Mock specific shadow offset
      shadowCalculator.compute = vi.fn(() => ({
        offsetX: 50,
        offsetY: 30,
        blur: 20,
        opacity: 0.3,
        scale: 0.8,
      }));
      
      const config = createTestConfig({ canvas, shadowCalculator });
      const renderer = new Renderer(config);
      
      const createRadialGradientSpy = vi.spyOn(canvas.context, 'createRadialGradient');
      
      renderer['update']();
      const state = renderer.getCurrentState()!;
      
      // Verify the ball position conversion
      const ballCanvasPos = canvas.toCSSCoords(state.x, state.y);
      
      renderer['drawShadow'](state);
      
      // Shadow center should be ball position + offset
      const expectedShadowX = ballCanvasPos.x + 50;
      const expectedShadowY = ballCanvasPos.y + 30;
      
      expect(createRadialGradientSpy).toHaveBeenCalledWith(
        expectedShadowX, expectedShadowY, 0, // Inner circle
        expectedShadowX, expectedShadowY, expect.any(Number) // Outer circle
      );
    });
    
    it('should use fillRect with bounding box for efficient rendering', () => {
      const canvas = createMockCanvasManager();
      const fillRectSpy = vi.spyOn(canvas.context, 'fillRect');
      const config = createTestConfig({ canvas });
      const renderer = new Renderer(config);
      
      renderer['update']();
      renderer['drawShadow'](renderer.getCurrentState()!);
      
      expect(fillRectSpy).toHaveBeenCalled();
      
      // Verify bounding box is reasonable (centered around shadow position)
      const call = fillRectSpy.mock.calls[0];
      expect(call[2]).toBeGreaterThan(0); // width > 0
      expect(call[3]).toBeGreaterThan(0); // height > 0
    });
    
    it('should save and restore canvas context', () => {
      const canvas = createMockCanvasManager();
      const saveSpy = vi.spyOn(canvas.context, 'save');
      const restoreSpy = vi.spyOn(canvas.context, 'restore');
      const config = createTestConfig({ canvas });
      const renderer = new Renderer(config);
      
      renderer['update']();
      renderer['drawShadow'](renderer.getCurrentState()!);
      
      expect(saveSpy).toHaveBeenCalled();
      expect(restoreSpy).toHaveBeenCalled();
    });
  });
  
  describe('Ball Rendering', () => {
    it('should draw ball as a circle', () => {
      const canvas = createMockCanvasManager();
      const arcSpy = vi.spyOn(canvas.context, 'arc');
      const config = createTestConfig({ canvas });
      const renderer = new Renderer(config);
      
      renderer['update']();
      renderer['drawBall'](renderer.getCurrentState()!);
      
      expect(arcSpy).toHaveBeenCalled();
      
      // Verify arc is a full circle (0 to 2π)
      const call = arcSpy.mock.calls[0];
      expect(call[3]).toBe(0); // Start angle
      expect(call[4]).toBeCloseTo(Math.PI * 2, 5); // End angle
    });
    
    it('should apply fill color from ballStyle', () => {
      const canvas = createMockCanvasManager();
      const fillSpy = vi.spyOn(canvas.context, 'fill');
      
      // Spy on fillStyle setter to verify it was set
      let capturedFillStyle: string | undefined;
      Object.defineProperty(canvas.context, 'fillStyle', {
        set: (value) => { capturedFillStyle = value; },
        get: () => capturedFillStyle || '#000000',
        configurable: true,
      });
      
      const config = createTestConfig({
        canvas,
        ballStyle: {
          fill: '#ff0000',
          stroke: 'none',
          strokeWidth: 0,
          radiusAtGround: 20,
          radiusAtMax: 40,
        },
      });
      const renderer = new Renderer(config);
      
      renderer['update']();
      renderer['drawBall'](renderer.getCurrentState()!);
      
      expect(capturedFillStyle).toBe('#ff0000');
      expect(fillSpy).toHaveBeenCalled();
    });
    
    it('should not fill when fill is "none"', () => {
      const canvas = createMockCanvasManager();
      const fillSpy = vi.spyOn(canvas.context, 'fill');
      const config = createTestConfig({
        canvas,
        ballStyle: {
          fill: 'none',
          stroke: '#000000',
          strokeWidth: 2,
          radiusAtGround: 20,
          radiusAtMax: 40,
        },
      });
      const renderer = new Renderer(config);
      
      renderer['update']();
      renderer['drawBall'](renderer.getCurrentState()!);
      
      expect(fillSpy).not.toHaveBeenCalled();
    });
    
    it('should apply stroke when configured', () => {
      const canvas = createMockCanvasManager();
      const strokeSpy = vi.spyOn(canvas.context, 'stroke');
      
      // Spy on strokeStyle and lineWidth setters
      let capturedStrokeStyle: string | undefined;
      let capturedLineWidth: number | undefined;
      Object.defineProperty(canvas.context, 'strokeStyle', {
        set: (value) => { capturedStrokeStyle = value; },
        get: () => capturedStrokeStyle || '#000000',
        configurable: true,
      });
      Object.defineProperty(canvas.context, 'lineWidth', {
        set: (value) => { capturedLineWidth = value; },
        get: () => capturedLineWidth || 1,
        configurable: true,
      });
      
      const config = createTestConfig({
        canvas,
        ballStyle: {
          fill: '#3b82f6',
          stroke: '#1e40af',
          strokeWidth: 3,
          radiusAtGround: 20,
          radiusAtMax: 40,
        },
      });
      const renderer = new Renderer(config);
      
      renderer['update']();
      renderer['drawBall'](renderer.getCurrentState()!);
      
      expect(capturedStrokeStyle).toBe('#1e40af');
      expect(capturedLineWidth).toBe(3);
      expect(strokeSpy).toHaveBeenCalled();
    });
    
    it('should not stroke when stroke is "none"', () => {
      const canvas = createMockCanvasManager();
      const strokeSpy = vi.spyOn(canvas.context, 'stroke');
      const config = createTestConfig({
        canvas,
        ballStyle: {
          fill: '#3b82f6',
          stroke: 'none',
          strokeWidth: 0,
          radiusAtGround: 20,
          radiusAtMax: 40,
        },
      });
      const renderer = new Renderer(config);
      
      renderer['update']();
      renderer['drawBall'](renderer.getCurrentState()!);
      
      expect(strokeSpy).not.toHaveBeenCalled();
    });
    
    it('should not stroke when strokeWidth is 0', () => {
      const canvas = createMockCanvasManager();
      const strokeSpy = vi.spyOn(canvas.context, 'stroke');
      const config = createTestConfig({
        canvas,
        ballStyle: {
          fill: '#3b82f6',
          stroke: '#1e40af',
          strokeWidth: 0,
          radiusAtGround: 20,
          radiusAtMax: 40,
        },
      });
      const renderer = new Renderer(config);
      
      renderer['update']();
      renderer['drawBall'](renderer.getCurrentState()!);
      
      expect(strokeSpy).not.toHaveBeenCalled();
    });
    
    it('should use radius from ball state', () => {
      const canvas = createMockCanvasManager();
      const arcSpy = vi.spyOn(canvas.context, 'arc');
      const driver = createMockDriver(0.5);
      const config = createTestConfig({
        canvas,
        driver,
        ballStyle: {
          fill: '#3b82f6',
          stroke: 'none',
          strokeWidth: 0,
          radiusAtGround: 20,
          radiusAtMax: 40,
        },
      });
      const renderer = new Renderer(config);
      
      renderer['update']();
      const state = renderer.getCurrentState()!;
      renderer['drawBall'](state);
      
      // At progress 0.5, radius should be 30 (midpoint between 20 and 40)
      expect(state.radius).toBe(30);
      
      // Verify arc was called with correct radius
      const call = arcSpy.mock.calls[0];
      expect(call[2]).toBe(30); // Radius parameter
    });
    
    it('should position ball at correct canvas coordinates', () => {
      const canvas = createMockCanvasManager();
      const arcSpy = vi.spyOn(canvas.context, 'arc');
      const driver = createMockDriver(0.5);
      const config = createTestConfig({
        canvas,
        driver,
        pathX: (t) => 0.25, // Quarter from left
        pathY: (t) => 0.75, // Three quarters from top
      });
      const renderer = new Renderer(config);
      
      renderer['update']();
      const state = renderer.getCurrentState()!;
      
      // Verify state has correct world coordinates
      expect(state.x).toBe(0.25);
      expect(state.y).toBe(0.75);
      
      renderer['drawBall'](state);
      
      // Convert to canvas coordinates
      const expectedCanvasPos = canvas.toCSSCoords(0.25, 0.75);
      
      // Verify arc was called with correct position
      const call = arcSpy.mock.calls[0];
      expect(call[0]).toBe(expectedCanvasPos.x);
      expect(call[1]).toBe(expectedCanvasPos.y);
    });
    
    it('should save and restore canvas context', () => {
      const canvas = createMockCanvasManager();
      const saveSpy = vi.spyOn(canvas.context, 'save');
      const restoreSpy = vi.spyOn(canvas.context, 'restore');
      const config = createTestConfig({ canvas });
      const renderer = new Renderer(config);
      
      renderer['update']();
      renderer['drawBall'](renderer.getCurrentState()!);
      
      expect(saveSpy).toHaveBeenCalled();
      expect(restoreSpy).toHaveBeenCalled();
    });
  });
  
  describe('Debug Mode Rendering', () => {
    it('should draw debug overlay when debug is enabled', () => {
      const canvas = createMockCanvasManager();
      const config = createTestConfig({ canvas, debug: true });
      const renderer = new Renderer(config);
      
      const fillTextSpy = vi.spyOn(canvas.context, 'fillText');
      
      renderer['update']();
      renderer['draw']();
      
      // Should draw debug info text
      expect(fillTextSpy).toHaveBeenCalled();
    });
    
    it('should not draw debug overlay when debug is disabled', () => {
      const canvas = createMockCanvasManager();
      const config = createTestConfig({ canvas, debug: false });
      const renderer = new Renderer(config);
      
      const fillTextSpy = vi.spyOn(canvas.context, 'fillText');
      
      renderer['update']();
      renderer['draw']();
      
      // Should not draw debug info
      expect(fillTextSpy).not.toHaveBeenCalled();
    });
    
    it('should draw light source position', () => {
      const canvas = createMockCanvasManager();
      const light: LightSource = { x: 0.75, y: 0.25, z: 2.0 };
      const config = createTestConfig({ canvas, light, debug: true });
      const renderer = new Renderer(config);
      
      const arcSpy = vi.spyOn(canvas.context, 'arc');
      
      renderer['update']();
      renderer['drawDebug'](renderer.getCurrentState()!);
      
      // Should draw light position circle
      const lightCanvasPos = canvas.toCSSCoords(light.x, light.y);
      expect(arcSpy).toHaveBeenCalledWith(
        lightCanvasPos.x,
        lightCanvasPos.y,
        10, // Light indicator radius
        0,
        Math.PI * 2
      );
    });
    
    it('should draw interactive zones', () => {
      const canvas = createMockCanvasManager();
      const zones: InteractiveZone[] = [
        {
          id: 'test-zone',
          shape: 'circle',
          bounds: { x: 0.5, y: 0.5, radius: 0.2 },
        },
      ];
      const config = createTestConfig({ canvas, zones, debug: true });
      const renderer = new Renderer(config);
      
      const arcSpy = vi.spyOn(canvas.context, 'arc');
      
      renderer['update']();
      renderer['drawDebug'](renderer.getCurrentState()!);
      
      // Should draw zone circle (in addition to light circle)
      expect(arcSpy.mock.calls.length).toBeGreaterThan(1);
    });
    
    it('should draw rectangular zones', () => {
      const canvas = createMockCanvasManager();
      const zones: InteractiveZone[] = [
        {
          id: 'rect-zone',
          shape: 'rect',
          bounds: { x: 0.2, y: 0.3, width: 0.4, height: 0.3 },
        },
      ];
      const config = createTestConfig({ canvas, zones, debug: true });
      const renderer = new Renderer(config);
      
      const strokeRectSpy = vi.spyOn(canvas.context, 'strokeRect');
      
      renderer['update']();
      renderer['drawDebug'](renderer.getCurrentState()!);
      
      expect(strokeRectSpy).toHaveBeenCalled();
    });
    
    it('should display progress information', () => {
      const canvas = createMockCanvasManager();
      const driver = createMockDriver(0.75);
      const config = createTestConfig({ canvas, driver, debug: true });
      const renderer = new Renderer(config);
      
      const fillTextSpy = vi.spyOn(canvas.context, 'fillText');
      
      renderer['update']();
      renderer['drawDebug'](renderer.getCurrentState()!);
      
      // Should display progress percentage
      const progressCall = fillTextSpy.mock.calls.find(call => 
        call[0].toString().includes('Progress')
      );
      expect(progressCall).toBeDefined();
      expect(progressCall![0]).toContain('75.0%');
    });
    
    it('should display Z height information', () => {
      const canvas = createMockCanvasManager();
      const driver = createMockDriver(0.5);
      const config = createTestConfig({ canvas, driver, debug: true });
      const renderer = new Renderer(config);
      
      const fillTextSpy = vi.spyOn(canvas.context, 'fillText');
      
      renderer['update']();
      renderer['drawDebug'](renderer.getCurrentState()!);
      
      // Should display Z height
      const zHeightCall = fillTextSpy.mock.calls.find(call => 
        call[0].toString().includes('Z Height')
      );
      expect(zHeightCall).toBeDefined();
    });
    
    it('should display FPS information', () => {
      const canvas = createMockCanvasManager();
      const config = createTestConfig({ canvas, debug: true });
      const renderer = new Renderer(config);
      
      const fillTextSpy = vi.spyOn(canvas.context, 'fillText');
      
      renderer['update']();
      renderer['drawDebug'](renderer.getCurrentState()!);
      
      // Should display FPS
      const fpsCall = fillTextSpy.mock.calls.find(call => 
        call[0].toString().includes('FPS')
      );
      expect(fpsCall).toBeDefined();
    });
    
    it('should draw ball position crosshair', () => {
      const canvas = createMockCanvasManager();
      const config = createTestConfig({ canvas, debug: true });
      const renderer = new Renderer(config);
      
      const moveToSpy = vi.spyOn(canvas.context, 'moveTo');
      const lineToSpy = vi.spyOn(canvas.context, 'lineTo');
      
      renderer['update']();
      renderer['drawDebug'](renderer.getCurrentState()!);
      
      // Should draw crosshair lines
      expect(moveToSpy).toHaveBeenCalled();
      expect(lineToSpy).toHaveBeenCalled();
    });
    
    it('should save and restore canvas context', () => {
      const canvas = createMockCanvasManager();
      const config = createTestConfig({ canvas, debug: true });
      const renderer = new Renderer(config);
      
      const saveSpy = vi.spyOn(canvas.context, 'save');
      const restoreSpy = vi.spyOn(canvas.context, 'restore');
      
      renderer['update']();
      renderer['drawDebug'](renderer.getCurrentState()!);
      
      expect(saveSpy).toHaveBeenCalled();
      expect(restoreSpy).toHaveBeenCalled();
    });
  });
});
