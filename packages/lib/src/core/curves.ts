/**
 * Curve computation system for ball height animation.
 * 
 * This module provides preset curve functions and utilities for computing
 * the ball's height (Z) based on animation progress (t).
 * All curves map t:[0,1] → z:[0,1].
 */

import type { CurveFn, Keypoint } from '../types';

/**
 * Linear curve: constant rate of change.
 * z(t) = t
 */
export function linear(t: number): number {
  return t;
}

/**
 * Sine curve: smooth oscillation starting and ending at mid-height.
 * z(t) = (sin(t * 2π - π/2) + 1) / 2
 * 
 * This creates a single complete sine wave over the [0,1] interval:
 * - t=0: z=0.5 (mid-height)
 * - t=0.25: z=1.0 (peak)
 * - t=0.5: z=0.5 (mid-height)
 * - t=0.75: z=0.0 (valley)
 * - t=1.0: z=0.5 (mid-height)
 */
export function sine(t: number): number {
  // sin(-π/2) = -1, so at t=0: (sin(-π/2) + 1) / 2 = 0/2 = 0
  // We need to shift by π/2 to start at mid-height
  // sin(0) = 0, so we want: (sin(2πt) + 1) / 2 to start at 0.5
  // Actually: sin(2πt - π/2) starts at -1, giving us 0
  // We want to start at 0 (which gives 0.5 after transform)
  // So: (sin(2πt) + 1) / 2 starts at 0.5 ✓
  return (Math.sin(t * 2 * Math.PI) + 1) / 2;
}

/**
 * Cosine curve: smooth oscillation starting and ending at maximum height.
 * z(t) = (cos(t * 2π) + 1) / 2
 */
export function cosine(t: number): number {
  return (Math.cos(t * 2 * Math.PI) + 1) / 2;
}

/**
 * Ease-in-out curve: accelerates then decelerates.
 * Based on quadratic easing.
 * z(t) = t < 0.5 ? 2t² : 1 - 2(1-t)²
 */
export function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t);
}

/**
 * Cubic Bezier curve implementation.
 * Uses the default control points for a smooth ease curve.
 * P0=(0,0), P1=(0.25,0.1), P2=(0.75,0.9), P3=(1,1)
 * 
 * This implementation uses Newton-Raphson iteration to solve for t
 * given an x value, then evaluates the y value at that t.
 */
export function bezier(t: number): number {
  // Default control points for a smooth ease
  const p1x = 0.25;
  const p1y = 0.1;
  const p2x = 0.75;
  const p2y = 0.9;
  
  // For cubic Bezier, we need to solve for the parameter that gives us x=t
  // Then evaluate y at that parameter
  
  // Newton-Raphson iteration to find parameter for given x
  const epsilon = 1e-6;
  const maxIterations = 10;
  
  let guess = t; // Initial guess
  
  for (let i = 0; i < maxIterations; i++) {
    // Cubic Bezier x(u) = 3(1-u)²u*p1x + 3(1-u)u²*p2x + u³
    const u = guess;
    const u2 = u * u;
    const u3 = u2 * u;
    const oneMinusU = 1 - u;
    const oneMinusU2 = oneMinusU * oneMinusU;
    
    const x = 3 * oneMinusU2 * u * p1x + 3 * oneMinusU * u2 * p2x + u3;
    const dx = t - x;
    
    if (Math.abs(dx) < epsilon) {
      break;
    }
    
    // Derivative: dx/du = 3(1-u)²*p1x - 6(1-u)u*p1x + 3(1-u)u*p2x + 3u²*p2x - 3u²
    const derivative = 
      3 * oneMinusU2 * p1x + 
      6 * oneMinusU * u * (p2x - p1x) + 
      3 * u2 * (1 - p2x);
    
    if (Math.abs(derivative) < epsilon) {
      break;
    }
    
    guess = guess + dx / derivative;
    guess = Math.max(0, Math.min(1, guess)); // Clamp to [0,1]
  }
  
  // Now evaluate y at the found parameter
  const u = guess;
  const u2 = u * u;
  const u3 = u2 * u;
  const oneMinusU = 1 - u;
  const oneMinusU2 = oneMinusU * oneMinusU;
  const oneMinusU3 = oneMinusU2 * oneMinusU;
  
  // Cubic Bezier y(u) = (1-u)³*0 + 3(1-u)²u*p1y + 3(1-u)u²*p2y + u³*1
  const y = 3 * oneMinusU2 * u * p1y + 3 * oneMinusU * u2 * p2y + u3;
  
  return y;
}

/**
 * Map of preset curve names to their implementations.
 */
export const CURVE_PRESETS: Record<string, CurveFn> = {
  linear,
  sine,
  cosine,
  easeInOut,
  bezier,
};

/**
 * Get a preset curve function by name.
 * 
 * @param preset - Name of the preset curve
 * @returns The curve function
 * @throws Error if preset name is invalid
 */
