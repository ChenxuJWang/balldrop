/**
 * Ball Animation Library - Type Definitions
 * 
 * This file contains all public and internal type definitions for the ball animation library.
 * Public types are exported and documented with JSDoc comments.
 * Internal types are used within the library implementation.
 */

// ============================================================================
// PUBLIC TYPES - Exported API
// ============================================================================

/**
 * 2D vector representing a position in normalized world space [0,1]
 */
export interface Vec2 {
  x: number;
  y: number;
}

/**
 * 3D vector representing a position with height
 */
export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/**
 * Light source configuration for shadow calculations.
 * Coordinates are in normalized world space where (0,0) is top-left and (1,1) is bottom-right.
 * The Z coordinate represents height above the canvas plane.
 * 
 * @example
 * ```typescript
 * const light: LightSource = {
 *   x: 0.5,  // centered horizontally
 *   y: 0.5,  // centered vertically
 *   z: 2.0   // twice the canvas height above the plane
 * };
 * ```
 */
export interface LightSource {
  /** Horizontal position in normalized coordinates [0,1] */
  x: number;
  /** Vertical position in normalized coordinates [0,1] */
  y: number;
  /** Height above the canvas plane (typically 1-3) */
  z: number;
}

/**
 * Shadow rendering options that control the appearance of the ball's shadow.
 * All parameters affect how the shadow changes as the ball moves higher (increasing Z).
 * 
 * @example
 * ```typescript
 * const shadowOptions: ShadowOptions = {
 *   softness: 0.7,        // moderately soft shadow edges
 *   opacityAtGround: 0.4, // 40% opacity when ball is at ground level
 *   minScale: 0.2         // shadow won't shrink below 20% of ball size
 * };
 * ```
 */
export interface ShadowOptions {
  /**
   * Controls shadow blur amount, mapped to blur radius.
   * Range: [0,1] where 0 is sharp and 1 is very soft.
   * @default 0.5
   */
  softness?: number;
  
  /**
   * Maximum shadow opacity when ball is at ground level (Z=0).
   * Range: [0,1] where 0 is transparent and 1 is opaque.
   * @default 0.3
   */
  opacityAtGround?: number;
  
  /**
   * Minimum shadow scale at maximum height to prevent shadow from disappearing.
   * Range: [0,1] as a fraction of the ball's radius.
   * @default 0.1
   */
  minScale?: number;
}

/**
 * Keypoint for defining height curves based on Y position.
 * The system interpolates smoothly between keypoints to create continuous motion.
 * 
 * @example
 * ```typescript
 * const keypoints: Keypoint[] = [
 *   { y: 0.0, zMin: 0.0, zMax: 0.2 },  // start low
 *   { y: 0.5, zMin: 0.8, zMax: 1.0 },  // peak in middle
 *   { y: 1.0, zMin: 0.0, zMax: 0.2 }   // end low
 * ];
 * ```
 */
export interface Keypoint {
  /** Y position in normalized coordinates [0,1] where this keypoint applies */
  y: number;
  /** Minimum Z height at this keypoint [0,1] */
  zMin: number;
  /** Maximum Z height at this keypoint [0,1] */
  zMax: number;
}

/**
 * Interactive zone definition for detecting ball interactions.
 * Zones can be circular or rectangular and trigger callbacks when the ball enters, exits, or reaches peaks/valleys.
 * 
 * @example
 * ```typescript
 * const zone: InteractiveZone = {
 *   id: 'cta-zone',
 *   shape: 'circle',
 *   bounds: { x: 0.5, y: 0.3, radius: 0.15 },
 *   onEnter: () => console.log('Ball entered zone'),
 *   onExit: () => console.log('Ball left zone'),
 *   onClick: (event) => console.log('Zone clicked', event)
 * };
 * ```
 */
export interface InteractiveZone {
  /** Unique identifier for this zone */
  id: string;
  
  /** Shape type of the zone */
  shape: 'circle' | 'rect';
  
