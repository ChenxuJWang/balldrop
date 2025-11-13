/**
 * Unit tests for curve computation system
 */

import { describe, it, expect, vi } from 'vitest';
import {
  linear,
  sine,
  cosine,
  easeInOut,
  bezier,
  getCurvePreset,
  CURVE_PRESETS,
  createCustomCurveAdapter,
  createKeypointCurve,
} from '../src/core/curves';

describe('Curve Presets', () => {
  describe('linear', () => {
    it('should return 0 at t=0', () => {
      expect(linear(0)).toBe(0);
    });

    it('should return 0.25 at t=0.25', () => {
      expect(linear(0.25)).toBe(0.25);
    });

    it('should return 0.5 at t=0.5', () => {
      expect(linear(0.5)).toBe(0.5);
    });

    it('should return 0.75 at t=0.75', () => {
      expect(linear(0.75)).toBe(0.75);
    });

    it('should return 1 at t=1', () => {
      expect(linear(1)).toBe(1);
    });

    it('should produce values in [0,1] range', () => {
      for (let t = 0; t <= 1; t += 0.1) {
        const z = linear(t);
        expect(z).toBeGreaterThanOrEqual(0);
        expect(z).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('sine', () => {
    it('should return approximately 0.5 at t=0 (starting mid-height)', () => {
      expect(sine(0)).toBeCloseTo(0.5, 2);
    });

    it('should return approximately 1.0 at t=0.25 (peak)', () => {
      expect(sine(0.25)).toBeCloseTo(1.0, 2);
    });

    it('should return approximately 0.5 at t=0.5 (mid-height)', () => {
      expect(sine(0.5)).toBeCloseTo(0.5, 2);
    });

    it('should return approximately 0.0 at t=0.75 (valley)', () => {
      expect(sine(0.75)).toBeCloseTo(0.0, 2);
    });

    it('should return approximately 0.5 at t=1.0 (ending mid-height)', () => {
      expect(sine(1.0)).toBeCloseTo(0.5, 2);
    });

    it('should produce values in [0,1] range', () => {
      for (let t = 0; t <= 1; t += 0.05) {
        const z = sine(t);
        expect(z).toBeGreaterThanOrEqual(0);
        expect(z).toBeLessThanOrEqual(1);
      }
    });

    it('should be smooth and continuous', () => {
      // Check that small changes in t produce small changes in z
      const delta = 0.01;
      for (let t = 0; t < 1; t += 0.1) {
        const z1 = sine(t);
        const z2 = sine(t + delta);
        const change = Math.abs(z2 - z1);
        expect(change).toBeLessThan(0.1); // Reasonable smoothness threshold
      }
    });
  });

  describe('cosine', () => {
    it('should return approximately 1.0 at t=0 (starting at maximum)', () => {
      expect(cosine(0)).toBeCloseTo(1.0, 2);
    });

    it('should return approximately 0.5 at t=0.25', () => {
      expect(cosine(0.25)).toBeCloseTo(0.5, 2);
    });

    it('should return approximately 0.0 at t=0.5 (minimum)', () => {
      expect(cosine(0.5)).toBeCloseTo(0.0, 2);
    });

    it('should return approximately 0.5 at t=0.75', () => {
      expect(cosine(0.75)).toBeCloseTo(0.5, 2);
    });

    it('should return approximately 1.0 at t=1.0 (ending at maximum)', () => {
      expect(cosine(1.0)).toBeCloseTo(1.0, 2);
    });

    it('should produce values in [0,1] range', () => {
      for (let t = 0; t <= 1; t += 0.05) {
        const z = cosine(t);
        expect(z).toBeGreaterThanOrEqual(0);
        expect(z).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('easeInOut', () => {
    it('should return 0 at t=0', () => {
      expect(easeInOut(0)).toBe(0);
    });

    it('should return 0.125 at t=0.25 (ease in)', () => {
      // 2 * 0.25² = 0.125
      expect(easeInOut(0.25)).toBeCloseTo(0.125, 3);
    });

    it('should return 0.5 at t=0.5 (midpoint)', () => {
      expect(easeInOut(0.5)).toBeCloseTo(0.5, 3);
    });

    it('should return 0.875 at t=0.75 (ease out)', () => {
      // 1 - 2 * (1 - 0.75)² = 1 - 2 * 0.0625 = 0.875
      expect(easeInOut(0.75)).toBeCloseTo(0.875, 3);
    });

    it('should return 1 at t=1', () => {
      expect(easeInOut(1)).toBe(1);
    });

    it('should produce values in [0,1] range', () => {
      for (let t = 0; t <= 1; t += 0.05) {
        const z = easeInOut(t);
        expect(z).toBeGreaterThanOrEqual(0);
        expect(z).toBeLessThanOrEqual(1);
      }
    });

    it('should accelerate in first half', () => {
      // Second derivative should be positive in first half
      const z1 = easeInOut(0.1);
      const z2 = easeInOut(0.2);
      const z3 = easeInOut(0.3);
      
      const slope1 = z2 - z1;
      const slope2 = z3 - z2;
      
      expect(slope2).toBeGreaterThan(slope1);
    });

    it('should decelerate in second half', () => {
      // Second derivative should be negative in second half
      const z1 = easeInOut(0.6);
      const z2 = easeInOut(0.7);
      const z3 = easeInOut(0.8);
      
      const slope1 = z2 - z1;
      const slope2 = z3 - z2;
      
      expect(slope2).toBeLessThan(slope1);
    });
  });

  describe('bezier', () => {
    it('should return 0 at t=0', () => {
      expect(bezier(0)).toBeCloseTo(0, 2);
    });

    it('should return a value between 0 and 1 at t=0.25', () => {
      const z = bezier(0.25);
      expect(z).toBeGreaterThan(0);
      expect(z).toBeLessThan(1);
    });

    it('should return a value around 0.5 at t=0.5', () => {
      const z = bezier(0.5);
      expect(z).toBeGreaterThan(0.3);
      expect(z).toBeLessThan(0.7);
    });

    it('should return a value between 0 and 1 at t=0.75', () => {
      const z = bezier(0.75);
      expect(z).toBeGreaterThan(0);
      expect(z).toBeLessThan(1);
    });

    it('should return 1 at t=1', () => {
      expect(bezier(1)).toBeCloseTo(1, 2);
    });

    it('should produce values in [0,1] range', () => {
      for (let t = 0; t <= 1; t += 0.05) {
        const z = bezier(t);
        expect(z).toBeGreaterThanOrEqual(0);
        expect(z).toBeLessThanOrEqual(1);
      }
    });

    it('should be monotonically increasing', () => {
      // With default control points, curve should always increase
      let prevZ = bezier(0);
      for (let t = 0.1; t <= 1; t += 0.1) {
        const z = bezier(t);
        expect(z).toBeGreaterThanOrEqual(prevZ);
        prevZ = z;
      }
    });

    it('should be smooth and continuous', () => {
      const delta = 0.01;
      for (let t = 0; t < 1; t += 0.1) {
        const z1 = bezier(t);
        const z2 = bezier(t + delta);
        const change = Math.abs(z2 - z1);
        expect(change).toBeLessThan(0.1);
      }
    });
  });

  describe('getCurvePreset', () => {
    it('should return linear curve for "linear"', () => {
      const curve = getCurvePreset('linear');
      expect(curve).toBe(linear);
      expect(curve(0.5)).toBe(0.5);
    });

    it('should return sine curve for "sine"', () => {
      const curve = getCurvePreset('sine');
      expect(curve).toBe(sine);
      expect(curve(0.25)).toBeCloseTo(1.0, 2);
    });

    it('should return cosine curve for "cosine"', () => {
      const curve = getCurvePreset('cosine');
      expect(curve).toBe(cosine);
      expect(curve(0)).toBeCloseTo(1.0, 2);
    });

    it('should return easeInOut curve for "easeInOut"', () => {
      const curve = getCurvePreset('easeInOut');
      expect(curve).toBe(easeInOut);
      expect(curve(0.5)).toBeCloseTo(0.5, 2);
    });

    it('should return bezier curve for "bezier"', () => {
      const curve = getCurvePreset('bezier');
      expect(curve).toBe(bezier);
      expect(curve(0)).toBeCloseTo(0, 2);
    });

    it('should throw error for invalid preset name', () => {
      expect(() => getCurvePreset('invalid')).toThrow(
        'Invalid curve preset: "invalid"'
      );
    });

    it('should include valid options in error message', () => {
      expect(() => getCurvePreset('invalid')).toThrow(
        'linear, sine, cosine, easeInOut, bezier'
      );
    });
  });

  describe('CURVE_PRESETS', () => {
    it('should contain all expected presets', () => {
      expect(CURVE_PRESETS).toHaveProperty('linear');
      expect(CURVE_PRESETS).toHaveProperty('sine');
      expect(CURVE_PRESETS).toHaveProperty('cosine');
      expect(CURVE_PRESETS).toHaveProperty('easeInOut');
      expect(CURVE_PRESETS).toHaveProperty('bezier');
    });

    it('should have exactly 5 presets', () => {
      expect(Object.keys(CURVE_PRESETS)).toHaveLength(5);
    });

    it('all presets should be functions', () => {
      Object.values(CURVE_PRESETS).forEach((curve) => {
        expect(typeof curve).toBe('function');
      });
    });

    it('all presets should map [0,1] to [0,1]', () => {
      Object.values(CURVE_PRESETS).forEach((curve) => {
        for (let t = 0; t <= 1; t += 0.1) {
          const z = curve(t);
          expect(z).toBeGreaterThanOrEqual(0);
          expect(z).toBeLessThanOrEqual(1);
        }
      });
    });
  });
});

describe('Custom Curve Adapter', () => {
  describe('createCustomCurveAdapter', () => {
    it('should pass through valid values unchanged', () => {
      const validCurve = (t: number) => t * t; // Quadratic curve
      const adapter = createCustomCurveAdapter(validCurve);

      expect(adapter(0)).toBe(0);
      expect(adapter(0.5)).toBe(0.25);
      expect(adapter(1)).toBe(1);
    });

    it('should clamp NaN to 0.5', () => {
      const nanCurve = (t: number) => (t === 0.5 ? NaN : t);
      const adapter = createCustomCurveAdapter(nanCurve);

      expect(adapter(0)).toBe(0);
      expect(adapter(0.5)).toBe(0.5); // NaN clamped to 0.5
      expect(adapter(1)).toBe(1);
    });

    it('should clamp Infinity to 1.0', () => {
      const infinityCurve = (t: number) => (t === 0.5 ? Infinity : t);
      const adapter = createCustomCurveAdapter(infinityCurve);

      expect(adapter(0)).toBe(0);
      expect(adapter(0.5)).toBe(1.0); // Infinity clamped to 1.0
      expect(adapter(1)).toBe(1);
    });

    it('should clamp -Infinity to 0.0', () => {
      const negInfinityCurve = (t: number) => (t === 0.5 ? -Infinity : t);
      const adapter = createCustomCurveAdapter(negInfinityCurve);

      expect(adapter(0)).toBe(0);
      expect(adapter(0.5)).toBe(0.0); // -Infinity clamped to 0.0
      expect(adapter(1)).toBe(1);
    });

    it('should clamp values below 0', () => {
      const negativeCurve = (t: number) => t - 0.5; // Returns negative for t < 0.5
      const adapter = createCustomCurveAdapter(negativeCurve);

      expect(adapter(0)).toBe(0); // -0.5 clamped to 0
      expect(adapter(0.25)).toBe(0); // -0.25 clamped to 0
      expect(adapter(0.5)).toBe(0);
      expect(adapter(0.75)).toBe(0.25);
      expect(adapter(1)).toBe(0.5);
    });

    it('should clamp values above 1', () => {
      const excessiveCurve = (t: number) => t + 0.5; // Returns > 1 for t > 0.5
      const adapter = createCustomCurveAdapter(excessiveCurve);

      expect(adapter(0)).toBe(0.5);
      expect(adapter(0.25)).toBe(0.75);
      expect(adapter(0.5)).toBe(1); // 1.0 clamped to 1
      expect(adapter(0.75)).toBe(1); // 1.25 clamped to 1
      expect(adapter(1)).toBe(1); // 1.5 clamped to 1
    });

    it('should warn only once for NaN', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const nanCurve = (t: number) => NaN;
      const adapter = createCustomCurveAdapter(nanCurve);

      adapter(0);
      adapter(0.5);
      adapter(1);

      // Should only warn once despite multiple calls
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Custom curve returned NaN')
      );

      consoleWarnSpy.mockRestore();
    });

    it('should warn only once for Infinity', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const infinityCurve = (t: number) => Infinity;
      const adapter = createCustomCurveAdapter(infinityCurve);

      adapter(0);
      adapter(0.5);
      adapter(1);

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Custom curve returned Infinity')
      );

      consoleWarnSpy.mockRestore();
    });

    it('should warn only once for out-of-range values', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const outOfRangeCurve = (t: number) => t * 2; // Returns values > 1
      const adapter = createCustomCurveAdapter(outOfRangeCurve);

      adapter(0.6);
      adapter(0.7);
      adapter(0.8);

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('out-of-range')
      );

      consoleWarnSpy.mockRestore();
    });

    it('should handle multiple warning types for the same curve', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const problematicCurve = (t: number) => {
        if (t < 0.3) return NaN;
        if (t < 0.6) return Infinity;
        return 2.0; // Out of range
      };
      const adapter = createCustomCurveAdapter(problematicCurve);

      adapter(0.1); // NaN
      adapter(0.2); // NaN again (no new warning)
      adapter(0.4); // Infinity
      adapter(0.5); // Infinity again (no new warning)
      adapter(0.7); // Out of range
      adapter(0.8); // Out of range again (no new warning)

      // Should warn once for each type: NaN, Infinity, out-of-range
      expect(consoleWarnSpy).toHaveBeenCalledTimes(3);

      consoleWarnSpy.mockRestore();
    });

    it('should provide helpful error messages', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const nanCurve = (t: number) => NaN;
      const nanAdapter = createCustomCurveAdapter(nanCurve);
      nanAdapter(0.5);
      
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Check your curve function')
      );

      consoleWarnSpy.mockRestore();
    });

    it('should handle edge case: curve returns exactly 0', () => {
      const zeroCurve = (t: number) => 0;
      const adapter = createCustomCurveAdapter(zeroCurve);

      expect(adapter(0.5)).toBe(0);
    });

    it('should handle edge case: curve returns exactly 1', () => {
      const oneCurve = (t: number) => 1;
      const adapter = createCustomCurveAdapter(oneCurve);

      expect(adapter(0.5)).toBe(1);
    });

    it('should work with complex mathematical functions', () => {
      const complexCurve = (t: number) => Math.sin(t * Math.PI) * 0.5 + 0.5;
      const adapter = createCustomCurveAdapter(complexCurve);

      for (let t = 0; t <= 1; t += 0.1) {
        const z = adapter(t);
        expect(z).toBeGreaterThanOrEqual(0);
        expect(z).toBeLessThanOrEqual(1);
      }
    });
  });
});

describe('Keypoint Interpolation', () => {
  describe('createKeypointCurve', () => {
    it('should return constant 0 for empty keypoints array', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const curve = createKeypointCurve([]);
      
      expect(curve(0)).toBe(0);
      expect(curve(0.5)).toBe(0);
      expect(curve(1)).toBe(0);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('No keypoints provided')
      );
      
      consoleWarnSpy.mockRestore();
    });

    it('should handle single keypoint', () => {
      const keypoints = [{ y: 0.5, zMin: 0.2, zMax: 0.8 }];
      const curve = createKeypointCurve(keypoints);
      
      // At t=0, z should be zMin
      expect(curve(0)).toBeCloseTo(0.2, 2);
      
      // At t=0.5, z should be midpoint
      expect(curve(0.5)).toBeCloseTo(0.5, 2);
      
      // At t=1, z should be zMax
      expect(curve(1)).toBeCloseTo(0.8, 2);
    });

    it('should interpolate between two keypoints', () => {
      const keypoints = [
        { y: 0.0, zMin: 0.0, zMax: 0.2 },
        { y: 1.0, zMin: 0.8, zMax: 1.0 }
      ];
      const curve = createKeypointCurve(keypoints);
      
      // At t=0 (y=0), should be at first keypoint's zMin
      expect(curve(0)).toBeCloseTo(0.0, 2);
      
      // At t=1 (y=1), should be at second keypoint's zMax
      expect(curve(1)).toBeCloseTo(1.0, 2);
      
      // At t=0.5 (y=0.5), should be interpolated
      const z = curve(0.5);
      expect(z).toBeGreaterThan(0.2);
      expect(z).toBeLessThan(0.8);
    });

    it('should create smooth interpolation with three keypoints', () => {
      const keypoints = [
        { y: 0.0, zMin: 0.0, zMax: 0.2 },
        { y: 0.5, zMin: 0.8, zMax: 1.0 },
        { y: 1.0, zMin: 0.0, zMax: 0.2 }
      ];
      const curve = createKeypointCurve(keypoints);
      
      // Start low
      expect(curve(0)).toBeCloseTo(0.0, 2);
      
      // Peak in middle
      const midZ = curve(0.5);
      expect(midZ).toBeGreaterThan(0.8);
      
      // End low
      expect(curve(1)).toBeCloseTo(0.2, 2);
      
      // Check smoothness: small changes in t produce small changes in z
      for (let t = 0; t < 1; t += 0.1) {
        const z1 = curve(t);
        const z2 = curve(t + 0.01);
        const change = Math.abs(z2 - z1);
        expect(change).toBeLessThan(0.1);
      }
    });

    it('should sort keypoints by y value', () => {
      // Provide keypoints out of order
      const keypoints = [
        { y: 1.0, zMin: 0.0, zMax: 0.2 },
        { y: 0.0, zMin: 0.0, zMax: 0.2 },
        { y: 0.5, zMin: 0.8, zMax: 1.0 }
      ];
      const curve = createKeypointCurve(keypoints);
      
      // Should still work correctly
      expect(curve(0)).toBeCloseTo(0.0, 2);
      expect(curve(0.5)).toBeGreaterThan(0.8);
      expect(curve(1)).toBeCloseTo(0.2, 2);
    });

    it('should handle duplicate y values gracefully', () => {
      const keypoints = [
        { y: 0.0, zMin: 0.0, zMax: 0.2 },
        { y: 0.5, zMin: 0.5, zMax: 0.7 },
        { y: 0.5, zMin: 0.8, zMax: 1.0 }, // Duplicate y
        { y: 1.0, zMin: 0.0, zMax: 0.2 }
      ];
      
      // Should not crash
      const curve = createKeypointCurve(keypoints);
      expect(curve(0.5)).toBeGreaterThanOrEqual(0);
      expect(curve(0.5)).toBeLessThanOrEqual(1);
    });

    it('should clamp interpolated values to [0,1]', () => {
      const keypoints = [
        { y: 0.0, zMin: 0.0, zMax: 0.0 },
        { y: 0.5, zMin: 1.0, zMax: 1.0 },
        { y: 1.0, zMin: 0.0, zMax: 0.0 }
      ];
      const curve = createKeypointCurve(keypoints);
      
      // Check all values are in range
      for (let t = 0; t <= 1; t += 0.05) {
        const z = curve(t);
        expect(z).toBeGreaterThanOrEqual(0);
        expect(z).toBeLessThanOrEqual(1);
      }
    });

    it('should handle keypoints at boundaries', () => {
      const keypoints = [
        { y: 0.0, zMin: 0.0, zMax: 0.5 },
        { y: 1.0, zMin: 0.5, zMax: 1.0 }
      ];
      const curve = createKeypointCurve(keypoints);
      
      expect(curve(0)).toBeCloseTo(0.0, 2);
      expect(curve(1)).toBeCloseTo(1.0, 2);
    });

    it('should extrapolate before first keypoint', () => {
      const keypoints = [
        { y: 0.3, zMin: 0.2, zMax: 0.4 },
        { y: 0.7, zMin: 0.6, zMax: 0.8 }
      ];
      const curve = createKeypointCurve(keypoints);
      
      // Before first keypoint (y < 0.3), should use first keypoint's range
      const z = curve(0.1); // t=0.1, so y=0.1 < 0.3
      expect(z).toBeGreaterThanOrEqual(0.2);
      expect(z).toBeLessThanOrEqual(0.4);
    });

    it('should extrapolate after last keypoint', () => {
      const keypoints = [
        { y: 0.3, zMin: 0.2, zMax: 0.4 },
        { y: 0.7, zMin: 0.6, zMax: 0.8 }
      ];
      const curve = createKeypointCurve(keypoints);
      
      // After last keypoint (y > 0.7), should use last keypoint's range
      const z = curve(0.9); // t=0.9, so y=0.9 > 0.7
      expect(z).toBeGreaterThanOrEqual(0.6);
      expect(z).toBeLessThanOrEqual(0.8);
    });

    it('should provide C1 continuity at keypoints', () => {
      const keypoints = [
        { y: 0.0, zMin: 0.0, zMax: 0.2 },
        { y: 0.5, zMin: 0.8, zMax: 1.0 },
        { y: 1.0, zMin: 0.0, zMax: 0.2 }
      ];
      const curve = createKeypointCurve(keypoints);
      
      // Check that the derivative is continuous at keypoints
      // by comparing slopes on either side
      const epsilon = 0.001;
      
      // At y=0.5 (middle keypoint)
      const t = 0.5;
      const zBefore = curve(t - epsilon);
      const zAt = curve(t);
      const zAfter = curve(t + epsilon);
      
      const slopeBefore = (zAt - zBefore) / epsilon;
      const slopeAfter = (zAfter - zAt) / epsilon;
      
      // Slopes should be similar (C1 continuity)
      expect(Math.abs(slopeBefore - slopeAfter)).toBeLessThan(0.5);
    });

    it('should warn about out-of-range keypoint values', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const keypoints = [
        { y: -0.1, zMin: 0.0, zMax: 0.5 }, // y out of range
        { y: 0.5, zMin: -0.2, zMax: 0.5 }, // zMin out of range
        { y: 1.0, zMin: 0.5, zMax: 1.5 }   // zMax out of range
      ];
      
      createKeypointCurve(keypoints);
      
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('out-of-range values')
      );
      
      consoleWarnSpy.mockRestore();
    });

    it('should handle many keypoints efficiently', () => {
      // Create 20 keypoints
      const keypoints = [];
      for (let i = 0; i <= 20; i++) {
        keypoints.push({
          y: i / 20,
          zMin: Math.sin(i / 20 * Math.PI) * 0.3,
          zMax: Math.sin(i / 20 * Math.PI) * 0.3 + 0.5
        });
      }
      
      const curve = createKeypointCurve(keypoints);
      
      // Should compute without errors
      for (let t = 0; t <= 1; t += 0.1) {
        const z = curve(t);
        expect(z).toBeGreaterThanOrEqual(0);
        expect(z).toBeLessThanOrEqual(1);
      }
    });

    it('should produce smooth curves for typical use cases', () => {
      // Bouncing ball effect
      const keypoints = [
        { y: 0.0, zMin: 0.0, zMax: 0.1 },
        { y: 0.2, zMin: 0.7, zMax: 0.9 },
        { y: 0.4, zMin: 0.0, zMax: 0.1 },
        { y: 0.6, zMin: 0.5, zMax: 0.7 },
        { y: 0.8, zMin: 0.0, zMax: 0.1 },
        { y: 1.0, zMin: 0.0, zMax: 0.1 }
      ];
      
      const curve = createKeypointCurve(keypoints);
      
      // Verify smoothness
      let prevZ = curve(0);
      for (let t = 0.01; t <= 1; t += 0.01) {
        const z = curve(t);
        const change = Math.abs(z - prevZ);
        expect(change).toBeLessThan(0.2); // No sudden jumps
        prevZ = z;
      }
    });
  });
});
