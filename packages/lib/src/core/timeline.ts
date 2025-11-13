/**
 * Timeline Module - Progress Drivers
 * 
 * This module provides progress drivers that map external inputs (time or scroll)
 * to normalized progress values [0,1] for driving animations.
 */

import type { ProgressDriver } from '../types';

/**
 * Configuration options for TimeDriver
 */
export interface TimeDriverConfig {
  /** Animation duration in milliseconds */
  durationMs: number;
  
  /**
   * Looping behavior
   * - false: Play once and stop
   * - true: Loop infinitely
   * - number: Loop N times
   */
  loop?: boolean | number;
}

/**
 * Time-based progress driver that uses requestAnimationFrame for smooth animations.
 * Tracks elapsed time and maps it to normalized progress [0,1].
 * 
 * @example
 * ```typescript
 * const driver = new TimeDriver({ durationMs: 3000, loop: true });
 * driver.start();
 * 
 * // In render loop
 * const progress = driver.getProgress(); // 0 to 1
 * ```
 */
export class TimeDriver implements ProgressDriver {
  private durationMs: number;
  private loop: boolean | number;
  private elapsedMs: number = 0;
  private startTime: number | null = null;
  private pausedTime: number | null = null;
  private rafId: number | null = null;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private completedLoops: number = 0;
  
  constructor(config: TimeDriverConfig) {
    this.durationMs = config.durationMs;
    this.loop = config.loop ?? false;
  }
  
  /**
   * Start the time driver and begin tracking elapsed time.
   */
  start(): void {
    if (this.isRunning && !this.isPaused) {
      return; // Already running
    }
    
    if (this.isPaused) {
      // Resume from pause
      this.resume();
      return;
    }
    
    this.isRunning = true;
    this.isPaused = false;
    this.startTime = performance.now();
    this.elapsedMs = 0;
    this.completedLoops = 0;
    this.tick();
  }
  
