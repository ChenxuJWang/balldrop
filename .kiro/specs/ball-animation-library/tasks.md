# Implementation Plan

**Note on Requirements References**: Each task includes `_Requirements: X.Y_` references that link to specific requirements in requirements.md. These are traceability links to ensure all requirements are implemented, not task dependencies.

**Note on Documentation**: Following the parallel documentation approach from the design doc, documentation tasks are integrated throughout development rather than saved for the end. Each major milestone includes corresponding docs updates.

- [x] 1. Set up project structure and tooling
  - Create monorepo structure with packages/lib and packages/ui-config directories
  - Initialize package.json files with TypeScript, Vitest, and build tooling
  - Configure TypeScript with strict mode and proper module resolution
  - Set up ESLint and Prettier with commit hooks
  - Create basic README with project overview and installation placeholder
  - Add CONTRIBUTING.md, CODE_OF_CONDUCT.md, LICENSE (MIT), and CHANGELOG.md
  - Document third-party library decisions in /docs/architecture-decisions.md
  - _Requirements: 9.2, 9.4, 9.6_

- [x] 2. Implement core type definitions and interfaces
  - Create types.ts with all TypeScript interfaces (AnimationConfig, LightSource, ShadowOptions, Keypoint, InteractiveZone, BallStyle, AnimationInstance)
  - Define internal types (ProgressDriver, CurveFn, CanvasManager, ShadowCalculator, InteractionManager, Vec2, Vec3, BallState, ShadowParams)
  - Add JSDoc comments to all public interfaces
  - _Requirements: 3.1, 3.2, 3.6_

- [x] 3. Build canvas management module
- [x] 3.1 Implement canvas initialization and DPR handling
  - Write CanvasManager class with initialization logic
  - Implement device pixel ratio scaling
  - Create coordinate transformation methods (toWorldCoords, toCSSCoords)
  - Write unit tests for canvas initialization and coordinate transforms
  - Update README with "Hello Ball" quickstart example
  - Create /docs/getting-started.md with canvas setup guide
  - _Requirements: 1.1, 1.3, 11.1_

- [x] 3.2 Implement canvas resize handling and fit modes
  - Add ResizeObserver integration for responsive sizing
  - Implement contain, cover, and stretch fit modes
  - Write unit tests for resize behavior and fit mode calculations
  - Add fit mode examples to getting-started.md
  - _Requirements: 1.2, 1.4, 1.5, 11.3_

- [x] 4. Create curve computation system
- [x] 4.1 Implement preset curve functions
  - Evaluate using bezier-easing library for cubic-bezier implementation vs custom
  - Write sine, cosine, easeInOut, linear curve functions (reference d3-ease patterns)
  - Implement or integrate bezier curve function
  - Ensure all functions map t:[0,1] → z:[0,1]
  - Write unit tests verifying outputs at t=0, 0.25, 0.5, 0.75, 1.0
  - Create /docs/configuration-guide.md with curves section
  - Add examples demonstrating each preset curve
  - _Requirements: 2.1, 2.5, 11.3_

- [x] 4.2 Implement custom curve adapter with validation
  - Create adapter function that wraps custom curve functions
  - Add NaN/Infinity detection and clamping
  - Implement out-of-range value clamping with developer warnings
  - Write unit tests for edge cases (NaN, Infinity, out-of-range)
  - Add custom curve examples to configuration-guide.md
  - _Requirements: 2.2, 2.4, 11.3_

- [x] 4.3 Implement keypoint interpolation system
  - Write keypoint sorting and segment finding logic
  - Implement Catmull-Rom or cubic Hermite interpolation
  - Add tangent computation for C1 continuity
  - Write unit tests for smooth interpolation and edge cases
  - Add keypoint examples to configuration-guide.md
  - _Requirements: 2.3, 11.3_

- [x] 5. Build configuration validation and defaults system
- [x] 5.1 Implement config schema validation
  - Write validation function for required fields (mount, driver, light)
  - Add conditional validation (durationMs for time driver, scrollTarget for scroll driver)
  - Create descriptive error messages with field names and expected types
  - Write unit tests for all validation scenarios
  - Start /docs/api-reference.md with AnimationConfig interface documentation
  - _Requirements: 3.1, 3.3, 3.4, 3.5, 11.2_

