# Test Directory

This directory contains all test files for the Package Manager Detector extension.

## Structure

```
test/
├── README.md               # This file
├── tsconfig.json           # TypeScript configuration for tests
├── runTest.ts              # Test runner entry point
└── suite/
    ├── index.ts            # Mocha test suite configuration
    ├── extension.test.ts   # Extension integration tests
    └── packageManagerDetector.test.ts  # Core detection logic tests
```

## Key Features

### 🚀 VS Code Caching
The test runner automatically downloads and caches VS Code in `.vscode-test/` directory. This means:
- First test run downloads VS Code (takes a few minutes)
- Subsequent test runs reuse the cached version (much faster)
- No need to manually manage VS Code test instances

### 📁 Separate Test Directory
Tests are kept in a dedicated root-level `test/` directory:
- Cleaner project structure
- Separate TypeScript configuration for tests
- Compiled test files go to `out/test/` (not in source tree)
- Root `package.json` is the only package manager file at root level

### 🔧 Test Configuration
The `test/tsconfig.json` extends the main configuration but:
- Compiles tests to `out/test/` directory
- Includes type definitions for Mocha and Node.js
- Processes test files and allows imports from `../src/`

## Running Tests

From the project root:

```bash
# Run all tests (compiles and runs)
npm test

# Or step by step:
npm run compile              # Compile source to out/
npm run compile:tests        # Compile tests to out/test/
node ./out/test/test/runTest.js   # Run tests
```

## Debugging Tests

1. Open VS Code
2. Go to Run and Debug (Cmd/Ctrl + Shift + D)
3. Select "Extension Tests"
4. Press F5

Breakpoints in test files will be hit during execution.

## Writing Tests

Tests use Mocha with the TDD interface:

```typescript
import * as assert from 'assert';

suite('My Feature', () => {
  setup(() => {
    // Runs before each test
  });

  teardown(() => {
    // Runs after each test
  });

  test('should do something', () => {
    assert.strictEqual(actual, expected);
  });
});
```

## CI/CD

Tests are designed to work in CI environments. The VS Code download and caching works automatically in CI pipelines.

For more detailed information, see [TESTING.md](../TESTING.md) in the project root.