  /**
   * Zone boundaries in normalized world coordinates [0,1].
   * For circles: { x, y, radius }
   * For rectangles: { x, y, width, height }
   */
  bounds: {
    x: number;
    y: number;
    radius?: number;
    width?: number;
    height?: number;
  };
  
  /**
   * Called once when the ball enters the zone.
   * @param zone - The zone that was entered
   */
  onEnter?: (zone: InteractiveZone) => void;
  
  /**
   * Called once when the ball exits the zone.
   * @param zone - The zone that was exited
   */
  onExit?: (zone: InteractiveZone) => void;
  
  /**
   * Called when the zone is clicked.
   * @param event - The mouse event
   * @param zone - The zone that was clicked
   */
  onClick?: (event: MouseEvent, zone: InteractiveZone) => void;
  
  /**
   * Called when the ball reaches a local maximum Z height within the zone.
   * @param z - The Z height at the peak
   * @param zone - The zone where the peak occurred
   */
  onPeak?: (z: number, zone: InteractiveZone) => void;
  
  /**
   * Called when the ball reaches a local minimum Z height within the zone.
   * @param z - The Z height at the valley
   * @param zone - The zone where the valley occurred
   */
  onValley?: (z: number, zone: InteractiveZone) => void;
}

/**
 * Visual styling options for the ball.
 * 
 * @example
 * ```typescript
 * const ballStyle: BallStyle = {
 *   fill: '#ff6b6b',
 *   stroke: '#c92a2a',
 *   strokeWidth: 2,
 *   radiusAtGround: 30,
 *   radiusAtMax: 60
 * };
 * ```
 */
export interface BallStyle {
  /**
   * Fill color for the ball (CSS color string).
   * @default '#3b82f6'
   */
  fill?: string;
  
  /**
   * Stroke color for the ball outline (CSS color string).
   * @default 'none'
   */
  stroke?: string;
  
  /**
   * Stroke width in pixels.
   * @default 0
   */
  strokeWidth?: number;
  
  /**
   * Ball radius in pixels when at ground level (Z=0).
   * @default 20
   */
  radiusAtGround?: number;
  
  /**
   * Ball radius in pixels when at maximum height (Z=1).
   * @default 40
   */
  radiusAtMax?: number;
}

/**
 * Main configuration object for creating a ball animation.
 * This is the primary interface developers use to configure the animation behavior.
 * 
 * @example
 * ```typescript
 * // Time-based animation
 * const config: AnimationConfig = {
 *   mount: document.getElementById('canvas-container'),
 *   driver: 'time',
 *   durationMs: 3000,
 *   loop: true,
 *   curvePreset: 'sine',
 *   light: { x: 0.5, y: 0.5, z: 2.0 }
 * };
 * 
 * // Scroll-based animation
 * const scrollConfig: AnimationConfig = {
 *   mount: document.getElementById('canvas-container'),
 *   driver: 'scroll',
 *   scrollTarget: document.scrollingElement,
 *   curvePreset: 'easeInOut',
 *   light: { x: 0.75, y: 0.25, z: 2.5 }
 * };
 * ```
 */
export interface AnimationConfig {
  /**
   * DOM element to mount the canvas into.
   * The canvas will be sized to fill this container.
   */
  mount: HTMLElement;
  
  /**
   * Animation driver type.
   * - 'time': Progress based on elapsed time
   * - 'scroll': Progress based on scroll position
   */
  driver: 'time' | 'scroll';
  
  /**
   * Animation duration in milliseconds.
   * Required when driver is 'time'.
   */
  durationMs?: number;
  
  /**
   * Looping behavior for time-based animations.
   * - true: Loop infinitely
   * - false: Play once and stop
   * - number: Loop N times
   * @default false
   */
  loop?: boolean | number;
  
  /**
   * Scroll container element for scroll-based animations.
   * Required when driver is 'scroll'.
   */
  scrollTarget?: HTMLElement | null;
  
  /**
   * Canvas width in CSS pixels.
   * If omitted, uses container width.
   */
  width?: number;
  
