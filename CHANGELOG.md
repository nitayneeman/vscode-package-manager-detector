# Changelog

All notable changes to the "Package Manager Detector" extension will be documented in this file.

## [1.0.0] - 2025-11-14

### 🎉 Official Release

This marks the official 1.0.0 release of Package Manager Detector! The extension is now stable and production-ready.

#### ✨ Highlights
- **Stable API**: All core features are finalized and tested
- **Monorepo Support**: Intelligent detection for multi-package projects
- **Clean UI**: Streamlined status bar and tooltip design
- **Performance**: Fast, lightweight, and reliable detection
- **Documentation**: Complete README with usage examples and settings

#### 🎯 Core Features
- Automatic package manager detection (npm, yarn, pnpm, bun)
- Color-coded status bar indicators
- Interactive tooltip with package manager info and scripts
- Monorepo-aware context detection
- Real-time updates via file watchers
- Customizable colors for each package manager

## [0.5.0] - 2025-01-11

### 🎯 Monorepo Support & UI Refinements

Added intelligent monorepo support and cleaned up the user interface for a better experience.

#### ✨ Added
- **Monorepo Support**: Automatically detects the nearest `package.json` based on the active file
  - Walks up the directory tree to find the closest package manager context
  - Status bar updates automatically when switching between files in different packages
  - Falls back to workspace root when no active editor or package.json found
- **Active Editor Tracking**: Extension now listens to editor changes to update package manager context

#### 🎨 Improved
- **Cleaner Status Bar**: Removed "No PM" display - now defaults to showing "npm" when no package manager is detected
- **Simplified Tooltip**: Removed dependency count (less actionable information)
- **Better Tooltip UX**: Limited scripts list to 8 entries with "… and X more" indicator
  - Ensures the "Click to open package.json" hint always stays visible
  - Prevents tooltip from being cut off with long script lists
- **Lowercase Package Manager Names**: Changed from "Npm", "Yarn", etc. to "npm", "yarn" for consistency

#### 🗑️ Removed
- "No PM" indicator when package manager is unknown
- Dependency count from tooltip
- Script count from tooltip header (was "Scripts (7)", now just "Scripts")

#### Example Tooltip (Monorepo Package):
```
npm v10.0.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📜 Scripts:
   • dev → vite
   • build → tsc && vite build
   • test → vitest
   • lint → eslint .
   • preview → vite preview
   • type-check → tsc --noEmit
   • format → prettier --write .
   • clean → rm -rf dist
   … and 3 more

💡 Click to open package.json
```

## [0.4.2] - 2025-01-10

### 🎨 Improved Visual Design

Enhanced the visual appearance with better logos and text styling.

#### ✨ Improvements
- **Improved SVG Logos**: All package manager icons (npm, yarn, pnpm, bun) now have better, more polished designs
  - Larger size (24x24 instead of 16x16)
  - Rounded corners for a modern look
  - Better contrast and details
- **Better Text Styling**: Status bar now shows package manager names in Word Case (Npm, Yarn, Pnpm, Bun)
- **Removed QUICKSTART.md**: Simplified documentation

## [0.4.1] - 2025-01-10

### 🎯 Removed File Decorations (Kept Status Bar Colors)

Simplified the extension by removing file explorer decorations while keeping the colored status bar.

#### ❌ Removed
- **File Decoration Provider**: Removed colored badges on package.json in file explorer
- **File Decoration Configuration**: Removed settings option to toggle decorations

#### ✅ What Remains
- ✅ Status bar indicator with icon and **colored text**
  - 🔴 npm in red
  - 🔵 yarn in blue  
  - 🟡 pnpm in yellow/gold
  - ⚪ bun in cream
- ✅ Simple tooltip with version, dependencies, and scripts
- ✅ Click to open package.json
- ✅ Auto-update via file watchers

#### 📊 Impact
- No visual clutter in file explorer
- Colored status bar still provides at-a-glance PM identification
- Zero configuration needed

## [0.4.0] - 2025-01-10

### 🧹 Major Cleanup: Minimal & Fast Version

This release dramatically simplifies the extension by removing features that added complexity without providing essential value. The extension is now ~50% smaller, faster, and focuses on doing one thing well: showing you which package manager your project uses.

#### ❌ Removed Features
- **Monorepo Support** (~200 lines): Removed context-aware detection and workspace management
- **Security Audit** (~100 lines): Removed vulnerability scanning (can be slow/unreliable)
- **Outdated Packages Check** (~100 lines): Removed update detection (can be slow)
- **"Install Dependencies" Command**: VS Code already has a terminal
- **"Run Script" Command**: VS Code already has npm scripts explorer
- **"Refresh Detection" Command**: File watchers handle this automatically

