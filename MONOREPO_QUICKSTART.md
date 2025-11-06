# Monorepo Quick Start

## ✨ Monorepo Support

Your extension has **full monorepo support**! It automatically detects workspace packages and shows context-aware information.

## 🚀 Quick Demo

### How It Works (Automatic!)

1. **Open any file** in your monorepo
2. **Look at the status bar** - it shows the package you're editing
3. **Hover over status bar** - see stats for that specific package
4. **Click status bar** - opens the relevant package.json

**Example:**
```
You're editing: packages/frontend/src/App.tsx

Status Bar: 🧶 yarn
Tooltip shows:
  📍 packages/frontend
  🏗️  Monorepo: 5 workspaces
  📊 Dependencies for frontend package
  📜 Scripts from frontend's package.json

Click it: Opens packages/frontend/package.json
```

The extension automatically updates as you navigate between different packages!

## 🎯 Supported Monorepo Types

✅ **npm Workspaces**
```json
{
  "workspaces": ["packages/*"]
}
```

✅ **Yarn Workspaces**
```json
{
  "workspaces": ["packages/*", "apps/*"]
}
```

✅ **pnpm Workspaces**
```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
```

✅ **Lerna**
```json
{
  "packages": ["packages/*"]
}
```

✅ **Turborepo** (detected via turbo.json)

## 📊 What You'll See

### Tooltip for Regular Project:
```
🧶 YARN v3.6.4
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Dependencies: 23 total
📜 Scripts: dev, build, test
```

### Tooltip for Monorepo:
```
🧶 YARN v3.6.4
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 packages/frontend          ← Current workspace
🏗️  Monorepo: 5 workspaces    ← Total count
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Dependencies: 23 total      ← For this workspace only
📜 Scripts: dev, build, test   ← From this package.json
```

## 🎮 Commands

| Command | Description |
|---------|-------------|
| `Open package.json` | Opens the relevant package.json for your context |
| `Refresh Package Manager Detection` | Re-scan workspaces |
| `Install Dependencies` | Run install in current context |
| `Run Script` | Run scripts from current package.json |

## 💡 Tips

### Tip 1: It Just Works!
The extension automatically detects which package you're working in based on your active file. No manual setup required!

### Tip 2: Quick Access
Click the status bar to quickly open the package.json for your current context - great for reviewing or editing dependencies and scripts.

### Tip 3: Seamless Navigation
Switch between packages by simply opening files in different workspace directories. The extension updates instantly!

## 🔍 Troubleshooting

**Q: It's not detecting my monorepo**
- Check if you have a supported configuration (workspaces field, pnpm-workspace.yaml, etc.)
- Run `Refresh Package Manager Detection`

**Q: Shows wrong workspace**
- The extension detects based on your active file location
- Try opening a file from the correct workspace package
- Run `Refresh Package Manager Detection` if needed

## 📚 Learn More

For complete documentation, see [MONOREPO_SUPPORT.md](./MONOREPO_SUPPORT.md)

---

**Enjoy your enhanced monorepo experience!** 🎉

