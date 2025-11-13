/**
 * Playwright Test Helper Functions
 * 
 * Helper functions for integration and visual regression tests.
 */

import { Page, expect } from '@playwright/test';

/**
 * Waits for the animation to be initialized on the page
 */
export async function waitForAnimation(page: Page, timeout = 5000): Promise<void> {
  await page.waitForSelector('canvas', { timeout });
}

/**
 * Gets the canvas element from the page
 */
export async function getCanvas(page: Page) {
  return page.locator('canvas').first();
}

/**
 * Simulates scrolling to a specific position
 */
export async function scrollToPosition(page: Page, scrollTop: number): Promise<void> {
  await page.evaluate((top) => {
    window.scrollTo({ top, behavior: 'instant' });
  }, scrollTop);
  
  // Wait for scroll to settle
  await page.waitForTimeout(100);
}

/**
 * Simulates scrolling by a percentage (0-1)
 */
export async function scrollToProgress(page: Page, progress: number): Promise<void> {
  const scrollHeight = await page.evaluate(() => {
    return document.documentElement.scrollHeight - window.innerHeight;
  });
  
  const scrollTop = Math.round(scrollHeight * progress);
  await scrollToPosition(page, scrollTop);
}

/**
 * Waits for a specific amount of time (for time-based animations)
 */
export async function waitForTime(page: Page, ms: number): Promise<void> {
  await page.waitForTimeout(ms);
}

/**
 * Gets the current animation progress from the page
 */
export async function getAnimationProgress(page: Page): Promise<number> {
  return page.evaluate(() => {
    return (window as any).__ballAnimation?.getProgress?.() ?? 0;
  });
}

/**
 * Checks if a canvas element exists and is visible
 */
export async function expectCanvasVisible(page: Page): Promise<void> {
  const canvas = await getCanvas(page);
  await expect(canvas).toBeVisible();
}

/**
 * Gets canvas dimensions
 */
export async function getCanvasDimensions(page: Page): Promise<{ width: number; height: number }> {
  const canvas = await getCanvas(page);
  const box = await canvas.boundingBox();
  
  if (!box) {
    throw new Error('Canvas bounding box not found');
  }
  
  return { width: box.width, height: box.height };
}

/**
 * Clicks at a specific position on the canvas
 */
export async function clickCanvas(page: Page, x: number, y: number): Promise<void> {
  const canvas = await getCanvas(page);
  const box = await canvas.boundingBox();
  
  if (!box) {
    throw new Error('Canvas bounding box not found');
  }
  
  await page.mouse.click(box.x + x, box.y + y);
}

/**
 * Takes a screenshot of the canvas for visual regression testing
 */
export async function screenshotCanvas(page: Page, name: string): Promise<Buffer> {
  const canvas = await getCanvas(page);
  return canvas.screenshot({ path: `tests/e2e/screenshots/${name}.png` });
}

/**
 * Compares canvas screenshot with baseline
 */
export async function expectCanvasMatchesBaseline(page: Page, name: string): Promise<void> {
  const canvas = await getCanvas(page);
  await expect(canvas).toHaveScreenshot(`${name}.png`, {
    maxDiffPixels: 100, // Allow small differences
  });
}

/**
 * Waits for animation frame
 */
export async function waitForAnimationFrame(page: Page): Promise<void> {
  await page.evaluate(() => {
    return new Promise((resolve) => {
      requestAnimationFrame(() => resolve(undefined));
    });
  });
}

/**
 * Measures frame rate over a period
 */
export async function measureFrameRate(page: Page, durationMs = 1000): Promise<number> {
  return page.evaluate((duration) => {
    return new Promise<number>((resolve) => {
      let frameCount = 0;
      const startTime = performance.now();
      
      function countFrame() {
        frameCount++;
        const elapsed = performance.now() - startTime;
        
        if (elapsed < duration) {
          requestAnimationFrame(countFrame);
        } else {
          const fps = (frameCount / elapsed) * 1000;
          resolve(fps);
        }
      }
      
      requestAnimationFrame(countFrame);
    });
  }, durationMs);
}

/**
 * Checks if an element has been called with specific text
 */
export async function expectElementText(page: Page, selector: string, text: string): Promise<void> {
  const element = page.locator(selector);
  await expect(element).toHaveText(text);
}

/**
 * Waits for a callback to be triggered (checks for data attribute or text change)
 */
export async function waitForCallback(page: Page, callbackName: string, timeout = 5000): Promise<void> {
  await page.waitForFunction(
    (name) => {
      const element = document.querySelector(`[data-callback="${name}"]`);
      return element?.textContent?.includes('triggered') ?? false;
    },
    callbackName,
    { timeout }
  );
}

/**
 * Resizes the viewport
 */
export async function resizeViewport(page: Page, width: number, height: number): Promise<void> {
  await page.setViewportSize({ width, height });
  await page.waitForTimeout(100); // Wait for resize to settle
}
