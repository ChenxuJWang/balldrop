/**
 * Test Helper Utilities Tests
 * 
 * Verifies that test helper functions work correctly.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  createMockCanvas,
  createMockContainer,
  createMockConfig,
  createMockLight,
  createMockShadowOptions,
  createMockBallStyle,
  mockScrollPosition,
  createMockMouseEvent,
  createMockRect,
  mockElementRect,
  cleanupContainer,
} from './test-helpers';

describe('Test Helper Utilities', () => {
  describe('createMockCanvas', () => {
    it('should create a canvas with default dimensions', () => {
      const canvas = createMockCanvas();
      
      expect(canvas).toBeInstanceOf(HTMLCanvasElement);
      expect(canvas.width).toBe(800);
      expect(canvas.height).toBe(600);
    });
    
    it('should create a canvas with custom dimensions', () => {
      const canvas = createMockCanvas(1024, 768);
      
      expect(canvas.width).toBe(1024);
      expect(canvas.height).toBe(768);
    });
  });
  
  describe('createMockContainer', () => {
    let container: HTMLElement;
    
    afterEach(() => {
      if (container) {
        cleanupContainer(container);
      }
    });
    
    it('should create a container with default dimensions', () => {
      container = createMockContainer();
      
      expect(container).toBeInstanceOf(HTMLElement);
      expect(container.style.width).toBe('800px');
      expect(container.style.height).toBe('600px');
      expect(document.body.contains(container)).toBe(true);
    });
    
    it('should create a container with custom dimensions', () => {
      container = createMockContainer(1024, 768);
      
      expect(container.style.width).toBe('1024px');
      expect(container.style.height).toBe('768px');
    });
  });
  
  describe('createMockConfig', () => {
    let config: ReturnType<typeof createMockConfig>;
    
    afterEach(() => {
      if (config?.mount) {
        cleanupContainer(config.mount as HTMLElement);
      }
    });
    
    it('should create a valid default config', () => {
      config = createMockConfig();
      
      expect(config.mount).toBeInstanceOf(HTMLElement);
      expect(config.driver).toBe('time');
      expect(config.durationMs).toBe(1000);
      expect(config.curvePreset).toBe('linear');
      expect(config.light).toEqual({ x: 0.5, y: 0.5, z: 2.0 });
    });
    
    it('should merge overrides with defaults', () => {
      config = createMockConfig({
        driver: 'scroll',
        scrollTarget: document.body,
        curvePreset: 'sine',
      });
      
      expect(config.driver).toBe('scroll');
      expect(config.scrollTarget).toBe(document.body);
      expect(config.curvePreset).toBe('sine');
      expect(config.light).toEqual({ x: 0.5, y: 0.5, z: 2.0 }); // default preserved
    });
  });
  
  describe('createMockLight', () => {
    it('should create a default light source', () => {
      const light = createMockLight();
      
      expect(light).toEqual({ x: 0.5, y: 0.5, z: 2.0 });
    });
    
    it('should merge overrides', () => {
      const light = createMockLight({ x: 0.75, z: 3.0 });
      
      expect(light).toEqual({ x: 0.75, y: 0.5, z: 3.0 });
    });
  });
  
  describe('createMockShadowOptions', () => {
    it('should create default shadow options', () => {
      const options = createMockShadowOptions();
      
      expect(options).toEqual({
        softness: 0.5,
        opacityAtGround: 0.3,
        minScale: 0.5,
      });
    });
    
    it('should merge overrides', () => {
      const options = createMockShadowOptions({ softness: 0.8 });
      
      expect(options.softness).toBe(0.8);
      expect(options.opacityAtGround).toBe(0.3);
    });
  });
  
  describe('createMockBallStyle', () => {
    it('should create default ball style', () => {
      const style = createMockBallStyle();
      
      expect(style).toEqual({
        fill: '#3b82f6',
        stroke: '#1e40af',
        strokeWidth: 2,
      });
    });
    
    it('should merge overrides', () => {
      const style = createMockBallStyle({ fill: '#ff0000' });
      
      expect(style.fill).toBe('#ff0000');
      expect(style.stroke).toBe('#1e40af');
    });
  });
  
  describe('mockScrollPosition', () => {
    it('should set scroll properties on element', () => {
      const element = document.createElement('div');
      
      mockScrollPosition(element, 100, 1000, 600);
      
      expect(element.scrollTop).toBe(100);
      expect(element.scrollHeight).toBe(1000);
      expect(element.clientHeight).toBe(600);
    });
    
    it('should use default clientHeight', () => {
      const element = document.createElement('div');
      
      mockScrollPosition(element, 50, 500);
      
      expect(element.clientHeight).toBe(600);
    });
  });
  
  describe('createMockMouseEvent', () => {
    it('should create a mouse event with coordinates', () => {
      const event = createMockMouseEvent('click', 100, 200);
      
      expect(event).toBeInstanceOf(MouseEvent);
      expect(event.type).toBe('click');
      expect(event.clientX).toBe(100);
      expect(event.clientY).toBe(200);
      expect(event.bubbles).toBe(true);
      expect(event.cancelable).toBe(true);
    });
  });
  
  describe('createMockRect', () => {
    it('should create a DOMRect with default values', () => {
      const rect = createMockRect();
      
      expect(rect.x).toBe(0);
      expect(rect.y).toBe(0);
      expect(rect.width).toBe(800);
      expect(rect.height).toBe(600);
      expect(rect.left).toBe(0);
      expect(rect.top).toBe(0);
      expect(rect.right).toBe(800);
      expect(rect.bottom).toBe(600);
    });
    
    it('should create a DOMRect with custom values', () => {
      const rect = createMockRect(10, 20, 300, 400);
      
      expect(rect.x).toBe(10);
      expect(rect.y).toBe(20);
      expect(rect.width).toBe(300);
      expect(rect.height).toBe(400);
      expect(rect.left).toBe(10);
      expect(rect.top).toBe(20);
      expect(rect.right).toBe(310);
      expect(rect.bottom).toBe(420);
    });
  });
  
  describe('mockElementRect', () => {
    it('should mock getBoundingClientRect on element', () => {
      const element = document.createElement('div');
      
      mockElementRect(element, { x: 50, y: 100, width: 400, height: 300 });
      
      const rect = element.getBoundingClientRect();
      expect(rect.x).toBe(50);
      expect(rect.y).toBe(100);
      expect(rect.width).toBe(400);
      expect(rect.height).toBe(300);
    });
  });
  
  describe('cleanupContainer', () => {
    it('should remove container from DOM', () => {
      const container = createMockContainer();
      
      expect(document.body.contains(container)).toBe(true);
      
      cleanupContainer(container);
      
      expect(document.body.contains(container)).toBe(false);
    });
    
    it('should not throw if container not in DOM', () => {
      const container = document.createElement('div');
      
      expect(() => cleanupContainer(container)).not.toThrow();
    });
  });
});
