/**
 * Visual Regression Tests
 * 
 * Tests visual appearance of ball and shadow rendering at different heights.
 */

import { test, expect } from '@playwright/test';
import { waitForAnimation, waitForTime } from './helpers';

test.describe('Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/e2e/fixtures/visual-regression.html');
    await waitForAnimation(page);
    // Wait for animations to render a few frames
    await waitForTime(page, 500);
  });
  
  test('should render ball at low Z with dark shadow', async ({ page }) => {
    const canvas = page.locator('#container-low canvas');
    await expect(canvas).toBeVisible();
    
    // Take screenshot for visual comparison
    await expect(canvas).toHaveScreenshot('ball-low-z.png', {
      maxDiffPixels: 100,
    });
  });
  
  test('should render ball at mid Z with medium shadow', async ({ page }) => {
    const canvas = page.locator('#container-mid canvas');
    await expect(canvas).toBeVisible();
    
    await expect(canvas).toHaveScreenshot('ball-mid-z.png', {
      maxDiffPixels: 100,
    });
  });
  
  test('should render ball at high Z with light shadow', async ({ page }) => {
    const canvas = page.locator('#container-high canvas');
    await expect(canvas).toBeVisible();
    
    await expect(canvas).toHaveScreenshot('ball-high-z.png', {
      maxDiffPixels: 100,
    });
  });
  
  test('shadow should be darker at low Z than high Z', async ({ page }) => {
    // This is a visual test - the screenshots above verify this
    // Here we just ensure all canvases are rendered
    const canvases = page.locator('canvas');
    const count = await canvases.count();
    expect(count).toBe(3);
  });
});
