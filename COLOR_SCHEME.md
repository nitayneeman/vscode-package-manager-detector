# Package Manager Color Scheme

This extension uses distinctive colors and symbols to help you quickly identify which package manager is in use.

## Visual Indicators

The extension provides two main visual indicators:
1. **Status Bar Icon & Colored Text**: The status bar item shows an icon and the package manager name in color
2. **package.json Badge**: A colored Unicode symbol appears as a badge on the package.json file in the explorer

### Status Bar Icons

Currently uses VS Code's built-in codicons:
- npm: `$(package)` 📦
- yarn: `$(symbol-color)` 🎨
- pnpm: `$(layers)` 📚
- bun: `$(circle-filled)` ⚫

**Want real logos?** See [CUSTOM_ICONS_GUIDE.md](./CUSTOM_ICONS_GUIDE.md) to convert the SVG logos to a custom font.

## Color Palette

### 🔴 npm - Red Diamond ◆
- **Symbol**: `◆` (Black Diamond U+25C6)
- **Hex**: `#CB3837`
- **RGB**: `rgb(203, 56, 55)`
- Matches the official npm brand color
- The diamond shape represents npm's logo aesthetics
- Applied to: Status bar background and package.json badge

### 🔵 yarn - Blue Circled Dot ◉
- **Symbol**: `◉` (Fisheye U+25C9)
- **Hex**: `#2C8EBB`
- **RGB**: `rgb(44, 142, 187)`
- Matches the official yarn brand color
- The circled dot represents yarn's ball of yarn logo
- Applied to: Status bar background and package.json badge

### 🟡 pnpm - Yellow Square Grid ▣
- **Symbol**: `▣` (White Square Containing Black Small Square U+25A3)
- **Hex**: `#F9AD00`
- **RGB**: `rgb(249, 173, 0)`
- Matches the official pnpm brand color
- The square grid represents pnpm's efficient storage structure
- Applied to: Status bar background and package.json badge

### ⚪ bun - Cream Circle ●
- **Symbol**: `●` (Black Circle U+25CF)
- **Hex (dark)**: `#FBF0DF`
- **Hex (light)**: `#F9F1E1`
- **RGB**: `rgb(251, 240, 223)` / `rgb(249, 241, 225)`
- Matches the official bun brand aesthetic
- The circle represents bun's round logo
- Applied to: Status bar background and package.json badge

## How It Works

1. **Status Bar**: Shows an icon and package manager name (e.g., "npm", "yarn", "pnpm", "bun") with colored text:
   - Text color matches the package manager's brand color
   - Icon provides instant visual recognition
   - Example: `📦 npm` in red

2. **package.json Badge**: Displays a colored symbol badge in the file explorer:
   - ◆ Red diamond for npm
   - ◉ Blue circled dot for yarn
   - ▣ Yellow square grid for pnpm
   - ● Cream circle for bun

3. **No Other Files Decorated**: Lock files and node_modules folder do NOT receive badges to keep the explorer clean and focused

## Why Symbols Instead of Logos?

VS Code's `FileDecorationProvider` API only supports:
- Single character badges (text or Unicode symbols)
- Theme colors

It does **not** support:
- Custom SVG icons
- Image files
- Multi-character badges

Therefore, we use carefully chosen Unicode symbols that:
1. Are visually distinctive from each other
2. Represent each package manager's characteristics
3. Work well at small sizes
4. Are universally supported across platforms

## Customization

You can customize these colors in VS Code settings:

1. Open Settings (JSON)
2. Search for `workbench.colorCustomizations`
3. Add your custom colors:

```json
{
  "workbench.colorCustomizations": {
    "packageManagerDetector.npm": "#YOUR_COLOR",
    "packageManagerDetector.yarn": "#YOUR_COLOR",
    "packageManagerDetector.pnpm": "#YOUR_COLOR",
    "packageManagerDetector.bun": "#YOUR_COLOR"
  }
}
```

## Disable Badge

If you prefer not to see the badge on package.json:

1. Open Settings
2. Search for `packageManagerDetector.fileDecorations.enabled`
3. Uncheck the box to disable

Or add to your settings.json:

```json
{
  "packageManagerDetector.fileDecorations.enabled": false
}
```

Note: This only disables the package.json badge. The colored status bar will still be visible.

