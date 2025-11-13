/**
 * Scroll-Based Animation Integration Tests
 * 
 * Tests scroll-driven animations with progress mapping.
 */

import { test, expect } from '@playwright/test';
import { 
  waitForAnimation, 
  expectCanvasVisible, 
  scrollToProgress,
  getAnimationProgress,
} from './helpers';

test.describe('Scroll-Based Animations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/e2e/fixtures/scroll-animation.html');
    await waitForAnimation(page);
  });
  
  test('should render canvas on page load', async ({ page }) => {
    await expectCanvasVisible(page);
  });
  
  test('should start at progress 0 when at top', async ({ page }) => {
    await scrollToProgress(page, 0);
    
    const progress = await getAnimationProgress(page);
    expect(progress).toBeCloseTo(0, 1);
  });
  
  test('should map scroll position to animation progress', async ({ page }) => {
    // Scroll to 25%
    await scrollToProgress(page, 0.25);
    let progress = await getAnimationProgress(page);
    expect(progress).toBeGreaterThan(0.2);
    expect(progress).toBeLessThan(0.3);
    
    // Scroll to 50%
    await scrollToProgress(page, 0.5);
    progress = await getAnimationProgress(page);
    expect(progress).toBeGreaterThan(0.45);
    expect(progress).toBeLessThan(0.55);
    
    // Scroll to 75%
    await scrollToProgress(page, 0.75);
    progress = await getAnimationProgress(page);
    expect(progress).toBeGreaterThan(0.7);
    expect(progress).toBeLessThan(0.8);
  });
  
  test('should reach progress 1 when scrolled to bottom', async ({ page }) => {
    await scrollToProgress(page, 1);
    
    const progress = await getAnimationProgress(page);
    expect(progress).toBeGreaterThanOrEqual(0.95);
  });
  
  test('should update progress display on scroll', async ({ page }) => {
    await scrollToProgress(page, 0.5);
    
    const progressText = await page.locator('#progress').textContent();
    const progress = parseFloat(progressText || '0');
    
    expect(progress).toBeGreaterThan(0.4);
    expect(progress).toBeLessThan(0.6);
  });
  
  test('should handle scroll in both directions', async ({ page }) => {
    // Scroll down
    await scrollToProgress(page, 0.8);
    let progress = await getAnimationProgress(page);
    expect(progress).toBeGreaterThan(0.75);
    
    // Scroll back up
    await scrollToProgress(page, 0.3);
    progress = await getAnimationProgress(page);
    expect(progress).toBeGreaterThan(0.25);
    expect(progress).toBeLessThan(0.35);
  });
});
