# Requirements Document

## Introduction

This feature encompasses building a lightweight, configurable 2D animation library that simulates a ball moving "above" a web page. The library will convey height through circle radius and soft shadows under a single configurable light source. Motion follows user-defined curves and can be driven by time or scroll progress, with optional interactive zones. A companion Config UI will provide a visual interface for generating configuration snippets.

## Requirements

### Requirement 1: Canvas Engine and Coordinate System

**User Story:** As a developer, I want a responsive canvas-based rendering system, so that the ball animation adapts to different screen sizes and device pixel ratios.

#### Acceptance Criteria

1. WHEN the library is initialized with a mount element THEN the system SHALL create a canvas with proper coordinate transforms from CSS pixels to world units
2. WHEN the container is resized THEN the system SHALL update the canvas dimensions and maintain proper aspect ratio based on the fit mode (contain/cover/stretch)
3. WHEN rendering on high-DPI displays THEN the system SHALL scale the canvas by device pixel ratio to prevent blur artifacts
4. IF the canvas size configuration includes width and height THEN the system SHALL apply those dimensions
5. IF the canvas size configuration includes a fit mode THEN the system SHALL apply contain, cover, or stretch behavior accordingly

### Requirement 2: Motion Curve System

**User Story:** As a developer, I want to define motion curves using presets or custom functions, so that I can control the ball's height variation over time.

#### Acceptance Criteria

1. WHEN a curve preset is specified (sine, cosine, easeInOut, linear, bezier) THEN the system SHALL apply the corresponding mathematical function to map progress (0→1) to height (0→1)
2. WHEN a custom curve function is provided THEN the system SHALL use it to compute height values and clamp any NaN or infinite outputs
3. IF keypoints are defined with y, zMin, and zMax values THEN the system SHALL smooth interpolate between them to create a continuous curve
4. WHEN custom curve outputs are out of range THEN the system SHALL issue developer warnings and clamp values to [0,1]
5. WHEN no curve is specified THEN the system SHALL default to a linear curve

### Requirement 3: Typed Configuration API

**User Story:** As a developer, I want a strongly-typed configuration API with validation, so that I can catch errors early and understand available options.

#### Acceptance Criteria

1. WHEN a configuration object is provided THEN the system SHALL validate all required fields (mount, driver, light) and provide descriptive error messages for missing or invalid values
2. WHEN optional fields are omitted THEN the system SHALL apply sensible defaults
3. WHEN the driver is 'time' THEN the system SHALL require a durationMs field
4. WHEN the driver is 'scroll' THEN the system SHALL require a scrollTarget field
5. IF invalid configuration values are detected THEN the system SHALL throw errors with clear guidance on how to fix them
6. WHEN TypeScript is used THEN the system SHALL provide full type definitions for all configuration interfaces

### Requirement 4: Light and Shadow Rendering

**User Story:** As a developer, I want realistic shadow rendering based on a single light source, so that the ball appears to have depth and height above the page.

#### Acceptance Criteria

1. WHEN a light source is configured with x, y, z coordinates THEN the system SHALL calculate shadow offset by projecting the ball center toward the light
2. WHEN the ball's Z height increases THEN the system SHALL increase shadow blur and decrease shadow opacity monotonically
3. WHEN shadow options specify softness THEN the system SHALL map the value (0→1) to blur radius
4. WHEN shadow options specify opacityAtGround THEN the system SHALL use that as the maximum opacity when Z=0
5. WHEN shadow options specify minScale THEN the system SHALL clamp shadow size for very high Z values
6. WHEN the ball is rendered THEN the system SHALL draw both the shadow and the ball circle with proper layering

### Requirement 5: Time-Based Playback

**User Story:** As a developer, I want to drive animations by time with configurable duration and looping, so that I can create autonomous animated effects.

#### Acceptance Criteria

1. WHEN driver is set to 'time' and durationMs is provided THEN the system SHALL progress from t=0 to t=1 over the specified duration with ±2% tolerance
2. WHEN loop is set to true THEN the system SHALL repeat the animation infinitely
3. WHEN loop is set to a number n THEN the system SHALL repeat the animation n times and stop
4. WHEN loop is false or omitted THEN the system SHALL play once and stop at t=1
5. WHEN play() is called THEN the system SHALL start or resume the animation using requestAnimationFrame
6. WHEN pause() is called THEN the system SHALL halt animation progress while maintaining current state
7. WHEN stop() is called THEN the system SHALL reset progress to t=0 and halt animation

### Requirement 6: Scroll-Based Playback

**User Story:** As a developer, I want to drive animations by scroll progress, so that I can create scroll-driven storytelling experiences.

#### Acceptance Criteria

1. WHEN driver is set to 'scroll' and scrollTarget is provided THEN the system SHALL map the scroll position to animation progress (0→1)
2. WHEN the user scrolls THEN the system SHALL update animation progress with debouncing and use requestAnimationFrame for smooth rendering
3. WHEN scroll reaches the top THEN the system SHALL set progress to 0
4. WHEN scroll reaches the bottom THEN the system SHALL set progress to 1
5. WHEN scroll listeners are attached THEN the system SHALL use passive event listeners for performance
6. WHEN the animation is destroyed THEN the system SHALL remove all scroll event listeners

