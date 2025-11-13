/**
 * Render Loop and Drawing System
 * 
 * This module implements the main render loop using requestAnimationFrame,
 * and provides drawing functions for the ball and shadow.
 */

import type {
  CanvasManager,
  ProgressDriver,
  CurveFn,
  ShadowCalculator,
  BallState,
  Vec3,
  BallStyle,
  InteractiveZone,
  LightSource,
} from '../types';

/**
 * Configuration for the renderer
 */
export interface RendererConfig {
  /** Canvas manager for drawing */
  canvas: CanvasManager;
  
  /** Progress driver (time or scroll based) */
  driver: ProgressDriver;
  
  /** Curve function for Z height */
  curveFn: CurveFn;
  
  /** Path function for X position */
  pathX: CurveFn;
  
  /** Path function for Y position */
  pathY: CurveFn;
  
  /** Shadow calculator */
  shadowCalculator: ShadowCalculator;
  
  /** Light source position */
  light: LightSource;
  
  /** Ball styling options */
  ballStyle: Required<BallStyle>;
  
  /** Interactive zones (optional) */
  zones?: InteractiveZone[];
  
  /** Enable debug mode */
  debug?: boolean;
}

/**
 * Performance monitoring data
 */
export interface PerformanceStats {
  /** Last frame time in milliseconds */
  lastFrameTime: number;
  
  /** Average frame time over last 60 frames */
  avgFrameTime: number;
  
  /** Current FPS */
  fps: number;
}

/**
 * Renderer class that manages the animation render loop.
 * 
 * Responsibilities:
 * - Run requestAnimationFrame loop
 * - Track frame timing for performance monitoring
 * - Update ball state based on progress
 * - Coordinate drawing of shadow and ball
 * - Provide debug visualization
 * 
 * @example
 * ```typescript
 * const renderer = new Renderer(config);
 * renderer.start();
 * 
 * // Later...
 * renderer.stop();
 * renderer.destroy();
 * ```
 */
export class Renderer {
  private config: RendererConfig;
  private rafId: number | null = null;
  private isRunning: boolean = false;
  private lastTimestamp: number = 0;
  private frameCount: number = 0;
  private frameTimes: number[] = [];
  private readonly MAX_FRAME_SAMPLES = 60;
  private currentState: BallState | null = null;
  
  constructor(config: RendererConfig) {
    this.config = config;
  }
  
  /**
   * Start the render loop.
   */
  start(): void {
    if (this.isRunning) {
      return;
    }
    
    this.isRunning = true;
    this.lastTimestamp = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }
  
  /**
   * Stop the render loop.
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }
    
    this.isRunning = false;
    
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
  
  /**
   * Get current performance statistics.
   */
  getPerformanceStats(): PerformanceStats {
    const avgFrameTime = this.frameTimes.length > 0
      ? this.frameTimes.reduce((sum, t) => sum + t, 0) / this.frameTimes.length
      : 0;
    
    const fps = avgFrameTime > 0 ? 1000 / avgFrameTime : 0;
    
    return {
      lastFrameTime: this.frameTimes[this.frameTimes.length - 1] || 0,
      avgFrameTime,
      fps,
    };
  }
  
  /**
   * Get the current ball state.
   */
  getCurrentState(): BallState | null {
    return this.currentState;
  }
  
  /**
   * Clean up resources.
   */
  destroy(): void {
    this.stop();
    this.frameTimes = [];
    this.currentState = null;
  }
  
  /**
   * Main render loop tick function.
   */
  private tick = (timestamp: number): void => {
    if (!this.isRunning) {
      return;
    }
    
    // Calculate frame time
    const frameTime = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;
    
    // Track frame times for performance monitoring
    this.frameTimes.push(frameTime);
    if (this.frameTimes.length > this.MAX_FRAME_SAMPLES) {
      this.frameTimes.shift();
    }
    
    // Warn if frame budget exceeded (>16ms for 60fps)
    if (frameTime > 16 && this.config.debug) {
      console.warn(
        `[Ball Animation] Frame time exceeded budget: ${frameTime.toFixed(2)}ms (target: 16ms)`
      );
    }
    
    // Update animation state
    this.update();
    
    // Draw frame
    this.draw();
    
    // Schedule next frame
    this.frameCount++;
    this.rafId = requestAnimationFrame(this.tick);
  };
  
