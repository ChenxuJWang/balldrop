/**
 * Interactive Zones Integration Tests
 * 
 * Tests zone hit detection and event callbacks.
 */

import { test, expect } from '@playwright/test';
import { 
  waitForAnimation, 
  expectCanvasVisible, 
  clickCanvas,
  waitForCallback,
} from './helpers';

test.describe('Interactive Zones', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/e2e/fixtures/interactive-zones.html');
    await waitForAnimation(page);
  });
  
  test('should render canvas on page load', async ({ page }) => {
    await expectCanvasVisible(page);
  });
  
  test('should trigger onEnter when ball enters zone', async ({ page }) => {
    // Wait for the ball to enter the zone (sine curve starts at mid-height)
    await waitForCallback(page, 'onEnter', 5000);
    
    const enterText = await page.locator('[data-callback="onEnter"] span').textContent();
    expect(enterText).toContain('triggered');
  });
  
  test('should trigger onExit when ball exits zone', async ({ page }) => {
    // Wait for enter first
    await waitForCallback(page, 'onEnter', 5000);
    
    // Then wait for exit
    await waitForCallback(page, 'onExit', 5000);
    
    const exitText = await page.locator('[data-callback="onExit"] span').textContent();
    expect(exitText).toContain('triggered');
  });
  
  test('should trigger onClick when zone is clicked', async ({ page }) => {
    // Click center of canvas (where zone is)
    await clickCanvas(page, 400, 300);
    
    // Check if onClick was triggered
    const clickText = await page.locator('[data-callback="onClick"] span').textContent();
    expect(clickText).toContain('triggered');
  });
  
  test('should trigger onPeak at local maximum Z', async ({ page }) => {
    // Wait for peak detection (sine curve has peaks)
    await waitForCallback(page, 'onPeak', 5000);
    
    const peakText = await page.locator('[data-callback="onPeak"] span').textContent();
    expect(peakText).toContain('triggered');
  });
  
  test('should trigger multiple events over time with looping', async ({ page }) => {
    // Wait for animation to loop and trigger events multiple times
    await page.waitForTimeout(6000); // 2 full loops
    
    const enterText = await page.locator('[data-callback="onEnter"] span').textContent();
    const exitText = await page.locator('[data-callback="onExit"] span').textContent();
    
    // Should have triggered multiple times
    expect(enterText).toMatch(/\d+x/);
    expect(exitText).toMatch(/\d+x/);
  });
});
