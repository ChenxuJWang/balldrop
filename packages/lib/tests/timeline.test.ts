import { describe, it, expect, vi } from 'vitest';
import { TimeDriver } from '../src/core/timeline';

describe('TimeDriver', () => {
  describe('Basic functionality', () => {
    it('should initialize with correct config', () => {
      const driver = new TimeDriver({ durationMs: 1000 });
      expect(driver.getProgress()).toBe(0);
    });

    it('should return 0 when not started', () => {
      const driver = new TimeDriver({ durationMs: 1000 });
      expect(driver.getProgress()).toBe(0);
    });
  });

  describe('Progress calculation', () => {
    it('should reach progress 1.0 after durationMs', async () => {
      const driver = new TimeDriver({ durationMs: 100 });
      driver.start();

      await new Promise(resolve => setTimeout(resolve, 110));

      const progress = driver.getProgress();
      expect(progress).toBeCloseTo(1.0, 1);
      driver.destroy();
    });

    it('should be at progress ~0.5 at half duration', async () => {
      const driver = new TimeDriver({ durationMs: 200 });
      driver.start();

      await new Promise(resolve => setTimeout(resolve, 100));

      const progress = driver.getProgress();
      expect(progress).toBeGreaterThan(0.4);
      expect(progress).toBeLessThan(0.6);
      driver.destroy();
    });

    it('should maintain timing accuracy within ±2%', async () => {
      const driver = new TimeDriver({ durationMs: 500 });
      driver.start();

      await new Promise(resolve => setTimeout(resolve, 250));
      const progress = driver.getProgress();
      expect(progress).toBeGreaterThanOrEqual(0.49);
      expect(progress).toBeLessThanOrEqual(0.51);

      driver.destroy();
    });

    it('should not exceed progress 1.0', async () => {
      const driver = new TimeDriver({ durationMs: 50 });
      driver.start();

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(driver.getProgress()).toBeLessThanOrEqual(1.0);
      driver.destroy();
    });
  });

  describe('Looping behavior', () => {
    it('should stop at progress 1.0 when loop is false', async () => {
      const driver = new TimeDriver({ durationMs: 100, loop: false });
      driver.start();

      await new Promise(resolve => setTimeout(resolve, 110));
      expect(driver.getProgress()).toBeCloseTo(1.0, 1);

      await new Promise(resolve => setTimeout(resolve, 50));
      expect(driver.getProgress()).toBeCloseTo(1.0, 1);
      driver.destroy();
    });

    it('should loop exactly N times when loop is a number', async () => {
      const driver = new TimeDriver({ durationMs: 50, loop: 2 });
      driver.start();

      await new Promise(resolve => setTimeout(resolve, 110));

      expect(driver.getProgress()).toBeCloseTo(1.0, 1);

      await new Promise(resolve => setTimeout(resolve, 50));
      expect(driver.getProgress()).toBeCloseTo(1.0, 1);
      driver.destroy();
    });
  });

  describe('Playback controls', () => {
    it('should pause and maintain current progress', async () => {
      const driver = new TimeDriver({ durationMs: 200 });
      driver.start();

      await new Promise(resolve => setTimeout(resolve, 100));
      const progressBeforePause = driver.getProgress();

      driver.pause();

      await new Promise(resolve => setTimeout(resolve, 50));

      const progressAfterPause = driver.getProgress();
      expect(Math.abs(progressAfterPause - progressBeforePause)).toBeLessThan(0.01);
      driver.destroy();
    });

    it('should resume from paused state', async () => {
      const driver = new TimeDriver({ durationMs: 200 });
      driver.start();

      await new Promise(resolve => setTimeout(resolve, 60));
      driver.pause();

      const progressAtPause = driver.getProgress();

      await new Promise(resolve => setTimeout(resolve, 40));
      expect(driver.getProgress()).toBeCloseTo(progressAtPause, 1);

      driver.resume();
      await new Promise(resolve => setTimeout(resolve, 60));

      expect(driver.getProgress()).toBeGreaterThan(progressAtPause);
      driver.destroy();
    });

    it('should stop and reset progress to 0', async () => {
      const driver = new TimeDriver({ durationMs: 200 });
      driver.start();

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(driver.getProgress()).toBeGreaterThan(0.4);

      driver.stop();

      expect(driver.getProgress()).toBe(0);
    });
  });

  describe('Resource cleanup', () => {
    it('should clean up on destroy', async () => {
      const driver = new TimeDriver({ durationMs: 1000 });
      driver.start();

      await new Promise(resolve => setTimeout(resolve, 50));
      driver.destroy();

      expect(driver.getProgress()).toBe(0);
    });

    it('should be safe to call destroy multiple times', () => {
      const driver = new TimeDriver({ durationMs: 1000 });
      driver.start();

      expect(() => {
        driver.destroy();
        driver.destroy();
        driver.destroy();
      }).not.toThrow();
    });
  });
});
