/**
 * Interaction Manager - Handles interactive zones and event tracking
 * 
 * This module provides hit testing for circular and rectangular zones,
 * tracks ball position relative to zones, and manages event callbacks.
 */

import type {
  InteractiveZone,
  InteractionManager as IInteractionManager,
  Vec2,
  CanvasManager,
} from '../types';

/**
 * Zone state tracking for enter/exit events
 */
interface ZoneState {
  zone: InteractiveZone;
  isInside: boolean;
  zHistory: number[]; // Track Z values for peak/valley detection
  lastZ: number;
}

/**
 * InteractionManager implementation
 * Handles hit testing, zone events, and peak/valley detection
 */
export class InteractionManager implements IInteractionManager {
  private zones: Map<string, ZoneState> = new Map();
  private canvasManager: CanvasManager;
  private clickHandler: ((event: MouseEvent) => void) | null = null;

  constructor(canvasManager: CanvasManager) {
    this.canvasManager = canvasManager;
    this.setupClickListener();
  }

  /**
   * Add an interactive zone
   */
  addZone(zone: InteractiveZone): void {
    this.zones.set(zone.id, {
      zone,
      isInside: false,
      zHistory: [],
      lastZ: 0,
    });
  }

  /**
   * Remove an interactive zone by ID
   */
  removeZone(id: string): void {
    this.zones.delete(id);
  }

  /**
   * Update ball position and check for zone interactions
   * This should be called on every frame
   */
  update(ballPos: Vec2, ballZ: number): void {
    this.zones.forEach((state) => {
      const wasInside = state.isInside;
      const isInside = this.hitTest(ballPos, state.zone);

      // Handle enter/exit events
      if (isInside && !wasInside) {
        state.isInside = true;
        if (state.zone.onEnter) {
          try {
            state.zone.onEnter(state.zone);
          } catch (error) {
            console.error(`Error in onEnter callback for zone ${state.zone.id}:`, error);
          }
        }
      } else if (!isInside && wasInside) {
        state.isInside = false;
        if (state.zone.onExit) {
          try {
            state.zone.onExit(state.zone);
          } catch (error) {
            console.error(`Error in onExit callback for zone ${state.zone.id}:`, error);
          }
        }
        // Clear Z history when exiting zone
        state.zHistory = [];
      }

      // Track Z values for peak/valley detection when inside zone
      if (isInside) {
        this.trackZValue(state, ballZ);
      }

      state.lastZ = ballZ;
    });
  }

  /**
   * Handle click events on the canvas
   */
  handleClick(_event: MouseEvent): void {
    // This is handled by the click listener setup in constructor
    // The actual logic is in handleCanvasClick
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.clickHandler) {
      this.canvasManager.element.removeEventListener('click', this.clickHandler);
      this.clickHandler = null;
    }
    this.zones.clear();
  }

  /**
   * Hit test: check if a point is inside a zone
   */
  private hitTest(point: Vec2, zone: InteractiveZone): boolean {
    if (zone.shape === 'circle') {
      return this.hitTestCircle(point, zone);
    } else if (zone.shape === 'rect') {
      return this.hitTestRect(point, zone);
    }
    return false;
  }

  /**
   * Hit test for circular zones
   */
  private hitTestCircle(point: Vec2, zone: InteractiveZone): boolean {
    const { x, y, radius } = zone.bounds;
    if (radius === undefined) {
      console.warn(`Circle zone ${zone.id} missing radius`);
      return false;
    }

    const dx = point.x - x;
    const dy = point.y - y;
    const distanceSquared = dx * dx + dy * dy;
    const radiusSquared = radius * radius;

    return distanceSquared <= radiusSquared;
  }

  /**
   * Hit test for rectangular zones
   */
  private hitTestRect(point: Vec2, zone: InteractiveZone): boolean {
    const { x, y, width, height } = zone.bounds;
    if (width === undefined || height === undefined) {
      console.warn(`Rect zone ${zone.id} missing width or height`);
      return false;
    }

    return (
      point.x >= x &&
      point.x <= x + width &&
      point.y >= y &&
      point.y <= y + height
    );
  }

  /**
   * Track Z values for peak/valley detection
   */
  private trackZValue(state: ZoneState, currentZ: number): void {
    const { zHistory } = state;
    
    // Add current Z to history (keep last 3 values for local extrema detection)
    zHistory.push(currentZ);
    if (zHistory.length > 3) {
      zHistory.shift();
    }

    // Need at least 3 points to detect local extrema
    if (zHistory.length < 3) {
      return;
    }

    const z0 = zHistory[0];
    const z1 = zHistory[1];
    const z2 = zHistory[2];

    // Detect peak: middle value is greater than both neighbors
    if (z1 !== undefined && z0 !== undefined && z2 !== undefined && z1 > z0 && z1 > z2) {
      if (state.zone.onPeak) {
        try {
          state.zone.onPeak(z1, state.zone);
        } catch (error) {
          console.error(`Error in onPeak callback for zone ${state.zone.id}:`, error);
        }
      }
      // Clear history after detecting peak to avoid duplicate triggers
      zHistory.length = 0;
      zHistory.push(z2);
    }

    // Detect valley: middle value is less than both neighbors
    if (z1 !== undefined && z0 !== undefined && z2 !== undefined && z1 < z0 && z1 < z2) {
      if (state.zone.onValley) {
        try {
          state.zone.onValley(z1, state.zone);
        } catch (error) {
          console.error(`Error in onValley callback for zone ${state.zone.id}:`, error);
        }
      }
      // Clear history after detecting valley to avoid duplicate triggers
      zHistory.length = 0;
      zHistory.push(z2);
    }
  }

  /**
   * Set up click event listener on canvas
   */
  private setupClickListener(): void {
    this.clickHandler = (event: MouseEvent) => {
      this.handleCanvasClick(event);
    };
    this.canvasManager.element.addEventListener('click', this.clickHandler);
  }

  /**
   * Handle canvas click events
   */
  private handleCanvasClick(event: MouseEvent): void {
    // Get click position relative to canvas
    const rect = this.canvasManager.element.getBoundingClientRect();
    const cssX = event.clientX - rect.left;
    const cssY = event.clientY - rect.top;

    // Convert to world coordinates
    const worldPos = this.canvasManager.toWorldCoords(cssX, cssY);

    // Check which zones were clicked
    this.zones.forEach((state) => {
      if (this.hitTest(worldPos, state.zone)) {
        if (state.zone.onClick) {
          try {
            state.zone.onClick(event, state.zone);
          } catch (error) {
            console.error(`Error in onClick callback for zone ${state.zone.id}:`, error);
          }
        }
      }
    });
  }
}

/**
 * Create an interaction manager instance
 */
export function createInteractionManager(canvasManager: CanvasManager): InteractionManager {
  return new InteractionManager(canvasManager);
}