- [x] 5.2 Implement default value application
  - Create defaults object for all optional configuration fields
  - Write merging logic to combine user config with defaults
  - Write unit tests verifying default application
  - Document default values in api-reference.md
  - _Requirements: 3.2, 11.2_

- [x] 6. Implement shadow calculation module
- [x] 6.1 Create shadow offset calculation
  - Write function to compute shadow offset based on ball position and light position
  - Implement projection logic (ball center → plane towards light)
  - Ensure offset magnitude increases with Z height
  - Write unit tests verifying offset direction and magnitude
  - Create /docs/advanced-topics.md with lighting section
  - _Requirements: 4.1, 4.6, 11.3_

- [x] 6.2 Implement shadow blur and opacity scaling
  - Write functions to compute blur radius based on Z height and softness parameter
  - Implement opacity calculation with opacityAtGround parameter
  - Add minScale clamping for high Z values
  - Write unit tests verifying monotonic behavior
  - Add shadow parameter examples to advanced-topics.md
  - Create demo page showing different shadow configurations
  - _Requirements: 4.2, 4.3, 4.4, 4.5, 11.3, 11.4_

- [x] 7. Build time-based progress driver
- [x] 7.1 Implement time driver core logic
  - Create TimeDriver class implementing ProgressDriver interface
  - Add elapsed time tracking with requestAnimationFrame
  - Implement progress calculation: t = elapsed / durationMs
  - Write unit tests with fake timers verifying timing accuracy (±2%)
  - Add time-based playback section to configuration-guide.md
  - _Requirements: 5.1, 5.5, 11.3_

- [x] 7.2 Implement looping and playback controls
  - Add loop count tracking (infinite and counted loops)
  - Implement play, pause, stop, and resume methods
  - Add state management to maintain progress across pause/resume
  - Write unit tests for loop behavior and playback controls
  - Document playback control methods in api-reference.md
  - _Requirements: 5.2, 5.3, 5.4, 5.6, 5.7, 11.2_

- [x] 8. Build scroll-based progress driver
- [x] 8.1 Implement scroll progress mapping
  - Create ScrollDriver class implementing ProgressDriver interface
  - Add scroll event listener with passive option
  - Implement progress calculation: scrollTop / (scrollHeight - clientHeight)
  - Write unit tests with mocked scroll events
  - Add scroll-based playback section to README
  - Create scroll demo example
  - _Requirements: 6.1, 6.3, 6.4, 6.5, 11.1, 11.4_

- [x] 8.2 Implement scroll performance optimizations
  - Add requestAnimationFrame batching for scroll updates
  - Implement debouncing with hysteresis threshold
  - Add cleanup logic to remove event listeners
  - Write unit tests verifying performance optimizations
  - Document scroll performance considerations in advanced-topics.md
  - _Requirements: 6.2, 6.6, 11.3_

- [x] 9. Create render loop and drawing system
- [x] 9.1 Implement main render loop
  - Create Renderer class with requestAnimationFrame loop
  - Add frame time tracking for performance monitoring
  - Implement update logic: get progress → compute curve → calculate position
  - Write integration tests verifying render loop execution
  - _Requirements: 1.1, 4.6_

- [x] 9.2 Implement shadow rendering
  - Write drawShadow function using radial gradients
  - Implement gradient color stops based on shadow parameters
  - Add bounding box calculation for efficient rendering
  - Write visual regression tests for shadow appearance
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [x] 9.3 Implement ball rendering
  - Write drawBall function with circle drawing
  - Add support for fill, stroke, and strokeWidth from BallStyle
  - Implement radius calculation based on Z height
  - Write visual regression tests for ball appearance at different heights
  - _Requirements: 1.1, 4.6_

- [x] 9.4 Add debug mode rendering
  - Implement debug overlay showing guides, zones, and light position
  - Add visual indicators for current progress and Z height
  - Write tests verifying debug mode toggles correctly
  - _Requirements: 7.7_

- [x] 10. Build interaction system
- [x] 10.1 Implement hit testing for zones
  - Create InteractionManager class
  - Study Konva.js hit-testing patterns for performance optimization
  - Write hit testing functions for circular and rectangular zones
  - Add coordinate mapping from canvas to world space
  - Write unit tests for hit detection accuracy
  - Add interactive zones section to configuration-guide.md
  - _Requirements: 7.1, 11.3_

