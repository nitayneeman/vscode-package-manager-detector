# Tooltip Examples

Visual examples of the enhanced tooltip for each package manager.

## 📦 NPM Example

```
📦 NPM v9.8.1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Dependencies:
   Production: 15 packages
   Development: 8 packages
   Total: 23 packages

📁 node_modules:
   Packages: 245 (updated 2h ago)

🔒 package-lock.json (modified 3h ago)

📜 Available Scripts (7):
   • dev → vite
   • build → tsc && vite build
   • test → vitest
   • lint → eslint .
   • format → prettier --write .
   • preview → vite preview
   • type-check → tsc --noEmit

💡 Click to refresh detection
```

## 🧶 Yarn Example

```
🧶 YARN v3.6.4
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Dependencies:
   Production: 12 packages
   Development: 6 packages
   Total: 18 packages

📁 node_modules:
   Packages: 198 (updated 1d ago)

🔒 yarn.lock (modified 5h ago)

📜 Available Scripts (5):
   • start → react-scripts start
   • build → react-scripts build
   • test → react-scripts test
   • eject → react-scripts eject
   • analyze → source-map-explorer 'build/st...

💡 Click to refresh detection
```

## 📦 PNPM Example

```
📦 PNPM v8.10.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Dependencies:
   Production: 20 packages
   Development: 12 packages
   Total: 32 packages

📁 node_modules:
   Packages: 310 (updated just now)

🔒 pnpm-lock.yaml (modified just now)

📜 Available Scripts (6):
   • dev → next dev
   • build → next build
   • start → next start
   • lint → next lint
   • test → jest
   • test:watch → jest --watch

💡 Click to refresh detection
```

## 🥟 Bun Example

```
🥟 BUN v1.0.11
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Dependencies:
   Production: 8 packages
   Development: 4 packages
   Total: 12 packages

📁 node_modules:
   Packages: 156 (updated 12h ago)

🔒 bun.lockb (modified 12h ago)

📜 Available Scripts (4):
   • dev → bun run --hot src/index.ts
   • build → bun build src/index.ts --outdir...
   • start → bun run src/index.ts
   • test → bun test

💡 Click to refresh detection
```

## ⚠️  No Dependencies Example

```
📦 NPM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔒 package-lock.json (modified 1h ago)

📜 Available Scripts (2):
   • start → node index.js
   • dev → nodemon index.js

💡 Click to refresh detection
```

## ❌ No Scripts Example

```
🧶 YARN v1.22.19
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Dependencies:
   Production: 5 packages
   Total: 5 packages

📁 node_modules:
   Packages: 42 (updated 3d ago)

🔒 yarn.lock (modified 3d ago)

⚠️  No scripts defined in package.json

💡 Click to refresh detection
```

## Features Shown

✅ **Package Manager Name & Version** - From packageManager field in package.json
✅ **Dependency Statistics** - Counts production, dev, and total packages
✅ **node_modules Info** - Package count and last update time
✅ **Lock File Status** - Name and last modified time
✅ **Complete Script List** - All scripts with their actual commands
✅ **Smart Truncation** - Long commands are truncated at 40 characters
✅ **Time Formatting** - Relative time (just now, 2h ago, 3d ago)
✅ **Dynamic Content** - Updates automatically when you modify package.json

## What's Calculated

| Data Point | How It's Calculated |
|-----------|-------------------|
| Dependencies | Counts keys in `dependencies` and `devDependencies` |
| node_modules count | Counts directories in node_modules (excludes .bin, .cache) |
| Last updated | Based on node_modules directory modification time |
| Lock file modified | Based on lock file modification time |
| Scripts | All entries from `scripts` section in package.json |
| Version | Extracted from `packageManager` field using regex |

