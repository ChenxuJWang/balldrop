/**
 * Ball Animation Library - Main Entry Point
 * 
 * This is the primary API for creating and controlling ball animations.
 * 
 * @example
 * ```typescript
 * import { createBallAnimation } from '@ballfx/core';
 * 
 * const animation = createBallAnimation({
 *   mount: document.getElementById('container'),
 *   driver: 'time',
 *   durationMs: 3000,
 *   loop: true,
 *   curvePreset: 'sine',
 *   light: { x: 0.5, y: 0.5, z: 2.0 }
 * });
 * 
 * animation.play();
 * ```
 */

import type { AnimationConfig, AnimationInstance, ProgressDriver, CurveFn, BallStyle } from './types';
import { createCanvasManager } from './core/canvas';
import { TimeDriver, ScrollDriver } from './core/timeline';
import { 
  getCurvePreset, 
  createCustomCurveAdapter, 
  createKeypointCurve 
} from './core/curves';
import { createShadowCalculator } from './core/shadow';
import { Renderer } from './core/render';
import { createInteractionManager } from './core/interactions';
import { validateConfig, applyDefaults } from './core/config';

// Re-export types for convenience
export type {
  AnimationConfig,
  AnimationInstance,
  LightSource,
  ShadowOptions,
  Keypoint,
  InteractiveZone,
  BallStyle,
  Vec2,
  Vec3,
} from './types';

// Re-export internal modules for advanced usage and demos
export { createCanvasManager } from './core/canvas';
export { createShadowCalculator } from './core/shadow';
export { Renderer } from './core/render';
export { 
  getCurvePreset, 
  createCustomCurveAdapter, 
  createKeypointCurve,
  linear,
  sine,
  cosine,
  easeInOut,
  bezier,
} from './core/curves';
export { TimeDriver, ScrollDriver } from './core/timeline';
export { createInteractionManager } from './core/interactions';

/**
 * Create a ball animation instance.
 * 
 * This is the main factory function that integrates all modules:
 * - Canvas management with DPR scaling and coordinate transforms
 * - Progress driver (time or scroll based)
 * - Curve computation for height animation
 * - Shadow calculation and rendering
 * - Render loop with requestAnimationFrame
 * - Interactive zones with event callbacks
 * 
 * @param config - Animation configuration object
 * @returns AnimationInstance with control methods
 * @throws {ConfigValidationError} If configuration is invalid
 * 
 * @example
 * ```typescript
 * // Time-based animation
 * const animation = createBallAnimation({
 *   mount: document.getElementById('container'),
 *   driver: 'time',
 *   durationMs: 3000,
 *   loop: true,
 *   curvePreset: 'sine',
 *   light: { x: 0.5, y: 0.5, z: 2.0 }
 * });
 * 
 * animation.play();
 * 
 * // Scroll-based animation
 * const scrollAnimation = createBallAnimation({
 *   mount: document.getElementById('container'),
 *   driver: 'scroll',
 *   scrollTarget: document.scrollingElement,
 *   curvePreset: 'easeInOut',
 *   light: { x: 0.75, y: 0.25, z: 2.5 }
 * });
 * 
 * scrollAnimation.play();
 * ```
 */