### Requirement 7: Interactive Zones

**User Story:** As a developer, I want to define interactive zones with event callbacks, so that users can interact with specific areas of the animation.

#### Acceptance Criteria

1. WHEN interactive zones are defined with shape (circle/rect) and bounds THEN the system SHALL perform hit testing on each frame
2. WHEN the ball enters a zone THEN the system SHALL trigger the onEnter callback once
3. WHEN the ball exits a zone THEN the system SHALL trigger the onExit callback once
4. WHEN a zone is clicked THEN the system SHALL trigger the onClick callback with the mouse event
5. WHEN the ball reaches a peak (local maximum Z) within a zone THEN the system SHALL trigger the onPeak callback
6. WHEN the ball reaches a valley (local minimum Z) within a zone THEN the system SHALL trigger the onValley callback
7. IF debug mode is enabled THEN the system SHALL visually render zone boundaries

### Requirement 8: Companion Config UI

**User Story:** As a developer, I want a visual configuration wizard, so that I can easily generate animation configurations without writing code manually.

#### Acceptance Criteria

1. WHEN the Config UI loads THEN the system SHALL display a left panel with controls and a right panel with live preview
2. WHEN configuration changes are made in the wizard THEN the system SHALL update the live preview in real-time using the same engine as the library
3. WHEN the Canvas step is completed THEN the system SHALL allow configuration of width, height, and fit mode
4. WHEN the Light & Shadow step is completed THEN the system SHALL allow dragging the light position and adjusting z, softness, and opacity via sliders
5. WHEN the Curve step is completed THEN the system SHALL allow selecting presets or editing custom curves with optional keypoints
6. WHEN the Playback step is completed THEN the system SHALL allow choosing time vs scroll, duration, and loop count
7. WHEN the Interactivity step is completed THEN the system SHALL allow defining zones with shapes and callback stubs
8. WHEN the Export step is reached THEN the system SHALL display JSON and JavaScript config snippets with a copy button
9. WHEN a config is exported and re-imported THEN the system SHALL reproduce the same preview within 5% visual tolerance

### Requirement 9: Package Distribution and Installation

**User Story:** As a developer, I want to install the library via npm with minimal setup, so that I can quickly integrate it into my projects.

#### Acceptance Criteria

1. WHEN the package is published THEN the system SHALL provide both ESM and CJS builds
2. WHEN the package is installed THEN the system SHALL include TypeScript type definitions
3. WHEN the package is bundled THEN the system SHALL provide a minified version for CDN usage
4. WHEN developers import the library THEN the system SHALL expose the createBallAnimation function as the primary API
5. IF the package is loaded via CDN THEN the system SHALL work without additional build steps

### Requirement 10: Testing and Quality Assurance

**User Story:** As a maintainer, I want comprehensive test coverage, so that the library remains stable and reliable across releases.

#### Acceptance Criteria

1. WHEN unit tests run THEN the system SHALL achieve 85%+ code coverage
2. WHEN curve presets are tested THEN the system SHALL produce deterministic outputs for sample t values
3. WHEN shadow calculations are tested THEN the system SHALL verify monotonic behavior of blur and opacity vs Z
4. WHEN integration tests run THEN the system SHALL verify timing accuracy within ±2% for time-based animations
5. WHEN integration tests run THEN the system SHALL verify scroll progress mapping with simulated scroll events
6. WHEN visual regression tests run THEN the system SHALL compare screenshots against golden images for low Z, high Z, and different shadow settings
7. WHEN performance tests run THEN the system SHALL maintain 60fps on mid-range hardware with frame budget <16ms

### Requirement 11: Documentation and Examples

**User Story:** As a developer, I want clear documentation and runnable examples, so that I can quickly understand how to use the library.

#### Acceptance Criteria

1. WHEN the README is viewed THEN the system SHALL include an animated GIF, quickstart guide, and at least three runnable examples
2. WHEN API documentation is accessed THEN the system SHALL provide complete JSDoc comments for all public APIs
3. WHEN the docs site is visited THEN the system SHALL include getting started guide, configuration guide, API reference, and advanced topics
4. WHEN examples are provided THEN the system SHALL include time-based, scroll-based, and interactive zone demos
5. WHEN a milestone is completed THEN the system SHALL update relevant documentation in parallel with code changes

### Requirement 12: Accessibility and Performance

**User Story:** As a developer, I want the library to be accessible and performant, so that it works well for all users.

#### Acceptance Criteria

1. WHEN interactive zones are rendered THEN the system SHALL apply appropriate ARIA roles and labels
2. WHEN keyboard navigation is used THEN the system SHALL support focus management for interactive elements
3. WHEN the animation runs on high-DPI displays THEN the system SHALL render clearly at 1x and 2x device pixel ratios
4. WHEN scroll-based animations run on heavy pages THEN the system SHALL use passive listeners and requestAnimationFrame batching to maintain performance
5. WHEN the animation is destroyed THEN the system SHALL clean up all event listeners and cancel animation frames to prevent memory leaks