  /**
   * Update ball state based on current progress.
   * Implements: get progress → compute curve → calculate position
   */
  private update(): void {
    const { driver, curveFn, pathX, pathY, shadowCalculator, light, ballStyle } = this.config;
    
    // Get current progress from driver
    const t = driver.getProgress();
    
    // Compute position using path functions
    const x = pathX(t);
    const y = pathY(t);
    
    // Compute height using curve function
    const z = curveFn(t);
    
    // Calculate ball radius based on height
    // Radius increases with height to simulate perspective
    const radius = ballStyle.radiusAtGround + 
      (ballStyle.radiusAtMax - ballStyle.radiusAtGround) * z;
    
    // Calculate shadow parameters
    const ballPos: Vec3 = { x, y, z };
    const shadow = shadowCalculator.compute(ballPos, light);
    
    // Update current state
    this.currentState = {
      t,
      x,
      y,
      z,
      radius,
      shadow,
    };
  }
  
  /**
   * Draw the current frame.
   */
  private draw(): void {
    if (!this.currentState) {
      return;
    }
    
    const { canvas } = this.config;
    const { context, width, height } = canvas;
    
    // Clear canvas
    context.clearRect(0, 0, width, height);
    
    // Draw shadow first (behind ball)
    this.drawShadow(this.currentState);
    
    // Draw ball
    this.drawBall(this.currentState);
    
    // Draw debug overlay if enabled
    if (this.config.debug) {
      this.drawDebug(this.currentState);
    }
  }
  
  /**
   * Draw the ball's shadow using radial gradients.
   * 
   * Since Canvas 2D doesn't have native soft shadows, we simulate them using
   * radial gradients with multiple color stops for smooth falloff.
   * 
   * @param state - Current ball state with shadow parameters
   */
  private drawShadow(state: BallState): void {
    const { canvas } = this.config;
    const { context } = canvas;
    const { shadow, radius } = state;
    
    // Convert ball position from world coords to canvas pixels
    const ballCanvasPos = canvas.toCSSCoords(state.x, state.y);
    
    // Calculate shadow center position (ball position + offset)
    const shadowCenterX = ballCanvasPos.x + shadow.offsetX;
    const shadowCenterY = ballCanvasPos.y + shadow.offsetY;
    
    // Calculate shadow radius based on ball radius and scale
    const shadowRadius = radius * shadow.scale + shadow.blur;
    
    // Skip drawing if shadow is completely transparent or too small
    if (shadow.opacity <= 0.001 || shadowRadius <= 0) {
      return;
    }
    
    // Create radial gradient for soft shadow
    const gradient = context.createRadialGradient(
      shadowCenterX, shadowCenterY, 0, // Inner circle (center)
      shadowCenterX, shadowCenterY, shadowRadius // Outer circle (blur extent)
    );
    
    // Add color stops for smooth falloff
    // Center is darkest, fades to transparent at edges
    gradient.addColorStop(0, `rgba(0, 0, 0, ${shadow.opacity})`);
    gradient.addColorStop(0.4, `rgba(0, 0, 0, ${shadow.opacity * 0.6})`);
    gradient.addColorStop(0.7, `rgba(0, 0, 0, ${shadow.opacity * 0.3})`);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    // Calculate bounding box for efficient rendering
    const boundingBox = {
      x: shadowCenterX - shadowRadius,
      y: shadowCenterY - shadowRadius,
      width: shadowRadius * 2,
      height: shadowRadius * 2,
    };
    
    // Draw shadow using gradient
    context.save();
    context.fillStyle = gradient;
    context.fillRect(
      boundingBox.x,
      boundingBox.y,
      boundingBox.width,
      boundingBox.height
    );
    context.restore();
  }
  
  /**
   * Draw the ball as a circle with configurable fill and stroke.
   * 
   * The ball's radius is calculated based on its Z height to simulate
   * perspective (higher balls appear larger).
   * 
   * @param state - Current ball state with position and radius
   */
  private drawBall(state: BallState): void {
    const { canvas, ballStyle } = this.config;
    const { context } = canvas;
    const { radius } = state;
    
    // Convert ball position from world coords to canvas pixels
    const ballCanvasPos = canvas.toCSSCoords(state.x, state.y);
    
    // Draw the ball circle
    context.save();
    context.beginPath();
    context.arc(ballCanvasPos.x, ballCanvasPos.y, radius, 0, Math.PI * 2);
    
    // Fill the ball
    if (ballStyle.fill && ballStyle.fill !== 'none') {
      context.fillStyle = ballStyle.fill;
      context.fill();
    }
    
    // Stroke the ball outline
    if (ballStyle.stroke && ballStyle.stroke !== 'none' && ballStyle.strokeWidth > 0) {
      context.strokeStyle = ballStyle.stroke;
      context.lineWidth = ballStyle.strokeWidth;
      context.stroke();
    }
    
    context.restore();
  }
  
