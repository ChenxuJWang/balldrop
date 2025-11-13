/**
 * Canvas Management Module
 * 
 * Handles canvas initialization, device pixel ratio scaling, coordinate transformations,
 * and responsive resizing with fit modes.
 */

import type { CanvasManager, Vec2 } from '../types';

export type FitMode = 'contain' | 'cover' | 'stretch';

export interface CanvasOptions {
  /** Container element to mount the canvas */
  container: HTMLElement;
  /** Logical width in CSS pixels (optional, defaults to container width) */
  width?: number;
  /** Logical height in CSS pixels (optional, defaults to container height) */
  height?: number;
  /** How the canvas should fit within its container */
  fitMode?: FitMode;
}

/**
 * Creates and manages a canvas element with proper DPR scaling and coordinate transforms.
 * 
 * @param options - Canvas configuration options
 * @returns CanvasManager instance
 * 
 * @example
 * ```typescript
 * const canvas = createCanvasManager({
 *   container: document.getElementById('app'),
 *   width: 800,
 *   height: 600,
 *   fitMode: 'contain'
 * });
 * 
 * // Convert mouse event coordinates to world space
 * const worldPos = canvas.toWorldCoords(event.clientX, event.clientY);
 * ```
 */
export function createCanvasManager(options: CanvasOptions): CanvasManager {
  const { container, fitMode = 'contain' } = options;
  
  // Create canvas element
  const canvas = document.createElement('canvas');
  canvas.style.display = 'block';
  canvas.style.maxWidth = '100%';
  canvas.style.maxHeight = '100%';
  
  // Get 2D context
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Failed to get 2D rendering context');
  }
  
  // Get device pixel ratio for high-DPI displays
  const dpr = window.devicePixelRatio || 1;
  
  // Calculate initial dimensions
  const containerRect = container.getBoundingClientRect();
  const initialWidth = options.width ?? (containerRect.width || 800);
  const initialHeight = options.height ?? (containerRect.height || 600);
  
  // State
  let logicalWidth = initialWidth;
  let logicalHeight = initialHeight;
  let resizeObserver: ResizeObserver | null = null;
  let isDestroyed = false;
  
  /**
   * Apply DPR scaling to canvas
   */
  function applyDPRScaling(width: number, height: number): void {
    // Set canvas internal resolution (scaled by DPR)
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    
    // Set canvas CSS size (logical pixels)
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    // Scale context to match DPR
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  
  /**
   * Calculate dimensions based on fit mode
   */
  function calculateFitDimensions(
    containerWidth: number,
    containerHeight: number,
    targetWidth: number,
    targetHeight: number,
    mode: FitMode
  ): { width: number; height: number } {
    // If container has no dimensions, use target dimensions directly
    if (containerWidth === 0 || containerHeight === 0) {
      return { width: targetWidth, height: targetHeight };
    }
    
    if (mode === 'stretch') {
      return { width: containerWidth, height: containerHeight };
    }
    
    const containerAspect = containerWidth / containerHeight;
    const targetAspect = targetWidth / targetHeight;
    
    if (mode === 'contain') {
      // Fit inside container, maintain aspect ratio
      if (containerAspect > targetAspect) {
        // Container is wider, fit to height
        return {
          width: containerHeight * targetAspect,
          height: containerHeight
        };
      } else {
        // Container is taller, fit to width
        return {
          width: containerWidth,
          height: containerWidth / targetAspect
        };
      }
    } else {
      // mode === 'cover'
      // Fill container, maintain aspect ratio (may crop)
      if (containerAspect > targetAspect) {
        // Container is wider, fit to width
        return {
          width: containerWidth,
          height: containerWidth / targetAspect
        };
      } else {
        // Container is taller, fit to height
        return {
          width: containerHeight * targetAspect,
          height: containerHeight
        };
      }
    }
  }
  
  /**
   * Resize the canvas to new dimensions
   */
  function resize(width?: number, height?: number): void {
    const containerRect = container.getBoundingClientRect();
    
    // Use provided dimensions or fall back to container size
    const targetWidth = width ?? options.width ?? (containerRect.width || logicalWidth);
    const targetHeight = height ?? options.height ?? (containerRect.height || logicalHeight);
    
    // Calculate fit dimensions
    const fitDimensions = calculateFitDimensions(
      containerRect.width,
      containerRect.height,
      targetWidth,
      targetHeight,
      fitMode
    );
    
    logicalWidth = fitDimensions.width;
    logicalHeight = fitDimensions.height;
    
    // Apply DPR scaling
    applyDPRScaling(logicalWidth, logicalHeight);
  }
  
  /**
   * Convert CSS pixel coordinates to normalized world coordinates [0,1]
   */
  function toWorldCoords(cssX: number, cssY: number): Vec2 {
    const rect = canvas.getBoundingClientRect();
    
    // Convert to canvas-relative coordinates
    const canvasX = cssX - rect.left;
    const canvasY = cssY - rect.top;
    
    // Normalize to [0,1]
    return {
      x: canvasX / logicalWidth,
      y: canvasY / logicalHeight
    };
  }
  
  /**
   * Convert normalized world coordinates [0,1] to CSS pixel coordinates
   */
  function toCSSCoords(worldX: number, worldY: number): Vec2 {
    return {
      x: worldX * logicalWidth,
      y: worldY * logicalHeight
    };
  }
  
  /**
   * Clean up and remove the canvas
   */
  function destroy(): void {
    if (isDestroyed) return;
    isDestroyed = true;
    
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
    
    if (canvas.parentElement) {
      canvas.parentElement.removeChild(canvas);
    }
  }
  
  // Initialize canvas
  applyDPRScaling(logicalWidth, logicalHeight);
  container.appendChild(canvas);
  
  // Set up ResizeObserver for responsive sizing
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver((entries) => {
      if (isDestroyed) return;
      
      for (const entry of entries) {
        if (entry.target === container) {
          // Trigger resize without explicit dimensions to use container size
          resize();
          break;
        }
      }
    });
    
    resizeObserver.observe(container);
  }
  
  // Create the manager object
  const manager: CanvasManager = {
    element: canvas,
    context,
    get width() {
      return logicalWidth;
    },
    get height() {
      return logicalHeight;
    },
    dpr,
    resize,
    toWorldCoords,
    toCSSCoords,
    destroy
  };
  
  return manager;
}
