# Monorepo Support

The Package Manager Detector extension provides intelligent support for monorepo projects, automatically detecting workspaces and showing context-aware information.

## 🎯 Features

### 1. **Automatic Monorepo Detection**

The extension automatically detects if you're working in a monorepo by checking for:

- ✅ `workspaces` field in package.json (npm/yarn)
- ✅ `pnpm-workspace.yaml` file (pnpm)
- ✅ `lerna.json` file (Lerna)
- ✅ `turbo.json` file (Turborepo)

### 2. **Context-Aware Package Detection**

The extension intelligently determines which workspace package you're currently working in:

```
Priority Order:
1. 📍 Pinned Workspace (if you manually selected one)
2. 📂 Active File Context (automatic detection based on current file)
3. 📦 Root Workspace (fallback)
```

### 3. **Smart Tooltip with Workspace Info**

When working in a monorepo, the tooltip shows additional context:

```
🧶 YARN v3.6.4
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 packages/frontend (pinned)
🏗️  Monorepo: 5 workspaces
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Dependencies:
   Production: 15 packages
   Development: 8 packages
   Total: 23 packages

📁 node_modules:
   Packages: 245 (updated 2h ago)

🔒 yarn.lock (modified 3h ago)

📜 Available Scripts (5):
   • dev → vite
   • build → vite build
   • test → vitest
   • lint → eslint .
   • preview → vite preview

💡 Click to refresh detection
```

## 🎮 Usage

### Automatic Mode (Default)

The extension automatically detects which package you're working in based on your active file:

1. Open any file in your monorepo
2. The extension finds the closest `package.json` by walking up the directory tree
3. Tooltip shows stats for that specific workspace package

**Example:**
```
Your Monorepo Structure:
/
├── package.json (root)
├── packages/
│   ├── frontend/
│   │   ├── package.json
│   │   └── src/
│   │       └── App.tsx ← You're here
│   └── backend/
│       ├── package.json
│       └── src/
│           └── server.ts

Status bar shows: packages/frontend context
```

### Manual Selection (Pin a Workspace)

You can manually select and "pin" a specific workspace:

1. **Open Command Palette**: `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. **Run**: `Select Workspace Package (Monorepo)`
3. **Choose a workspace** from the list:
   ```
   📦 Root
   📁 packages/frontend ✓ Active
   📁 packages/backend
   📁 packages/shared
   ```
4. **Pin it**: The selected workspace stays active regardless of which file you're editing

To **clear the pin** and return to automatic mode:
1. Run `Select Workspace Package (Monorepo)` again
2. Select **"Clear Pin (Auto-detect)"** at the top of the list

## 🔄 When Does Context Update?

The workspace context updates automatically when:

| Event | Behavior |
|-------|----------|
| **Switch files/tabs** | Detects workspace for new active file |
| **Modify package.json** | Refreshes workspace detection |
| **Add/delete lock files** | Re-scans workspaces |
| **Click status bar** | Manual refresh |
| **Pin workspace** | Overrides auto-detection |

## 📊 Supported Monorepo Tools

| Tool | Detection Method | Status |
|------|-----------------|--------|
| **npm Workspaces** | `package.json` → `workspaces` | ✅ Full Support |
| **Yarn Workspaces** | `package.json` → `workspaces` | ✅ Full Support |
| **pnpm Workspaces** | `pnpm-workspace.yaml` | ✅ Full Support |
| **Lerna** | `lerna.json` | ✅ Full Support |
| **Turborepo** | `turbo.json` | ✅ Full Support |
| **Nx** | Detection via package.json | ✅ Works with npm/yarn/pnpm workspaces |

## 📁 Example Monorepo Configurations

### npm/Yarn Workspaces

```json
{
  "name": "my-monorepo",
  "private": true,
  "workspaces": [
    "packages/*",
    "apps/*"
  ]
}
```

### pnpm Workspaces

**pnpm-workspace.yaml:**
```yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

### Lerna

**lerna.json:**
```json
{
  "packages": [
    "packages/*"
  ],
  "version": "independent"
}
```

## 🎯 Benefits for Monorepo Users

### Before (Without Monorepo Support):
```
❌ Always shows root package.json scripts
❌ Shows aggregated dependencies (confusing)
❌ Can't tell which package context you're in
❌ Must manually navigate to each package
```

### After (With Monorepo Support):
```
✅ Shows scripts for the package you're editing
✅ Shows dependencies specific to that package
✅ Clear indicator of current workspace
✅ Quick workspace switching via command
✅ Automatic context detection as you work
```

## 🔍 Troubleshooting

### Issue: "No monorepo detected"

**Cause**: No workspace configuration found

**Solution**:
1. Ensure you have one of the supported configurations:
   - `workspaces` field in root package.json
   - `pnpm-workspace.yaml` file
   - `lerna.json` file
   - `turbo.json` file

2. Run `Refresh Package Manager Detection` command

### Issue: "Wrong workspace context shown"

**Cause**: Might be in pinned mode

**Solution**:
1. Run `Select Workspace Package (Monorepo)`
2. Choose **"Clear Pin (Auto-detect)"**
3. Context will now follow your active file

### Issue: "Workspace not found in list"

**Cause**: Package doesn't match workspace glob patterns

**Solution**:
1. Check your workspace configuration patterns
2. Ensure the package has a `package.json` file
3. Run `Refresh Package Manager Detection`

## 🚀 Performance

The extension is optimized for monorepo performance:

- ✅ **Lazy detection**: Only scans when needed
- ✅ **Caches workspace list**: Doesn't re-scan on every file switch
- ✅ **Efficient glob matching**: Uses VS Code's built-in `findFiles` API
- ✅ **No blocking**: All operations are async

**Benchmarks:**
- Small monorepo (5-10 packages): < 50ms
- Medium monorepo (20-50 packages): < 200ms
- Large monorepo (100+ packages): < 500ms

## 💡 Tips & Tricks

### Tip 1: Quick Workspace Switching
Set up a keyboard shortcut for `packageManagerDetector.selectWorkspace`:
1. Open Keyboard Shortcuts (`Cmd+K Cmd+S`)
2. Search for "Select Workspace Package"
3. Assign your preferred shortcut (e.g., `Cmd+Shift+W`)

### Tip 2: Pin Common Workspaces
When working primarily in one package:
1. Pin that workspace
2. Work across multiple files without context switching
3. Clear pin when moving to different package

### Tip 3: Use with Multi-root Workspaces
Open each package as a separate VS Code workspace folder for even better organization.

## 🔮 Future Enhancements

Planned features for monorepo support:

- [ ] Show workspace dependency graph in tooltip
- [ ] Detect circular dependencies
- [ ] Workspace-specific commands (build, test per package)
- [ ] Multi-workspace status bar (one item per package)
- [ ] Workspace health indicators
- [ ] Integration with task runners (Nx, Turborepo)

## 📚 Examples

Check out real-world examples in the repository:
- [Example: React Monorepo](./examples/react-monorepo)
- [Example: Full-stack Monorepo](./examples/fullstack-monorepo)
- [Example: Component Library](./examples/component-library)

---

**Have questions or suggestions?** Open an issue on GitHub!

