# Testing Guide

This project includes comprehensive tests for the Package Manager Detector extension.

## Test Structure

The tests are organized in a dedicated `test/` directory at the root level:

```
test/
├── tsconfig.json           # Test-specific TypeScript configuration
├── runTest.ts              # Test runner entry point
└── suite/
    ├── index.ts            # Mocha test suite configuration
    ├── extension.test.ts   # Extension activation and command tests
    └── packageManagerDetector.test.ts  # Core detection logic tests
```

This keeps the root directory clean and separates test infrastructure from source code.

## Running Tests

### Prerequisites

Make sure you have installed all dependencies:

```bash
yarn install
```

### Compile TypeScript

Before running tests, compile the TypeScript code:

```bash
yarn compile
```

### Run Tests

Execute the test suite:

```bash
yarn test
```

This will:
1. Compile the source TypeScript files
2. Compile the test TypeScript files
3. Download VS Code if needed (cached in `.vscode-test/` for reuse)
4. Launch VS Code in test mode
5. Run all tests in the `test/suite/` directory

**Note:** VS Code is downloaded once and cached in the `.vscode-test/` directory, so subsequent test runs will be much faster.

### Debugging Tests

To debug tests in VS Code:

1. Open the Run and Debug view (Cmd/Ctrl + Shift + D)
2. Select "Extension Tests" from the dropdown
3. Set breakpoints in your test files
4. Press F5 to start debugging

## Test Coverage

### PackageManagerDetector Tests (`packageManagerDetector.test.ts`)

These tests verify the core package manager detection logic:

- **Lock File Detection**: Tests detection of npm, yarn, pnpm, and bun via their respective lock files
- **Priority Order**: Verifies that detection follows the correct priority (bun > pnpm > yarn > npm)
- **packageManager Field**: Tests detection from the `package.json` `packageManager` field when no lock file exists
- **Edge Cases**: 
  - No package.json
  - Malformed package.json
  - Complex version specifiers in packageManager field
  - Lock file takes precedence over packageManager field

### Extension Tests (`extension.test.ts`)

These tests verify the VS Code extension integration:

- **Extension Presence**: Confirms the extension is properly registered
- **Activation**: Ensures the extension activates correctly
- **Commands**: Verifies that all commands are registered

## Writing New Tests

### Test File Template

```typescript
import * as assert from 'assert';
import * as vscode from 'vscode';

suite('My Test Suite', () => {
  test('My test case', () => {
    // Arrange
    const expected = 'value';
    
    // Act
    const actual = myFunction();
    
    // Assert
    assert.strictEqual(actual, expected);
  });
});
```

### Test Setup and Teardown

Use `setup()` and `teardown()` for test initialization and cleanup:

```typescript
suite('My Test Suite', () => {
  let testWorkspace: vscode.WorkspaceFolder;

  setup(() => {
    // Runs before each test
    testWorkspace = createTestWorkspace();
  });

  teardown(() => {
    // Runs after each test
    cleanupTestWorkspace(testWorkspace);
  });
});
```

### Test File Location

All test files should be placed in the `test/` directory at the project root. This keeps tests separate from source code and maintains a clean project structure.

## Continuous Integration

The tests are designed to run in CI environments. Make sure your CI configuration:

1. Installs dependencies with `yarn install`
2. Runs `yarn test`
3. Has a display/X server available (for VS Code test runner)

## Troubleshooting

### Tests won't compile

Make sure TypeScript and all type definitions are installed:

```bash
yarn install
```

### VS Code download fails

The test runner will automatically download VS Code and cache it in `.vscode-test/`. If this fails:

1. Check your internet connection
2. Clear the `.vscode-test/` directory and try again: `rm -rf .vscode-test/`
3. Set proxy environment variables if needed

The downloaded VS Code is cached, so you only need to download it once. Subsequent test runs will reuse the cached version.

### Tests hang or timeout

Increase the Mocha timeout in `test/suite/index.ts`:

```typescript
const mocha = new Mocha({
  ui: 'tdd',
  color: true,
  timeout: 10000  // Increase this value
});
```

## Test Files

### `packageManagerDetector.test.ts`

Contains 20+ test cases covering all package manager detection scenarios. Each test:

1. Creates a temporary workspace
2. Sets up test files (lock files, package.json)
3. Runs the detection logic
4. Verifies the correct package manager is detected
5. Cleans up the temporary workspace

Key test scenarios:
- Individual lock file detection for each package manager
- Priority when multiple lock files exist
- packageManager field parsing and detection
- Unknown/no package manager scenarios
- Error handling for malformed files

### `extension.test.ts`

Verifies the extension integration with VS Code:

- Extension is registered with correct ID
- Extension activates successfully
- All commands are registered
- Status bar integration works correctly

## Code Coverage

To generate code coverage reports (requires additional setup):

```bash
# Install coverage tools
yarn add --dev nyc

# Run tests with coverage
nyc yarn test
```

## Performance

The test suite is designed to be fast:
- Uses temporary directories for isolated tests
- Cleans up after each test
- Mocks file system operations where possible
- Runs in parallel when safe

Expected test run time: < 30 seconds

## Contributing

When adding new features:

1. Write tests first (TDD approach recommended)
2. Ensure all existing tests pass
3. Add new test cases for edge cases
4. Update this documentation if adding new test patterns

