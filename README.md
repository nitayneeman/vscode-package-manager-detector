<h1 align="center">VS Code - Package Manager Detector</h1>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=nitayneeman.package-manager-detector"><img src="https://vsmarketplacebadges.dev/version/nitayneeman.package-manager-detector.svg?label=Package%20Manager%20Detector&color=eae9e1" alt="Marketplace"></a>
  <a href="https://marketplace.visualstudio.com/items?itemName=nitayneeman.package-manager-detector"><img src="https://vsmarketplacebadges.dev/installs/nitayneeman.package-manager-detector.svg?color=blue" alt="Installs"></a>
  <a href="https://github.com/nitayneeman/vscode-package-manager-detector/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-lightgray.svg" alt="License"></a>
</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=nitayneeman.package-manager-detector">Installation</a> ·
  <a href="https://github.com/nitayneeman/vscode-package-manager-detector#-how-to-use">Usage</a> ·
  <a href="https://github.com/nitayneeman/vscode-package-manager-detector#-settings">Settings</a> ·
  <a href="https://github.com/nitayneeman/vscode-package-manager-detector/blob/main/CHANGELOG.md">CHANGELOG</a>
</p>

## ℹ️️ Description

This Visual Studio Code extension automatically detects and displays which package manager (npm, yarn, pnpm, or bun) is used in your project. It shows the detected package manager in the status bar with color-coded indicators and provides quick access to package.json.

<p align="center">
  <img src="https://github.com/nitayneeman/vscode-package-manager-detector/blob/main/images/preview.gif?raw=true" alt="Preview" width="500">
</p>

The extension intelligently detects package managers by analyzing:

- Lock files (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `bun.lockb`)
- The `packageManager` field in `package.json`
- Priority-based detection when multiple lock files exist

<br>

## 👨🏻‍🏫 How to Use

The first thing you need to do is installing the [extension](https://marketplace.visualstudio.com/items?itemName=nitayneeman.package-manager-detector).

The extension automatically detects your package manager when you open a workspace and displays it in the status bar with color-coded text (all lowercase):

- **npm** - Red (`#CB3837`)
- **yarn** - Blue (`#2C8EBB`)
- **pnpm** - Orange (`#F9AD00`)
- **bun** - Beige (`#FBF0DF`)

Hover over the status bar item to see:

- Package manager name and version (from `packageManager` field)
- Total dependency count
- Available npm scripts with their commands
- Click to open `package.json`

### Detection Priority

The extension follows this detection priority:

1. **Lock Files** (highest priority)

   - `bun.lockb` → bun
   - `pnpm-lock.yaml` → pnpm
   - `yarn.lock` → yarn
   - `package-lock.json` → npm

2. **packageManager Field** (fallback)

   - Parses the `packageManager` field in `package.json`
   - Examples: `"packageManager": "pnpm@8.6.0"` → pnpm

<br>

## ⚙️ Settings

The extension allows you to customize the following configuration settings:

| Name                          | Description                      | Default   |
| ----------------------------- | -------------------------------- | --------- |
| `packageManagerDetector.npm`  | Color for npm in the status bar  | `#CB3837` |
| `packageManagerDetector.yarn` | Color for yarn in the status bar | `#2C8EBB` |
| `packageManagerDetector.pnpm` | Color for pnpm in the status bar | `#F9AD00` |
| `packageManagerDetector.bun`  | Color for bun in the status bar  | `#FBF0DF` |

### Customize Colors

You can customize the colors in your VS Code settings:

```json
{
  "workbench.colorCustomizations": {
    "packageManagerDetector.npm": "#CC0000",
    "packageManagerDetector.yarn": "#0066CC",
    "packageManagerDetector.pnpm": "#FF9900",
    "packageManagerDetector.bun": "#FFF5E1"
  }
}
```

<br>

## 💁🏻 Contributing

This is an open source project. Any contribution would be greatly appreciated!
