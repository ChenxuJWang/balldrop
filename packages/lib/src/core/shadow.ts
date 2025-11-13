/**
 * Shadow Calculation Module
 * 
 * Implements shadow offset, blur, and opacity calculations based on ball position,
 * light source position, and shadow configuration options.
 */

import type { Vec3, ShadowParams, ShadowOptions, ShadowCalculator } from '../types';

/**
 * Default shadow options applied when not specified by user.
 */
export const DEFAULT_SHADOW_OPTIONS: Required<ShadowOptions> = {
  softness: 0.5,
  opacityAtGround: 0.3,
  minScale: 0.1,
};

/**
 * Calculate shadow offset based on ball position and light position.
 * 
 * The shadow is cast by projecting the ball's center onto the ground plane (Z=0)
 * in the direction away from the light source. The offset magnitude increases
 * with the ball's height (Z value).
 * 
 * Algorithm:
 * 1. Compute vector from light to ball center
 * 2. Project this vector onto the ground plane (Z=0)
 * 3. Scale the projection based on the ball's height
 * 
 * @param ballPos - Ball position in 3D world space (normalized [0,1] for x,y)
 * @param lightPos - Light position in 3D world space (normalized [0,1] for x,y)
 * @returns Shadow offset in normalized world coordinates
 */
export function calculateShadowOffset(
  ballPos: Vec3,
  lightPos: Vec3
): { offsetX: number; offsetY: number } {
  // Vector from light to ball
  const dx = ballPos.x - lightPos.x;
  const dy = ballPos.y - lightPos.y;
  const dz = ballPos.z - lightPos.z;
  
  // If light is at or below the ball, shadow projects away from light
  // We project the ball position onto the ground plane (Z=0) along the light ray
  
  // Calculate the parameter t where the ray from light through ball hits Z=0
  // Ray equation: P(t) = light + t * (ball - light)
  // At ground: light.z + t * (ball.z - light.z) = 0
  // Solving for t: t = -light.z / (ball.z - light.z)
  
  const denominator = dz;
  
  // If light and ball are at same height, shadow is directly below ball
  if (Math.abs(denominator) < 0.0001) {
    return {
      offsetX: 0,
      offsetY: 0,
    };
  }
  
  // Calculate projection parameter
  const t = -lightPos.z / denominator;
  
  // Calculate shadow position on ground plane
  const shadowX = lightPos.x + t * dx;
  const shadowY = lightPos.y + t * dy;
  
  // Offset is the difference between shadow position and ball position
  const offsetX = shadowX - ballPos.x;
  const offsetY = shadowY - ballPos.y;
  
  return { offsetX, offsetY };
}

/**
 * Calculate shadow blur radius based on ball height and softness parameter.
 * 
 * The blur increases monotonically with height, simulating the shadow becoming
 * more diffuse as the ball moves away from the ground.
 * 
 * @param z - Ball height in normalized coordinates [0,1]
 * @param softness - Softness parameter [0,1] controlling blur amount
 * @param baseRadius - Base radius for scaling blur (typically ball radius)
 * @returns Blur radius in the same units as baseRadius
 */
export function calculateShadowBlur(
  z: number,
  softness: number,
  baseRadius: number
): number {
  // Blur increases with height
  // At Z=0 (ground), blur is minimal
  // At Z=1 (max height), blur is at maximum
  
  // Base blur factor increases with height
  const heightFactor = z;
  
  // Softness scales the overall blur amount
  // softness=0 means sharp shadow, softness=1 means very soft
  const blurFactor = 0.2 + softness * 1.5; // Range: 0.2 to 1.7
  
  // Final blur is proportional to base radius, height, and softness
  const blur = baseRadius * heightFactor * blurFactor;
  
  return Math.max(blur, 0);
}

/**
 * Calculate shadow opacity based on ball height and opacity configuration.
 * 
 * The opacity decreases monotonically with height, simulating the shadow
 * becoming fainter as the ball moves away from the ground.
 * 
 * @param z - Ball height in normalized coordinates [0,1]
 * @param opacityAtGround - Maximum opacity when ball is at ground level [0,1]
 * @returns Opacity value [0,1]
 */
export function calculateShadowOpacity(
  z: number,
  opacityAtGround: number
): number {
  // Opacity decreases with height
  // At Z=0 (ground), opacity is at maximum (opacityAtGround)
  // At Z=1 (max height), opacity approaches 0
  
  // Use exponential decay for more realistic falloff
  const decayFactor = 2.0; // Controls how quickly opacity decreases
  const opacity = opacityAtGround * Math.exp(-decayFactor * z);
  
  return Math.max(0, Math.min(1, opacity));
}

/**
 * Calculate shadow scale based on ball height and minimum scale constraint.
 * 
 * The scale decreases with height but is clamped to minScale to prevent
 * the shadow from disappearing completely at high altitudes.
 * 
 * @param z - Ball height in normalized coordinates [0,1]
 * @param minScale - Minimum scale factor [0,1]
 * @returns Scale factor [minScale, 1]
 */
export function calculateShadowScale(
  z: number,
  minScale: number
): number {
  // Scale decreases with height
  // At Z=0 (ground), scale is 1.0 (full size)
  // At Z=1 (max height), scale is minScale
  
  const scale = 1.0 - z * (1.0 - minScale);
  
  return Math.max(minScale, Math.min(1, scale));
}

/**
 * Create a shadow calculator with the given configuration.
 * 
 * @param options - Shadow configuration options
 * @param canvasWidth - Canvas width for converting normalized coords to pixels
 * @param canvasHeight - Canvas height for converting normalized coords to pixels
 * @param baseRadius - Base ball radius for scaling blur
 * @returns Shadow calculator instance
 */
export function createShadowCalculator(
  options: ShadowOptions,
  canvasWidth: number,
  canvasHeight: number,
  baseRadius: number
): ShadowCalculator {
  // Merge with defaults
  const config: Required<ShadowOptions> = {
    ...DEFAULT_SHADOW_OPTIONS,
    ...options,
  };
  
  return {
    compute(ballPos: Vec3, lightPos: Vec3): ShadowParams {
      // Calculate offset in normalized coordinates
      const { offsetX, offsetY } = calculateShadowOffset(ballPos, lightPos);
      
      // Convert offset to canvas pixels
      const offsetXPx = offsetX * canvasWidth;
      const offsetYPx = offsetY * canvasHeight;
      
      // Calculate blur radius
      const blur = calculateShadowBlur(ballPos.z, config.softness, baseRadius);
      
      // Calculate opacity
      const opacity = calculateShadowOpacity(ballPos.z, config.opacityAtGround);
      
      // Calculate scale
      const scale = calculateShadowScale(ballPos.z, config.minScale);
      
      return {
        offsetX: offsetXPx,
        offsetY: offsetYPx,
        blur,
        opacity,
        scale,
      };
    },
  };
}