  /**
   * Draw debug overlay showing guides, zones, and light position.
   * 
   * Debug visualization includes:
   * - Light source position (yellow circle)
   * - Interactive zones (outlined shapes)
   * - Current progress indicator
   * - Z height indicator
   * - Ball position crosshair
   * 
   * @param state - Current ball state
   */
  private drawDebug(state: BallState): void {
    const { canvas, light, zones } = this.config;
    const { context, width, height } = canvas;
    
    context.save();
    
    // Draw light source position
    const lightCanvasPos = canvas.toCSSCoords(light.x, light.y);
    context.strokeStyle = '#fbbf24'; // Yellow
    context.fillStyle = 'rgba(251, 191, 36, 0.3)';
    context.lineWidth = 2;
    context.beginPath();
    context.arc(lightCanvasPos.x, lightCanvasPos.y, 10, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    
    // Draw light rays to ball
    const ballCanvasPos = canvas.toCSSCoords(state.x, state.y);
    context.strokeStyle = 'rgba(251, 191, 36, 0.3)';
    context.lineWidth = 1;
    context.setLineDash([5, 5]);
    context.beginPath();
    context.moveTo(lightCanvasPos.x, lightCanvasPos.y);
    context.lineTo(ballCanvasPos.x, ballCanvasPos.y);
    context.stroke();
    context.setLineDash([]);
    
    // Draw interactive zones
    if (zones && zones.length > 0) {
      for (const zone of zones) {
        context.strokeStyle = '#8b5cf6'; // Purple
        context.fillStyle = 'rgba(139, 92, 246, 0.1)';
        context.lineWidth = 2;
        
        if (zone.shape === 'circle' && zone.bounds.radius) {
          const zonePos = canvas.toCSSCoords(zone.bounds.x, zone.bounds.y);
          const radiusPx = zone.bounds.radius * Math.min(width, height);
          
          context.beginPath();
          context.arc(zonePos.x, zonePos.y, radiusPx, 0, Math.PI * 2);
          context.fill();
          context.stroke();
          
          // Draw zone label
          context.fillStyle = '#8b5cf6';
          context.font = '12px monospace';
          context.fillText(zone.id, zonePos.x - 20, zonePos.y - radiusPx - 5);
        } else if (zone.shape === 'rect' && zone.bounds.width && zone.bounds.height) {
          const zonePos = canvas.toCSSCoords(zone.bounds.x, zone.bounds.y);
          const widthPx = zone.bounds.width * width;
          const heightPx = zone.bounds.height * height;
          
          context.fillRect(zonePos.x, zonePos.y, widthPx, heightPx);
          context.strokeRect(zonePos.x, zonePos.y, widthPx, heightPx);
          
          // Draw zone label
          context.fillStyle = '#8b5cf6';
          context.font = '12px monospace';
          context.fillText(zone.id, zonePos.x + 5, zonePos.y - 5);
        }
      }
    }
    
    // Draw ball position crosshair
    context.strokeStyle = '#ef4444'; // Red
    context.lineWidth = 1;
    const crosshairSize = 15;
    
    // Horizontal line
    context.beginPath();
    context.moveTo(ballCanvasPos.x - crosshairSize, ballCanvasPos.y);
    context.lineTo(ballCanvasPos.x + crosshairSize, ballCanvasPos.y);
    context.stroke();
    
    // Vertical line
    context.beginPath();
    context.moveTo(ballCanvasPos.x, ballCanvasPos.y - crosshairSize);
    context.lineTo(ballCanvasPos.x, ballCanvasPos.y + crosshairSize);
    context.stroke();
    
    // Draw info panel
    context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    context.fillRect(10, 10, 200, 100);
    
    context.fillStyle = '#ffffff';
    context.font = '12px monospace';
    context.fillText(`Progress: ${(state.t * 100).toFixed(1)}%`, 20, 30);
    context.fillText(`Position: (${state.x.toFixed(2)}, ${state.y.toFixed(2)})`, 20, 50);
    context.fillText(`Z Height: ${state.z.toFixed(2)}`, 20, 70);
    context.fillText(`Radius: ${state.radius.toFixed(1)}px`, 20, 90);
    
    // Draw performance stats
    const stats = this.getPerformanceStats();
    context.fillText(`FPS: ${stats.fps.toFixed(0)}`, 20, 110);
    
    context.restore();
  }
}
