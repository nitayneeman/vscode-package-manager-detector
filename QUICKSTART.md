# Quick Start Guide

## Testing the Extension

### Option 1: Debug Mode (Recommended for Development)

1. Open the project in VS Code:

   ```bash
   code /Users/nitayn/dev/package-manager-detector
   ```

2. Press `F5` to launch the Extension Development Host

   - This will open a new VS Code window with your extension loaded

3. In the new window, open a project that has a package.json file

4. Look at the bottom left of the status bar - you should see an icon and package manager name in color:

   - 📦 npm in red text
   - 🎨 yarn in blue text
   - 📚 pnpm in yellow/gold text
   - ⚫ bun in cream text
   - "No PM" if no package manager is detected

5. Check the file explorer - you'll see a distinctive colored symbol badge on **package.json only**:
   - ◆ Red diamond for npm
   - ◉ Blue circled dot for yarn
   - ▣ Yellow square grid for pnpm
   - ● Cream circle for bun

### Option 2: Install Locally (For Regular Use)

Package the extension and install it:

```bash
npm install -g @vscode/vsce
vsce package
code --install-extension package-manager-detector-0.0.1.vsix
```

## Features to Test

1. **Status Bar Icon & Color**: Open any Node.js project and check the colored icon + text in the status bar
2. **File Badge**: Look at the file explorer for the colored symbol badge on package.json
3. **Hover Tooltip**: Hover over the status bar item to see detailed info
4. **Refresh Command**: Click the status bar or use Command Palette → "Refresh Package Manager Detection"
5. **Install Command**: Command Palette → "Install Dependencies"
6. **Run Script**: Command Palette → "Run Script" (shows all scripts from package.json)
7. **Auto-Detection**: Create/delete lock files and watch the status bar and badge update automatically

## Using Custom Logo Icons

The extension currently uses VS Code's built-in codicons. For real package manager logos:

- See [CUSTOM_ICONS_GUIDE.md](./CUSTOM_ICONS_GUIDE.md)
- Convert the SVG icons in `/icons` to a font using IcoMoon
- Takes ~5 minutes to set up

## Available Commands

Open Command Palette (`Cmd+Shift+P` on Mac, `Ctrl+Shift+P` on Windows/Linux):

- `Refresh Package Manager Detection`
- `Install Dependencies`
- `Run Script`

## Development Workflow

### Watch Mode (Auto-compile on changes)

```bash
npm run watch
```

Then press `F5` to launch the extension.

### Manual Compile

```bash
npm run compile
```

## Project Structure

```
package-manager-detector/
├── src/
│   ├── extension.ts                  # Main extension entry point
│   ├── packageManagerDetector.ts     # Detection logic
│   └── fileDecorationProvider.ts     # Color-coded file badges
├── out/                              # Compiled JavaScript (generated)
├── .vscode/
│   ├── launch.json                  # Debug configuration
│   └── tasks.json                   # Build tasks
├── package.json                     # Extension manifest
├── tsconfig.json                    # TypeScript config
└── README.md                        # Documentation
```

## Next Steps

1. Test the extension with different projects (npm, yarn, pnpm, bun)
2. Customize icons or add more features
3. Publish to VS Code Marketplace (optional)

## Troubleshooting

- **Extension not showing**: Make sure you have a workspace open with a package.json file
- **Compilation errors**: Run `npm run compile` and check for TypeScript errors
- **Extension not updating**: Reload the Extension Development Host window (`Cmd+R` or `Ctrl+R`)
