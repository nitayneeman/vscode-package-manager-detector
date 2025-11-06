# Changelog

All notable changes to the "Package Manager Detector" extension will be documented in this file.

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

