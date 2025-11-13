/**
 * Configuration validation and defaults system
 * 
 * This module provides validation for AnimationConfig objects and applies
 * sensible defaults for optional fields.
 */

import type { AnimationConfig, ShadowOptions, BallStyle } from '../types';

/**
 * Validation error thrown when configuration is invalid.
 */
export class ConfigValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigValidationError';
  }
}

/**
 * Default values for optional configuration fields.
 */
export const CONFIG_DEFAULTS = {
  fitMode: 'contain' as const,
  loop: false,
  debug: false,
  curvePreset: 'linear' as const,
  
  shadow: {
    softness: 0.5,
    opacityAtGround: 0.3,
    minScale: 0.1,
  } satisfies Required<ShadowOptions>,
  
  ballStyle: {
    fill: '#3b82f6',
    stroke: 'none',
    strokeWidth: 0,
    radiusAtGround: 20,
    radiusAtMax: 40,
  } satisfies Required<BallStyle>,
  
  zones: [],
  
  // Default path functions
  pathX: (_t: number) => 0.5,  // centered horizontally
  pathY: (t: number) => t,     // top to bottom
};

/**
 * Validates the AnimationConfig object and throws descriptive errors for invalid configurations.
 * 
 * @param config - The configuration object to validate
 * @throws {ConfigValidationError} If the configuration is invalid
 * 
 * @example
 * ```typescript
 * try {
 *   validateConfig(config);
 * } catch (error) {
 *   if (error instanceof ConfigValidationError) {
 *     console.error('Invalid configuration:', error.message);
 *   }
 * }
 * ```
 */
export function validateConfig(config: AnimationConfig): void {
  // Validate required fields
  if (!config.mount) {
    throw new ConfigValidationError(
      'Missing required field "mount". Expected an HTMLElement to mount the canvas into.'
    );
  }
  
  if (!(config.mount instanceof HTMLElement)) {
    throw new ConfigValidationError(
      'Invalid field "mount". Expected an HTMLElement, but got ' + typeof config.mount + '.'
    );
  }
  
  if (!config.driver) {
    throw new ConfigValidationError(
      'Missing required field "driver". Expected "time" or "scroll".'
    );
  }
  
  if (config.driver !== 'time' && config.driver !== 'scroll') {
    throw new ConfigValidationError(
      `Invalid field "driver". Expected "time" or "scroll", but got "${config.driver}".`
    );
  }
  
  if (!config.light) {
    throw new ConfigValidationError(
      'Missing required field "light". Expected an object with x, y, and z coordinates.'
    );
  }
  
  // Validate light source
  if (typeof config.light !== 'object' || config.light === null) {
    throw new ConfigValidationError(
      'Invalid field "light". Expected an object with x, y, and z coordinates.'
    );
  }
  
  if (typeof config.light.x !== 'number' || isNaN(config.light.x)) {
    throw new ConfigValidationError(
      'Invalid field "light.x". Expected a number, but got ' + typeof config.light.x + '.'
    );
  }
  
  if (typeof config.light.y !== 'number' || isNaN(config.light.y)) {
    throw new ConfigValidationError(
      'Invalid field "light.y". Expected a number, but got ' + typeof config.light.y + '.'
    );
  }
  
  if (typeof config.light.z !== 'number' || isNaN(config.light.z)) {
    throw new ConfigValidationError(
      'Invalid field "light.z". Expected a number, but got ' + typeof config.light.z + '.'
    );
  }
  
  // Conditional validation based on driver type
  if (config.driver === 'time') {
    if (config.durationMs === undefined || config.durationMs === null) {
      throw new ConfigValidationError(
        'Missing required field "durationMs" for time-based driver. Expected a number in milliseconds.'
      );
    }
    
    if (typeof config.durationMs !== 'number' || isNaN(config.durationMs)) {
      throw new ConfigValidationError(
        'Invalid field "durationMs". Expected a number, but got ' + typeof config.durationMs + '.'
      );
    }
    
    if (config.durationMs <= 0) {
      throw new ConfigValidationError(
        'Invalid field "durationMs". Expected a positive number, but got ' + config.durationMs + '.'
      );
    }
  }
  
  if (config.driver === 'scroll') {
    if (config.scrollTarget === undefined) {
      throw new ConfigValidationError(
        'Missing required field "scrollTarget" for scroll-based driver. Expected an HTMLElement or null.'
      );
    }
    
    if (config.scrollTarget !== null && !(config.scrollTarget instanceof HTMLElement)) {
      throw new ConfigValidationError(
        'Invalid field "scrollTarget". Expected an HTMLElement or null, but got ' + typeof config.scrollTarget + '.'
      );
    }
  }
  
  // Validate optional fields if provided
  if (config.width !== undefined) {
    if (typeof config.width !== 'number' || isNaN(config.width) || config.width <= 0) {
      throw new ConfigValidationError(
        'Invalid field "width". Expected a positive number, but got ' + config.width + '.'
      );
    }
  }
  
  if (config.height !== undefined) {
    if (typeof config.height !== 'number' || isNaN(config.height) || config.height <= 0) {
      throw new ConfigValidationError(
        'Invalid field "height". Expected a positive number, but got ' + config.height + '.'
      );
    }
  }
  
  if (config.fitMode !== undefined) {
    const validFitModes = ['contain', 'cover', 'stretch'];
    if (!validFitModes.includes(config.fitMode)) {
      throw new ConfigValidationError(
        `Invalid field "fitMode". Expected "contain", "cover", or "stretch", but got "${config.fitMode}".`
      );
    }
  }
  
  if (config.curvePreset !== undefined) {
    const validPresets = ['sine', 'cosine', 'easeInOut', 'linear', 'bezier'];
    if (!validPresets.includes(config.curvePreset)) {
      throw new ConfigValidationError(
        `Invalid field "curvePreset". Expected one of ${validPresets.join(', ')}, but got "${config.curvePreset}".`
      );
    }
  }
  
  if (config.customCurve !== undefined && typeof config.customCurve !== 'function') {
    throw new ConfigValidationError(
      'Invalid field "customCurve". Expected a function, but got ' + typeof config.customCurve + '.'
    );
  }
  
  if (config.pathX !== undefined && typeof config.pathX !== 'function') {
    throw new ConfigValidationError(
      'Invalid field "pathX". Expected a function, but got ' + typeof config.pathX + '.'
    );
  }
  
  if (config.pathY !== undefined && typeof config.pathY !== 'function') {
    throw new ConfigValidationError(
      'Invalid field "pathY". Expected a function, but got ' + typeof config.pathY + '.'
    );
  }
  
  if (config.loop !== undefined) {
    if (typeof config.loop !== 'boolean' && typeof config.loop !== 'number') {
      throw new ConfigValidationError(
        'Invalid field "loop". Expected a boolean or number, but got ' + typeof config.loop + '.'
      );
    }
    
    if (typeof config.loop === 'number' && (config.loop < 0 || !Number.isInteger(config.loop))) {
      throw new ConfigValidationError(
        'Invalid field "loop". Expected a non-negative integer, but got ' + config.loop + '.'
      );
    }
  }
  
  // Validate keypoints if provided
  if (config.keypoints !== undefined) {
    if (!Array.isArray(config.keypoints)) {
      throw new ConfigValidationError(
        'Invalid field "keypoints". Expected an array, but got ' + typeof config.keypoints + '.'
      );
    }
    
    config.keypoints.forEach((kp, index) => {
      if (typeof kp.y !== 'number' || isNaN(kp.y)) {
        throw new ConfigValidationError(
          `Invalid keypoint at index ${index}. Field "y" must be a number.`
        );
      }
      if (typeof kp.zMin !== 'number' || isNaN(kp.zMin)) {
        throw new ConfigValidationError(
          `Invalid keypoint at index ${index}. Field "zMin" must be a number.`
        );
      }
      if (typeof kp.zMax !== 'number' || isNaN(kp.zMax)) {
        throw new ConfigValidationError(
          `Invalid keypoint at index ${index}. Field "zMax" must be a number.`
        );
      }
    });
  }
  
  // Validate zones if provided
  if (config.zones !== undefined) {
    if (!Array.isArray(config.zones)) {
      throw new ConfigValidationError(
        'Invalid field "zones". Expected an array, but got ' + typeof config.zones + '.'
      );
    }
    
    config.zones.forEach((zone, index) => {
      if (!zone.id) {
        throw new ConfigValidationError(
          `Invalid zone at index ${index}. Missing required field "id".`
        );
      }
      
      if (zone.shape !== 'circle' && zone.shape !== 'rect') {
        throw new ConfigValidationError(
          `Invalid zone at index ${index}. Field "shape" must be "circle" or "rect", but got "${zone.shape}".`
        );
      }
      
      if (!zone.bounds || typeof zone.bounds !== 'object') {
        throw new ConfigValidationError(
          `Invalid zone at index ${index}. Missing required field "bounds".`
        );
      }
      
      if (zone.shape === 'circle' && typeof zone.bounds.radius !== 'number') {
        throw new ConfigValidationError(
          `Invalid zone at index ${index}. Circular zones require "bounds.radius" to be a number.`
        );
      }
      
      if (zone.shape === 'rect') {
        if (typeof zone.bounds.width !== 'number') {
          throw new ConfigValidationError(
            `Invalid zone at index ${index}. Rectangular zones require "bounds.width" to be a number.`
          );
        }
        if (typeof zone.bounds.height !== 'number') {
          throw new ConfigValidationError(
            `Invalid zone at index ${index}. Rectangular zones require "bounds.height" to be a number.`
          );
        }
      }
    });
  }
}

