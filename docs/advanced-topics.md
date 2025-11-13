# Advanced Topics

This guide covers advanced features and techniques for the Ball Animation Library.

## Table of Contents

- [Lighting and Shadows](#lighting-and-shadows)
- [Shadow Parameters](#shadow-parameters)
- [Performance Considerations](#performance-considerations)

## Lighting and Shadows

The Ball Animation Library uses a single-light shadow model to create realistic depth perception. The shadow system simulates how a ball casts a shadow on the ground plane based on its position and height relative to a light source.

### Light Source Configuration

The light source is defined by a 3D position in world space:

```typescript
const config: AnimationConfig = {
  // ... other config
  light: {
    x: 0.5,  // Horizontal position [0,1], 0=left, 1=right
    y: 0.5,  // Vertical position [0,1], 0=top, 1=bottom
    z: 2.0   // Height above canvas plane (typically 1-3)
  }
};
```

**Coordinate System:**
- `x` and `y` are normalized coordinates where `(0,0)` is the top-left corner and `(1,1)` is the bottom-right corner
- `z` represents the height above the canvas plane, typically set between 1 and 3 times the canvas height
- Higher `z` values create more overhead lighting with smaller shadow offsets
- Lower `z` values create more dramatic side lighting with larger shadow offsets

### Shadow Projection

The shadow is calculated by projecting the ball's center onto the ground plane (Z=0) along a ray from the light source through the ball. This creates realistic shadow behavior:

1. **Shadow Direction**: The shadow always points away from the light source
2. **Shadow Distance**: As the ball rises (increasing Z), the shadow moves further from the ball
3. **Shadow Size**: The shadow grows larger as the ball moves higher

**Example: Side Lighting**

```typescript
// Light positioned to the left and above
const config: AnimationConfig = {
  light: { x: 0.2, y: 0.3, z: 2.0 },
  // Ball at center will cast shadow to the right and down
};
```

**Example: Overhead Lighting**

```typescript
// Light directly above center
const config: AnimationConfig = {
  light: { x: 0.5, y: 0.5, z: 3.0 },
  // Shadow will be directly beneath ball with minimal offset
};
```

### Shadow Behavior with Height

As the ball moves vertically (changing Z coordinate), three shadow properties change automatically:

1. **Offset**: Distance between ball and shadow increases
2. **Blur**: Shadow edges become softer and more diffuse
3. **Opacity**: Shadow becomes fainter and more transparent
4. **Scale**: Shadow size decreases (but never below `minScale`)

This creates a natural depth effect where higher balls appear further from the ground.

## Shadow Parameters

Fine-tune shadow appearance using the `shadow` configuration options:

```typescript
const config: AnimationConfig = {
  // ... other config
  shadow: {
    softness: 0.7,        // Controls blur amount [0,1]
    opacityAtGround: 0.4, // Maximum opacity at Z=0 [0,1]
    minScale: 0.2         // Minimum shadow size at Z=1 [0,1]
  }
};
```

### Softness

Controls how blurred the shadow edges appear. This parameter affects the blur radius calculation.

- **Range**: `0` to `1`
- **Default**: `0.5`
- **Effect**:
  - `0` = Sharp, well-defined shadow edges
  - `0.5` = Moderately soft shadows (default)
  - `1` = Very soft, diffuse shadows

**Example: Sharp Shadows**

```typescript
const config: AnimationConfig = {
  light: { x: 0.5, y: 0.5, z: 2.0 },
  shadow: {
    softness: 0.2  // Crisp, defined edges
  }
};
```

**Example: Soft Shadows**

```typescript
const config: AnimationConfig = {
  light: { x: 0.5, y: 0.5, z: 2.0 },
  shadow: {
    softness: 0.9  // Very diffuse, atmospheric
  }
};
```

### Opacity at Ground

Sets the maximum shadow opacity when the ball is at ground level (Z=0). As the ball rises, opacity decreases exponentially.

- **Range**: `0` to `1`
- **Default**: `0.3`
- **Effect**:
  - `0` = Invisible shadow
  - `0.3` = Subtle shadow (default)
  - `0.6` = Prominent shadow
  - `1` = Solid black shadow

**Example: Subtle Shadow**

```typescript
const config: AnimationConfig = {
  light: { x: 0.5, y: 0.5, z: 2.0 },
  shadow: {
    opacityAtGround: 0.2  // Very faint shadow
  }
};
```

**Example: Dramatic Shadow**

```typescript
const config: AnimationConfig = {
  light: { x: 0.5, y: 0.5, z: 2.0 },
  shadow: {
    opacityAtGround: 0.6  // Strong, visible shadow
  }
};
```

### Minimum Scale

Prevents the shadow from shrinking too much at maximum height. This ensures the shadow remains visible even when the ball is at its highest point.

- **Range**: `0` to `1` (as a fraction of ball radius)
- **Default**: `0.1`
- **Effect**:
  - `0.1` = Shadow can shrink to 10% of ball size
  - `0.3` = Shadow stays at least 30% of ball size
  - `0.5` = Shadow never shrinks below 50% of ball size

**Example: Vanishing Shadow**

```typescript
const config: AnimationConfig = {
  light: { x: 0.5, y: 0.5, z: 2.0 },
  shadow: {
    minScale: 0.05  // Shadow nearly disappears at max height
  }
};
```

**Example: Persistent Shadow**

```typescript
const config: AnimationConfig = {
  light: { x: 0.5, y: 0.5, z: 2.0 },
  shadow: {
    minScale: 0.4  // Shadow remains substantial at all heights
  }
};
```

### Combined Shadow Configurations

Here are some preset combinations for common shadow styles:

**Realistic Outdoor Lighting**

```typescript
const config: AnimationConfig = {
  light: { x: 0.3, y: 0.2, z: 2.5 },  // Sun from upper-left
  shadow: {
    softness: 0.4,        // Moderately sharp
    opacityAtGround: 0.5, // Visible but not harsh
    minScale: 0.15        // Shadow fades at height
  }
};
```

**Soft Indoor Lighting**

```typescript
const config: AnimationConfig = {
  light: { x: 0.5, y: 0.5, z: 2.0 },  // Overhead diffuse light
  shadow: {
    softness: 0.8,        // Very soft edges
    opacityAtGround: 0.3, // Subtle shadow
    minScale: 0.25        // Shadow remains visible
  }
};
```

**Dramatic Stage Lighting**

```typescript
const config: AnimationConfig = {
  light: { x: 0.8, y: 0.2, z: 1.5 },  // Strong side light
  shadow: {
    softness: 0.3,        // Sharp, defined
    opacityAtGround: 0.7, // Strong shadow
    minScale: 0.1         // High contrast
  }
};
```

**Floating/Ethereal Effect**

```typescript
const config: AnimationConfig = {
  light: { x: 0.5, y: 0.5, z: 3.0 },  // High overhead light
  shadow: {
    softness: 0.9,        // Very diffuse
    opacityAtGround: 0.2, // Barely visible
    minScale: 0.3         // Maintains presence
  }
};
```

## Performance Considerations

### Shadow Rendering Performance

Shadow rendering uses radial gradients, which are relatively efficient but can impact performance with many animations:

1. **Single Animation**: Negligible performance impact
2. **Multiple Animations**: Consider reducing shadow complexity
3. **Mobile Devices**: Use lower `softness` values for better performance

### Scroll-Based Animation Performance

Scroll-based animations are optimized for smooth performance even on heavy pages. The library implements several performance optimizations automatically:

#### RequestAnimationFrame Batching

The ScrollDriver uses `requestAnimationFrame` to batch scroll updates, ensuring smooth rendering at 60fps:

```typescript
// Scroll events are automatically batched
const config: AnimationConfig = {
  driver: 'scroll',
  scrollTarget: document.scrollingElement,
  // ... other config
};
```

**How it works:**
1. Multiple rapid scroll events trigger only one RAF callback
2. Progress updates are synchronized with the browser's repaint cycle
3. Prevents layout thrashing and excessive reflows

#### Hysteresis Threshold

The library implements a hysteresis threshold (0.1% progress change) to prevent excessive updates for tiny scroll movements:

```typescript
// Tiny scroll changes (< 0.1%) are ignored
// This prevents unnecessary re-renders while maintaining smooth animation
```

**Benefits:**
- Reduces CPU usage during slow scrolling
- Prevents jitter from sub-pixel scroll changes
- Maintains smooth visual appearance

#### Passive Event Listeners

Scroll listeners use the `passive` option for optimal browser performance:

```typescript
// Automatically applied by ScrollDriver
scrollTarget.addEventListener('scroll', handler, { passive: true });
```

**Benefits:**
- Allows browser to optimize scroll performance
- Prevents scroll blocking
- Improves responsiveness on touch devices

### Scroll Performance Best Practices

**1. Use Appropriate Scroll Containers**

```typescript
// Good: Use document.scrollingElement for full-page scroll
const config: AnimationConfig = {
  driver: 'scroll',
  scrollTarget: document.scrollingElement
};

// Also good: Use specific scrollable containers
const scrollContainer = document.getElementById('scroll-container');
const config: AnimationConfig = {
  driver: 'scroll',
  scrollTarget: scrollContainer
};
```

**2. Avoid Heavy Computations in Zone Callbacks**

```typescript
// Bad: Heavy computation in scroll-triggered callback
const config: AnimationConfig = {
  driver: 'scroll',
  zones: [{
    id: 'zone1',
    shape: 'circle',
    bounds: { x: 0.5, y: 0.5, radius: 0.2 },
    onEnter: () => {
      // Avoid heavy DOM manipulation or calculations here
      performExpensiveOperation(); // ❌
    }
  }]
};

// Good: Debounce or defer heavy operations
const config: AnimationConfig = {
  driver: 'scroll',
  zones: [{
    id: 'zone1',
    shape: 'circle',
    bounds: { x: 0.5, y: 0.5, radius: 0.2 },
    onEnter: () => {
      // Light operations are fine
      element.classList.add('active'); // ✅
      
      // Defer heavy operations
      requestIdleCallback(() => {
        performExpensiveOperation(); // ✅
      });
    }
  }]
};
```

**3. Monitor Performance**

The library automatically maintains 60fps on mid-range hardware. If you experience performance issues:

```typescript
// Enable debug mode to monitor frame times
const config: AnimationConfig = {
  debug: true,
  driver: 'scroll',
  scrollTarget: document.scrollingElement
};
```

**4. Optimize for Mobile**

Mobile devices may have less powerful GPUs. Consider these optimizations:

```typescript
// Mobile-optimized configuration
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

const config: AnimationConfig = {
  driver: 'scroll',
  scrollTarget: document.scrollingElement,
  shadow: {
    softness: isMobile ? 0.3 : 0.7,  // Simpler gradients on mobile
    opacityAtGround: isMobile ? 0.25 : 0.4
  },
  ballStyle: {
    radiusAtGround: isMobile ? 15 : 20,  // Smaller ball on mobile
    radiusAtMax: isMobile ? 30 : 40
  }
};
```

### Optimization Tips

**Reduce Shadow Complexity**

```typescript
// For better performance on mobile
const config: AnimationConfig = {
  shadow: {
    softness: 0.3  // Lower softness = simpler gradients
  }
};
```

**Disable Shadows for Performance**

```typescript
// Set opacity to 0 to skip shadow rendering
const config: AnimationConfig = {
  shadow: {
    opacityAtGround: 0  // No shadow drawn
  }
};
```

### Resource Cleanup

Always clean up animations when they're no longer needed:

```typescript
const animation = createBallAnimation(config);

// When done (e.g., component unmount, page navigation)
animation.destroy();
```

The `destroy()` method:
- Removes all event listeners (including scroll listeners)
- Cancels pending `requestAnimationFrame` callbacks
- Clears the canvas
- Prevents memory leaks

**Example: React Component**

```typescript
useEffect(() => {
  const animation = createBallAnimation(config);
  
  return () => {
    animation.destroy(); // Cleanup on unmount
  };
}, []);
```

### Debug Mode

Enable debug mode to visualize the light source position and shadow calculations:

```typescript
const config: AnimationConfig = {
  debug: true,
  light: { x: 0.5, y: 0.5, z: 2.0 }
};
```

Debug mode displays:
- Light source position indicator
- Shadow projection guides
- Interactive zone boundaries
- Current Z height value

## Next Steps

- Learn about [interactive zones](./configuration-guide.md#interactive-zones)
- Explore [curve customization](./configuration-guide.md#curves)
- Check the [API Reference](./api-reference.md) for complete documentation


---

## Peak and Valley Detection

Peak and valley detection allows you to trigger callbacks when the ball reaches local extrema (highest or lowest points) in its Z height while inside an interactive zone. This is useful for emphasizing key moments in your animation.

### How It Works

The library tracks the ball's Z height history while it's inside a zone. When it detects a local maximum (peak) or local minimum (valley), it triggers the corresponding callback.

**Detection Algorithm:**
- Requires at least 3 consecutive frames to detect an extremum
- Peak: Middle value is greater than both neighbors (z1 > z0 && z1 > z2)
- Valley: Middle value is less than both neighbors (z1 < z0 && z1 < z2)
- History is cleared after detection to prevent duplicate triggers
- History is cleared when exiting a zone

### Peak Detection

A peak occurs when the ball reaches a local maximum Z height within a zone.

**Example: Flash Effect on Peak**

```typescript
const animation = createBallAnimation({
  mount: document.getElementById('container'),
  driver: 'time',
  durationMs: 3000,
  loop: true,
  curvePreset: 'sine',
  light: { x: 0.5, y: 0.5, z: 2.0 },
  zones: [
    {
      id: 'peak-zone',
      shape: 'circle',
      bounds: { x: 0.5, y: 0.5, radius: 0.3 },
      onPeak: (z, zone) => {
        console.log(`Peak detected at height ${z.toFixed(2)}`);
        
        // Add flash effect
        const container = document.getElementById('container');
        container.classList.add('flash');
        setTimeout(() => {
          container.classList.remove('flash');
        }, 200);
      }
    }
  ]
});

animation.play();
```

**CSS for flash effect:**
```css
.flash {
  animation: flashEffect 0.2s ease;
}

@keyframes flashEffect {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.5); }
}
```

---

**Example: Sound Effect on Peak**

```typescript
const peakSound = new Audio('/sounds/peak.mp3');

const animation = createBallAnimation({
  mount: document.getElementById('container'),
  driver: 'scroll',
  scrollTarget: document.scrollingElement,
  curvePreset: 'sine',
  light: { x: 0.5, y: 0.5, z: 2.0 },
  zones: [
    {
      id: 'audio-zone',
      shape: 'rect',
      bounds: { x: 0.2, y: 0.3, width: 0.6, height: 0.4 },
      onPeak: (z, zone) => {
        // Play sound at peak
        peakSound.currentTime = 0; // Reset to start
        peakSound.play();
        
        // Visual feedback
        document.getElementById('peak-indicator').style.opacity = '1';
        setTimeout(() => {
          document.getElementById('peak-indicator').style.opacity = '0';
        }, 300);
      }
    }
  ]
});

animation.play();
```

---

**Example: Counter and Analytics**

```typescript
let peakCount = 0;

const animation = createBallAnimation({
  mount: document.getElementById('container'),
  driver: 'time',
  durationMs: 4000,
  loop: true,
  curvePreset: 'sine',
  light: { x: 0.5, y: 0.5, z: 2.0 },
  zones: [
    {
      id: 'tracking-zone',
      shape: 'circle',
      bounds: { x: 0.5, y: 0.5, radius: 0.4 },
      onPeak: (z, zone) => {
        peakCount++;
        document.getElementById('peak-counter').textContent = peakCount;
        
        // Track analytics
        if (typeof analytics !== 'undefined') {
          analytics.track('animation_peak', {
            zoneId: zone.id,
            height: z,
            count: peakCount
          });
        }
      }
    }
  ]
});

animation.play();
```

---

### Valley Detection

A valley occurs when the ball reaches a local minimum Z height within a zone.

**Example: Bounce Effect on Valley**

```typescript
const animation = createBallAnimation({
  mount: document.getElementById('container'),
  driver: 'time',
  durationMs: 3000,
  loop: true,
  curvePreset: 'cosine',
  light: { x: 0.5, y: 0.5, z: 2.0 },
  zones: [
    {
      id: 'bounce-zone',
      shape: 'circle',
      bounds: { x: 0.5, y: 0.5, radius: 0.3 },
      onValley: (z, zone) => {
        console.log(`Valley detected at height ${z.toFixed(2)}`);
        
        // Play bounce sound
        const bounceSound = new Audio('/sounds/bounce.mp3');
        bounceSound.play();
        
        // Add bounce animation to container
        const container = document.getElementById('container');
        container.style.transform = 'scale(0.98)';
        setTimeout(() => {
          container.style.transform = 'scale(1)';
        }, 100);
      }
    }
  ]
});

animation.play();
```

---

**Example: State Change on Valley**

```typescript
const animation = createBallAnimation({
  mount: document.getElementById('container'),
  driver: 'scroll',
  scrollTarget: document.scrollingElement,
  curvePreset: 'sine',
  light: { x: 0.5, y: 0.5, z: 2.0 },
  zones: [
    {
      id: 'state-zone',
      shape: 'rect',
      bounds: { x: 0.3, y: 0.4, width: 0.4, height: 0.3 },
      onValley: (z, zone) => {
        // Change background color
        document.body.style.backgroundColor = '#1e293b';
        
        // Update status text
        document.getElementById('status').textContent = 'At ground level';
        document.getElementById('status').style.color = '#ef4444';
        
        // Trigger haptic feedback on mobile
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
      },
      onPeak: (z, zone) => {
        // Reset on peak
        document.body.style.backgroundColor = '#0f172a';
        document.getElementById('status').textContent = 'At peak height';
        document.getElementById('status').style.color = '#10b981';
      }
    }
  ]
});

animation.play();
```

---

**Example: Progress Indicator**

```typescript
let valleyCount = 0;
const totalValleys = 5;

const animation = createBallAnimation({
  mount: document.getElementById('container'),
  driver: 'time',
  durationMs: 5000,
  loop: totalValleys,
  curvePreset: 'sine',
  light: { x: 0.5, y: 0.5, z: 2.0 },
  zones: [
    {
      id: 'progress-zone',
      shape: 'rect',
      bounds: { x: 0, y: 0, width: 1, height: 1 }, // Full canvas
      onValley: (z, zone) => {
        valleyCount++;
        
        // Update progress bar
        const progress = (valleyCount / totalValleys) * 100;
        document.getElementById('progress-bar').style.width = `${progress}%`;
        
        // Update text
        document.getElementById('progress-text').textContent = 
          `${valleyCount} / ${totalValleys} complete`;
        
        // Check if finished
        if (valleyCount >= totalValleys) {
          document.getElementById('completion-message').style.display = 'block';
        }
      }
    }
  ]
});

animation.play();
```

---

### Combining Peaks and Valleys

You can use both peak and valley detection in the same zone for complementary effects.

**Example: Breathing Effect**

```typescript
const animation = createBallAnimation({
  mount: document.getElementById('container'),
  driver: 'time',
  durationMs: 4000,
  loop: true,
  curvePreset: 'sine',
  light: { x: 0.5, y: 0.5, z: 2.0 },
  zones: [
    {
      id: 'breathing-zone',
      shape: 'circle',
      bounds: { x: 0.5, y: 0.5, radius: 0.35 },
      onPeak: (z, zone) => {
        // Inhale - expand
        document.getElementById('breathing-circle').style.transform = 'scale(1.2)';
        document.getElementById('breathing-text').textContent = 'Breathe in...';
        document.getElementById('breathing-text').style.color = '#3b82f6';
      },
      onValley: (z, zone) => {
        // Exhale - contract
        document.getElementById('breathing-circle').style.transform = 'scale(0.8)';
        document.getElementById('breathing-text').textContent = 'Breathe out...';
        document.getElementById('breathing-text').style.color = '#8b5cf6';
      }
    }
  ]
});

animation.play();
```

---

### Best Practices

**1. Choose the Right Curve**

Not all curves produce peaks and valleys. Choose curves that have local extrema:

| Curve | Peaks/Valleys | Best For |
|-------|---------------|----------|
| `sine` | Yes (1 peak, 1 valley per cycle) | Bouncing, oscillating |
| `cosine` | Yes (1 peak, 1 valley per cycle) | Floating, hovering |
| `linear` | No | Simple rise/fall |
| `easeInOut` | No | Smooth transitions |
| `bezier` | Maybe (depends on control points) | Custom curves |

**2. Zone Sizing**

- Make zones large enough to capture the full peak/valley motion
- Too small: May miss extrema if ball moves quickly
- Too large: May capture unintended peaks/valleys
- Recommended: radius or height of at least 0.2 (20% of canvas)

**3. Performance**

- Peak/valley detection adds minimal overhead (< 1ms per zone)
- Keep callbacks fast (< 16ms) to maintain 60fps
- Debounce expensive operations (DOM updates, API calls)
- Use CSS transitions instead of JavaScript animations when possible

**4. User Experience**

- Don't overuse effects - one peak/valley effect per zone is usually enough
- Provide visual feedback so users understand what's happening
- Consider accessibility - not everyone can see or hear effects
- Test on mobile devices - haptic feedback can enhance the experience

**5. Debugging**

Enable debug mode to visualize zones and verify peak/valley detection:

```typescript
const animation = createBallAnimation({
  // ... config
  debug: true, // Shows zone boundaries and ball position
  zones: [
    {
      id: 'debug-zone',
      shape: 'circle',
      bounds: { x: 0.5, y: 0.5, radius: 0.3 },
      onPeak: (z, zone) => {
        console.log(`Peak at ${z.toFixed(2)} in ${zone.id}`);
      },
      onValley: (z, zone) => {
        console.log(`Valley at ${z.toFixed(2)} in ${zone.id}`);
      }
    }
  ]
});
```

---

### Common Patterns

**Pattern 1: Rhythm Game**

```typescript
let score = 0;
let combo = 0;

const animation = createBallAnimation({
  mount: document.getElementById('container'),
  driver: 'time',
  durationMs: 2000,
  loop: true,
  curvePreset: 'sine',
  light: { x: 0.5, y: 0.5, z: 2.0 },
  zones: [
    {
      id: 'hit-zone',
      shape: 'circle',
      bounds: { x: 0.5, y: 0.5, radius: 0.15 },
      onValley: (z, zone) => {
        // Player must click at valley for points
        const hitWindow = 100; // ms
        let hitRegistered = false;
        
        const clickHandler = () => {
          if (!hitRegistered) {
            hitRegistered = true;
            score += 100 * (combo + 1);
            combo++;
            document.getElementById('score').textContent = score;
            document.getElementById('combo').textContent = `${combo}x`;
          }
        };
        
        document.addEventListener('click', clickHandler, { once: true });
        
        setTimeout(() => {
          if (!hitRegistered) {
            combo = 0;
            document.getElementById('combo').textContent = '';
          }
          document.removeEventListener('click', clickHandler);
        }, hitWindow);
      }
    }
  ]
});

animation.play();
```

---

**Pattern 2: Loading Indicator**

```typescript
const steps = ['Initializing...', 'Loading assets...', 'Processing...', 'Almost done...', 'Complete!'];
let currentStep = 0;

const animation = createBallAnimation({
  mount: document.getElementById('container'),
  driver: 'time',
  durationMs: 3000,
  loop: steps.length,
  curvePreset: 'sine',
  light: { x: 0.5, y: 0.5, z: 2.0 },
  zones: [
    {
      id: 'loading-zone',
      shape: 'rect',
      bounds: { x: 0, y: 0, width: 1, height: 1 },
      onPeak: (z, zone) => {
        if (currentStep < steps.length) {
          document.getElementById('loading-text').textContent = steps[currentStep];
          currentStep++;
        }
      }
    }
  ]
});

animation.play();
```

---

**Pattern 3: Meditation Timer**

```typescript
const breathingCycle = 4000; // 4 seconds per breath
let breathCount = 0;
const targetBreaths = 10;

const animation = createBallAnimation({
  mount: document.getElementById('container'),
  driver: 'time',
  durationMs: breathingCycle,
  loop: targetBreaths,
  curvePreset: 'sine',
  light: { x: 0.5, y: 0.5, z: 2.0 },
  zones: [
    {
      id: 'meditation-zone',
      shape: 'circle',
      bounds: { x: 0.5, y: 0.5, radius: 0.4 },
      onPeak: (z, zone) => {
        // Hold breath at peak
        document.getElementById('instruction').textContent = 'Hold...';
        document.getElementById('instruction').style.color = '#f59e0b';
      },
      onValley: (z, zone) => {
        // Complete breath cycle
        breathCount++;
        document.getElementById('breath-count').textContent = 
          `${breathCount} / ${targetBreaths}`;
        
        if (breathCount >= targetBreaths) {
          document.getElementById('instruction').textContent = 'Session complete!';
          document.getElementById('instruction').style.color = '#10b981';
          animation.stop();
        } else {
          document.getElementById('instruction').textContent = 'Breathe in...';
          document.getElementById('instruction').style.color = '#3b82f6';
        }
      }
    }
  ]
});

animation.play();
```

---

### Troubleshooting

**Problem: Peaks/valleys not detected**

Solutions:
- Verify your curve has local extrema (use `sine` or `cosine` for testing)
- Ensure the zone is large enough to capture the motion
- Check that the ball actually enters the zone (enable debug mode)
- Verify callbacks are defined correctly

**Problem: Multiple triggers for same peak/valley**

Solutions:
- This shouldn't happen - the library clears history after detection
- If it does, file a bug report with your configuration

**Problem: Peaks/valleys detected outside zone**

Solutions:
- This shouldn't happen - detection only occurs when ball is inside zone
- Verify zone bounds are correct
- Enable debug mode to visualize zones

**Problem: Performance issues**

Solutions:
- Limit expensive operations in callbacks
- Use CSS transitions instead of JavaScript animations
- Debounce or throttle callback logic
- Reduce number of zones (< 10 recommended)

---

### Next Steps

- See the [Configuration Guide](./configuration-guide.md#interactive-zones) for more zone examples
- Check the [API Reference](./api-reference.md#zones) for complete zone documentation
- Explore the [zones demo](./zones-demo.html) for interactive examples

