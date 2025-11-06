# Tooltip Examples

Visual examples of the simplified tooltip for each package manager.

## 📦 Npm Example (with issues)

```
📦 Npm v9.8.1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  2 critical, 5 high vulnerabilities
   💡 Run: npm audit fix

📦 3 major, 5 minor updates available
   💡 Run: npm update

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

## 🧶 Yarn Example (healthy)

```
🧶 Yarn v3.6.4
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ No vulnerabilities

✅ All packages up to date

📊 18 dependencies

📜 Scripts (5):
   • start → react-scripts start
   • build → react-scripts build
   • test → react-scripts test
   • eject → react-scripts eject
   • analyze → source-map-explorer 'build/st...

💡 Click to open package.json
```

## 📦 Pnpm Example (with updates only)

```
📦 Pnpm v8.10.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ No vulnerabilities

📦 2 minor, 8 patch updates available
   💡 Run: pnpm update

📊 32 dependencies

📜 Scripts (6):
   • dev → next dev
   • build → next build
   • start → next start
   • lint → next lint
   • test → jest
   • test:watch → jest --watch

💡 Click to open package.json
```

## 🥟 Bun Example

```
🥟 Bun v1.0.11
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 12 dependencies

📜 Scripts (4):
   • dev → bun run --hot src/index.ts
   • build → bun build src/index.ts --outdir...
   • start → bun run src/index.ts
   • test → bun test

💡 Click to open package.json
```

## 🏗️ Monorepo Example (Yarn)

```
🧶 Yarn v3.6.4
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 packages/frontend
🏗️  Monorepo: 5 workspaces
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  1 high, 3 moderate vulnerabilities
   💡 Run: yarn audit fix

📦 1 major, 2 minor updates available
   💡 Run: yarn upgrade-interactive

📊 15 dependencies

📜 Scripts (5):
   • dev → vite
   • build → vite build
   • test → vitest
   • lint → eslint .
   • preview → vite preview

💡 Click to open package.json
```

## ⚠️ No Dependencies Example

```
📦 Npm
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📜 Scripts (2):
   • start → node index.js
   • dev → nodemon index.js

💡 Click to open package.json
```

## ❌ No Scripts Example

```
🧶 Yarn v1.22.19
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 5 dependencies

⚠️  No scripts defined

💡 Click to open package.json
```

## Features Shown

✅ **Package Manager Name & Version** (Word Case) - From packageManager field in package.json
✅ **Security Vulnerabilities** - Condensed one-line summary with actionable fix command
✅ **Outdated Packages** - Condensed one-line summary with update command
✅ **Total Dependencies** - Simple count of all dependencies
✅ **Complete Script List** - All scripts with their actual commands
✅ **Smart Truncation** - Long commands are truncated at 40 characters
✅ **Monorepo Context** - Shows current workspace and total workspace count
✅ **Dynamic Content** - Updates automatically when you modify package.json

## What's Calculated

| Data Point       | How It's Calculated                                              |
| ---------------- | ---------------------------------------------------------------- |
| Dependencies     | Total count from `dependencies` + `devDependencies`              |
| Security         | Runs `npm/yarn/pnpm audit --json` (cached for 5 min)             |
| Updates          | Runs `npm/yarn/pnpm outdated --json` (cached for 5 min)          |
| Scripts          | All entries from `scripts` section in package.json               |
| Version          | Extracted from `packageManager` field using regex                |
| Workspace Context| Walks up directory tree to find nearest package.json (monorepos) |

## What Was Removed (v0.3.1)

❌ Production/Dev dependency breakdown
❌ node_modules package count
❌ Lock file modified time

These were removed to focus on actionable information and reduce tooltip clutter.
