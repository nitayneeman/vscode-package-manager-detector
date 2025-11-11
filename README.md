# VS Code - Package Manager Detector

[![Marketplace](https://img.shields.io/visual-studio-marketplace/v/nitayneeman.package-manager-detector?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=nitayneeman.package-manager-detector)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/nitayneeman.package-manager-detector?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=nitayneeman.package-manager-detector)
[![License](https://img.shields.io/github/license/nitayneeman/package-manager-detector?style=flat-square)](https://github.com/nitayneeman/package-manager-detector/blob/main/LICENSE)

[Installation](#-installation) · [Features](#-features) · [Settings](#%EF%B8%8F-settings) · [CHANGELOG](CHANGELOG.md)

## ℹ️ Description

This Visual Studio Code extension automatically detects and displays which package manager (npm, yarn, pnpm, or bun) is used in your project. It shows the detected package manager in the status bar with color-coded indicators and provides quick access to package.json.

<p align="center">
  <img src="https://github.com/nitayneeman/vscode-package-manager-detector/blob/main/images/preview.gif?raw=true" alt="Preview" width="500">
</p>

The extension intelligently detects package managers by analyzing:
- Lock files (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `bun.lockb`)
- The `packageManager` field in `package.json`
- Priority-based detection when multiple lock files exist

## 📦 Installation

Install the extension from the [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=nitayneeman.package-manager-detector).

Alternatively, you can install it directly from VS Code:
1. Open the Extensions view (`Ctrl+Shift+X` / `Cmd+Shift+X`)
2. Search for "Package Manager Detector"
3. Click Install

## ✨ Features

### Automatic Detection
The extension automatically detects your package manager when you open a workspace:
- **Priority Order**: bun > pnpm > yarn > npm
- **Fallback Detection**: Uses `packageManager` field from `package.json` if no lock file is found
- **Real-time Updates**: Watches for changes to lock files and `package.json`

### Status Bar Display
Shows the detected package manager in the status bar with color-coded text (all lowercase):
- **npm** - Red (`#CB3837`)
- **yarn** - Blue (`#2C8EBB`)
- **pnpm** - Orange (`#F9AD00`)
- **bun** - Beige (`#FBF0DF`)

### Interactive Tooltip
Hover over the status bar item to see:
- Package manager name and version (from `packageManager` field)
- Total dependency count
- Available npm scripts with their commands
- Click to open `package.json`

### Smart Detection Logic

The extension follows this detection priority:

1. **Lock Files** (highest priority)
   - `bun.lockb` → bun
   - `pnpm-lock.yaml` → pnpm
   - `yarn.lock` → yarn
   - `package-lock.json` → npm

2. **packageManager Field** (fallback)
   - Parses the `packageManager` field in `package.json`
   - Examples: `"packageManager": "pnpm@8.6.0"` → pnpm

3. **Unknown** (no detection)
   - Shows "No PM" when no package manager is detected

## ⚙️ Settings

The extension provides color customization for each package manager:

| Setting                              | Description                          | Default   |
| ------------------------------------ | ------------------------------------ | --------- |
| `packageManagerDetector.npm`         | Color for npm in the status bar      | `#CB3837` |
| `packageManagerDetector.yarn`        | Color for yarn in the status bar     | `#2C8EBB` |
| `packageManagerDetector.pnpm`        | Color for pnpm in the status bar     | `#F9AD00` |
| `packageManagerDetector.bun`         | Color for bun in the status bar      | `#FBF0DF` |

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

## 🎯 Use Cases

- **Multi-Package Manager Projects**: Quickly identify which package manager each project uses
- **Team Collaboration**: Ensure everyone uses the correct package manager
- **Project Switching**: Instantly see the package manager when switching between projects
- **Monorepo Management**: Different workspaces may use different package managers

## 📝 Commands

| Command                                       | Description                |
| --------------------------------------------- | -------------------------- |
| `packageManagerDetector.openPackageJson`      | Open the package.json file |

## 🚀 How It Works

1. **Activation**: The extension activates when VS Code starts
2. **Detection**: Scans the workspace for lock files and `package.json`
3. **Display**: Shows the detected package manager in the status bar
4. **Watch**: Monitors file changes to update detection in real-time
5. **Interaction**: Click the status bar item to open `package.json`

## 💡 Tips

- The extension respects the **priority order**: if you have multiple lock files, it will choose the highest priority one (bun > pnpm > yarn > npm)
- Lock files take precedence over the `packageManager` field in `package.json`
- Hover over the status bar item to see detailed project information
- The tooltip shows all available npm scripts for quick reference

## 🐛 Known Issues

No known issues at this time. If you encounter any problems, please [open an issue](https://github.com/nitayneeman/package-manager-detector/issues).

## 🤝 Contributing

This is an open source project. Any contribution would be greatly appreciated!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the need to quickly identify package managers in multi-project environments
- Icons and colors based on official package manager branding

---

**Enjoy using Package Manager Detector!** ⭐

If you find this extension helpful, please consider [leaving a review](https://marketplace.visualstudio.com/items?itemName=nitayneeman.package-manager-detector&ssr=false#review-details) on the VS Code Marketplace.
