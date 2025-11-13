/**
 * Time-Based Animation Integration Tests
 * 
 * Tests time-driven animations with duration and looping.
 */

import { test, expect } from '@playwright/test';
import { 
  waitForAnimation, 
  expectCanvasVisible, 
  getAnimationProgress,
  waitForTime,
} from './helpers';

test.describe('Time-Based Animations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/e2e/fixtures/time-animation.html');
    await waitForAnimation(page);
  });
  
  test('should render canvas on page load', async ({ page }) => {
    await expectCanvasVisible(page);
  });
  
  test('should progress from 0 to 1 over duration', async ({ page }) => {
    // Animation is 2000ms, check at start, middle, and end
    const startProgress = await getAnimationProgress(page);
    expect(startProgress).toBeCloseTo(0, 1);
    
    await waitForTime(page, 1000);
    const midProgress = await getAnimationProgress(page);
    expect(midProgress).toBeGreaterThan(0.4);
    expect(midProgress).toBeLessThan(0.6);
    
    await waitForTime(page, 1100);
    const endProgress = await getAnimationProgress(page);
    expect(endProgress).toBeGreaterThanOrEqual(0.95);
  });
  
  test('should update progress display', async ({ page }) => {
    await waitForTime(page, 500);
    
    const progressText = await page.locator('#progress').textContent();
    const progress = parseFloat(progressText || '0');
    
    expect(progress).toBeGreaterThan(0);
    expect(progress).toBeLessThan(1);
  });
  
  test('should complete animation within expected time', async ({ page }) => {
    const startTime = Date.now();
    
    // Wait for animation to complete
    await page.waitForFunction(() => {
      return (window as any).__ballAnimation?.getProgress() >= 0.99;
    }, { timeout: 3000 });
    
    const elapsed = Date.now() - startTime;
    
    // Should complete in ~2000ms ±10%
    expect(elapsed).toBeGreaterThan(1800);
    expect(elapsed).toBeLessThan(2200);
  });
});