export function getCurvePreset(preset: string): CurveFn {
  const curve = CURVE_PRESETS[preset];
  if (!curve) {
    throw new Error(
      `Invalid curve preset: "${preset}". Valid options: ${Object.keys(CURVE_PRESETS).join(', ')}`
    );
  }
  return curve;
}

/**
 * Track which custom curves have already issued warnings to avoid spam.
 * Maps curve function to a set of warning types that have been issued.
 */
const warnedCurves = new WeakMap<CurveFn, Set<string>>();

/**
 * Issue a warning for a custom curve, but only once per curve per warning type.
 * 
 * @param curve - The curve function that triggered the warning
 * @param warningType - Type of warning (e.g., 'nan', 'infinity', 'out-of-range')
 * @param message - Warning message to display
 */
function warnOnce(curve: CurveFn, warningType: string, message: string): void {
  let warnings = warnedCurves.get(curve);
  if (!warnings) {
    warnings = new Set();
    warnedCurves.set(curve, warnings);
  }
  
  if (!warnings.has(warningType)) {
    console.warn(`[Ball Animation] ${message}`);
    warnings.add(warningType);
  }
}

/**
 * Sort keypoints by Y position and validate them.
 * 
 * @param keypoints - Array of keypoints to sort
 * @returns Sorted keypoints
 */
function sortAndValidateKeypoints(keypoints: Keypoint[]): Keypoint[] {
  if (keypoints.length === 0) {
    return [];
  }
  
  // Sort by y value
  const sorted = [...keypoints].sort((a, b) => a.y - b.y);
  
  // Validate that all values are in valid ranges
  for (const kp of sorted) {
    if (kp.y < 0 || kp.y > 1 || kp.zMin < 0 || kp.zMin > 1 || kp.zMax < 0 || kp.zMax > 1) {
      console.warn(
        `[Ball Animation] Keypoint has out-of-range values: y=${kp.y}, zMin=${kp.zMin}, zMax=${kp.zMax}. Values should be in [0,1].`
      );
    }
  }
  
  return sorted;
}

/**
 * Cubic Hermite interpolation between two points with given tangents.
 * This provides C1 continuity (smooth first derivative).
 * 
 * @param p0 - Start value
 * @param p1 - End value
 * @param m0 - Tangent at start
 * @param m1 - Tangent at end
 * @param t - Interpolation parameter [0,1]
 * @returns Interpolated value
 */
function cubicHermite(p0: number, p1: number, m0: number, m1: number, t: number): number {
  const t2 = t * t;
  const t3 = t2 * t;
  
  const h00 = 2 * t3 - 3 * t2 + 1;
  const h10 = t3 - 2 * t2 + t;
  const h01 = -2 * t3 + 3 * t2;
  const h11 = t3 - t2;
  
  return h00 * p0 + h10 * m0 + h01 * p1 + h11 * m1;
}

/**
 * Compute tangent at a keypoint using finite differences.
 * Uses the Catmull-Rom approach: tangent = (next - prev) / 2
 * 
 * @param prev - Previous keypoint value (or null if at start)
 * @param next - Next keypoint value (or null if at end)
 * @param deltaY - Y distance between prev and next
 * @returns Tangent value
 */
function computeTangent(prev: number | null, next: number | null, deltaY: number): number {
  if (prev === null && next === null) {
    return 0; // Single point, no tangent
  }
  if (prev === null) {
    return next!; // Start point, use forward difference
  }
  if (next === null) {
    return prev!; // End point, use backward difference
  }
  
  // Central difference (Catmull-Rom)
  return (next - prev) / (2 * deltaY);
}

/**
 * Create a curve function from keypoints using smooth interpolation.
 * 
 * Keypoints define the ball's height range at specific Y positions.
 * The system interpolates smoothly between keypoints using cubic Hermite
 * interpolation for C1 continuity (smooth first derivative).
 * 
 * The actual Z value at each keypoint is computed based on the current
 * progress through the animation, mapping linearly between zMin and zMax.
 * 
 * @param keypoints - Array of keypoints defining height at Y positions
 * @returns Curve function that takes progress t and returns height z
 * 
 * @example
 * ```typescript
 * const keypoints = [
 *   { y: 0.0, zMin: 0.0, zMax: 0.2 },  // Start low
 *   { y: 0.5, zMin: 0.8, zMax: 1.0 },  // Peak in middle
 *   { y: 1.0, zMin: 0.0, zMax: 0.2 }   // End low
 * ];
 * 
 * const curve = createKeypointCurve(keypoints);
 * const z = curve(0.5); // Get height at progress 0.5
 * ```
 */
