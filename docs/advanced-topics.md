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
