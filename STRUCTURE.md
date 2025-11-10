# Repository Structure

This document describes the organization of the Package Manager Detector extension repository.

## Directory Layout

```
package-manager-detector/
├── .github/
│   └── workflows/          # CI/CD workflows
│       ├── test.yml        # Cross-platform test matrix
│       └── sanity.yml      # Sanity checks and validation
├── .vscode/
│   └── launch.json         # VS Code debug configurations
├── icons/                  # Extension icons (empty after cleanup)
├── out/                    # Compiled JavaScript (gitignored)
│   ├── extension.js
│   └── packageManagerDetector.js
├── src/                    # TypeScript source files
│   ├── extension.ts        # Extension entry point
│   └── packageManagerDetector.ts  # Core detection logic
├── test/                   # Test files (separate from src)
│   ├── suite/
│   │   ├── index.ts        # Mocha test runner
│   │   ├── extension.test.ts
│   │   └── packageManagerDetector.test.ts
│   ├── tsconfig.json       # Test-specific TypeScript config
│   ├── runTest.ts          # VS Code test runner
│   └── README.md           # Test documentation
├── .gitignore              # Git ignore rules
├── .npmignore              # NPM package ignore rules
├── .vscodeignore           # VS Code extension package ignore rules
├── CHANGELOG.md            # Version history
├── package.json            # NPM package manifest (npm only)
├── package-lock.json       # NPM lock file
├── README.md               # Extension documentation
├── TESTING.md              # Testing guide
├── STRUCTURE.md            # This file
└── tsconfig.json           # TypeScript configuration

## Key Principles

### 1. Single Package Manager
- **Only npm** is used at the root level
- `package.json` contains no `packageManager` field
- No `yarn.lock`, `.pnp.*`, `.yarn/`, `pnpm-lock.yaml`, or `bun.lockb`
- Keeps the root directory clean and consistent

### 2. Separate Test Directory
- Tests live in `test/` at the root level, not in `src/test/`
- Test files compile in place (not to `out/`)
- Separate TypeScript configuration for tests
- Cleaner separation of concerns

### 3. VS Code Caching
- VS Code downloads are cached in `.vscode-test/`
- First test run downloads VS Code once
- Subsequent runs reuse the cached version
- CI/CD workflows cache VS Code between runs

### 4. Headless Testing
- Tests run headless by default (no GUI)
- Suitable for CI/CD environments
- Uses `xvfb` on Linux for headless display

## File Purposes

### Configuration Files

- **`tsconfig.json`**: Main TypeScript configuration for source files
  - Compiles `src/` → `out/`
  - Excludes `test/` directory

- **`test/tsconfig.json`**: Test-specific TypeScript configuration
  - Compiles tests in place
  - Includes Mocha types
  - Can import from `../src/`

- **`.gitignore`**: Prevents committing:
  - `node_modules/`
  - `out/` compiled files
  - `.vscode-test/` cache
  - Test compiled files
  - Other package manager files

- **`.npmignore`**: Excludes from NPM package:
  - Source `.ts` files
  - `test/` directory
  - Development configuration

- **`.vscodeignore`**: Excludes from VSIX package:
  - Source `.ts` files
  - `test/` directory
  - `node_modules/`
  - Development files

### Source Files

- **`src/extension.ts`**: Extension activation, status bar, commands
- **`src/packageManagerDetector.ts`**: Core package manager detection logic

### Test Files

- **`test/runTest.ts`**: Downloads VS Code and runs tests
- **`test/suite/index.ts`**: Mocha test suite configuration
- **`test/suite/extension.test.ts`**: Extension integration tests
- **`test/suite/packageManagerDetector.test.ts`**: Detection logic unit tests

### CI/CD Workflows

- **`.github/workflows/test.yml`**: 
  - Cross-platform testing (Ubuntu, macOS, Windows)
  - Multiple Node.js versions (18.x, 20.x)
  - Caches VS Code downloads

- **`.github/workflows/sanity.yml`**:
  - Quick sanity checks
  - Verifies compilation
  - Validates project structure
  - Ensures only npm is used

## Build Process

### Development
```bash
npm install          # Install dependencies
npm run compile      # Compile source: src/ → out/
npm run compile:tests # Compile tests in place
npm test            # Run tests (headless)
```

### CI/CD
```bash
npm ci              # Clean install
npm run compile     # Compile source
npm run compile:tests # Compile tests
npm test           # Run tests with cached VS Code
```

### Packaging
```bash
npm run package     # Create .vsix file
```

## Ignored Files

### Development (`.gitignore`)
- Compiled output (`out/`, test JS files)
- Dependencies (`node_modules/`)
- VS Code cache (`.vscode-test/`)
- Other package managers (yarn, pnpm, bun files)
- OS files (`.DS_Store`, `Thumbs.db`)
- IDE files (`.idea/`, `*.code-workspace`)

### NPM Package (`.npmignore`)
- Source TypeScript files
- Test directory
- Development configuration
- Documentation (except README)

### VS Code Extension (`.vscodeignore`)
- Everything in `.npmignore`
- Plus build artifacts
- Git directory

## Testing Architecture

### Local Testing
1. VS Code downloaded to `.vscode-test/` (once)
2. Tests run headless
3. Cached VS Code reused

### CI Testing
1. GitHub Actions caches `.vscode-test/`
2. First run: Downloads VS Code
3. Subsequent runs: Uses cache
4. Headless mode with `xvfb`

## Best Practices

1. **Keep root clean**: Only npm files (`package.json`, `package-lock.json`)
2. **Separate concerns**: Tests in `test/`, source in `src/`
3. **Cache aggressively**: VS Code, npm packages
4. **Test headless**: No GUI dependencies
5. **Document changes**: Update CHANGELOG.md
6. **Validate structure**: Run sanity workflow

## Maintenance

### Adding Dependencies
```bash
npm install --save-dev <package>  # Dev dependency
npm install <package>             # Runtime dependency
```

### Updating Tests
1. Add test files to `test/suite/`
2. Follow TDD interface (suite, setup, test, teardown)
3. Run locally with `npm test`
4. CI will validate automatically

### Version Bumping
1. Update `package.json` version
2. Update `CHANGELOG.md`
3. Commit changes
4. Create git tag
5. Push with tags

### Cleaning
```bash
rm -rf out/ test/**/*.js test/**/*.js.map  # Clean compiled files
rm -rf .vscode-test/                        # Clean VS Code cache
rm -rf node_modules/                        # Clean dependencies
npm install                                 # Reinstall
```