- [x] 10.2 Implement zone event tracking and callbacks
  - Add state tracking for ball position relative to zones
  - Implement onEnter and onExit event triggering with state management
  - Add onClick event handling with coordinate mapping
  - Write integration tests verifying event firing
  - Create interactive zone example with modal trigger
  - Document zone callbacks in api-reference.md
  - _Requirements: 7.2, 7.3, 7.4, 11.2, 11.4_

- [x] 10.3 Implement peak and valley detection
  - Add Z value history tracking for local extrema detection
  - Implement peak detection (local maximum Z)
  - Implement valley detection (local minimum Z)
  - Write unit tests for peak/valley detection logic
  - Add peak/valley examples to zones cookbook in docs
  - _Requirements: 7.5, 7.6, 11.3_

- [x] 11. Create main API and animation instance
- [x] 11.1 Implement createBallAnimation function
  - Write main factory function that accepts AnimationConfig
  - Integrate all modules: canvas, driver, curve, shadow, render, interactions
  - Return AnimationInstance with control methods
  - Write integration tests for full initialization flow
  - Complete api-reference.md with createBallAnimation documentation
  - Update README with complete working examples
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 11.1, 11.2_

- [x] 11.2 Implement AnimationInstance control methods
  - Add play, pause, stop methods delegating to driver
  - Implement setProgress method for manual control
  - Add updateConfig method for runtime configuration changes
  - Implement destroy method with complete cleanup
  - Write integration tests for all control methods
  - Document AnimationInstance methods in api-reference.md
  - Add troubleshooting section to configuration-guide.md
  - _Requirements: 5.5, 5.6, 5.7, 6.6, 12.5, 11.2, 11.3_

- [ ] 12. Add path animation support
  - Implement 2D path functions (xFn, yFn) for ball movement
  - Add default path functions (x=0.5 center, y=t top-to-bottom)
  - Integrate path computation into render loop
  - Write unit tests for path calculations
  - _Requirements: 2.1_

- [ ] 13. Build test suite infrastructure
- [ ] 13.1 Set up unit test environment
  - Configure Vitest with TypeScript support
  - Add vitest-canvas-mock or jsdom-canvas for Canvas API mocking
  - Create test utility functions (createMockCanvas, createMockConfig, etc.)
  - Write example tests to verify setup
  - _Requirements: 10.1, 10.2_

- [ ] 13.2 Set up integration test environment
  - Configure Playwright for browser-based testing
  - Create test HTML pages with animation examples
  - Write helper functions for timing and scroll simulation
  - Add visual regression test infrastructure
  - _Requirements: 10.3, 10.4, 10.5, 10.6_

- [ ] 13.3 Implement comprehensive test coverage
  - Write unit tests for all modules achieving 85%+ coverage
  - Write integration tests for time-based animations
  - Write integration tests for scroll-based animations
  - Write integration tests for interactive zones
  - Add visual regression tests for shadow and ball rendering
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

- [ ] 14. Set up build and packaging system
- [ ] 14.1 Configure build pipeline
  - Set up Vite or Rollup for bundling
  - Configure TypeScript compilation with declaration generation
  - Add ESM, CJS, and UMD output formats
  - Implement minification with terser
  - Write build scripts in package.json
  - Update README with installation instructions for all formats
  - Add version badge and build status badge
  - _Requirements: 9.1, 9.2, 9.4, 11.1_

- [ ] 14.2 Add bundle size monitoring
  - Integrate bundle size checking in build process
  - Set size budget (<50KB gzipped for core)
  - Add CI check to fail on size budget violations
  - Document bundle size in README
  - Update CHANGELOG.md with release notes
  - _Requirements: 9.1, 9.2, 11.1_

- [ ] 15. Finalize documentation site
- [ ] 15.1 Set up documentation site infrastructure
  - Choose and configure docs framework (Docusaurus/VitePress)
  - Migrate all markdown docs to site structure
  - Add navigation and search functionality
  - Configure deployment to GitHub Pages
  - _Requirements: 11.3_

- [ ] 15.2 Polish documentation content
  - Review and update all docs for consistency
  - Add animated GIFs or screenshots to README and docs
  - Ensure all examples are tested and working
  - Add links between related documentation sections
  - _Requirements: 11.1, 11.3, 11.4_

- [ ] 15.3 Generate API documentation
  - Set up TypeDoc or similar for API docs generation
  - Ensure all public APIs have complete JSDoc comments
  - Generate and integrate API docs into documentation site
  - _Requirements: 11.2, 11.3_