#### ✅ What Remains (Core Features)
- ✅ Package manager detection (npm/yarn/pnpm/bun)
- ✅ Status bar with icon + colored text
- ✅ File decoration on package.json with colored badge
- ✅ Click to open package.json
- ✅ Simple tooltip: PM name, version, dependency count, scripts list
- ✅ Auto-update via file watchers

#### 📊 Impact
- **Code Size**: 865 lines → 233 lines (~73% reduction)
- **Performance**: No more external command execution (npm audit, npm outdated)
- **Reliability**: No network dependencies, no timeouts, no caching complexity
- **Simplicity**: One command, one purpose, no overwhelming options

#### New Tooltip Format
```
📦 Npm v9.8.1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 23 dependencies

📜 Scripts (7):
   • dev → vite
   • build → tsc && vite build
   • test → vitest
   • lint → eslint .
   • format → prettier --write .
   • preview → vite preview
   • type-check → tsc --noEmit

💡 Click to open package.json
```

## [0.3.1] - 2025-01-06

### 🎨 Improved: Simplified Tooltip

The tooltip has been streamlined to show only the most actionable and relevant information!

#### Changed
- **Package Manager Name Format**: Changed from UPPERCASE to Word Case (e.g., "YARN" → "Yarn", "NPM" → "Npm")
- **Simplified Security Info**: Condensed to one line showing severity counts (e.g., "⚠️ 2 critical, 5 high vulnerabilities")
- **Simplified Updates Info**: Condensed to one line showing update counts (e.g., "📦 3 major, 5 minor updates available")
- **Simplified Dependencies**: Shows only total count instead of breakdown (e.g., "📊 23 dependencies")
- **Fixed Click Message**: Corrected tooltip footer to always say "Click to open package.json"

#### Removed
- **Production/Dev Dependency Breakdown**: Removed to reduce clutter
- **node_modules Package Count**: Removed as it's rarely actionable
- **Lock File Modified Time**: Removed to simplify display

#### New Format Example
```
🧶 Yarn v3.6.4
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 packages/frontend
🏗️  Monorepo: 5 workspaces
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  2 critical, 5 high vulnerabilities
   💡 Run: yarn audit fix

📦 3 major, 5 minor updates available
   💡 Run: yarn upgrade-interactive

📊 23 dependencies

📜 Scripts (5):
   • dev → vite
   • build → vite build
   • test → vitest
   • lint → eslint .
   • preview → vite preview

💡 Click to open package.json
```

## [0.3.0] - 2025-01-06

### 🎯 Simplified: Context-Aware Detection

The extension now automatically detects the nearest package.json based on your active file!

#### Changed
- **Removed Pinned Workspace Feature**: Extension now always uses context-aware detection based on the active file's location
- **Status Bar Click Action**: Clicking the status bar item now opens the nearest package.json file
- **Removed Workspace Selector**: The `packageManagerDetector.selectWorkspace` command has been removed
- **Cleaner Tooltip**: Removed "(pinned)" indicator from tooltip

#### Improved
- **Better User Experience**: The extension automatically updates as you navigate between different packages in a monorepo
- **Simpler Workflow**: No need to manually pin/unpin workspaces - the extension intelligently follows your context
- **Direct Access**: Quick access to the relevant package.json with a single click

## [0.2.0] - 2025-01-06

### 🔒 Major Feature: Security & Update Monitoring

The extension now provides real-time security and package update information!

#### Added
- **Security Vulnerability Detection**:
  - Runs `npm/yarn/pnpm audit` to check for security issues
  - Shows critical, high, moderate, and low severity counts
  - Displays "✅ No vulnerabilities found" when secure
  - Suggests fix command: `npm audit fix`
  - Results cached for 5 minutes to avoid performance impact

- **Outdated Package Detection**:
  - Runs `npm/yarn/pnpm outdated` to check for updates
  - Categorizes updates by semver type (major/minor/patch)
  - Color-coded indicators: 🔴 major, 🟡 minor, 🟢 patch
  - Shows "✅ All packages up to date" when current
  - Suggests appropriate update command per package manager
  - Results cached for 5 minutes

- **Smart Caching**:
  - Security and outdated checks cached for 5 minutes
  - Prevents slow performance from running commands repeatedly
  - Cache invalidated on manual refresh

