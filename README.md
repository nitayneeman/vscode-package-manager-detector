# Package Manager Detector

A VS Code extension that automatically detects and displays which package manager (npm, yarn, pnpm, or bun) is being used in your project.

## Features

- **Automatic Detection**: Identifies package manager based on lock files
- **🏗️ Monorepo Support** (NEW!):
  - Auto-detects npm/yarn/pnpm workspaces, Lerna, and Turborepo
  - Context-aware detection based on active file
  - Manual workspace selector with pin functionality
  - Shows workspace-specific stats and scripts
  - [Learn more](./MONOREPO_SUPPORT.md)
- **Color-Coded Status Bar**: Shows icon and package manager name with colored text
  - 🔴 **npm**: Icon + name in red (#CB3837)
  - 🔵 **yarn**: Icon + name in blue (#2C8EBB)
  - 🟡 **pnpm**: Icon + name in yellow/gold (#F9AD00)
  - ⚪ **bun**: Icon + name in cream (#FBF0DF)
- **File Badge on package.json**: Visual badge with distinctive symbol appears only on package.json:
  - ◆ Red diamond for npm
  - ◉ Blue circled dot for yarn
  - ▣ Yellow square grid for pnpm
  - ● Cream circle for bun
- **Rich Statistics Tooltip**:
  - Dependencies count (production/dev/total)
  - node_modules stats with last updated time
  - Complete list of all scripts with their commands
  - Workspace context for monorepos
- **Priority Detection**: bun → pnpm → yarn → npm
- **Quick Commands**: 
  - Install dependencies with one click
  - Run package.json scripts from a quick pick menu
  - Select workspace package (for monorepos)
  - Refresh detection manually
- **Auto-Update**: Watches for changes to lock files and updates automatically

## Supported Package Managers

- 📦 **npm** (package-lock.json)
- 🧶 **yarn** (yarn.lock)
- 📦 **pnpm** (pnpm-lock.yaml)
- 🥟 **bun** (bun.lockb)

## Usage

1. Open a project with a package.json file
2. The status bar will automatically show an icon and the package manager name in color
3. Look in the file explorer - package.json will display a colored symbol badge
4. Click the status bar item to see details and refresh
5. Use Command Palette commands:
   - `Refresh Package Manager Detection`
   - `Install Dependencies`
   - `Run Script`

## Custom Logo Icons

The extension currently uses VS Code's built-in codicons. To use the real package manager logos, see [CUSTOM_ICONS_GUIDE.md](./CUSTOM_ICONS_GUIDE.md) for instructions on converting the SVG icons to a custom font.

## Configuration

You can customize the extension through VS Code settings:

- **`packageManagerDetector.fileDecorations.enabled`**: Enable or disable the badge on package.json (default: true)

To change the colors used for the status bar background and package.json badge, go to VS Code settings and search for:
- `packageManagerDetector.npm` - Color for npm (default: #CB3837 red)
- `packageManagerDetector.yarn` - Color for yarn (default: #2C8EBB blue)
- `packageManagerDetector.pnpm` - Color for pnpm (default: #F9AD00 yellow/gold)
- `packageManagerDetector.bun` - Color for bun (default: #FBF0DF cream)

## Development

1. Install dependencies: `npm install`
2. Compile: `npm run compile`
3. Press F5 to launch in debug mode

## Building

Run `npm run compile` to build the extension.

