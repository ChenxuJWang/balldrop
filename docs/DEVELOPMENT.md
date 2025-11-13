# Development Guide

This document provides guidelines for developing and testing the Ball Animation Library.

## Table of Contents

- [Running Demo Files](#running-demo-files)
- [Building the Library](#building-the-library)
- [Testing](#testing)
- [Common Issues](#common-issues)
- [Best Practices](#best-practices)

---

## Running Demo Files

The HTML demo files in the `docs/` directory cannot be opened directly in a browser due to ES module restrictions and MIME type issues.

### ⚠️ IMPORTANT: MIME Type Issues

**Problem:** Browsers enforce strict MIME type checking for ES modules. When you try to import TypeScript files (`.ts`) directly in HTML, the server may return the wrong MIME type (e.g., `video/mp2t` instead of `application/javascript`), causing the error:

```
Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of "video/mp2t"
```

### Solutions

#### Option 1: Use Vite Dev Server (Recommended for Development)

Vite handles TypeScript and ES modules correctly:

```bash
# Install Vite globally (if not already installed)
npm install -g vite

# Run a specific demo
npx vite docs/zones-demo.html

# Or run from the docs directory
cd docs
npx vite index.html
```

Vite will:
- Compile TypeScript on-the-fly
- Serve files with correct MIME types
- Provide hot module replacement
- Handle ES module imports correctly

#### Option 2: Build the Library First

Build the library to JavaScript, then import the built version:

```bash
# Build the library
npm run build

# The built files will be in packages/lib/dist/
# Update demo imports to use the built version:
# import { createBallAnimation } from '../packages/lib/dist/index.js';
```

#### Option 3: Use a Simple HTTP Server (Limited)

For simple demos without TypeScript imports:

```bash
# Python 3
python -m http.server 8000

# Node.js
npx http-server -p 8000

# Then open http://localhost:8000/docs/zones-demo.html
```

**Note:** This won't work with TypeScript imports - you'll need to use built JavaScript files.

---

## Building the Library

### Development Build

```bash
# Build all packages
npm run build

# Build only the core library
cd packages/lib
npm run build
```

### Watch Mode

For continuous development:

```bash
cd packages/lib
npm run build -- --watch
```

---

## Testing

### Run All Tests

```bash
# From root
npm test

# From library package
cd packages/lib
npm test
```

### Run Specific Test File

```bash
cd packages/lib
npm test integration.test.ts
```

### Watch Mode

```bash
cd packages/lib
npm test -- --watch
```

---

## Common Issues

### Issue 1: MIME Type Error with TypeScript Imports

**Error:**
```
Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of "video/mp2t"
```

**Cause:** Browser trying to load `.ts` files directly without proper server configuration.

**Solution:**
- Use Vite dev server: `npx vite docs/zones-demo.html`
- Or build the library first and import `.js` files

### Issue 2: Module Not Found

**Error:**
```
Failed to resolve module specifier "@ballfx/core"
```

**Cause:** Package not built or not properly linked.

**Solution:**
```bash
# Build the library
npm run build

# If using local development, ensure proper import paths
# Use relative paths: '../packages/lib/dist/index.js'
```

### Issue 3: Canvas Not Appearing

**Cause:** Container element not properly sized or animation not started.

**Solution:**
- Ensure container has explicit width/height
- Call `animation.play()` after creation
- Check browser console for errors

---

## Best Practices

### For Demo Files

1. **Always use a dev server** - Never open HTML files directly with `file://` protocol
2. **Document requirements** - Add comments about build/server requirements
3. **Provide fallbacks** - Include placeholder code for when library isn't built
4. **Test in multiple browsers** - ES modules behave differently across browsers

### For Library Development

1. **Run tests before committing**
   ```bash
   npm test
   ```

2. **Check TypeScript compilation**
   ```bash
   npx tsc --noEmit
   ```

3. **Build before publishing**
   ```bash
   npm run build
   ```

4. **Update documentation** - Keep docs in sync with API changes

### For Import Statements

**In Demo HTML Files:**

```javascript
// ❌ DON'T: Import TypeScript directly
import { createBallAnimation } from '../packages/lib/src/index.ts';

// ✅ DO: Use built JavaScript (after npm run build)
import { createBallAnimation } from '../packages/lib/dist/index.js';

// ✅ DO: Use package name (after publishing to npm)
import { createBallAnimation } from '@ballfx/core';
```

**In TypeScript Source Files:**

```typescript
// ✅ DO: Use relative imports with .ts extension
import { createBallAnimation } from './index.ts';

// ✅ DO: Use package imports for external dependencies
import { createBallAnimation } from '@ballfx/core';
```

### For New Demo Files

When creating new demo HTML files:

1. Add a comment block at the top:
   ```html
   <!--
     DEVELOPMENT NOTE:
     This demo requires a dev server to run properly.
     Run: npx vite docs/your-demo.html
     
     Or build the library first:
     npm run build
     Then update imports to use: ../packages/lib/dist/index.js
   -->
   ```

2. Include error handling:
   ```javascript
   try {
     const animation = createBallAnimation(config);
     animation.play();
   } catch (error) {
     console.error('Failed to create animation:', error);
     document.getElementById('error-message').textContent = 
       'Please build the library first: npm run build';
   }
   ```

3. Provide a placeholder/fallback for when library isn't available

---

## Development Workflow

### Recommended Workflow for Feature Development

1. **Write tests first** (TDD approach)
   ```bash
   cd packages/lib
   npm test -- --watch
   ```

2. **Implement feature** in TypeScript source files

3. **Verify tests pass**
   ```bash
   npm test
   ```

4. **Check TypeScript compilation**
   ```bash
   npx tsc --noEmit
   ```

5. **Build the library**
   ```bash
   npm run build
   ```

6. **Test in demo files**
   ```bash
   npx vite docs/your-demo.html
   ```

7. **Update documentation** as needed

---

## Troubleshooting

### TypeScript Errors

If you see TypeScript errors during development:

```bash
# Check all TypeScript errors
npx tsc --noEmit

# Fix errors in source files
# Then verify tests still pass
npm test
```

### Build Errors

If build fails:

```bash
# Clean build artifacts
rm -rf packages/lib/dist

# Reinstall dependencies
npm install

# Try building again
npm run build
```

### Test Failures

If tests fail unexpectedly:

```bash
# Clear test cache
npm test -- --clearCache

# Run tests with verbose output
npm test -- --verbose

# Run specific test file
npm test your-test.test.ts
```

---

## Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
- [ES Modules in Browsers](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [Vitest Documentation](https://vitest.dev/)

---

## Questions?

If you encounter issues not covered in this guide, please:
1. Check the [GitHub Issues](https://github.com/your-repo/issues)
2. Review the [API Reference](./api-reference.md)
3. Ask in the project discussions