export function createKeypointCurve(keypoints: Keypoint[]): CurveFn {
  if (keypoints.length === 0) {
    console.warn('[Ball Animation] No keypoints provided, using constant z=0');
    return () => 0;
  }
  
  const sorted = sortAndValidateKeypoints(keypoints);
  
  if (sorted.length === 1) {
    // Single keypoint: return constant value based on progress
    const kp = sorted[0];
    return (t: number) => kp.zMin + t * (kp.zMax - kp.zMin);
  }
  
  // Precompute tangents for each keypoint
  const tangents: number[] = [];
  
  for (let i = 0; i < sorted.length; i++) {
    const prev = i > 0 ? sorted[i - 1] : null;
    const curr = sorted[i];
    const next = i < sorted.length - 1 ? sorted[i + 1] : null;
    
    // Compute Z value at current keypoint based on progress
    // For tangent computation, we use the midpoint of the range
    const currZ = (curr.zMin + curr.zMax) / 2;
    const prevZ = prev ? (prev.zMin + prev.zMax) / 2 : null;
    const nextZ = next ? (next.zMin + next.zMax) / 2 : null;
    
    // Compute delta Y for tangent scaling
    const deltaY = next && prev ? next.y - prev.y : 1;
    
    const tangent = computeTangent(
      prevZ !== null ? prevZ - currZ : null,
      nextZ !== null ? nextZ - currZ : null,
      deltaY
    );
    
    tangents.push(tangent);
  }
  
  return (t: number): number => {
    // For keypoint curves, we need to know the current Y position
    // Since we're using progress t, we'll map t to Y linearly
    // This assumes pathY is linear (default behavior)
    const y = t;
    
    // Find the segment containing y
    if (y <= sorted[0].y) {
      // Before first keypoint
      const kp = sorted[0];
      return kp.zMin + t * (kp.zMax - kp.zMin);
    }
    
    if (y >= sorted[sorted.length - 1].y) {
      // After last keypoint
      const kp = sorted[sorted.length - 1];
      return kp.zMin + t * (kp.zMax - kp.zMin);
    }
    
    // Find segment
    let segmentIndex = 0;
    for (let i = 0; i < sorted.length - 1; i++) {
      if (y >= sorted[i].y && y <= sorted[i + 1].y) {
        segmentIndex = i;
        break;
      }
    }
    
    const kp0 = sorted[segmentIndex];
    const kp1 = sorted[segmentIndex + 1];
    
    // Compute Z values at keypoints based on progress
    const z0 = kp0.zMin + t * (kp0.zMax - kp0.zMin);
    const z1 = kp1.zMin + t * (kp1.zMax - kp1.zMin);
    
    // Local t within segment
    const localT = (y - kp0.y) / (kp1.y - kp0.y);
    
    // Interpolate using cubic Hermite
    const m0 = tangents[segmentIndex] * (kp1.y - kp0.y);
    const m1 = tangents[segmentIndex + 1] * (kp1.y - kp0.y);
    
    const z = cubicHermite(z0, z1, m0, m1, localT);
    
    // Clamp to [0,1] to handle any overshoot from interpolation
    return Math.max(0, Math.min(1, z));
  };
}

/**
 * Wrap a custom curve function with validation and error handling.
 * 
 * This adapter ensures that custom curves:
 * - Return valid numbers (not NaN or Infinity)
 * - Stay within the [0,1] range
 * - Issue developer warnings for edge cases
 * 
 * Invalid values are clamped to safe defaults:
 * - NaN → 0.5 (mid-height)
 * - Infinity → 1.0 (max height)
 * - -Infinity → 0.0 (ground level)
 * - Out of range → clamped to [0,1]
 * 
 * @param customCurve - User-provided curve function
 * @returns Validated curve function
 * 
 * @example
 * ```typescript
 * const myCurve = (t: number) => Math.pow(t, 2);
 * const safeCurve = createCustomCurveAdapter(myCurve);
 * 
 * // safeCurve will clamp and warn if myCurve returns invalid values
 * const z = safeCurve(0.5);
 * ```
 */
export function createCustomCurveAdapter(customCurve: CurveFn): CurveFn {
  return (t: number): number => {
    const z = customCurve(t);
    
    // Check for NaN
    if (Number.isNaN(z)) {
      warnOnce(
        customCurve,
        'nan',
        `Custom curve returned NaN at t=${t}. Clamping to 0.5. Check your curve function for division by zero or invalid math operations.`
      );
      return 0.5;
    }
    
    // Check for positive infinity
    if (z === Infinity) {
      warnOnce(
        customCurve,
        'infinity',
        `Custom curve returned Infinity at t=${t}. Clamping to 1.0. Check your curve function for unbounded growth.`
      );
      return 1.0;
    }
    
    // Check for negative infinity
    if (z === -Infinity) {
      warnOnce(
        customCurve,
        'neg-infinity',
        `Custom curve returned -Infinity at t=${t}. Clamping to 0.0. Check your curve function for unbounded decay.`
      );
      return 0.0;
    }
    
    // Check for out-of-range values
    if (z < 0 || z > 1) {
      warnOnce(
        customCurve,
        'out-of-range',
        `Custom curve returned out-of-range value ${z} at t=${t}. Values will be clamped to [0,1]. Ensure your curve function returns values in the valid range.`
      );
      return Math.max(0, Math.min(1, z));
    }
    
    return z;
  };
}
