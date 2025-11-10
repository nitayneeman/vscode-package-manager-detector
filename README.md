# Package Manager Detector

A lightweight VS Code extension that automatically detects and displays which package manager (npm, yarn, pnpm, or bun) is being used in your project.

## Features

- **Automatic Detection**: Identifies package manager based on lock files
- **Color-Coded Status Bar**: Shows icon and package manager name with colored text
  - 🔴 **npm**: Icon + name in red (#CB3837)
  - 🔵 **yarn**: Icon + name in blue (#2C8EBB)
  - 🟡 **pnpm**: Icon + name in yellow/gold (#F9AD00)
  - ⚪ **bun**: Icon + name in cream (#FBF0DF)
- **Simple Tooltip**: Hover to see:
  - Package manager name and version
  - Total dependency count
  - Complete list of all scripts with their commands
- **Priority Detection**: bun → pnpm → yarn → npm
- **Auto-Update**: Watches for changes to lock files and updates automatically
- **One-Click Access**: Click status bar to open package.json

## Supported Package Managers

- 📦 **npm** (package-lock.json)
- 🧶 **yarn** (yarn.lock)
- 📦 **pnpm** (pnpm-lock.yaml)
- 🥟 **bun** (bun.lockb)

## Usage

1. Open a project with a package.json file
2. The status bar will automatically show an icon and the package manager name in color
3. Hover over the status bar item to see dependency count and available scripts
4. Click the status bar item to open package.json

## Configuration

No configuration needed! The extension works out of the box.

## Why This Extension?

When working with multiple projects, it's easy to forget which package manager each project uses. This extension provides an instant, at-a-glance indicator so you never accidentally run `npm install` in a yarn project (or vice versa).

## Development

1. Install dependencies: `yarn install` or `npm install`
2. Compile: `npm run compile`
3. Press F5 to launch in debug mode

## Building

Run `npm run compile` to build the extension.

## License

MIT