- [ ] 16. Implement accessibility features
- [ ] 16.1 Add ARIA support for interactive zones
  - Apply role="button" to clickable zones
  - Add aria-label attributes
  - Implement keyboard focus with tabindex
  - Write tests for keyboard navigation
  - Create /docs/accessibility-guide.md documenting accessibility features
  - _Requirements: 12.1, 12.2, 11.3_

- [ ] 16.2 Add reduced motion support
  - Detect prefers-reduced-motion media query
  - Implement alternative behavior (static position or slowed animation)
  - Add configuration option to override behavior
  - Write tests for reduced motion handling
  - Document reduced motion support in accessibility-guide.md
  - _Requirements: 12.4, 11.3_

- [ ] 17. Build Config UI foundation
- [ ] 17.1 Set up React project structure
  - Initialize React app with TypeScript
  - Evaluate and integrate Leva for control panel UI (or build custom)
  - Set up component structure for wizard steps
  - Configure state management (Context API)
  - Add routing for wizard steps
  - _Requirements: 8.1, 8.2_

- [ ] 17.2 Implement live preview component
  - Create preview component that embeds the core library
  - Add real-time config updates with debouncing (study Leva patterns)
  - Integrate AnimationInstance.updateConfig for live changes
  - Write tests for preview synchronization
  - _Requirements: 8.2, 8.9_

- [ ] 18. Build Config UI wizard steps
- [ ] 18.1 Implement Canvas configuration step
  - Create form for width, height, and fit mode selection
  - Add preview of canvas sizing
  - Implement state management for canvas config
  - Add inline help text and tooltips
  - _Requirements: 8.3_

- [ ] 18.2 Implement Light & Shadow configuration step
  - Create draggable light position control
  - Add sliders for z, softness, and opacity parameters
  - Show real-time shadow updates in preview
  - Add inline help text explaining each parameter
  - _Requirements: 8.4_

- [ ] 18.3 Implement Curve configuration step
  - Add preset curve selector with visual previews
  - Create curve editor for custom functions
  - Add keypoints editor with YZ pane visualization
  - Implement smoothing toggle
  - Add inline help and curve preview graphs
  - _Requirements: 8.5_

- [ ] 18.4 Implement Playback configuration step
  - Add time vs scroll driver selector
  - Create duration input and loop count selector
  - Add scroll target configuration
  - Add inline help for playback options
  - _Requirements: 8.6_

- [ ] 18.5 Implement Interactivity configuration step
  - Create zone definition interface (shape, bounds)
  - Add visual zone placement on preview
  - Implement callback stub naming
  - Add inline help for zone configuration
  - _Requirements: 8.7_

- [ ] 18.6 Implement Export step
  - Generate JSON config from wizard state
  - Generate JavaScript code snippet
  - Add copy-to-clipboard functionality
  - Implement config round-trip validation
  - Add usage instructions and next steps
  - Update docs site with Config UI screenshots and guide
  - _Requirements: 8.8, 8.9, 11.3_

- [ ] 19. Set up CI/CD pipeline
- [ ] 19.1 Configure GitHub Actions workflow
  - Add install and dependency caching
  - Configure lint, typecheck, and test jobs
  - Add build verification
  - Set up visual regression testing
  - _Requirements: 10.1, 10.2, 10.3, 10.6_

- [ ] 19.2 Add deployment automation
  - Configure npm publishing on version tags
  - Set up GitHub releases with changelog
  - Add docs site deployment to GitHub Pages
  - _Requirements: 9.1, 9.2, 9.5_

- [ ] 20. Performance optimization and hardening
- [ ] 20.1 Implement performance monitoring
  - Add frame time tracking in render loop
  - Log warnings when frame budget exceeded (>16ms)
  - Add performance tests for 60fps target
  - _Requirements: 10.7, 12.3_

- [ ] 20.2 Optimize memory usage
  - Implement object pooling for frequently allocated objects
  - Add proper cleanup in destroy method
  - Verify no memory leaks with heap snapshots
  - _Requirements: 12.5_

- [ ] 20.3 Add error boundary and graceful degradation
  - Wrap zone callbacks in try-catch blocks
  - Add fallback behavior for unsupported features
  - Implement comprehensive error logging
  - Write tests for error scenarios
  - _Requirements: 3.5_