#### Example Tooltip (With Security Issues):
```
🧶 YARN v3.6.4
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔒 Security:
   🔴 2 critical
   🟠 3 high
   🟡 5 moderate
   💡 Run: yarn audit fix

📦 Updates Available:
   🔴 2 major updates
   🟡 5 minor updates
   🟢 12 patch updates
   💡 Run: yarn upgrade-interactive

📊 Dependencies:
   Production: 15 packages
   Development: 8 packages
   Total: 23 packages

📜 Available Scripts (5):
   • dev → vite
   • build → vite build
   • test → vitest
   • lint → eslint .
   • preview → vite preview

💡 Click to refresh detection
```

#### Changed
- Tooltip now fetches security and outdated info asynchronously
- Commands run with 10-15 second timeout to prevent hanging
- Gracefully handles cases where audit/outdated commands fail

#### Performance
- First tooltip hover may take 1-2 seconds (running audit + outdated)
- Subsequent hovers are instant (cached for 5 minutes)
- No impact on extension activation or general VS Code performance

## [0.1.0] - 2025-01-06

### 🎉 Major Feature: Monorepo Support

The extension now provides intelligent support for monorepo projects!

#### Added
- **Automatic Monorepo Detection**:
  - Detects npm/yarn workspaces via `package.json`
  - Detects pnpm workspaces via `pnpm-workspace.yaml`
  - Detects Lerna projects via `lerna.json`
  - Detects Turborepo projects via `turbo.json`

- **Context-Aware Package Detection**:
  - Automatically detects which workspace package you're editing
  - Walks up directory tree to find closest `package.json`
  - Shows stats and scripts for the active workspace package

- **Workspace Selector Command**:
  - New command: `Select Workspace Package (Monorepo)`
  - Manually pin a specific workspace to override auto-detection
  - Quick pick menu shows all workspace packages
  - Clear pin to return to automatic mode

- **Enhanced Tooltip for Monorepos**:
  - Shows current workspace context (e.g., "packages/frontend")
  - Displays monorepo indicator with workspace count
  - Indicates if workspace is pinned
  - All stats now reflect the active workspace package

#### Changed
- Tooltip updates automatically when switching between files in different packages
- Status bar command dynamically changes based on monorepo detection
- File watchers now trigger workspace context updates

#### Example Tooltip (Monorepo):
```
🧶 YARN v3.6.4
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 packages/frontend (pinned)
🏗️  Monorepo: 5 workspaces
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Dependencies:
   Production: 15 packages
   Development: 8 packages
   Total: 23 packages

📜 Available Scripts (5):
   • dev → vite
   • build → vite build
   • test → vitest
   • lint → eslint .
   • preview → vite preview

💡 Click to refresh detection
```

For more details, see [MONOREPO_SUPPORT.md](./MONOREPO_SUPPORT.md)

## [0.0.3] - 2025-01-06

### Added
- **Rich statistics & health info in tooltip**:
  - Package manager version (from packageManager field)
  - Production and development dependency counts
  - node_modules package count and last updated time
  - Lock file with last modified timestamp
  - Complete list of all scripts with their actual commands
  - Scripts are truncated if longer than 40 characters for readability

### Changed
- Enhanced tooltip format with better organization and emojis
- Shows all available scripts (not just first 3)
- Each script now displays: `• script-name → actual command`

### Example Tooltip:
```
🧶 YARN v3.6.4
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Dependencies:
   Production: 2 packages
   Development: 3 packages
   Total: 5 packages

📁 node_modules:
   Packages: 7 (updated 2h ago)

🔒 yarn.lock (modified 3h ago)

📜 Available Scripts (5):
   • vscode:prepublish → npm run compile
   • compile → tsc -p ./
   • watch → tsc -watch -p ./
   • package → vsce package
   • install-local → code --install-extension...

💡 Click to refresh detection
```

## [0.0.2] - 2025-01-06

### Changed
- **Removed notification popup** when clicking the status bar indicator - now refreshes silently
- **Enhanced tooltip** with much more useful information:
  - Shows lock file name
  - Displays available commands (install, run)
  - Lists first 3 scripts from package.json with count
  - Provides helpful tips
  - Better formatted with emojis and separators

### Example Tooltip:
```
📦 NPM
──────────────────────────────
🔒 package-lock.json

💻 Commands:
  Install: npm install
  Run: npm run <script>

📜 Scripts (5):
  dev, build, test, +2 more

💡 Tip: Use "Run Script" command to execute

🔄 Click to refresh detection
```

## [0.0.1] - 2025-01-06

### Added
- Initial release
- Automatic package manager detection (npm, yarn, pnpm, bun)
- Color-coded status bar with icon and colored text
- File badge on package.json with distinctive symbols
- Commands: Refresh, Install Dependencies, Run Script
- Auto-detection on lock file changes
- Customizable colors and badge toggle

