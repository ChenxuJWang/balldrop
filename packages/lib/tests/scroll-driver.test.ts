import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ScrollDriver } from '../src/core/timeline';

describe('ScrollDriver', () => {
  let mockScrollTarget: HTMLElement;

  beforeEach(() => {
    // Create a mock scroll target
    mockScrollTarget = document.createElement('div');
    Object.defineProperty(mockScrollTarget, 'scrollTop', {
      value: 0,
      writable: true,
      configurable: true
    });
    Object.defineProperty(mockScrollTarget, 'scrollHeight', {
      value: 2000,
      writable: true,
      configurable: true
    });
    Object.defineProperty(mockScrollTarget, 'clientHeight', {
      value: 600,
      writable: true,
      configurable: true
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic functionality', () => {
    it('should initialize with correct config', () => {
      const driver = new ScrollDriver({ scrollTarget: mockScrollTarget });
      expect(driver.getProgress()).toBe(0);
    });

    it('should return 0 when not started', () => {
      const driver = new ScrollDriver({ scrollTarget: mockScrollTarget });
      expect(driver.getProgress()).toBe(0);
    });

    it('should handle null scroll target', () => {
      const driver = new ScrollDriver({ scrollTarget: null });
      driver.start();
      expect(driver.getProgress()).toBe(0);
      driver.destroy();
    });
  });

  describe('Progress calculation', () => {
    it('should calculate progress as scrollTop / (scrollHeight - clientHeight)', () => {
      const driver = new ScrollDriver({ scrollTarget: mockScrollTarget });
      driver.start();

      // scrollHeight = 2000, clientHeight = 600, scrollableDistance = 1400
      // scrollTop = 700 should give progress = 0.5
      Object.defineProperty(mockScrollTarget, 'scrollTop', { value: 700, writable: true, configurable: true });
      
      // Trigger scroll event
      mockScrollTarget.dispatchEvent(new Event('scroll'));
      
      // Wait for RAF to process
      return new Promise<void>(resolve => {
        requestAnimationFrame(() => {
          expect(driver.getProgress()).toBeCloseTo(0.5, 2);
          driver.destroy();
          resolve();
        });
      });
    });

    it('should return progress 0 at scroll top', () => {
      const driver = new ScrollDriver({ scrollTarget: mockScrollTarget });
      driver.start();

      Object.defineProperty(mockScrollTarget, 'scrollTop', { value: 0, writable: true, configurable: true });
      mockScrollTarget.dispatchEvent(new Event('scroll'));

      return new Promise<void>(resolve => {
        requestAnimationFrame(() => {
          expect(driver.getProgress()).toBe(0);
          driver.destroy();
          resolve();
        });
      });
    });

    it('should return progress 1 at scroll bottom', () => {
      const driver = new ScrollDriver({ scrollTarget: mockScrollTarget });
      driver.start();

      // scrollHeight = 2000, clientHeight = 600, scrollableDistance = 1400
      Object.defineProperty(mockScrollTarget, 'scrollTop', { value: 1400, writable: true, configurable: true });
      mockScrollTarget.dispatchEvent(new Event('scroll'));

      return new Promise<void>(resolve => {
        requestAnimationFrame(() => {
          expect(driver.getProgress()).toBeCloseTo(1.0, 2);
          driver.destroy();
          resolve();
        });
      });
    });

    it('should clamp progress to [0,1] range', () => {
      const driver = new ScrollDriver({ scrollTarget: mockScrollTarget });
      driver.start();

      // Test negative scroll (shouldn't happen but handle gracefully)
      Object.defineProperty(mockScrollTarget, 'scrollTop', { value: -100, writable: true, configurable: true });
      mockScrollTarget.dispatchEvent(new Event('scroll'));

      return new Promise<void>(resolve => {
        requestAnimationFrame(() => {
          expect(driver.getProgress()).toBe(0);

          // Test over-scroll
          Object.defineProperty(mockScrollTarget, 'scrollTop', { value: 2000, writable: true, configurable: true });
          mockScrollTarget.dispatchEvent(new Event('scroll'));

          requestAnimationFrame(() => {
            expect(driver.getProgress()).toBeLessThanOrEqual(1.0);
            driver.destroy();
            resolve();
          });
        });
      });
    });

    it('should handle non-scrollable elements (scrollHeight <= clientHeight)', () => {
      Object.defineProperty(mockScrollTarget, 'scrollHeight', { value: 600, writable: true, configurable: true });
      Object.defineProperty(mockScrollTarget, 'clientHeight', { value: 600, writable: true, configurable: true });

      const driver = new ScrollDriver({ scrollTarget: mockScrollTarget });
      driver.start();

      expect(driver.getProgress()).toBe(0);
      driver.destroy();
    });
  });

  describe('Performance optimizations', () => {
    it('should use requestAnimationFrame batching for scroll updates', () => {
      const rafSpy = vi.spyOn(window, 'requestAnimationFrame');
      const driver = new ScrollDriver({ scrollTarget: mockScrollTarget });
      driver.start();

      // Trigger multiple scroll events rapidly
      mockScrollTarget.dispatchEvent(new Event('scroll'));
      mockScrollTarget.dispatchEvent(new Event('scroll'));
      mockScrollTarget.dispatchEvent(new Event('scroll'));

      // Should only schedule one RAF
      expect(rafSpy).toHaveBeenCalledTimes(1);

      driver.destroy();
    });

    it('should implement hysteresis threshold to prevent excessive updates', () => {
      const driver = new ScrollDriver({ scrollTarget: mockScrollTarget });
      driver.start();

      // Set initial scroll position
      Object.defineProperty(mockScrollTarget, 'scrollTop', { value: 700, writable: true, configurable: true });
      mockScrollTarget.dispatchEvent(new Event('scroll'));

      return new Promise<void>(resolve => {
        requestAnimationFrame(() => {
          const initialProgress = driver.getProgress();

          // Make a tiny scroll change (less than 0.1% threshold)
          // scrollableDistance = 1400, so 0.1% = 1.4 pixels
          Object.defineProperty(mockScrollTarget, 'scrollTop', { value: 700.5, writable: true, configurable: true });
          mockScrollTarget.dispatchEvent(new Event('scroll'));

          requestAnimationFrame(() => {
            // Progress should not have changed due to hysteresis
            expect(driver.getProgress()).toBe(initialProgress);
            driver.destroy();
            resolve();
          });
        });
      });
    });

    it('should use passive event listeners', () => {
      const addEventListenerSpy = vi.spyOn(mockScrollTarget, 'addEventListener');
      const driver = new ScrollDriver({ scrollTarget: mockScrollTarget });
      driver.start();

      expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true });

      driver.destroy();
    });
  });

  describe('Playback controls', () => {
    it('should pause and maintain current progress', () => {
      const driver = new ScrollDriver({ scrollTarget: mockScrollTarget });
      driver.start();

      Object.defineProperty(mockScrollTarget, 'scrollTop', { value: 700, writable: true, configurable: true });
      mockScrollTarget.dispatchEvent(new Event('scroll'));

      return new Promise<void>(resolve => {
        requestAnimationFrame(() => {
          const progressBeforePause = driver.getProgress();
          driver.pause();

          // Try to scroll while paused
          Object.defineProperty(mockScrollTarget, 'scrollTop', { value: 1000, writable: true, configurable: true });
          mockScrollTarget.dispatchEvent(new Event('scroll'));

          requestAnimationFrame(() => {
            // Progress should not have changed
            expect(driver.getProgress()).toBe(progressBeforePause);
            driver.destroy();
            resolve();
          });
        });
      });
    });

    it('should resume from paused state', () => {
      const driver = new ScrollDriver({ scrollTarget: mockScrollTarget });
      driver.start();

      Object.defineProperty(mockScrollTarget, 'scrollTop', { value: 700, writable: true, configurable: true });
      mockScrollTarget.dispatchEvent(new Event('scroll'));

      return new Promise<void>(resolve => {
        requestAnimationFrame(() => {
          const progressAtPause = driver.getProgress();
          driver.pause();

          driver.resume();

          // Scroll after resume
          Object.defineProperty(mockScrollTarget, 'scrollTop', { value: 1000, writable: true, configurable: true });
          mockScrollTarget.dispatchEvent(new Event('scroll'));

          requestAnimationFrame(() => {
            expect(driver.getProgress()).toBeGreaterThan(progressAtPause);
            driver.destroy();
            resolve();
          });
        });
      });
    });

    it('should stop and reset progress to 0', () => {
      const driver = new ScrollDriver({ scrollTarget: mockScrollTarget });
      driver.start();

      Object.defineProperty(mockScrollTarget, 'scrollTop', { value: 700, writable: true, configurable: true });
      mockScrollTarget.dispatchEvent(new Event('scroll'));

      return new Promise<void>(resolve => {
        requestAnimationFrame(() => {
          expect(driver.getProgress()).toBeGreaterThan(0);

          driver.stop();
          expect(driver.getProgress()).toBe(0);
          resolve();
        });
      });
    });
  });

  describe('Resource cleanup', () => {
    it('should remove event listeners on destroy', () => {
      const removeEventListenerSpy = vi.spyOn(mockScrollTarget, 'removeEventListener');
      const driver = new ScrollDriver({ scrollTarget: mockScrollTarget });
      driver.start();

      driver.destroy();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    });

    it('should cancel pending requestAnimationFrame on destroy', () => {
      const cancelAnimationFrameSpy = vi.spyOn(window, 'cancelAnimationFrame');
      const driver = new ScrollDriver({ scrollTarget: mockScrollTarget });
      driver.start();

      // Trigger scroll to schedule RAF
      mockScrollTarget.dispatchEvent(new Event('scroll'));

      driver.destroy();

      expect(cancelAnimationFrameSpy).toHaveBeenCalled();
    });

    it('should be safe to call destroy multiple times', () => {
      const driver = new ScrollDriver({ scrollTarget: mockScrollTarget });
      driver.start();

      expect(() => {
        driver.destroy();
        driver.destroy();
        driver.destroy();
      }).not.toThrow();
    });

    it('should clean up on stop', () => {
      const removeEventListenerSpy = vi.spyOn(mockScrollTarget, 'removeEventListener');
      const driver = new ScrollDriver({ scrollTarget: mockScrollTarget });
      driver.start();

      driver.stop();

      expect(removeEventListenerSpy).toHaveBeenCalled();
      expect(driver.getProgress()).toBe(0);
    });
  });
});