export function createBallAnimation(config: AnimationConfig): AnimationInstance {
  // Validate configuration
  validateConfig(config);
  
  // Apply defaults
  const fullConfig = applyDefaults(config);
  
  // Create canvas manager
  const canvas = createCanvasManager({
    container: fullConfig.mount,
    width: fullConfig.width,
    height: fullConfig.height,
    fitMode: fullConfig.fitMode,
  });
  
  // Create progress driver based on driver type
  let driver: ProgressDriver;
  if (fullConfig.driver === 'time') {
    driver = new TimeDriver({
      durationMs: fullConfig.durationMs!,
      loop: fullConfig.loop,
    });
  } else {
    driver = new ScrollDriver({
      scrollTarget: fullConfig.scrollTarget ?? null,
    });
  }
  
  // Create curve function based on configuration priority:
  // 1. Keypoints (highest priority)
  // 2. Custom curve function
  // 3. Preset curve (default)
  let curveFn: CurveFn;
  if (fullConfig.keypoints && fullConfig.keypoints.length > 0) {
    curveFn = createKeypointCurve(fullConfig.keypoints);
  } else if (fullConfig.customCurve) {
    curveFn = createCustomCurveAdapter(fullConfig.customCurve);
  } else {
    curveFn = getCurvePreset(fullConfig.curvePreset);
  }
  
  // Ensure ballStyle has all required fields
  const ballStyle: Required<BallStyle> = {
    fill: fullConfig.ballStyle.fill ?? '#3b82f6',
    stroke: fullConfig.ballStyle.stroke ?? 'none',
    strokeWidth: fullConfig.ballStyle.strokeWidth ?? 0,
    radiusAtGround: fullConfig.ballStyle.radiusAtGround ?? 20,
    radiusAtMax: fullConfig.ballStyle.radiusAtMax ?? 40,
  };
  
  // Create shadow calculator
  const shadowCalculator = createShadowCalculator(
    fullConfig.shadow,
    canvas.width,
    canvas.height,
    ballStyle.radiusAtGround
  );
  
  // Create interaction manager
  const interactionManager = createInteractionManager(canvas);
  
  // Add zones to interaction manager
  if (fullConfig.zones && fullConfig.zones.length > 0) {
    for (const zone of fullConfig.zones) {
      interactionManager.addZone(zone);
    }
  }
  
  // Create renderer with interaction manager
  const renderer = new Renderer({
    canvas,
    driver,
    curveFn,
    pathX: fullConfig.pathX,
    pathY: fullConfig.pathY,
    shadowCalculator,
    light: fullConfig.light,
    ballStyle,
    zones: fullConfig.zones,
    debug: fullConfig.debug,
    interactionManager,
  });
  
  // Track if animation has been destroyed
  let isDestroyed = false;
  
  // Create animation instance with control methods
  const instance: AnimationInstance = {
    play(): void {
      if (isDestroyed) {
        console.warn('[Ball Animation] Cannot play: animation has been destroyed');
        return;
      }
      
      driver.start();
      renderer.start();
    },
    
    pause(): void {
      if (isDestroyed) {
        console.warn('[Ball Animation] Cannot pause: animation has been destroyed');
        return;
      }
      
      driver.pause();
      // Renderer continues running to show paused state
    },
    
    stop(): void {
      if (isDestroyed) {
        console.warn('[Ball Animation] Cannot stop: animation has been destroyed');
        return;
      }
      
      driver.stop();
      renderer.stop();
    },
    
    setProgress(progress: number): void {
      if (isDestroyed) {
        console.warn('[Ball Animation] Cannot set progress: animation has been destroyed');
        return;
      }
      
      // Validate progress value
      const clampedProgress = Math.max(0, Math.min(1, progress));
      if (clampedProgress !== progress) {
        console.warn(
          `[Ball Animation] Progress value ${progress} out of range [0,1], clamping to ${clampedProgress}`
        );
      }
      
      // Stop the current driver
      driver.stop();
      
      // Create a manual driver that returns the fixed progress
      const manualDriver: ProgressDriver = {
        start: () => {},
        stop: () => {},
        pause: () => {},
        resume: () => {},
        getProgress: () => clampedProgress,
        destroy: () => {},
      };
      
      // Replace the driver temporarily
      // Note: This is a simplified implementation. A full implementation would
      // need to properly manage driver lifecycle and allow resuming normal playback
      (renderer as any).config.driver = manualDriver;
      
      // Ensure renderer is running to show the new progress
      if (!renderer['isRunning']) {
        renderer.start();
      }
    },
    
    updateConfig(partialConfig: Partial<AnimationConfig>): void {
      if (isDestroyed) {
        console.warn('[Ball Animation] Cannot update config: animation has been destroyed');
        return;
      }
      
      // Track which properties can be updated at runtime
      const updatableProperties = ['debug', 'light', 'shadow', 'ballStyle', 'zones'];
      const requestedUpdates = Object.keys(partialConfig);
      const nonUpdatableRequests = requestedUpdates.filter(
        key => !updatableProperties.includes(key)
      );
      
      if (nonUpdatableRequests.length > 0) {
        console.warn(
          `[Ball Animation] The following properties cannot be updated at runtime: ${nonUpdatableRequests.join(', ')}. ` +
          'To change these properties, destroy and recreate the animation.'
        );
      }
      
      // Update debug mode
      if (partialConfig.debug !== undefined) {
        (renderer as any).config.debug = partialConfig.debug;
      }
      
      // Update light position
      if (partialConfig.light !== undefined) {
        (renderer as any).config.light = partialConfig.light;
      }
      
      // Update shadow options
      if (partialConfig.shadow !== undefined) {
        // Recreate shadow calculator with new options
        const newShadowCalculator = createShadowCalculator(
          { ...fullConfig.shadow, ...partialConfig.shadow },
          canvas.width,
          canvas.height,
          ballStyle.radiusAtGround
        );
        (renderer as any).config.shadowCalculator = newShadowCalculator;
      }
      
      // Update ball style
      if (partialConfig.ballStyle !== undefined) {
        const updatedBallStyle: Required<BallStyle> = {
          ...ballStyle,
          ...partialConfig.ballStyle,
        };
        (renderer as any).config.ballStyle = updatedBallStyle;
        
        // Update shadow calculator if radius changed
        if (partialConfig.ballStyle.radiusAtGround !== undefined) {
          const newShadowCalculator = createShadowCalculator(
            fullConfig.shadow,
            canvas.width,
            canvas.height,
            updatedBallStyle.radiusAtGround
          );
          (renderer as any).config.shadowCalculator = newShadowCalculator;
        }
      }
      
      // Update zones
      if (partialConfig.zones !== undefined) {
        // Clear existing zones
        for (const zone of fullConfig.zones) {
          interactionManager.removeZone(zone.id);
        }
        
        // Add new zones
        for (const zone of partialConfig.zones) {
          interactionManager.addZone(zone);
        }
        
        (renderer as any).config.zones = partialConfig.zones;
        fullConfig.zones = partialConfig.zones;
      }
    },
    
    destroy(): void {
      if (isDestroyed) {
        return; // Already destroyed, safe to call multiple times
      }
      
      isDestroyed = true;
      
      // Stop and clean up all modules in reverse order of creation
      renderer.stop();
      renderer.destroy();
      
      interactionManager.destroy();
      
      driver.stop();
      driver.destroy();
      
      canvas.destroy();
      
      console.log('[Ball Animation] Animation instance destroyed');
    },
  };
  
  return instance;
}
