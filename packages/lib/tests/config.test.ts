/**
 * Unit tests for configuration validation and defaults
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { validateConfig, applyDefaults, ConfigValidationError, CONFIG_DEFAULTS } from '../src/core/config';
import type { AnimationConfig } from '../src/types';

describe('Config Validation', () => {
  let mockElement: HTMLElement;
  
  beforeEach(() => {
    mockElement = document.createElement('div');
  });
  
  describe('validateConfig', () => {
    describe('required fields', () => {
      it('should throw error when mount is missing', () => {
        const config = {
          driver: 'time',
          durationMs: 1000,
          light: { x: 0.5, y: 0.5, z: 2.0 },
        } as any;
        
        expect(() => validateConfig(config)).toThrow(ConfigValidationError);
        expect(() => validateConfig(config)).toThrow('Missing required field "mount"');
      });
      
      it('should throw error when mount is not an HTMLElement', () => {
        const config = {
          mount: 'not-an-element',
          driver: 'time',
          durationMs: 1000,
          light: { x: 0.5, y: 0.5, z: 2.0 },
        } as any;
        
        expect(() => validateConfig(config)).toThrow(ConfigValidationError);
        expect(() => validateConfig(config)).toThrow('Invalid field "mount"');
      });
      
      it('should throw error when driver is missing', () => {
        const config = {
          mount: mockElement,
          durationMs: 1000,
          light: { x: 0.5, y: 0.5, z: 2.0 },
        } as any;
        
        expect(() => validateConfig(config)).toThrow(ConfigValidationError);
        expect(() => validateConfig(config)).toThrow('Missing required field "driver"');
      });
      
      it('should throw error when driver is invalid', () => {
        const config = {
          mount: mockElement,
          driver: 'invalid',
          light: { x: 0.5, y: 0.5, z: 2.0 },
        } as any;
        
        expect(() => validateConfig(config)).toThrow(ConfigValidationError);
        expect(() => validateConfig(config)).toThrow('Invalid field "driver"');
        expect(() => validateConfig(config)).toThrow('"time" or "scroll"');
      });
      
      it('should throw error when light is missing', () => {
        const config = {
          mount: mockElement,
          driver: 'time',
          durationMs: 1000,
        } as any;
        
        expect(() => validateConfig(config)).toThrow(ConfigValidationError);
        expect(() => validateConfig(config)).toThrow('Missing required field "light"');
      });
      
      it('should throw error when light is not an object', () => {
        const config = {
          mount: mockElement,
          driver: 'time',
          durationMs: 1000,
          light: 'not-an-object',
        } as any;
        
        expect(() => validateConfig(config)).toThrow(ConfigValidationError);
        expect(() => validateConfig(config)).toThrow('Invalid field "light"');
      });
      
      it('should throw error when light.x is not a number', () => {
        const config = {
          mount: mockElement,
          driver: 'time',
          durationMs: 1000,
          light: { x: 'not-a-number', y: 0.5, z: 2.0 },
        } as any;
        
        expect(() => validateConfig(config)).toThrow(ConfigValidationError);
        expect(() => validateConfig(config)).toThrow('Invalid field "light.x"');
      });
      
      it('should throw error when light.y is not a number', () => {
        const config = {
          mount: mockElement,
          driver: 'time',
          durationMs: 1000,
          light: { x: 0.5, y: 'not-a-number', z: 2.0 },
        } as any;
        
        expect(() => validateConfig(config)).toThrow(ConfigValidationError);
        expect(() => validateConfig(config)).toThrow('Invalid field "light.y"');
      });
      
      it('should throw error when light.z is not a number', () => {
        const config = {
          mount: mockElement,
          driver: 'time',
          durationMs: 1000,
          light: { x: 0.5, y: 0.5, z: 'not-a-number' },
        } as any;
        
        expect(() => validateConfig(config)).toThrow(ConfigValidationError);
        expect(() => validateConfig(config)).toThrow('Invalid field "light.z"');
      });
      
      it('should throw error when light coordinates are NaN', () => {
        const config = {
          mount: mockElement,
          driver: 'time',
          durationMs: 1000,
          light: { x: NaN, y: 0.5, z: 2.0 },
        } as any;
        
        expect(() => validateConfig(config)).toThrow(ConfigValidationError);
        expect(() => validateConfig(config)).toThrow('Invalid field "light.x"');
      });
    });
    
    describe('conditional validation - time driver', () => {
      it('should throw error when durationMs is missing for time driver', () => {
        const config = {
          mount: mockElement,
          driver: 'time',
          light: { x: 0.5, y: 0.5, z: 2.0 },
        } as any;
        
        expect(() => validateConfig(config)).toThrow(ConfigValidationError);
        expect(() => validateConfig(config)).toThrow('Missing required field "durationMs"');
      });
      
      it('should throw error when durationMs is not a number', () => {
        const config = {
          mount: mockElement,
          driver: 'time',
          durationMs: 'not-a-number',
          light: { x: 0.5, y: 0.5, z: 2.0 },
        } as any;
        
        expect(() => validateConfig(config)).toThrow(ConfigValidationError);
        expect(() => validateConfig(config)).toThrow('Invalid field "durationMs"');
      });
      
      it('should throw error when durationMs is zero or negative', () => {
        const config = {
          mount: mockElement,
          driver: 'time',
          durationMs: 0,
          light: { x: 0.5, y: 0.5, z: 2.0 },
        } as AnimationConfig;
        
        expect(() => validateConfig(config)).toThrow(ConfigValidationError);
        expect(() => validateConfig(config)).toThrow('Expected a positive number');
      });
      
      it('should accept valid time driver configuration', () => {
        const config: AnimationConfig = {
          mount: mockElement,
          driver: 'time',
          durationMs: 1000,
          light: { x: 0.5, y: 0.5, z: 2.0 },
        };
        
        expect(() => validateConfig(config)).not.toThrow();
      });
    });
    
    describe('conditional validation - scroll driver', () => {
      it('should throw error when scrollTarget is missing for scroll driver', () => {
        const config = {
          mount: mockElement,
          driver: 'scroll',
          light: { x: 0.5, y: 0.5, z: 2.0 },
        } as any;
        
        expect(() => validateConfig(config)).toThrow(ConfigValidationError);
        expect(() => validateConfig(config)).toThrow('Missing required field "scrollTarget"');
      });
      
      it('should throw error when scrollTarget is not an HTMLElement or null', () => {
        const config = {
          mount: mockElement,
          driver: 'scroll',
          scrollTarget: 'not-an-element',
          light: { x: 0.5, y: 0.5, z: 2.0 },
        } as any;
        
        expect(() => validateConfig(config)).toThrow(ConfigValidationError);
        expect(() => validateConfig(config)).toThrow('Invalid field "scrollTarget"');
      });
      
      it('should accept null as scrollTarget', () => {
        const config: AnimationConfig = {
          mount: mockElement,
          driver: 'scroll',
          scrollTarget: null,
          light: { x: 0.5, y: 0.5, z: 2.0 },
        };
        
        expect(() => validateConfig(config)).not.toThrow();
      });
      
      it('should accept valid scroll driver configuration', () => {
        const scrollElement = document.createElement('div');
        const config: AnimationConfig = {
          mount: mockElement,
          driver: 'scroll',
          scrollTarget: scrollElement,
          light: { x: 0.5, y: 0.5, z: 2.0 },
        };
        
        expect(() => validateConfig(config)).not.toThrow();
      });
    });
    
    describe('optional field validation', () => {
      it('should throw error for invalid width', () => {
        const config = {
          mount: mockElement,
          driver: 'time',
          durationMs: 1000,
          light: { x: 0.5, y: 0.5, z: 2.0 },
          width: -100,
        } as AnimationConfig;
        
        expect(() => validateConfig(config)).toThrow(ConfigValidationError);
        expect(() => validateConfig(config)).toThrow('Invalid field "width"');
      });
      
      it('should throw error for invalid height', () => {
        const config = {
          mount: mockElement,
          driver: 'time',
          durationMs: 1000,
          light: { x: 0.5, y: 0.5, z: 2.0 },
          height: 0,
        } as AnimationConfig;
        
        expect(() => validateConfig(config)).toThrow(ConfigValidationError);
        expect(() => validateConfig(config)).toThrow('Invalid field "height"');
      });
      
      it('should throw error for invalid fitMode', () => {
        const config = {
          mount: mockElement,
          driver: 'time',
          durationMs: 1000,
          light: { x: 0.5, y: 0.5, z: 2.0 },
          fitMode: 'invalid',
        } as any;
        
        expect(() => validateConfig(config)).toThrow(ConfigValidationError);
        expect(() => validateConfig(config)).toThrow('Invalid field "fitMode"');
        expect(() => validateConfig(config)).toThrow('"contain", "cover", or "stretch"');
      });
      
      it('should throw error for invalid curvePreset', () => {
        const config = {
          mount: mockElement,
          driver: 'time',
          durationMs: 1000,
          light: { x: 0.5, y: 0.5, z: 2.0 },
          curvePreset: 'invalid',
        } as any;
        
        expect(() => validateConfig(config)).toThrow(ConfigValidationError);
        expect(() => validateConfig(config)).toThrow('Invalid field "curvePreset"');
      });
      
      it('should throw error when customCurve is not a function', () => {
        const config = {
          mount: mockElement,
          driver: 'time',
          durationMs: 1000,
          light: { x: 0.5, y: 0.5, z: 2.0 },
          customCurve: 'not-a-function',
        } as any;
        
        expect(() => validateConfig(config)).toThrow(ConfigValidationError);
        expect(() => validateConfig(config)).toThrow('Invalid field "customCurve"');
      });
      
      it('should throw error when pathX is not a function', () => {
        const config = {
          mount: mockElement,
          driver: 'time',
          durationMs: 1000,
          light: { x: 0.5, y: 0.5, z: 2.0 },
          pathX: 'not-a-function',
        } as any;
        
        expect(() => validateConfig(config)).toThrow(ConfigValidationError);
        expect(() => validateConfig(config)).toThrow('Invalid field "pathX"');
      });
      
      it('should throw error when pathY is not a function', () => {
        const config = {
          mount: mockElement,
          driver: 'time',
          durationMs: 1000,
          light: { x: 0.5, y: 0.5, z: 2.0 },
          pathY: 123,
        } as any;
        
        expect(() => validateConfig(config)).toThrow(ConfigValidationError);
        expect(() => validateConfig(config)).toThrow('Invalid field "pathY"');
      });
      
      it('should throw error when loop is invalid type', () => {
        const config = {
          mount: mockElement,
          driver: 'time',
          durationMs: 1000,
          light: { x: 0.5, y: 0.5, z: 2.0 },
          loop: 'invalid',
        } as any;
        
        expect(() => validateConfig(config)).toThrow(ConfigValidationError);
        expect(() => validateConfig(config)).toThrow('Invalid field "loop"');
      });
      
      it('should throw error when loop is negative number', () => {
        const config = {
          mount: mockElement,
          driver: 'time',
          durationMs: 1000,
          light: { x: 0.5, y: 0.5, z: 2.0 },
          loop: -1,
        } as any;
        
        expect(() => validateConfig(config)).toThrow(ConfigValidationError);
        expect(() => validateConfig(config)).toThrow('Invalid field "loop"');
      });
      
      it('should throw error when loop is not an integer', () => {
        const config = {
          mount: mockElement,
          driver: 'time',
          durationMs: 1000,
          light: { x: 0.5, y: 0.5, z: 2.0 },
          loop: 3.5,
        } as any;
        
        expect(() => validateConfig(config)).toThrow(ConfigValidationError);
        expect(() => validateConfig(config)).toThrow('non-negative integer');
      });
      
      it('should accept valid loop values', () => {
        const configs = [
          { loop: true },
          { loop: false },
          { loop: 0 },
          { loop: 5 },
        ];
        
        configs.forEach(partial => {
          const config: AnimationConfig = {
            mount: mockElement,
            driver: 'time',
            durationMs: 1000,
            light: { x: 0.5, y: 0.5, z: 2.0 },
            ...partial,
          };
          
          expect(() => validateConfig(config)).not.toThrow();
        });
      });
    });
    
    describe('keypoints validation', () => {
      it('should throw error when keypoints is not an array', () => {
        const config = {
          mount: mockElement,
          driver: 'time',
          durationMs: 1000,
          light: { x: 0.5, y: 0.5, z: 2.0 },
          keypoints: 'not-an-array',
        } as any;
        
        expect(() => validateConfig(config)).toThrow(ConfigValidationError);
        expect(() => validateConfig(config)).toThrow('Invalid field "keypoints"');
      });
      
      it('should throw error when keypoint.y is not a number', () => {
        const config = {
          mount: mockElement,
          driver: 'time',
          durationMs: 1000,
          light: { x: 0.5, y: 0.5, z: 2.0 },
          keypoints: [{ y: 'invalid', zMin: 0, zMax: 1 }],
        } as any;
        
        expect(() => validateConfig(config)).toThrow(ConfigValidationError);
        expect(() => validateConfig(config)).toThrow('Invalid keypoint at index 0');
        expect(() => validateConfig(config)).toThrow('Field "y" must be a number');
      });
      
      it('should throw error when keypoint.zMin is not a number', () => {
        const config = {
          mount: mockElement,
          driver: 'time',
          durationMs: 1000,
          light: { x: 0.5, y: 0.5, z: 2.0 },
          keypoints: [{ y: 0.5, zMin: 'invalid', zMax: 1 }],
        } as any;
        
        expect(() => validateConfig(config)).toThrow(ConfigValidationError);
        expect(() => validateConfig(config)).toThrow('Invalid keypoint at index 0');
        expect(() => validateConfig(config)).toThrow('Field "zMin" must be a number');
      });
      
      it('should throw error when keypoint.zMax is not a number', () => {
        const config = {
          mount: mockElement,
          driver: 'time',
          durationMs: 1000,
          light: { x: 0.5, y: 0.5, z: 2.0 },
          keypoints: [{ y: 0.5, zMin: 0, zMax: NaN }],
        } as any;
        
        expect(() => validateConfig(config)).toThrow(ConfigValidationError);
        expect(() => validateConfig(config)).toThrow('Invalid keypoint at index 0');
        expect(() => validateConfig(config)).toThrow('Field "zMax" must be a number');
      });
      
      it('should accept valid keypoints', () => {
        const config: AnimationConfig = {
          mount: mockElement,
          driver: 'time',
          durationMs: 1000,
          light: { x: 0.5, y: 0.5, z: 2.0 },
          keypoints: [
            { y: 0.0, zMin: 0.0, zMax: 0.2 },
            { y: 0.5, zMin: 0.8, zMax: 1.0 },
            { y: 1.0, zMin: 0.0, zMax: 0.2 },
          ],
        };
        
        expect(() => validateConfig(config)).not.toThrow();
      });
    });
    
    describe('zones validation', () => {
      it('should throw error when zones is not an array', () => {
        const config = {
          mount: mockElement,
          driver: 'time',
          durationMs: 1000,
          light: { x: 0.5, y: 0.5, z: 2.0 },
          zones: 'not-an-array',
        } as any;
        
        expect(() => validateConfig(config)).toThrow(ConfigValidationError);
        expect(() => validateConfig(config)).toThrow('Invalid field "zones"');
      });
      
      it('should throw error when zone is missing id', () => {
        const config = {
          mount: mockElement,
          driver: 'time',
          durationMs: 1000,
          light: { x: 0.5, y: 0.5, z: 2.0 },
          zones: [{ shape: 'circle', bounds: { x: 0.5, y: 0.5, radius: 0.1 } }],
        } as any;
        
        expect(() => validateConfig(config)).toThrow(ConfigValidationError);
        expect(() => validateConfig(config)).toThrow('Invalid zone at index 0');
        expect(() => validateConfig(config)).toThrow('Missing required field "id"');
      });
      
      it('should throw error when zone has invalid shape', () => {
        const config = {
          mount: mockElement,
          driver: 'time',
          durationMs: 1000,
          light: { x: 0.5, y: 0.5, z: 2.0 },
          zones: [{ id: 'zone1', shape: 'invalid', bounds: { x: 0.5, y: 0.5 } }],
        } as any;
        
        expect(() => validateConfig(config)).toThrow(ConfigValidationError);
        expect(() => validateConfig(config)).toThrow('Invalid zone at index 0');
        expect(() => validateConfig(config)).toThrow('"circle" or "rect"');
      });
      
      it('should throw error when zone is missing bounds', () => {
        const config = {
          mount: mockElement,
          driver: 'time',
          durationMs: 1000,
          light: { x: 0.5, y: 0.5, z: 2.0 },
          zones: [{ id: 'zone1', shape: 'circle' }],
        } as any;
        
        expect(() => validateConfig(config)).toThrow(ConfigValidationError);
        expect(() => validateConfig(config)).toThrow('Invalid zone at index 0');
        expect(() => validateConfig(config)).toThrow('Missing required field "bounds"');
      });
      
      it('should throw error when circular zone is missing radius', () => {
        const config = {
          mount: mockElement,
          driver: 'time',
          durationMs: 1000,
          light: { x: 0.5, y: 0.5, z: 2.0 },
          zones: [{ id: 'zone1', shape: 'circle', bounds: { x: 0.5, y: 0.5 } }],
        } as any;
        
        expect(() => validateConfig(config)).toThrow(ConfigValidationError);
        expect(() => validateConfig(config)).toThrow('Invalid zone at index 0');
        expect(() => validateConfig(config)).toThrow('require "bounds.radius"');
      });
      
      it('should throw error when rectangular zone is missing width', () => {
        const config = {
          mount: mockElement,
          driver: 'time',
          durationMs: 1000,
          light: { x: 0.5, y: 0.5, z: 2.0 },
          zones: [{ id: 'zone1', shape: 'rect', bounds: { x: 0.5, y: 0.5, height: 0.2 } }],
        } as any;
        
        expect(() => validateConfig(config)).toThrow(ConfigValidationError);
        expect(() => validateConfig(config)).toThrow('Invalid zone at index 0');
        expect(() => validateConfig(config)).toThrow('require "bounds.width"');
      });
      
      it('should throw error when rectangular zone is missing height', () => {
        const config = {
          mount: mockElement,
          driver: 'time',
          durationMs: 1000,
          light: { x: 0.5, y: 0.5, z: 2.0 },
          zones: [{ id: 'zone1', shape: 'rect', bounds: { x: 0.5, y: 0.5, width: 0.2 } }],
        } as any;
        
        expect(() => validateConfig(config)).toThrow(ConfigValidationError);
        expect(() => validateConfig(config)).toThrow('Invalid zone at index 0');
        expect(() => validateConfig(config)).toThrow('require "bounds.height"');
      });
      
      it('should accept valid circular zone', () => {
        const config: AnimationConfig = {
          mount: mockElement,
          driver: 'time',
          durationMs: 1000,
          light: { x: 0.5, y: 0.5, z: 2.0 },
          zones: [{
            id: 'zone1',
            shape: 'circle',
            bounds: { x: 0.5, y: 0.5, radius: 0.1 },
          }],
        };
        
        expect(() => validateConfig(config)).not.toThrow();
      });
      
      it('should accept valid rectangular zone', () => {
        const config: AnimationConfig = {
          mount: mockElement,
          driver: 'time',
          durationMs: 1000,
          light: { x: 0.5, y: 0.5, z: 2.0 },
          zones: [{
            id: 'zone1',
            shape: 'rect',
            bounds: { x: 0.5, y: 0.5, width: 0.2, height: 0.3 },
          }],
        };
        
        expect(() => validateConfig(config)).not.toThrow();
      });
    });
  });
  
  describe('applyDefaults', () => {
    let baseConfig: AnimationConfig;
    
    beforeEach(() => {
      baseConfig = {
        mount: mockElement,
        driver: 'time',
        durationMs: 1000,
        light: { x: 0.5, y: 0.5, z: 2.0 },
      };
    });
    
    it('should apply default fitMode', () => {
      const result = applyDefaults(baseConfig);
      expect(result.fitMode).toBe(CONFIG_DEFAULTS.fitMode);
    });
    
    it('should apply default loop', () => {
      const result = applyDefaults(baseConfig);
      expect(result.loop).toBe(CONFIG_DEFAULTS.loop);
    });
    
    it('should apply default debug', () => {
      const result = applyDefaults(baseConfig);
      expect(result.debug).toBe(CONFIG_DEFAULTS.debug);
    });
    
    it('should apply default curvePreset', () => {
      const result = applyDefaults(baseConfig);
      expect(result.curvePreset).toBe(CONFIG_DEFAULTS.curvePreset);
    });
    
    it('should apply default shadow options', () => {
      const result = applyDefaults(baseConfig);
      expect(result.shadow).toEqual(CONFIG_DEFAULTS.shadow);
    });
    
    it('should merge partial shadow options with defaults', () => {
      const config = {
        ...baseConfig,
        shadow: { softness: 0.8 },
      };
      
      const result = applyDefaults(config);
      expect(result.shadow).toEqual({
        softness: 0.8,
        opacityAtGround: CONFIG_DEFAULTS.shadow.opacityAtGround,
        minScale: CONFIG_DEFAULTS.shadow.minScale,
      });
    });
    
    it('should apply default ballStyle', () => {
      const result = applyDefaults(baseConfig);
      expect(result.ballStyle).toEqual(CONFIG_DEFAULTS.ballStyle);
    });
    
    it('should merge partial ballStyle with defaults', () => {
      const config = {
        ...baseConfig,
        ballStyle: { fill: '#ff0000', radiusAtGround: 30 },
      };
      
      const result = applyDefaults(config);
      expect(result.ballStyle).toEqual({
        fill: '#ff0000',
        stroke: CONFIG_DEFAULTS.ballStyle.stroke,
        strokeWidth: CONFIG_DEFAULTS.ballStyle.strokeWidth,
        radiusAtGround: 30,
        radiusAtMax: CONFIG_DEFAULTS.ballStyle.radiusAtMax,
      });
    });
    
    it('should apply default zones', () => {
      const result = applyDefaults(baseConfig);
      expect(result.zones).toEqual(CONFIG_DEFAULTS.zones);
    });
    
    it('should apply default pathX', () => {
      const result = applyDefaults(baseConfig);
      expect(result.pathX).toBe(CONFIG_DEFAULTS.pathX);
      expect(result.pathX(0.5)).toBe(0.5);
    });
    
    it('should apply default pathY', () => {
      const result = applyDefaults(baseConfig);
      expect(result.pathY).toBe(CONFIG_DEFAULTS.pathY);
      expect(result.pathY(0.5)).toBe(0.5);
    });
    
    it('should preserve user-provided values', () => {
      const config: AnimationConfig = {
        ...baseConfig,
        fitMode: 'cover',
        loop: true,
        debug: true,
        curvePreset: 'sine',
        width: 800,
        height: 600,
      };
      
      const result = applyDefaults(config);
      expect(result.fitMode).toBe('cover');
      expect(result.loop).toBe(true);
      expect(result.debug).toBe(true);
      expect(result.curvePreset).toBe('sine');
      expect(result.width).toBe(800);
      expect(result.height).toBe(600);
    });
    
    it('should preserve custom functions', () => {
      const customCurve = (t: number) => t * t;
      const customPathX = (t: number) => t * 0.8;
      const customPathY = (t: number) => 1 - t;
      
      const config: AnimationConfig = {
        ...baseConfig,
        customCurve,
        pathX: customPathX,
        pathY: customPathY,
      };
      
      const result = applyDefaults(config);
      expect(result.customCurve).toBe(customCurve);
      expect(result.pathX).toBe(customPathX);
      expect(result.pathY).toBe(customPathY);
    });
    
    it('should preserve keypoints', () => {
      const keypoints = [
        { y: 0.0, zMin: 0.0, zMax: 0.2 },
        { y: 1.0, zMin: 0.8, zMax: 1.0 },
      ];
      
      const config: AnimationConfig = {
        ...baseConfig,
        keypoints,
      };
      
      const result = applyDefaults(config);
      expect(result.keypoints).toBe(keypoints);
    });
    
    it('should preserve zones', () => {
      const zones = [{
        id: 'zone1',
        shape: 'circle' as const,
        bounds: { x: 0.5, y: 0.5, radius: 0.1 },
      }];
      
      const config: AnimationConfig = {
        ...baseConfig,
        zones,
      };
      
      const result = applyDefaults(config);
      expect(result.zones).toBe(zones);
    });
    
    it('should not mutate the original config', () => {
      const original = { ...baseConfig };
      applyDefaults(baseConfig);
      expect(baseConfig).toEqual(original);
    });
  });
});
