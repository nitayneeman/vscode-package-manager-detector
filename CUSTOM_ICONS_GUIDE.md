# Custom Icons Setup Guide

This extension currently uses built-in VS Code codicons as placeholders. To use the real package manager logos, follow this guide to convert the SVG icons to a custom font.

## Current Status

**Interim Solution (Active):**
- Status bar shows: `$(icon) name` with colored text
- Uses VS Code built-in codicons:
  - npm: `$(package)` 📦
  - yarn: `$(symbol-color)` 🎨
  - pnpm: `$(layers)` 📚
  - bun: `$(circle-filled)` ⚫

**Target Solution:**
- Use real package manager logos from `/icons` directory
- Converted to a custom icon font

## How to Add Custom Logo Icons

### Step 1: Convert SVG to Font using IcoMoon

1. Go to https://icomoon.io/app/

2. Click **"Import Icons"** and upload these files:
   - `icons/npm.svg`
   - `icons/yarn.svg`
   - `icons/pnpm.svg`
   - `icons/bun.svg`

3. Select all 4 icons (click each one)

4. Click **"Generate Font"** at the bottom

5. Click **"Download"** to get the font package

6. From the downloaded zip, extract:
   - `fonts/icomoon.woff` → Rename to `package-manager-icons.woff`
   - Note the Unicode characters from `selection.json`:
     ```json
     {
       "npm": "\\e900",
       "yarn": "\\e901", 
       "pnpm": "\\e902",
       "bun": "\\e903"
     }
     ```

### Step 2: Add Font to Extension

1. Create a `media` folder in the extension root:
   ```bash
   mkdir -p media
   ```

2. Copy the font file:
   ```bash
   cp path/to/package-manager-icons.woff media/
   ```

### Step 3: Update package.json

Add the icon contributions (after the `colors` section):

```json
{
  "contributes": {
    "icons": {
      "pm-npm-logo": {
        "description": "npm package manager logo",
        "default": {
          "fontPath": "./media/package-manager-icons.woff",
          "fontCharacter": "\\e900"
        }
      },
      "pm-yarn-logo": {
        "description": "yarn package manager logo",
        "default": {
          "fontPath": "./media/package-manager-icons.woff",
          "fontCharacter": "\\e901"
        }
      },
      "pm-pnpm-logo": {
        "description": "pnpm package manager logo",
        "default": {
          "fontPath": "./media/package-manager-icons.woff",
          "fontCharacter": "\\e902"
        }
      },
      "pm-bun-logo": {
        "description": "bun package manager logo",
        "default": {
          "fontPath": "./media/package-manager-icons.woff",
          "fontCharacter": "\\e903"
        }
      }
    }
  }
}
```

### Step 4: Update extension.ts

Replace the iconMap in `src/extension.ts`:

```typescript
// Change from:
const iconMap: Record<PackageManager, string> = {
  [PackageManager.NPM]: "package",
  [PackageManager.YARN]: "symbol-color",
  [PackageManager.PNPM]: "layers",
  [PackageManager.BUN]: "circle-filled",
  [PackageManager.UNKNOWN]: "question",
};

// To:
const iconMap: Record<PackageManager, string> = {
  [PackageManager.NPM]: "pm-npm-logo",
  [PackageManager.YARN]: "pm-yarn-logo",
  [PackageManager.PNPM]: "pm-pnpm-logo",
  [PackageManager.BUN]: "pm-bun-logo",
  [PackageManager.UNKNOWN]: "question",
};
```

### Step 5: Compile and Test

```bash
npm run compile
```

Press F5 to test - you should now see real package manager logos in the status bar!

## Alternative: Use Fantasticon CLI

You can automate font generation with Fantasticon:

```bash
npm install -D fantasticon

# Add to package.json scripts:
"generate-icons": "fantasticon icons -o media -n package-manager-icons -t woff"

# Run:
npm run generate-icons
```

## Troubleshooting

### Icons not showing
- Verify the font file path in package.json is correct
- Check that Unicode characters match what IcoMoon generated
- Reload VS Code window (Cmd+R)

### Icons are wrong size
- Edit SVG viewBox before importing to IcoMoon
- Ensure all SVGs have the same viewBox dimensions (16x16)

### Icons are wrong color
- Icon fonts inherit text color
- The colored text is applied via `statusBarItem.color`
- Icons should be monochrome in the font (color comes from text color)

## Current Icon Mappings

| Package Manager | Codicon (Current) | Custom Icon (After Setup) |
|----------------|-------------------|---------------------------|
| npm            | `$(package)`      | `$(pm-npm-logo)` 📦 Red   |
| yarn           | `$(symbol-color)` | `$(pm-yarn-logo)` 🧶 Blue |
| pnpm           | `$(layers)`       | `$(pm-pnpm-logo)` 📚 Gold |
| bun            | `$(circle-filled)`| `$(pm-bun-logo)` 🥟 Cream |