  /**
   * Stop the driver and reset all state.
   */
  stop(): void {
    this.isRunning = false;
    this.isPaused = false;
    this.elapsedMs = 0;
    this.startTime = null;
    this.pausedTime = null;
    this.completedLoops = 0;
    
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
  
  /**
   * Pause the driver, maintaining current progress.
   */
  pause(): void {
    if (!this.isRunning || this.isPaused) {
      return;
    }
    
    this.isPaused = true;
    this.pausedTime = performance.now();
    
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
  
  /**
   * Resume the driver from paused state.
   */
  resume(): void {
    if (!this.isRunning || !this.isPaused) {
      return;
    }
    
    this.isPaused = false;
    
    // Adjust start time to account for pause duration
    if (this.pausedTime !== null && this.startTime !== null) {
      const pauseDuration = performance.now() - this.pausedTime;
      this.startTime += pauseDuration;
    }
    
    this.pausedTime = null;
    this.tick();
  }
  
  /**
   * Get the current progress value [0,1].
   */
  getProgress(): number {
    if (!this.isRunning) {
      return 0;
    }
    
    if (this.isPaused) {
      // Return progress at pause time
      return Math.min(this.elapsedMs / this.durationMs, 1);
    }
    
    // Update elapsed time based on current time
    if (this.startTime !== null) {
      this.elapsedMs = performance.now() - this.startTime;
    }
    
    // Calculate progress based on elapsed time
    const progress = this.elapsedMs / this.durationMs;
    return Math.min(progress, 1);
  }
  
  /**
   * Clean up resources and cancel animation frames.
   */
  destroy(): void {
    this.stop();
  }
  
  /**
   * Internal tick function called by requestAnimationFrame.
   */
  private tick = (timestamp?: number): void => {
    if (!this.isRunning || this.isPaused) {
      return;
    }
    
    const now = timestamp ?? performance.now();
    
    if (this.startTime === null) {
      this.startTime = now;
    }
    
    this.elapsedMs = now - this.startTime;
    
    // Check if we've completed a cycle
    if (this.elapsedMs >= this.durationMs) {
      this.completedLoops++;
      
      // Determine if we should loop
      const shouldLoop = this.shouldContinueLooping();
      
      if (shouldLoop) {
        // Reset for next loop
        this.startTime = now;
        this.elapsedMs = 0;
      } else {
        // Animation complete
        this.elapsedMs = this.durationMs;
        this.isRunning = false;
        
        if (this.rafId !== null) {
          cancelAnimationFrame(this.rafId);
          this.rafId = null;
        }
        return;
      }
    }
    
    // Schedule next frame
    this.rafId = requestAnimationFrame(this.tick);
  };
  
  /**
   * Determine if the animation should continue looping.
   */
  private shouldContinueLooping(): boolean {
    if (this.loop === true) {
      return true; // Infinite loop
    }
    
    if (typeof this.loop === 'number') {
      return this.completedLoops < this.loop;
    }
    
    return false; // No looping
  }
}

/**
 * Configuration options for ScrollDriver
 */
export interface ScrollDriverConfig {
  /** The scrollable element to track (e.g., document.scrollingElement) */
  scrollTarget: HTMLElement | null;
}

/**
 * Scroll-based progress driver that maps scroll position to normalized progress [0,1].
 * Uses requestAnimationFrame batching and hysteresis for optimal performance.
 * 
 * @example
 * ```typescript
 * const driver = new ScrollDriver({ scrollTarget: document.scrollingElement });
 * driver.start();
 * 
 * // In render loop
 * const progress = driver.getProgress(); // 0 to 1 based on scroll position
 * ```
 */
export class ScrollDriver implements ProgressDriver {
  private scrollTarget: HTMLElement | null;
  private progress: number = 0;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private rafId: number | null = null;
  // Track last scroll position for future use
  // private lastScrollY: number = 0;
  private pendingUpdate: boolean = false;
  
  /** Hysteresis threshold to prevent excessive updates (0.1% change) */
  private readonly HYSTERESIS_THRESHOLD = 0.001;
  
  constructor(config: ScrollDriverConfig) {
    this.scrollTarget = config.scrollTarget;
    this.onScroll = this.onScroll.bind(this);
  }
  
  /**
   * Start tracking scroll events.
   */
  start(): void {
    if (this.isRunning && !this.isPaused) {
      return; // Already running
    }
    
    if (this.isPaused) {
      this.resume();
      return;
    }
    
    this.isRunning = true;
    this.isPaused = false;
    
    // Initialize progress based on current scroll position
    this.updateProgress();
    
    // Attach scroll listener with passive option for performance
    if (this.scrollTarget) {
      this.scrollTarget.addEventListener('scroll', this.onScroll, { passive: true });
    }
  }
  
  /**
   * Stop tracking scroll and reset state.
   */
  stop(): void {
    this.isRunning = false;
    this.isPaused = false;
    this.progress = 0;
    // this.lastScrollY = 0;
    this.pendingUpdate = false;
    
    // Remove scroll listener
    if (this.scrollTarget) {
      this.scrollTarget.removeEventListener('scroll', this.onScroll);
    }
    
    // Cancel pending RAF
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
  
  /**
   * Pause scroll tracking, maintaining current progress.
   */
  pause(): void {
    if (!this.isRunning || this.isPaused) {
      return;
    }
    
    this.isPaused = true;
    
    // Remove scroll listener while paused
    if (this.scrollTarget) {
      this.scrollTarget.removeEventListener('scroll', this.onScroll);
    }
    
    // Cancel pending RAF
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
  
  /**
   * Resume scroll tracking from paused state.
   */
  resume(): void {
    if (!this.isRunning || !this.isPaused) {
      return;
    }
    
    this.isPaused = false;
    
    // Re-attach scroll listener
    if (this.scrollTarget) {
      this.scrollTarget.addEventListener('scroll', this.onScroll, { passive: true });
    }
    
    // Update progress based on current scroll position
    this.updateProgress();
  }
  
  /**
   * Get the current progress value [0,1] based on scroll position.
   */
  getProgress(): number {
    return this.progress;
  }
  
  /**
   * Clean up resources and remove event listeners.
   */
  destroy(): void {
    this.stop();
  }
  
  /**
   * Scroll event handler that schedules RAF updates.
   */
  private onScroll(): void {
    if (!this.isRunning || this.isPaused) {
      return;
    }
    
    // If we already have a pending update, don't schedule another
    if (this.pendingUpdate) {
      return;
    }
    
    this.pendingUpdate = true;
    
    // Use requestAnimationFrame to batch scroll updates
    this.rafId = requestAnimationFrame(() => {
      this.updateProgress();
      this.pendingUpdate = false;
      this.rafId = null;
    });
  }
  
  /**
   * Calculate and update progress based on current scroll position.
   * Implements hysteresis to prevent excessive updates for tiny scroll changes.
   */
  private updateProgress(): void {
    if (!this.scrollTarget) {
      this.progress = 0;
      return;
    }
    
    const scrollTop = this.scrollTarget.scrollTop;
    const scrollHeight = this.scrollTarget.scrollHeight;
    const clientHeight = this.scrollTarget.clientHeight;
    
    // Calculate scrollable distance
    const scrollableDistance = scrollHeight - clientHeight;
    
    // Handle non-scrollable elements
    if (scrollableDistance <= 0) {
      this.progress = 0;
      return;
    }
    
    // Calculate progress: scrollTop / scrollableDistance
    const newProgress = Math.max(0, Math.min(1, scrollTop / scrollableDistance));
    
    // Apply hysteresis: only update if change exceeds threshold
    if (Math.abs(newProgress - this.progress) > this.HYSTERESIS_THRESHOLD) {
      this.progress = newProgress;
    }
  }
}
