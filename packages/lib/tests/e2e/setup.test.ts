/**
 * Playwright Setup Verification Test
 * 
 * Verifies that the Playwright test environment is configured correctly.
 */

import { test, expect } from '@playwright/test';
import { waitForAnimation, getCanvas, expectCanvasVisible } from './helpers';

test.describe('Playwright Setup', () => {
  test('should load time-based animation page', async ({ page }) => {
    await page.goto('/tests/e2e/fixtures/time-animation.html');
    await waitForAnimation(page);
    await expectCanvasVisible(page);
  });
  
  test('should load scroll-based animation page', async ({ page }) => {
    await page.goto('/tests/e2e/fixtures/scroll-animation.html');
    await waitForAnimation(page);
    await expectCanvasVisible(page);
  });
  
  test('should load interactive zones page', async ({ page }) => {
    await page.goto('/tests/e2e/fixtures/interactive-zones.html');
    await waitForAnimation(page);
    await expectCanvasVisible(page);
  });
  
  test('canvas should have correct dimensions', async ({ page }) => {
    await page.goto('/tests/e2e/fixtures/time-animation.html');
    await waitForAnimation(page);
    
    const canvas = await getCanvas(page);
    const box = await canvas.boundingBox();
    
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(0);
    expect(box!.height).toBeGreaterThan(0);
  });
});