  /**
   * Canvas height in CSS pixels.
   * If omitted, uses container height.
   */
  height?: number;
  
  /**
   * How the canvas should fit within its container.
   * - 'contain': Fit inside container, maintain aspect ratio
   * - 'cover': Fill container, maintain aspect ratio (may crop)
   * - 'stretch': Fill container, ignore aspect ratio
   * @default 'contain'
   */
  fitMode?: 'contain' | 'cover' | 'stretch';
  
  /**
   * Preset curve name for height animation.
   * Options: 'sine', 'cosine', 'easeInOut', 'linear', 'bezier'
   */
  curvePreset?: 'sine' | 'cosine' | 'easeInOut' | 'linear' | 'bezier';
  
  /**
   * Custom curve function for height animation.
   * Takes progress t in [0,1] and returns height z in [0,1].
   * If provided, overrides curvePreset.
   */
  customCurve?: (t: number) => number;
  
  /**
   * Keypoints for defining height curve based on Y position.
   * If provided, overrides curvePreset and customCurve.
   */
  keypoints?: Keypoint[];
  
  /**
   * Custom function for horizontal position over time.
   * Takes progress t in [0,1] and returns x position in [0,1].
   * @default (t) => 0.5 (centered)
   */
  pathX?: (t: number) => number;
  
  /**
   * Custom function for vertical position over time.
   * Takes progress t in [0,1] and returns y position in [0,1].
   * @default (t) => t (top to bottom)
   */
  pathY?: (t: number) => number;
  
  /**
   * Light source configuration for shadow calculations.
   * Required field.
   */
  light: LightSource;
  
  /**
   * Shadow rendering options.
   */
  shadow?: ShadowOptions;
  
  /**
   * Ball visual styling options.
   */
  ballStyle?: BallStyle;
  
  /**
   * Interactive zones for user interaction.
   */
  zones?: InteractiveZone[];
  
  /**
   * Enable debug mode to visualize zones, light position, and guides.
   * @default false
   */
  debug?: boolean;
}

/**
 * Animation instance returned by createBallAnimation().
 * Provides methods to control playback and update configuration at runtime.
 * 
 * @example
 * ```typescript
 * const animation = createBallAnimation(config);
 * 
 * // Control playback
 * animation.play();
 * animation.pause();
 * animation.stop();
 * 
 * // Manual control
 * animation.setProgress(0.5);
 * 
 * // Update configuration
 * animation.updateConfig({ light: { x: 0.6, y: 0.4, z: 2.0 } });
 * 
 * // Cleanup
 * animation.destroy();
 * ```
 */
export interface AnimationInstance {
  /**
   * Start or resume the animation.
   * For time-based animations, begins the timeline.
   * For scroll-based animations, enables scroll tracking.
   */
  play(): void;
  
  /**
   * Pause the animation, maintaining current progress.
   * Can be resumed with play().
   */
  pause(): void;
  
  /**
   * Stop the animation and reset progress to 0.
   */
  stop(): void;
  
  /**
   * Manually set the animation progress.
   * @param progress - Progress value in [0,1]
   */
  setProgress(progress: number): void;
  
  /**
   * Update configuration at runtime.
   * Not all properties can be changed after initialization.
   * @param config - Partial configuration to merge with current config
   */
  updateConfig(config: Partial<AnimationConfig>): void;
  
  /**
   * Destroy the animation instance and clean up all resources.
   * Removes event listeners, cancels animation frames, and clears the canvas.
   * Safe to call multiple times.
   */
  destroy(): void;
}

// ============================================================================
// INTERNAL TYPES - Used within library implementation
// ============================================================================

/**
 * Abstract interface for progress drivers.
 * Drivers map external inputs (time or scroll) to normalized progress [0,1].
 * @internal
 */
export interface ProgressDriver {
  /**
   * Start the driver (begin tracking time or scroll).
   */
  start(): void;
  
  /**
   * Stop the driver and reset state.
   */
  stop(): void;
  
  /**
   * Pause the driver, maintaining current progress.
   */
  pause(): void;
  
