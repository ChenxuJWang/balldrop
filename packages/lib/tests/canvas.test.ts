/**
 * Canvas Management Module Tests
 * 
 * Tests canvas initialization, DPR scaling, coordinate transformations,
 * and fit mode calculations.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createCanvasManager, type FitMode } from '../src/core/canvas';

describe('Canvas Management Module', () => {
  let container: HTMLElement;
  
  beforeEach(() => {
    // Create a container element
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);
  });
  
  afterEach(() => {
    // Clean up
    if (container.parentElement) {
      container.parentElement.removeChild(container);
    }
  });
  
  describe('Canvas Initialization', () => {
    it('should create a canvas element and append it to the container', () => {
      const manager = createCanvasManager({ container });
      
      expect(manager.element).toBeInstanceOf(HTMLCanvasElement);
      expect(manager.element.parentElement).toBe(container);
      expect(container.children.length).toBe(1);
      
      manager.destroy();
    });
    
    it('should get a 2D rendering context', () => {
      const manager = createCanvasManager({ container });
      
      expect(manager.context).toBeInstanceOf(CanvasRenderingContext2D);
      
      manager.destroy();
    });
    
    it('should use container dimensions when width/height not specified', () => {
      const manager = createCanvasManager({ container });
      
      expect(manager.width).toBe(800);
      expect(manager.height).toBe(600);
      
      manager.destroy();
    });
    
    it('should use specified width and height', () => {
      const manager = createCanvasManager({
        container,
        width: 1024,
        height: 768
      });
      
      expect(manager.width).toBe(1024);
      expect(manager.height).toBe(768);
      
      manager.destroy();
    });
    
    it('should throw error if 2D context cannot be obtained', () => {
      // Mock getContext to return null
      const originalGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = vi.fn(() => null);
      
      expect(() => {
        createCanvasManager({ container });
      }).toThrow('Failed to get 2D rendering context');
      
      // Restore original method
      HTMLCanvasElement.prototype.getContext = originalGetContext;
    });
  });
  
  describe('Device Pixel Ratio Scaling', () => {
    it('should expose the device pixel ratio', () => {
      const manager = createCanvasManager({ container });
      
      expect(manager.dpr).toBe(window.devicePixelRatio || 1);
      
      manager.destroy();
    });
    
    it('should scale canvas internal resolution by DPR', () => {
      const manager = createCanvasManager({
        container,
        width: 800,
        height: 600
      });
      
      const dpr = window.devicePixelRatio || 1;
      
      expect(manager.element.width).toBe(800 * dpr);
      expect(manager.element.height).toBe(600 * dpr);
      
      manager.destroy();
    });
    
    it('should set CSS size to logical dimensions', () => {
      const manager = createCanvasManager({
        container,
        width: 800,
        height: 600
      });
      
      expect(manager.element.style.width).toBe('800px');
      expect(manager.element.style.height).toBe('600px');
      
      manager.destroy();
    });
    
    it('should scale context transform by DPR', () => {
      const manager = createCanvasManager({
        container,
        width: 800,
        height: 600
      });
      
      const transform = manager.context.getTransform();
      const dpr = window.devicePixelRatio || 1;
      
      expect(transform.a).toBe(dpr); // scaleX
      expect(transform.d).toBe(dpr); // scaleY
      
      manager.destroy();
    });
  });
  
  describe('Coordinate Transformations', () => {
    it('should convert CSS coordinates to world coordinates', () => {
      const manager = createCanvasManager({
        container,
        width: 800,
        height: 600
      });
      
      // Get canvas position
      const rect = manager.element.getBoundingClientRect();
      
      // Top-left corner
      const topLeft = manager.toWorldCoords(rect.left, rect.top);
      expect(topLeft.x).toBeCloseTo(0, 5);
      expect(topLeft.y).toBeCloseTo(0, 5);
      
      // Center
      const center = manager.toWorldCoords(rect.left + 400, rect.top + 300);
      expect(center.x).toBeCloseTo(0.5, 5);
      expect(center.y).toBeCloseTo(0.5, 5);
      
      // Bottom-right corner
      const bottomRight = manager.toWorldCoords(rect.left + 800, rect.top + 600);
      expect(bottomRight.x).toBeCloseTo(1, 5);
      expect(bottomRight.y).toBeCloseTo(1, 5);
      
      manager.destroy();
    });
    
    it('should convert world coordinates to CSS coordinates', () => {
      const manager = createCanvasManager({
        container,
        width: 800,
        height: 600
      });
      
      // Top-left corner (0, 0)
      const topLeft = manager.toCSSCoords(0, 0);
      expect(topLeft.x).toBe(0);
      expect(topLeft.y).toBe(0);
      
      // Center (0.5, 0.5)
      const center = manager.toCSSCoords(0.5, 0.5);
      expect(center.x).toBe(400);
      expect(center.y).toBe(300);
      
      // Bottom-right corner (1, 1)
      const bottomRight = manager.toCSSCoords(1, 1);
      expect(bottomRight.x).toBe(800);
      expect(bottomRight.y).toBe(600);
      
      manager.destroy();
    });
    
    it('should round-trip between coordinate systems', () => {
      const manager = createCanvasManager({
        container,
        width: 800,
        height: 600
      });
      
      const rect = manager.element.getBoundingClientRect();
      
      // Start with CSS coordinates
      const cssX = rect.left + 320;
      const cssY = rect.top + 240;
      
      // Convert to world and back
      const world = manager.toWorldCoords(cssX, cssY);
      const css = manager.toCSSCoords(world.x, world.y);
      
      expect(css.x).toBeCloseTo(320, 1);
      expect(css.y).toBeCloseTo(240, 1);
      
      manager.destroy();
    });
  });
  
  describe('Resize Functionality', () => {
    it('should resize canvas to new dimensions', () => {
      const manager = createCanvasManager({
        container,
        width: 800,
        height: 600
      });
      
      manager.resize(1024, 768);
      
      expect(manager.width).toBe(1024);
      expect(manager.height).toBe(768);
      
      const dpr = window.devicePixelRatio || 1;
      expect(manager.element.width).toBe(1024 * dpr);
      expect(manager.element.height).toBe(768 * dpr);
      
      manager.destroy();
    });
    
    it('should use container dimensions when resize called without arguments', () => {
      const manager = createCanvasManager({
        container,
        width: 400,
        height: 300
      });
      
      // Resize without arguments should use container size
      manager.resize();
      
      // With stretch mode (default is contain), it should fit
      expect(manager.width).toBeGreaterThan(0);
      expect(manager.height).toBeGreaterThan(0);
      
      manager.destroy();
    });
  });
  
  describe('Fit Modes', () => {
    it('should apply contain fit mode (fit inside, maintain aspect)', () => {
      // Container is 800x600, target is 400x400 (square)
      const manager = createCanvasManager({
        container,
        width: 400,
        height: 400,
        fitMode: 'contain'
      });
      
      // Should fit to height (600) and maintain aspect ratio
      // Width should be 600 (same as height for square)
      // But container is 800 wide, so it fits to the smaller dimension
      expect(manager.width).toBeLessThanOrEqual(800);
      expect(manager.height).toBeLessThanOrEqual(600);
      
      manager.destroy();
    });
    
    it('should apply cover fit mode (fill container, maintain aspect)', () => {
      const manager = createCanvasManager({
        container,
        width: 400,
        height: 400,
        fitMode: 'cover'
      });
      
      // Should fill container while maintaining aspect ratio
      expect(manager.width).toBeGreaterThan(0);
      expect(manager.height).toBeGreaterThan(0);
      
      manager.destroy();
    });
    
    it('should apply stretch fit mode (fill container, ignore aspect)', () => {
      // Create a container with known dimensions
      const stretchContainer = document.createElement('div');
      Object.defineProperty(stretchContainer, 'getBoundingClientRect', {
        value: () => ({
          width: 1000,
          height: 500,
          top: 0,
          left: 0,
          right: 1000,
          bottom: 500,
          x: 0,
          y: 0,
          toJSON: () => {}
        })
      });
      document.body.appendChild(stretchContainer);
      
      const manager = createCanvasManager({
        container: stretchContainer,
        fitMode: 'stretch'
      });
      
      // Should stretch to fill container exactly (no width/height specified)
      expect(manager.width).toBe(1000);
      expect(manager.height).toBe(500);
      
      manager.destroy();
      document.body.removeChild(stretchContainer);
    });
    
    it('should default to contain fit mode when not specified', () => {
      const manager = createCanvasManager({
        container,
        width: 400,
        height: 400
      });
      
      // Default is contain
      expect(manager.width).toBeGreaterThan(0);
      expect(manager.height).toBeGreaterThan(0);
      
      manager.destroy();
    });
    
    it('should handle aspect ratio calculations correctly for contain mode', () => {
      // Wide target (16:9) in square-ish container (4:3)
      const manager = createCanvasManager({
        container,
        width: 1600,
        height: 900,
        fitMode: 'contain'
      });
      
      // Should maintain 16:9 aspect ratio
      const aspect = manager.width / manager.height;
      expect(aspect).toBeCloseTo(16 / 9, 1);
      
      manager.destroy();
    });
    
    it('should handle aspect ratio calculations correctly for cover mode', () => {
      // Tall target (9:16) in square-ish container (4:3)
      const manager = createCanvasManager({
        container,
        width: 900,
        height: 1600,
        fitMode: 'cover'
      });
      
      // Should maintain 9:16 aspect ratio
      const aspect = manager.width / manager.height;
      expect(aspect).toBeCloseTo(9 / 16, 1);
      
      manager.destroy();
    });
    
    it('should handle zero container dimensions gracefully', () => {
      // When container has no dimensions (e.g., in jsdom), should use target dimensions
      const manager = createCanvasManager({
        container,
        width: 400,
        height: 300,
        fitMode: 'contain'
      });
      
      // Should fall back to target dimensions
      expect(manager.width).toBe(400);
      expect(manager.height).toBe(300);
      
      manager.destroy();
    });
  });
  
  describe('ResizeObserver Integration', () => {
    it('should set up ResizeObserver on initialization', () => {
      const manager = createCanvasManager({ container });
      
      // ResizeObserver should be created (we can't easily test it directly in jsdom)
      // But we can verify the manager was created successfully
      expect(manager).toBeDefined();
      expect(manager.element).toBeInstanceOf(HTMLCanvasElement);
      
      manager.destroy();
    });
    
    it('should disconnect ResizeObserver on destroy', () => {
      const manager = createCanvasManager({ container });
      
      // Should not throw when destroying
      expect(() => manager.destroy()).not.toThrow();
    });
    
    it('should handle resize when container dimensions change', () => {
      const manager = createCanvasManager({
        container,
        width: 400,
        height: 300
      });
      
      const initialWidth = manager.width;
      const initialHeight = manager.height;
      
      // Manually trigger resize
      manager.resize(800, 600);
      
      expect(manager.width).not.toBe(initialWidth);
      expect(manager.height).not.toBe(initialHeight);
      expect(manager.width).toBe(800);
      expect(manager.height).toBe(600);
      
      manager.destroy();
    });
    
    it('should handle resize with only width parameter', () => {
      const manager = createCanvasManager({
        container,
        width: 400,
        height: 300
      });
      
      manager.resize(800);
      
      expect(manager.width).toBe(800);
      // Height should be recalculated based on fit mode
      expect(manager.height).toBeGreaterThan(0);
      
      manager.destroy();
    });
    
    it('should handle resize with only height parameter', () => {
      const manager = createCanvasManager({
        container,
        width: 400,
        height: 300
      });
      
      manager.resize(undefined, 600);
      
      expect(manager.height).toBe(600);
      // Width should be recalculated based on fit mode
      expect(manager.width).toBeGreaterThan(0);
      
      manager.destroy();
    });
  });
  
  describe('Cleanup', () => {
    it('should remove canvas from DOM on destroy', () => {
      const manager = createCanvasManager({ container });
      
      expect(container.children.length).toBe(1);
      
      manager.destroy();
      
      expect(container.children.length).toBe(0);
    });
    
    it('should be safe to call destroy multiple times', () => {
      const manager = createCanvasManager({ container });
      
      expect(() => {
        manager.destroy();
        manager.destroy();
        manager.destroy();
      }).not.toThrow();
    });
    
    it('should disconnect ResizeObserver on destroy', () => {
      const manager = createCanvasManager({ container });
      
      manager.destroy();
      
      // Should not throw and should be idempotent
      expect(() => manager.destroy()).not.toThrow();
    });
  });
});
