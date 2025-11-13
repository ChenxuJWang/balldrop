# Contributing to BallFX

Thank you for your interest in contributing to BallFX! We appreciate your help in making this library better.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/ballfx.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/your-feature-name`

## Development Workflow

### Project Structure

```
ballfx/
├── packages/
│   ├── lib/          # Core animation library (@ballfx/core)
│   └── ui-config/    # Config wizard UI (@ballfx/ui-config)
├── docs/             # Documentation
└── .kiro/specs/      # Feature specifications
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Code Quality

We use ESLint and Prettier to maintain code quality:

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

Pre-commit hooks will automatically run linting and formatting checks.

### Building

```bash
# Build all packages
npm run build

# Build in watch mode
npm run dev
```

## Coding Standards

- **TypeScript**: All code must be written in TypeScript with strict mode enabled
- **Testing**: Maintain 85%+ test coverage for new code
- **Documentation**: Add JSDoc comments to all public APIs
- **Commits**: Use clear, descriptive commit messages

### TypeScript Guidelines

- Use explicit types where helpful for clarity
- Avoid `any` - use `unknown` if type is truly unknown
- Prefer interfaces over type aliases for object shapes
- Use strict null checks

### Testing Guidelines

- Write unit tests for all modules
- Use descriptive test names: `it('should return 0.5 at t=0 for sine curve', ...)`
- Follow AAA pattern: Arrange, Act, Assert
- Mock external dependencies appropriately

## Pull Request Process

1. Ensure all tests pass: `npm test`
2. Ensure code is properly formatted: `npm run format:check`
3. Ensure no linting errors: `npm run lint`
4. Update documentation if needed
5. Add tests for new features
6. Update CHANGELOG.md with your changes
7. Submit PR with clear description of changes

### PR Title Format

Use conventional commit format:
- `feat: add new curve preset`
- `fix: correct shadow offset calculation`
- `docs: update API reference`
- `test: add integration tests for scroll driver`
- `refactor: simplify canvas initialization`

## Reporting Issues

When reporting issues, please include:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Browser/environment information
- Code samples if applicable

## Feature Requests

We use a spec-driven development process. For significant features:
1. Open an issue to discuss the feature
2. Create a spec in `.kiro/specs/` following our template
3. Get approval before implementing
4. Implement according to the spec

## Questions?

Feel free to open an issue with the `question` label or reach out to maintainers.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