/**
 * Applies default values to optional configuration fields.
 * Returns a new configuration object with defaults merged in.
 * 
 * @param config - The user-provided configuration
 * @returns A new configuration object with defaults applied
 * 
 * @example
 * ```typescript
 * const userConfig = {
 *   mount: element,
 *   driver: 'time',
 *   durationMs: 3000,
 *   light: { x: 0.5, y: 0.5, z: 2.0 }
 * };
 * 
 * const fullConfig = applyDefaults(userConfig);
 * // fullConfig now includes default values for shadow, ballStyle, etc.
 * ```
 */
export function applyDefaults(config: AnimationConfig): Required<AnimationConfig> {
  return {
    mount: config.mount,
    driver: config.driver,
    durationMs: config.durationMs,
    loop: config.loop ?? CONFIG_DEFAULTS.loop,
    scrollTarget: config.scrollTarget,
    width: config.width,
    height: config.height,
    fitMode: config.fitMode ?? CONFIG_DEFAULTS.fitMode,
    curvePreset: config.curvePreset ?? CONFIG_DEFAULTS.curvePreset,
    customCurve: config.customCurve,
    keypoints: config.keypoints,
    pathX: config.pathX ?? CONFIG_DEFAULTS.pathX,
    pathY: config.pathY ?? CONFIG_DEFAULTS.pathY,
    light: config.light,
    shadow: {
      ...CONFIG_DEFAULTS.shadow,
      ...config.shadow,
    },
    ballStyle: {
      ...CONFIG_DEFAULTS.ballStyle,
      ...config.ballStyle,
    },
    zones: config.zones ?? CONFIG_DEFAULTS.zones,
    debug: config.debug ?? CONFIG_DEFAULTS.debug,
  } as Required<AnimationConfig>;
}
