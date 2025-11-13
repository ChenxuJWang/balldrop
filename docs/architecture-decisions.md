# Architecture Decisions

This document tracks key architectural and third-party library decisions for the BallFX project.

## Third-Party Library Decisions

### Core Library (@ballfx/core)

#### Decision: Keep Core Dependency-Free

**Status**: Approved

**Context**: The core animation library needs to be lightweight and flexible for maximum adoption.

**Decision**: The core library will have zero runtime dependencies. All functionality will be implemented from scratch or use browser-native APIs.

**Rationale**:
- Minimizes bundle size (<50KB gzipped target)
- Reduces security surface area
- Eliminates dependency conflicts
- Provides maximum flexibility for consumers
- Simplifies maintenance

**Consequences**:
- More implementation work for common utilities
- Need to implement curve functions manually
- Must maintain our own implementations

---

#### Decision: Bezier Curve Implementation

**Status**: Under Consideration

**Options**:
1. Use `bezier-easing` library (1KB, stable, CSS-compatible)
2. Implement custom bezier function
3. Reference `d3-ease` patterns

**Current Approach**: Will implement custom bezier function initially, may add `bezier-easing` as optional peer dependency if complexity warrants it.

**Rationale**:
- Bezier curves are well-documented and straightforward to implement
- Custom implementation keeps core dependency-free
- Can always add library later if needed

---

### Config UI (@ballfx/ui-config)

#### Decision: React as UI Framework

**Status**: Approved

**Context**: Need a modern, maintainable framework for the configuration wizard.

**Decision**: Use React 18+ with TypeScript for the Config UI.

**Rationale**:
- Large ecosystem and community
- Excellent TypeScript support
- Good performance with modern hooks
- Familiar to most developers
- Separate package allows core to remain framework-agnostic

---

#### Decision: Control Panel Library

**Status**: Under Consideration

**Options**:
1. Use Leva (React-based, excellent DX, ~50KB)
2. Build custom controls
3. Use react-hook-form + custom UI

**Current Approach**: Will evaluate Leva during Config UI implementation. If it meets needs, use it. Otherwise, build minimal custom controls.

**Rationale**:
- Leva provides excellent developer experience
- Config UI is separate package, so size is less critical
- Custom controls give more flexibility but require more work

---

### Build and Tooling

#### Decision: Vite for Build Pipeline

**Status**: Approved

**Context**: Need fast, modern build tooling with good TypeScript support.

**Decision**: Use Vite for both library bundling and Config UI development.

**Rationale**:
- Fast development server with HMR
- Excellent TypeScript support
- Built-in Rollup for library mode
- Simple configuration
- Good ecosystem

---

#### Decision: Vitest for Testing

**Status**: Approved

**Context**: Need fast, modern test runner with TypeScript support.

**Decision**: Use Vitest for unit and integration tests.

**Rationale**:
- Compatible with Vite configuration
- Fast execution with native ESM
- Jest-compatible API
- Excellent TypeScript support
- Built-in coverage with v8

---

#### Decision: Playwright for E2E Tests

**Status**: Approved

**Context**: Need browser-based testing for visual regression and integration tests.

**Decision**: Use Playwright for end-to-end and visual regression tests.

**Rationale**:
- Cross-browser testing support
- Built-in screenshot comparison
- Good performance
- Excellent documentation
- Active maintenance

---

## Reference Implementations

These libraries were studied for patterns and best practices:

### Konva.js
- **Studied for**: Hit-testing patterns, layer management, performance optimizations
- **Key takeaways**: Efficient hit detection using bounding boxes, object pooling for performance

### ScrollMagic / Locomotive Scroll
- **Studied for**: Scroll-to-progress mapping patterns
- **Key takeaways**: Passive event listeners, requestAnimationFrame batching, debouncing strategies

### GSAP / Motion One
- **Studied for**: Timeline architecture and precision timing
- **Key takeaways**: Progress normalization, easing function patterns, playback controls

### Illuminated.js
- **Studied for**: Advanced shadow casting techniques
- **Key takeaways**: Radial gradient approach for soft shadows, light source modeling

---

## Future Considerations

### WebGL Renderer (Post-v1)
- For 100+ simultaneous balls, WebGL may be necessary
- Would study PixiJS patterns for implementation
- Keep as optional renderer, maintain Canvas 2D as default

### SVG Renderer (Post-v1)
- Better accessibility and theming support
- Easier to style with CSS
- May have performance trade-offs

### Plugin Architecture
- GSAP-style plugin system for extensibility
- Allow community contributions without bloating core
- Define clear plugin API boundaries

---

## Decision Log Format

When adding new decisions, use this format:

```markdown
#### Decision: [Title]

**Status**: [Proposed | Approved | Deprecated | Superseded]

**Context**: [What is the issue we're trying to solve?]

**Decision**: [What did we decide?]

**Rationale**: [Why did we make this decision?]

**Consequences**: [What are the trade-offs?]

**Alternatives Considered**: [What other options did we evaluate?]
```
