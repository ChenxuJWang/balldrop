/**
 * Interaction Manager Tests
 * 
 * Tests for hit testing, zone event tracking, and peak/valley detection
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { InteractionManager } from '../src/core/interactions';
import type { InteractiveZone, CanvasManager, Vec2 } from '../src/types';

// Mock CanvasManager
function createMockCanvasManager(): CanvasManager {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2D context');

  return {
    element: canvas,
    context: ctx,
    width: 800,
    height: 600,
    dpr: 1,
    resize: vi.fn(),
    toWorldCoords: (cssX: number, cssY: number): Vec2 => ({
      x: cssX / 800,
      y: cssY / 600,
    }),
    toCSSCoords: (worldX: number, worldY: number): Vec2 => ({
      x: worldX * 800,
      y: worldY * 600,
    }),
    destroy: vi.fn(),
  };
}

describe('InteractionManager', () => {
  let manager: InteractionManager;
  let canvasManager: CanvasManager;

  beforeEach(() => {
    canvasManager = createMockCanvasManager();
    manager = new InteractionManager(canvasManager);
  });

  afterEach(() => {
    manager.destroy();
  });

  describe('Hit Testing - Circular Zones', () => {
    it('should detect ball inside circular zone', () => {
      const onEnter = vi.fn();
      const zone: InteractiveZone = {
        id: 'circle-1',
        shape: 'circle',
        bounds: { x: 0.5, y: 0.5, radius: 0.2 },
        onEnter,
      };

      manager.addZone(zone);
      
      // Ball at center of zone
      manager.update({ x: 0.5, y: 0.5 }, 0.5);
      
      expect(onEnter).toHaveBeenCalledTimes(1);
      expect(onEnter).toHaveBeenCalledWith(zone);
    });

    it('should detect ball outside circular zone', () => {
      const onEnter = vi.fn();
      const zone: InteractiveZone = {
        id: 'circle-2',
        shape: 'circle',
        bounds: { x: 0.5, y: 0.5, radius: 0.2 },
        onEnter,
      };

      manager.addZone(zone);
      
      // Ball far from zone
      manager.update({ x: 0.9, y: 0.9 }, 0.5);
      
      expect(onEnter).not.toHaveBeenCalled();
    });

    it('should detect ball at zone boundary', () => {
      const onEnter = vi.fn();
      const zone: InteractiveZone = {
        id: 'circle-3',
        shape: 'circle',
        bounds: { x: 0.5, y: 0.5, radius: 0.2 },
        onEnter,
      };

      manager.addZone(zone);
      
      // Ball exactly at radius distance (should be inside due to <= comparison)
      manager.update({ x: 0.7, y: 0.5 }, 0.5);
      
      expect(onEnter).toHaveBeenCalledTimes(1);
    });

    it('should handle circular zone with missing radius', () => {
      const onEnter = vi.fn();
      const zone: InteractiveZone = {
        id: 'circle-invalid',
        shape: 'circle',
        bounds: { x: 0.5, y: 0.5 }, // Missing radius
        onEnter,
      };

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      manager.addZone(zone);
      manager.update({ x: 0.5, y: 0.5 }, 0.5);
      
      expect(onEnter).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('missing radius'));
      
      consoleSpy.mockRestore();
    });
  });

  describe('Hit Testing - Rectangular Zones', () => {
    it('should detect ball inside rectangular zone', () => {
      const onEnter = vi.fn();
      const zone: InteractiveZone = {
        id: 'rect-1',
        shape: 'rect',
        bounds: { x: 0.3, y: 0.3, width: 0.4, height: 0.4 },
        onEnter,
      };

      manager.addZone(zone);
      
      // Ball in center of rect
      manager.update({ x: 0.5, y: 0.5 }, 0.5);
      
      expect(onEnter).toHaveBeenCalledTimes(1);
    });

    it('should detect ball outside rectangular zone', () => {
      const onEnter = vi.fn();
      const zone: InteractiveZone = {
        id: 'rect-2',
        shape: 'rect',
        bounds: { x: 0.3, y: 0.3, width: 0.4, height: 0.4 },
        onEnter,
      };

      manager.addZone(zone);
      
      // Ball outside rect
      manager.update({ x: 0.1, y: 0.1 }, 0.5);
      
      expect(onEnter).not.toHaveBeenCalled();
    });

    it('should detect ball at rectangular zone corners', () => {
      const onEnter = vi.fn();
      const zone: InteractiveZone = {
        id: 'rect-3',
        shape: 'rect',
        bounds: { x: 0.3, y: 0.3, width: 0.4, height: 0.4 },
        onEnter,
      };

      manager.addZone(zone);
      
      // Test all four corners (should be inside)
      manager.update({ x: 0.3, y: 0.3 }, 0.5); // Top-left
      expect(onEnter).toHaveBeenCalledTimes(1);
      
      manager.update({ x: 0.7, y: 0.3 }, 0.5); // Top-right
      manager.update({ x: 0.3, y: 0.7 }, 0.5); // Bottom-left
      manager.update({ x: 0.7, y: 0.7 }, 0.5); // Bottom-right
      
      // Should still be 1 call since we never exited
      expect(onEnter).toHaveBeenCalledTimes(1);
    });

    it('should handle rectangular zone with missing dimensions', () => {
      const onEnter = vi.fn();
      const zone: InteractiveZone = {
        id: 'rect-invalid',
        shape: 'rect',
        bounds: { x: 0.3, y: 0.3 }, // Missing width and height
        onEnter,
      };

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      manager.addZone(zone);
      manager.update({ x: 0.5, y: 0.5 }, 0.5);
      
      expect(onEnter).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('missing width or height'));
      
      consoleSpy.mockRestore();
    });
  });

  describe('Zone Event Tracking', () => {
    it('should trigger onEnter when ball enters zone', () => {
      const onEnter = vi.fn();
      const zone: InteractiveZone = {
        id: 'event-1',
        shape: 'circle',
        bounds: { x: 0.5, y: 0.5, radius: 0.2 },
        onEnter,
      };

      manager.addZone(zone);
      
      // Ball outside zone
      manager.update({ x: 0.1, y: 0.1 }, 0.5);
      expect(onEnter).not.toHaveBeenCalled();
      
      // Ball enters zone
      manager.update({ x: 0.5, y: 0.5 }, 0.5);
      expect(onEnter).toHaveBeenCalledTimes(1);
      expect(onEnter).toHaveBeenCalledWith(zone);
    });

    it('should trigger onExit when ball exits zone', () => {
      const onExit = vi.fn();
      const zone: InteractiveZone = {
        id: 'event-2',
        shape: 'circle',
        bounds: { x: 0.5, y: 0.5, radius: 0.2 },
        onExit,
      };

      manager.addZone(zone);
      
      // Ball enters zone
      manager.update({ x: 0.5, y: 0.5 }, 0.5);
      expect(onExit).not.toHaveBeenCalled();
      
      // Ball exits zone
      manager.update({ x: 0.9, y: 0.9 }, 0.5);
      expect(onExit).toHaveBeenCalledTimes(1);
      expect(onExit).toHaveBeenCalledWith(zone);
    });

    it('should trigger onEnter only once per entry', () => {
      const onEnter = vi.fn();
      const zone: InteractiveZone = {
        id: 'event-3',
        shape: 'circle',
        bounds: { x: 0.5, y: 0.5, radius: 0.2 },
        onEnter,
      };

      manager.addZone(zone);
      
      // Ball enters zone
      manager.update({ x: 0.5, y: 0.5 }, 0.5);
      expect(onEnter).toHaveBeenCalledTimes(1);
      
      // Ball stays in zone (multiple updates)
      manager.update({ x: 0.5, y: 0.5 }, 0.6);
      manager.update({ x: 0.5, y: 0.5 }, 0.7);
      manager.update({ x: 0.5, y: 0.5 }, 0.8);
      
      // Should still be called only once
      expect(onEnter).toHaveBeenCalledTimes(1);
    });

    it('should trigger onEnter again after re-entering zone', () => {
      const onEnter = vi.fn();
      const zone: InteractiveZone = {
        id: 'event-4',
        shape: 'circle',
        bounds: { x: 0.5, y: 0.5, radius: 0.2 },
        onEnter,
      };

      manager.addZone(zone);
      
      // First entry
      manager.update({ x: 0.5, y: 0.5 }, 0.5);
      expect(onEnter).toHaveBeenCalledTimes(1);
      
      // Exit zone
      manager.update({ x: 0.9, y: 0.9 }, 0.5);
      
      // Re-enter zone
      manager.update({ x: 0.5, y: 0.5 }, 0.5);
      expect(onEnter).toHaveBeenCalledTimes(2);
    });

    it('should handle callback errors gracefully', () => {
      const onEnter = vi.fn(() => {
        throw new Error('Callback error');
      });
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const zone: InteractiveZone = {
        id: 'error-zone',
        shape: 'circle',
        bounds: { x: 0.5, y: 0.5, radius: 0.2 },
        onEnter,
      };

      manager.addZone(zone);
      
      // Should not throw
      expect(() => {
        manager.update({ x: 0.5, y: 0.5 }, 0.5);
      }).not.toThrow();
      
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Click Event Handling', () => {
    it('should trigger onClick when zone is clicked', () => {
      const onClick = vi.fn();
      const zone: InteractiveZone = {
        id: 'click-1',
        shape: 'circle',
        bounds: { x: 0.5, y: 0.5, radius: 0.2 },
        onClick,
      };

      manager.addZone(zone);
      
      // Simulate click at center of zone (world coords 0.5, 0.5 = canvas coords 400, 300)
      const clickEvent = new MouseEvent('click', {
        clientX: 400,
        clientY: 300,
      });
      
      // Mock getBoundingClientRect
      vi.spyOn(canvasManager.element, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        right: 800,
        bottom: 600,
        width: 800,
        height: 600,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });
      
      canvasManager.element.dispatchEvent(clickEvent);
      
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(onClick).toHaveBeenCalledWith(clickEvent, zone);
    });

    it('should not trigger onClick when clicking outside zone', () => {
      const onClick = vi.fn();
      const zone: InteractiveZone = {
        id: 'click-2',
        shape: 'circle',
        bounds: { x: 0.5, y: 0.5, radius: 0.2 },
        onClick,
      };

      manager.addZone(zone);
      
      // Click far from zone
      const clickEvent = new MouseEvent('click', {
        clientX: 100,
        clientY: 100,
      });
      
      vi.spyOn(canvasManager.element, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        right: 800,
        bottom: 600,
        width: 800,
        height: 600,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });
      
      canvasManager.element.dispatchEvent(clickEvent);
      
      expect(onClick).not.toHaveBeenCalled();
    });

    it('should handle multiple zones on click', () => {
      const onClick1 = vi.fn();
      const onClick2 = vi.fn();
      
      const zone1: InteractiveZone = {
        id: 'click-multi-1',
        shape: 'circle',
        bounds: { x: 0.5, y: 0.5, radius: 0.3 },
        onClick: onClick1,
      };
      
      const zone2: InteractiveZone = {
        id: 'click-multi-2',
        shape: 'circle',
        bounds: { x: 0.5, y: 0.5, radius: 0.2 },
        onClick: onClick2,
      };

      manager.addZone(zone1);
      manager.addZone(zone2);
      
      // Click at center (both zones overlap)
      const clickEvent = new MouseEvent('click', {
        clientX: 400,
        clientY: 300,
      });
      
      vi.spyOn(canvasManager.element, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        right: 800,
        bottom: 600,
        width: 800,
        height: 600,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });
      
      canvasManager.element.dispatchEvent(clickEvent);
      
      // Both zones should receive click
      expect(onClick1).toHaveBeenCalledTimes(1);
      expect(onClick2).toHaveBeenCalledTimes(1);
    });
  });

  describe('Peak and Valley Detection', () => {
    it('should detect peak (local maximum Z)', () => {
      const onPeak = vi.fn();
      const zone: InteractiveZone = {
        id: 'peak-1',
        shape: 'circle',
        bounds: { x: 0.5, y: 0.5, radius: 0.3 },
        onPeak,
      };

      manager.addZone(zone);
      
      // Ball enters zone and Z increases then decreases (peak)
      manager.update({ x: 0.5, y: 0.5 }, 0.3); // Rising
      manager.update({ x: 0.5, y: 0.5 }, 0.7); // Peak
      manager.update({ x: 0.5, y: 0.5 }, 0.4); // Falling
      
      expect(onPeak).toHaveBeenCalledTimes(1);
      expect(onPeak).toHaveBeenCalledWith(0.7, zone);
    });

    it('should detect valley (local minimum Z)', () => {
      const onValley = vi.fn();
      const zone: InteractiveZone = {
        id: 'valley-1',
        shape: 'circle',
        bounds: { x: 0.5, y: 0.5, radius: 0.3 },
        onValley,
      };

      manager.addZone(zone);
      
      // Ball enters zone and Z decreases then increases (valley)
      manager.update({ x: 0.5, y: 0.5 }, 0.7); // Falling
      manager.update({ x: 0.5, y: 0.5 }, 0.3); // Valley
      manager.update({ x: 0.5, y: 0.5 }, 0.6); // Rising
      
      expect(onValley).toHaveBeenCalledTimes(1);
      expect(onValley).toHaveBeenCalledWith(0.3, zone);
    });

    it('should not detect peak/valley with monotonic Z', () => {
      const onPeak = vi.fn();
      const onValley = vi.fn();
      const zone: InteractiveZone = {
        id: 'monotonic-1',
        shape: 'circle',
        bounds: { x: 0.5, y: 0.5, radius: 0.3 },
        onPeak,
        onValley,
      };

      manager.addZone(zone);
      
      // Monotonically increasing Z
      manager.update({ x: 0.5, y: 0.5 }, 0.2);
      manager.update({ x: 0.5, y: 0.5 }, 0.4);
      manager.update({ x: 0.5, y: 0.5 }, 0.6);
      manager.update({ x: 0.5, y: 0.5 }, 0.8);
      
      expect(onPeak).not.toHaveBeenCalled();
      expect(onValley).not.toHaveBeenCalled();
    });

    it('should clear Z history when exiting zone', () => {
      const onPeak = vi.fn();
      const zone: InteractiveZone = {
        id: 'history-clear',
        shape: 'circle',
        bounds: { x: 0.5, y: 0.5, radius: 0.3 },
        onPeak,
      };

      manager.addZone(zone);
      
      // Build up Z history
      manager.update({ x: 0.5, y: 0.5 }, 0.3);
      manager.update({ x: 0.5, y: 0.5 }, 0.7);
      
      // Exit zone
      manager.update({ x: 0.9, y: 0.9 }, 0.4);
      
      // Re-enter zone - should not trigger peak from old history
      manager.update({ x: 0.5, y: 0.5 }, 0.5);
      manager.update({ x: 0.5, y: 0.5 }, 0.6);
      
      expect(onPeak).not.toHaveBeenCalled();
    });

    it('should only detect peak/valley when inside zone', () => {
      const onPeak = vi.fn();
      const zone: InteractiveZone = {
        id: 'outside-peak',
        shape: 'circle',
        bounds: { x: 0.5, y: 0.5, radius: 0.2 },
        onPeak,
      };

      manager.addZone(zone);
      
      // Ball outside zone with peak pattern
      manager.update({ x: 0.9, y: 0.9 }, 0.3);
      manager.update({ x: 0.9, y: 0.9 }, 0.7);
      manager.update({ x: 0.9, y: 0.9 }, 0.4);
      
      expect(onPeak).not.toHaveBeenCalled();
    });
  });

  describe('Zone Management', () => {
    it('should add and remove zones', () => {
      const onEnter = vi.fn();
      const zone: InteractiveZone = {
        id: 'manage-1',
        shape: 'circle',
        bounds: { x: 0.5, y: 0.5, radius: 0.2 },
        onEnter,
      };

      manager.addZone(zone);
      manager.update({ x: 0.5, y: 0.5 }, 0.5);
      expect(onEnter).toHaveBeenCalledTimes(1);
      
      // Remove zone
      manager.removeZone('manage-1');
      
      // Exit and re-enter - should not trigger since zone is removed
      manager.update({ x: 0.9, y: 0.9 }, 0.5);
      manager.update({ x: 0.5, y: 0.5 }, 0.5);
      expect(onEnter).toHaveBeenCalledTimes(1); // Still 1
    });

    it('should handle multiple zones independently', () => {
      const onEnter1 = vi.fn();
      const onEnter2 = vi.fn();
      
      const zone1: InteractiveZone = {
        id: 'multi-1',
        shape: 'circle',
        bounds: { x: 0.3, y: 0.3, radius: 0.15 },
        onEnter: onEnter1,
      };
      
      const zone2: InteractiveZone = {
        id: 'multi-2',
        shape: 'circle',
        bounds: { x: 0.7, y: 0.7, radius: 0.15 },
        onEnter: onEnter2,
      };

      manager.addZone(zone1);
      manager.addZone(zone2);
      
      // Enter zone 1
      manager.update({ x: 0.3, y: 0.3 }, 0.5);
      expect(onEnter1).toHaveBeenCalledTimes(1);
      expect(onEnter2).not.toHaveBeenCalled();
      
      // Move to zone 2
      manager.update({ x: 0.7, y: 0.7 }, 0.5);
      expect(onEnter1).toHaveBeenCalledTimes(1);
      expect(onEnter2).toHaveBeenCalledTimes(1);
    });
  });

  describe('Cleanup', () => {
    it('should remove event listeners on destroy', () => {
      const removeEventListenerSpy = vi.spyOn(canvasManager.element, 'removeEventListener');
      
      manager.destroy();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
    });

    it('should clear all zones on destroy', () => {
      const onEnter = vi.fn();
      const zone: InteractiveZone = {
        id: 'cleanup-1',
        shape: 'circle',
        bounds: { x: 0.5, y: 0.5, radius: 0.2 },
        onEnter,
      };

      manager.addZone(zone);
      manager.destroy();
      
      // Create new manager and verify old zones don't exist
      const newManager = new InteractionManager(canvasManager);
      newManager.update({ x: 0.5, y: 0.5 }, 0.5);
      
      expect(onEnter).not.toHaveBeenCalled();
      newManager.destroy();
    });
  });
});