  /**
   * Resume the driver from paused state.
   */
  resume(): void;
  
  /**
   * Get the current progress value.
   * @returns Progress in [0,1]
   */
  getProgress(): number;
  
  /**
   * Clean up resources and remove event listeners.
   */
  destroy(): void;
}

/**
 * Curve function signature.
 * Maps progress t to height z, both in normalized range [0,1].
 * @internal
 */
export type CurveFn = (t: number) => number;

/**
 * Canvas manager interface for handling canvas lifecycle and coordinate transforms.
 * @internal
 */
export interface CanvasManager {
  /** The canvas element */
  element: HTMLCanvasElement;
  
  /** 2D rendering context */
  context: CanvasRenderingContext2D;
  
  /** Logical width in CSS pixels */
  width: number;
  
  /** Logical height in CSS pixels */
  height: number;
  
  /** Device pixel ratio for high-DPI displays */
  dpr: number;
  
  /**
   * Resize the canvas to new dimensions.
   * @param width - New width in CSS pixels (optional)
   * @param height - New height in CSS pixels (optional)
   */
  resize(width?: number, height?: number): void;
  
  /**
   * Convert CSS pixel coordinates to normalized world coordinates.
   * @param cssX - X coordinate in CSS pixels
   * @param cssY - Y coordinate in CSS pixels
   * @returns Normalized coordinates in [0,1]
   */
  toWorldCoords(cssX: number, cssY: number): Vec2;
  
  /**
   * Convert normalized world coordinates to CSS pixel coordinates.
   * @param worldX - X coordinate in [0,1]
   * @param worldY - Y coordinate in [0,1]
   * @returns CSS pixel coordinates
   */
  toCSSCoords(worldX: number, worldY: number): Vec2;
  
  /**
   * Clean up and remove the canvas.
   */
  destroy(): void;
}

/**
 * Shadow calculation parameters returned by the shadow calculator.
 * @internal
 */
export interface ShadowParams {
  /** Shadow offset in X direction (canvas pixels) */
  offsetX: number;
  
  /** Shadow offset in Y direction (canvas pixels) */
  offsetY: number;
  
  /** Shadow blur radius (canvas pixels) */
  blur: number;
  
  /** Shadow opacity [0,1] */
  opacity: number;
  
  /** Shadow scale factor [0,1] */
  scale: number;
}

/**
 * Shadow calculator interface for computing shadow parameters.
 * @internal
 */
export interface ShadowCalculator {
  /**
   * Compute shadow parameters based on ball and light positions.
   * @param ballPos - Ball position in 3D world space
   * @param lightPos - Light position in 3D world space
   * @returns Shadow rendering parameters
   */
  compute(ballPos: Vec3, lightPos: Vec3): ShadowParams;
}

/**
 * Interaction manager interface for handling zones and events.
 * @internal
 */
export interface InteractionManager {
  /**
   * Add an interactive zone.
   * @param zone - Zone configuration
   */
  addZone(zone: InteractiveZone): void;
  
  /**
   * Remove an interactive zone by ID.
   * @param id - Zone identifier
   */
  removeZone(id: string): void;
  
  /**
   * Update ball position and check for zone interactions.
   * @param ballPos - Ball position in 2D world space
   * @param ballZ - Ball height [0,1]
   */
  update(ballPos: Vec2, ballZ: number): void;
  
  /**
   * Handle click events on the canvas.
   * @param event - Mouse event
   */
  handleClick(event: MouseEvent): void;
  
  /**
   * Clean up resources.
   */
  destroy(): void;
}

/**
 * Internal ball state tracked during animation.
 * @internal
 */
export interface BallState {
  /** Current progress [0,1] */
  t: number;
  
  /** X position in normalized world space [0,1] */
  x: number;
  
  /** Y position in normalized world space [0,1] */
  y: number;
  
  /** Height in normalized world space [0,1] */
  z: number;
  
  /** Ball radius in canvas pixels */
  radius: number;
  
  /** Shadow rendering parameters */
  shadow: ShadowParams;
}
