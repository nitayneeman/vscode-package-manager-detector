# Monorepo Quick Start

## ✨ What's New in v0.1.0

Your extension now has **full monorepo support**! It automatically detects workspace packages and shows context-aware information.

## 🚀 Quick Demo

### Automatic Mode (No setup required!)

1. **Open any file** in your monorepo
2. **Look at the status bar** - it shows the package you're editing
3. **Hover over status bar** - see stats for that specific package

**Example:**
```
You're editing: packages/frontend/src/App.tsx

Status Bar: 🧶 yarn
Tooltip shows:
  📍 packages/frontend
  🏗️  Monorepo: 5 workspaces
  📊 Dependencies for frontend package
  📜 Scripts from frontend's package.json
```

### Manual Mode (Pin a workspace)

1. Press **Cmd+Shift+P** (Mac) or **Ctrl+Shift+P** (Windows/Linux)
2. Type: **"Select Workspace"**
3. Choose: `Select Workspace Package (Monorepo)`
4. **Pick a workspace** from the list
5. **Done!** That workspace stays active until you clear the pin

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
| `Refresh Package Manager Detection` | Re-scan workspaces |
| `Select Workspace Package (Monorepo)` | Pin a specific workspace |
| `Install Dependencies` | Run install in current context |
| `Run Script` | Run scripts from current package.json |

## 💡 Tips

### Tip 1: Automatic is Best
Most of the time, just let it auto-detect. It works great!

### Tip 2: Pin When Needed
Pin a workspace when:
- Working on one package for a while
- Running commands specific to one package
- Don't want context to switch as you browse files

### Tip 3: Clear Pin Easily
To go back to automatic mode:
- Run `Select Workspace Package`
- Choose **"Clear Pin (Auto-detect)"** at the top

## 🔍 Troubleshooting

**Q: It's not detecting my monorepo**
- Check if you have a supported configuration (workspaces field, pnpm-workspace.yaml, etc.)
- Run `Refresh Package Manager Detection`

**Q: Shows wrong workspace**
- You might have it pinned. Run `Select Workspace Package` and clear the pin
- Or manually select the correct workspace

**Q: I don't see the workspace selector command**
- Only appears when a monorepo is detected
- Try refreshing detection

## 📚 Learn More

For complete documentation, see [MONOREPO_SUPPORT.md](./MONOREPO_SUPPORT.md)

---

**Enjoy your enhanced monorepo experience!** 🎉

