/**
 * Integration tests for the main API (createBallAnimation)
 * 
 * These tests verify that all modules work together correctly
 * and that the AnimationInstance provides the expected control methods.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createBallAnimation } from '../src/index';
import type { AnimationConfig } from '../src/types';

describe('createBallAnimation', () => {
  let container: HTMLElement;

  beforeEach(() => {
    // Create a container element for mounting
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);
    
    // Use fake timers for time-based tests
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Clean up
    if (container.parentElement) {
      document.body.removeChild(container);
    }
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Initialization', () => {
    it('should create an animation instance with time driver', () => {
      const config: AnimationConfig = {
        mount: container,
        driver: 'time',
        durationMs: 1000,
        light: { x: 0.5, y: 0.5, z: 2.0 },
      };

      const animation = createBallAnimation(config);

      expect(animation).toBeDefined();
      expect(animation.play).toBeInstanceOf(Function);
      expect(animation.pause).toBeInstanceOf(Function);
      expect(animation.stop).toBeInstanceOf(Function);
      expect(animation.setProgress).toBeInstanceOf(Function);
      expect(animation.updateConfig).toBeInstanceOf(Function);
      expect(animation.destroy).toBeInstanceOf(Function);

      animation.destroy();
    });

    it('should create an animation instance with scroll driver', () => {
      const scrollContainer = document.createElement('div');
      scrollContainer.style.height = '1000px';
      scrollContainer.style.overflow = 'auto';
      document.body.appendChild(scrollContainer);

      const config: AnimationConfig = {
        mount: container,
        driver: 'scroll',
        scrollTarget: scrollContainer,
        light: { x: 0.5, y: 0.5, z: 2.0 },
      };

      const animation = createBallAnimation(config);

      expect(animation).toBeDefined();

      animation.destroy();
      document.body.removeChild(scrollContainer);
    });

    it('should create canvas element in mount container', () => {
      const config: AnimationConfig = {
        mount: container,
        driver: 'time',
        durationMs: 1000,
        light: { x: 0.5, y: 0.5, z: 2.0 },
      };

      const animation = createBallAnimation(config);

      const canvas = container.querySelector('canvas');
      expect(canvas).toBeDefined();
      expect(canvas).toBeInstanceOf(HTMLCanvasElement);

      animation.destroy();
    });

    it('should apply default configuration values', () => {
      const config: AnimationConfig = {
        mount: container,
        driver: 'time',
        durationMs: 1000,
        light: { x: 0.5, y: 0.5, z: 2.0 },
      };

      const animation = createBallAnimation(config);

      // Animation should work with defaults
      expect(() => animation.play()).not.toThrow();

      animation.destroy();
    });

    it('should throw error for invalid configuration', () => {
      const invalidConfig = {
        // Missing required fields
        driver: 'time',
      } as any;

      expect(() => createBallAnimation(invalidConfig)).toThrow();
    });

    it('should throw error for time driver without durationMs', () => {
      const config = {
        mount: container,
        driver: 'time',
        light: { x: 0.5, y: 0.5, z: 2.0 },
      } as any;

      expect(() => createBallAnimation(config)).toThrow(/durationMs/);
    });

    it('should throw error for scroll driver without scrollTarget', () => {
      const config = {
        mount: container,
        driver: 'scroll',
        light: { x: 0.5, y: 0.5, z: 2.0 },
      } as any;

      expect(() => createBallAnimation(config)).toThrow(/scrollTarget/);
    });
  });

  describe('Control Methods', () => {
    it('should start animation when play() is called', () => {
      const config: AnimationConfig = {
        mount: container,
        driver: 'time',
        durationMs: 1000,
        light: { x: 0.5, y: 0.5, z: 2.0 },
      };

      const animation = createBallAnimation(config);

      expect(() => animation.play()).not.toThrow();

      animation.destroy();
    });

    it('should pause animation when pause() is called', () => {
      const config: AnimationConfig = {
        mount: container,
        driver: 'time',
        durationMs: 1000,
        light: { x: 0.5, y: 0.5, z: 2.0 },
      };

      const animation = createBallAnimation(config);
      animation.play();

      expect(() => animation.pause()).not.toThrow();

      animation.destroy();
    });

    it('should stop animation when stop() is called', () => {
      const config: AnimationConfig = {
        mount: container,
        driver: 'time',
        durationMs: 1000,
        light: { x: 0.5, y: 0.5, z: 2.0 },
      };

      const animation = createBallAnimation(config);
      animation.play();

      expect(() => animation.stop()).not.toThrow();

      animation.destroy();
    });

    it('should handle destroy() being called multiple times', () => {
      const config: AnimationConfig = {
        mount: container,
        driver: 'time',
        durationMs: 1000,
        light: { x: 0.5, y: 0.5, z: 2.0 },
      };

      const animation = createBallAnimation(config);

      expect(() => {
        animation.destroy();
        animation.destroy();
        animation.destroy();
      }).not.toThrow();
    });

    it('should warn when calling methods after destroy', () => {
      const config: AnimationConfig = {
        mount: container,
        driver: 'time',
        durationMs: 1000,
        light: { x: 0.5, y: 0.5, z: 2.0 },
      };

      const animation = createBallAnimation(config);
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      animation.destroy();
      animation.play();

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Cannot play: animation has been destroyed')
      );

      warnSpy.mockRestore();
    });

    it('should clean up canvas when destroyed', () => {
      const config: AnimationConfig = {
        mount: container,
        driver: 'time',
        durationMs: 1000,
        light: { x: 0.5, y: 0.5, z: 2.0 },
      };

      const animation = createBallAnimation(config);

      const canvas = container.querySelector('canvas');
      expect(canvas).toBeDefined();

      animation.destroy();

      const canvasAfterDestroy = container.querySelector('canvas');
      expect(canvasAfterDestroy).toBeNull();
    });
  });

  describe('Curve Configuration', () => {
    it('should use preset curve when curvePreset is specified', () => {
      const config: AnimationConfig = {
        mount: container,
        driver: 'time',
        durationMs: 1000,
        curvePreset: 'sine',
        light: { x: 0.5, y: 0.5, z: 2.0 },
      };

      const animation = createBallAnimation(config);
      animation.play();

      expect(() => animation.play()).not.toThrow();

      animation.destroy();
    });

    it('should use custom curve when customCurve is specified', () => {
      const customCurve = (t: number) => t * t; // Quadratic curve

      const config: AnimationConfig = {
        mount: container,
        driver: 'time',
        durationMs: 1000,
        customCurve,
        light: { x: 0.5, y: 0.5, z: 2.0 },
      };

      const animation = createBallAnimation(config);
      animation.play();

      expect(() => animation.play()).not.toThrow();

      animation.destroy();
    });

    it('should use keypoints when keypoints are specified', () => {
      const config: AnimationConfig = {
        mount: container,
        driver: 'time',
        durationMs: 1000,
        keypoints: [
          { y: 0.0, zMin: 0.0, zMax: 0.2 },
          { y: 0.5, zMin: 0.8, zMax: 1.0 },
          { y: 1.0, zMin: 0.0, zMax: 0.2 },
        ],
        light: { x: 0.5, y: 0.5, z: 2.0 },
      };

      const animation = createBallAnimation(config);
      animation.play();

      expect(() => animation.play()).not.toThrow();

      animation.destroy();
    });
  });

  describe('Interactive Zones', () => {
    it('should create animation with interactive zones', () => {
      const onEnter = vi.fn();
      const onExit = vi.fn();
      const onClick = vi.fn();

      const config: AnimationConfig = {
        mount: container,
        driver: 'time',
        durationMs: 1000,
        light: { x: 0.5, y: 0.5, z: 2.0 },
        zones: [
          {
            id: 'test-zone',
            shape: 'circle',
            bounds: { x: 0.5, y: 0.5, radius: 0.2 },
            onEnter,
            onExit,
            onClick,
          },
        ],
      };

      const animation = createBallAnimation(config);

      expect(() => animation.play()).not.toThrow();

      animation.destroy();
    });
  });

  describe('Debug Mode', () => {
    it('should enable debug mode when debug is true', () => {
      const config: AnimationConfig = {
        mount: container,
        driver: 'time',
        durationMs: 1000,
        light: { x: 0.5, y: 0.5, z: 2.0 },
        debug: true,
      };

      const animation = createBallAnimation(config);
      animation.play();

      expect(() => animation.play()).not.toThrow();

      animation.destroy();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom ball styling', () => {
      const config: AnimationConfig = {
        mount: container,
        driver: 'time',
        durationMs: 1000,
        light: { x: 0.5, y: 0.5, z: 2.0 },
        ballStyle: {
          fill: '#ff0000',
          stroke: '#000000',
          strokeWidth: 2,
          radiusAtGround: 30,
          radiusAtMax: 60,
        },
      };

      const animation = createBallAnimation(config);
      animation.play();

      expect(() => animation.play()).not.toThrow();

      animation.destroy();
    });

    it('should apply custom shadow options', () => {
      const config: AnimationConfig = {
        mount: container,
        driver: 'time',
        durationMs: 1000,
        light: { x: 0.5, y: 0.5, z: 2.0 },
        shadow: {
          softness: 0.8,
          opacityAtGround: 0.5,
          minScale: 0.2,
        },
      };

      const animation = createBallAnimation(config);
      animation.play();

      expect(() => animation.play()).not.toThrow();

      animation.destroy();
    });
  });

  describe('Path Functions', () => {
    it('should use custom path functions', () => {
      const config: AnimationConfig = {
        mount: container,
        driver: 'time',
        durationMs: 1000,
        light: { x: 0.5, y: 0.5, z: 2.0 },
        pathX: (t) => 0.2 + t * 0.6, // Move from left to right
        pathY: (t) => 0.5, // Stay centered vertically
      };

      const animation = createBallAnimation(config);
      animation.play();

      expect(() => animation.play()).not.toThrow();

      animation.destroy();
    });
  });

  describe('setProgress Method', () => {
    it('should set progress to a specific value', () => {
      const config: AnimationConfig = {
        mount: container,
        driver: 'time',
        durationMs: 1000,
        light: { x: 0.5, y: 0.5, z: 2.0 },
      };

      const animation = createBallAnimation(config);

      expect(() => animation.setProgress(0.5)).not.toThrow();

      animation.destroy();
    });

    it('should clamp progress values to [0,1]', () => {
      const config: AnimationConfig = {
        mount: container,
        driver: 'time',
        durationMs: 1000,
        light: { x: 0.5, y: 0.5, z: 2.0 },
      };

      const animation = createBallAnimation(config);
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      animation.setProgress(1.5);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('out of range')
      );

      animation.setProgress(-0.5);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('out of range')
      );

      warnSpy.mockRestore();
      animation.destroy();
    });
  });

  describe('updateConfig Method', () => {
    it('should update debug mode', () => {
      const config: AnimationConfig = {
        mount: container,
        driver: 'time',
        durationMs: 1000,
        light: { x: 0.5, y: 0.5, z: 2.0 },
        debug: false,
      };

      const animation = createBallAnimation(config);

      expect(() => animation.updateConfig({ debug: true })).not.toThrow();

      animation.destroy();
    });

    it('should update light position', () => {
      const config: AnimationConfig = {
        mount: container,
        driver: 'time',
        durationMs: 1000,
        light: { x: 0.5, y: 0.5, z: 2.0 },
      };

      const animation = createBallAnimation(config);

      expect(() => animation.updateConfig({
        light: { x: 0.7, y: 0.3, z: 3.0 }
      })).not.toThrow();

      animation.destroy();
    });

    it('should update shadow options', () => {
      const config: AnimationConfig = {
        mount: container,
        driver: 'time',
        durationMs: 1000,
        light: { x: 0.5, y: 0.5, z: 2.0 },
      };

      const animation = createBallAnimation(config);

      expect(() => animation.updateConfig({
        shadow: { softness: 0.9, opacityAtGround: 0.6 }
      })).not.toThrow();

      animation.destroy();
    });

    it('should update ball style', () => {
      const config: AnimationConfig = {
        mount: container,
        driver: 'time',
        durationMs: 1000,
        light: { x: 0.5, y: 0.5, z: 2.0 },
      };

      const animation = createBallAnimation(config);

      expect(() => animation.updateConfig({
        ballStyle: { fill: '#00ff00', radiusAtGround: 25 }
      })).not.toThrow();

      animation.destroy();
    });

    it('should update zones', () => {
      const config: AnimationConfig = {
        mount: container,
        driver: 'time',
        durationMs: 1000,
        light: { x: 0.5, y: 0.5, z: 2.0 },
        zones: [
          {
            id: 'zone1',
            shape: 'circle',
            bounds: { x: 0.5, y: 0.5, radius: 0.2 },
          },
        ],
      };

      const animation = createBallAnimation(config);

      expect(() => animation.updateConfig({
        zones: [
          {
            id: 'zone2',
            shape: 'rect',
            bounds: { x: 0.3, y: 0.3, width: 0.4, height: 0.4 },
          },
        ],
      })).not.toThrow();

      animation.destroy();
    });

    it('should warn when trying to update non-updatable properties', () => {
      const config: AnimationConfig = {
        mount: container,
        driver: 'time',
        durationMs: 1000,
        light: { x: 0.5, y: 0.5, z: 2.0 },
      };

      const animation = createBallAnimation(config);
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      animation.updateConfig({ durationMs: 2000 } as any);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('cannot be updated at runtime')
      );

      warnSpy.mockRestore();
      animation.destroy();
    });
  });
});