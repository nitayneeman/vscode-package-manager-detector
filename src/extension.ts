import * as vscode from "vscode";
import * as path from "path";
import {
  PackageManagerDetector,
  PackageManagerInfo,
  PackageManager,
} from "./packageManagerDetector";
import { PackageManagerFileDecorationProvider } from "./fileDecorationProvider";

let statusBarItem: vscode.StatusBarItem;
let currentPackageManager: PackageManagerInfo | undefined;
let fileDecorationProvider: PackageManagerFileDecorationProvider;
let currentWorkspaceContext: string | undefined; // Path to current package.json directory
let pinnedWorkspace: string | undefined; // User-selected workspace (overrides auto-detection)
let isMonorepo: boolean = false;
let workspacePackages: string[] = []; // List of workspace package paths

export function activate(context: vscode.ExtensionContext) {
  console.log("Package Manager Detector is now active");

  // Create status bar item
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  // Command will be set dynamically based on monorepo detection
  context.subscriptions.push(statusBarItem);

  // Register file decoration provider
  fileDecorationProvider = new PackageManagerFileDecorationProvider();
  context.subscriptions.push(
    vscode.window.registerFileDecorationProvider(fileDecorationProvider)
  );

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "packageManagerDetector.refresh",
      async () => {
        await updateWorkspaceContext();
        // Notification removed - just refresh silently
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "packageManagerDetector.selectWorkspace",
      async () => {
        if (!isMonorepo || workspacePackages.length <= 1) {
          vscode.window.showInformationMessage(
            "No monorepo detected or only one package found"
          );
          return;
        }

        const workspaceRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
        if (!workspaceRoot) {
          return;
        }

        // Build quick pick items
        const items: vscode.QuickPickItem[] = workspacePackages.map(
          (pkgPath) => {
            const displayName = getWorkspaceDisplayName(pkgPath, workspaceRoot);
            const isCurrent = pkgPath === currentWorkspaceContext;
            const isPinned = pkgPath === pinnedWorkspace;

            let description = "";
            if (isCurrent && isPinned) {
              description = "📍 Pinned & Active";
            } else if (isPinned) {
              description = "📍 Pinned";
            } else if (isCurrent) {
              description = "✓ Active";
            }

            return {
              label: `${
                pkgPath === workspaceRoot ? "📦" : "📁"
              } ${displayName}`,
              description,
              detail: pkgPath,
            };
          }
        );

        // Add option to clear pin
        if (pinnedWorkspace) {
          items.unshift({
            label: "$(pin) Clear Pin (Auto-detect)",
            description: "Let extension detect workspace from active file",
            detail: "clear-pin",
          });
        }

        const selected = await vscode.window.showQuickPick(items, {
          placeHolder: "Select workspace package",
          matchOnDescription: true,
          matchOnDetail: true,
        });

        if (!selected) {
          return;
        }

        if (selected.detail === "clear-pin") {
          pinnedWorkspace = undefined;
          vscode.window.showInformationMessage(
            "Workspace pin cleared - using auto-detection"
          );
        } else {
          pinnedWorkspace = selected.detail;
          vscode.window.showInformationMessage(`Pinned to: ${selected.label}`);
        }

        await updateWorkspaceContext();
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "packageManagerDetector.install",
      async () => {
        if (
          currentPackageManager &&
          currentPackageManager.type !== PackageManager.UNKNOWN
        ) {
          const terminal = vscode.window.createTerminal("Package Manager");
          terminal.show();
          terminal.sendText(currentPackageManager.installCommand);
        } else {
          vscode.window.showWarningMessage("No package manager detected");
        }
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("packageManagerDetector.run", async () => {
      if (
        currentPackageManager &&
        currentPackageManager.type !== PackageManager.UNKNOWN
      ) {
        const scripts = await getAvailableScripts();
        if (scripts.length === 0) {
          vscode.window.showWarningMessage("No scripts found in package.json");
          return;
        }

        const selected = await vscode.window.showQuickPick(scripts, {
          placeHolder: "Select a script to run",
        });

        if (selected) {
          const terminal = vscode.window.createTerminal("Package Manager");
          terminal.show();
          terminal.sendText(`${currentPackageManager.runCommand} ${selected}`);
        }
      } else {
        vscode.window.showWarningMessage("No package manager detected");
      }
    })
  );

  // Watch for workspace changes
  const fileWatcher = vscode.workspace.createFileSystemWatcher(
    "**/{package-lock.json,yarn.lock,pnpm-lock.yaml,bun.lockb,package.json}"
  );
  fileWatcher.onDidCreate(() => updateWorkspaceContext());
  fileWatcher.onDidDelete(() => updateWorkspaceContext());
  fileWatcher.onDidChange(() => updateWorkspaceContext());
  context.subscriptions.push(fileWatcher);

  // Watch for active editor changes (for context-aware detection)
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(async (editor) => {
      if (editor && !pinnedWorkspace) {
        // Only auto-update if not pinned
        await updateWorkspaceContext(editor.document.uri.fsPath);
      }
    })
  );

  // Watch for text document changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(async (event) => {
      if (event.document.fileName.endsWith("package.json")) {
        await updateWorkspaceContext();
      }
    })
  );

  // Initial detection
  updateWorkspaceContext();
}

async function updatePackageManager() {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (!workspaceFolders || workspaceFolders.length === 0) {
    statusBarItem.hide();
    fileDecorationProvider.updatePackageManager(
      PackageManager.UNKNOWN,
      undefined
    );
    return;
  }

  // Detect package manager in the first workspace folder
  currentPackageManager = await PackageManagerDetector.detect(
    workspaceFolders[0]
  );

  // Update file decoration provider
  fileDecorationProvider.updatePackageManager(
    currentPackageManager.type,
    workspaceFolders[0].uri.fsPath
  );

  // Update status bar
  if (currentPackageManager.type === PackageManager.UNKNOWN) {
    statusBarItem.text = "$(question) No PM";
    statusBarItem.tooltip = "No package manager detected. Click to refresh.";
    statusBarItem.color = undefined;
  } else {
    // Icon map using codicons as temporary solution
    // TODO: Replace with custom font icons from SVG logos
    const iconMap: Record<PackageManager, string> = {
      [PackageManager.NPM]: "package",
      [PackageManager.YARN]: "symbol-color",
      [PackageManager.PNPM]: "layers",
      [PackageManager.BUN]: "circle-filled",
      [PackageManager.UNKNOWN]: "question",
    };

    statusBarItem.text = `$(${iconMap[currentPackageManager.type]}) ${
      currentPackageManager.type
    }`;

    // Build enhanced tooltip with statistics and health info
    const packageData = await getPackageJsonData();
    const nodeModulesStats = await getNodeModulesStats();
    const lockFileTime = currentPackageManager.lockFile
      ? await getLockFileInfo(currentPackageManager.lockFile)
      : "";

    // Extract version from packageManager field if available
    let version = "";
    if (packageData?.packageManager) {
      const match = packageData.packageManager.match(/@(.+?)(?:[+@]|$)/);
      if (match) {
        version = ` v${match[1]}`;
      }
    }

    // Icon map for package managers
    const pmIcons: Record<PackageManager, string> = {
      [PackageManager.NPM]: "📦",
      [PackageManager.YARN]: "🧶",
      [PackageManager.PNPM]: "📦",
      [PackageManager.BUN]: "🥟",
      [PackageManager.UNKNOWN]: "❓",
    };

    let tooltipText = `${
      pmIcons[currentPackageManager.type]
    } ${currentPackageManager.type.toUpperCase()}${version}\n`;
    tooltipText += `${"━".repeat(30)}\n`;

    // Show workspace context for monorepos
    if (isMonorepo && currentWorkspaceContext) {
      const workspaceRoot = workspaceFolders[0].uri.fsPath;
      const contextName = getWorkspaceDisplayName(
        currentWorkspaceContext,
        workspaceRoot
      );
      tooltipText += `📍 ${contextName}`;
      if (pinnedWorkspace) {
        tooltipText += ` (pinned)`;
      }
      tooltipText += `\n`;
      tooltipText += `🏗️  Monorepo: ${workspacePackages.length} workspace${
        workspacePackages.length !== 1 ? "s" : ""
      }\n`;
      tooltipText += `${"━".repeat(30)}\n`;
    }

    // Dependencies statistics
    const prodDeps = packageData?.dependencies
      ? Object.keys(packageData.dependencies).length
      : 0;
    const devDeps = packageData?.devDependencies
      ? Object.keys(packageData.devDependencies).length
      : 0;
    const totalDeps = prodDeps + devDeps;

    if (totalDeps > 0) {
      tooltipText += `📊 Dependencies:\n`;
      if (prodDeps > 0) {
        tooltipText += `   Production: ${prodDeps} package${
          prodDeps !== 1 ? "s" : ""
        }\n`;
      }
      if (devDeps > 0) {
        tooltipText += `   Development: ${devDeps} package${
          devDeps !== 1 ? "s" : ""
        }\n`;
      }
      tooltipText += `   Total: ${totalDeps} package${
        totalDeps !== 1 ? "s" : ""
      }\n`;
    }

    // node_modules info
    if (nodeModulesStats) {
      tooltipText += `\n📁 node_modules:\n`;
      tooltipText += `   Packages: ${nodeModulesStats.count} (updated ${nodeModulesStats.lastModified})\n`;
    }

    // Lock file info
    if (currentPackageManager.lockFile) {
      tooltipText += `\n🔒 ${currentPackageManager.lockFile}`;
      if (lockFileTime) {
        tooltipText += ` (modified ${lockFileTime})`;
      }
      tooltipText += `\n`;
    }

    // Available scripts with commands
    if (packageData?.scripts) {
      const scripts = Object.entries(packageData.scripts);
      if (scripts.length > 0) {
        tooltipText += `\n📜 Available Scripts (${scripts.length}):\n`;
        scripts.forEach(([name, command]) => {
          // Truncate long commands
          const truncatedCommand =
            command.length > 40 ? command.substring(0, 37) + "..." : command;
          tooltipText += `   • ${name} → ${truncatedCommand}\n`;
        });
      }
    } else {
      tooltipText += `\n⚠️  No scripts defined in package.json\n`;
    }

    tooltipText += `\n💡 Click to ${
      isMonorepo ? "select workspace" : "refresh detection"
    }`;

    statusBarItem.tooltip = tooltipText;

    // Set text color based on package manager
    const colorMap: Record<PackageManager, vscode.ThemeColor> = {
      [PackageManager.NPM]: new vscode.ThemeColor("packageManagerDetector.npm"),
      [PackageManager.YARN]: new vscode.ThemeColor(
        "packageManagerDetector.yarn"
      ),
      [PackageManager.PNPM]: new vscode.ThemeColor(
        "packageManagerDetector.pnpm"
      ),
      [PackageManager.BUN]: new vscode.ThemeColor("packageManagerDetector.bun"),
      [PackageManager.UNKNOWN]: new vscode.ThemeColor(
        "statusBarItem.errorForeground"
      ),
    };

    statusBarItem.color = colorMap[currentPackageManager.type];
  }

  // Set command based on monorepo detection
  statusBarItem.command = isMonorepo
    ? "packageManagerDetector.selectWorkspace"
    : "packageManagerDetector.refresh";

  statusBarItem.show();
}

interface PackageJsonData {
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  packageManager?: string;
  workspaces?: string[] | { packages?: string[] };
}

async function getPackageJsonData(): Promise<PackageJsonData | null> {
  if (!currentWorkspaceContext) {
    return null;
  }

  return await getPackageJsonDataForPath(currentWorkspaceContext);
}

async function getAvailableScripts(): Promise<string[]> {
  const data = await getPackageJsonData();
  return data?.scripts ? Object.keys(data.scripts) : [];
}

async function getNodeModulesStats(): Promise<{
  count: number;
  lastModified: string;
} | null> {
  if (!currentWorkspaceContext) {
    return null;
  }

  const nodeModulesUri = vscode.Uri.file(
    path.join(currentWorkspaceContext, "node_modules")
  );

  try {
    const stat = await vscode.workspace.fs.stat(nodeModulesUri);
    const entries = await vscode.workspace.fs.readDirectory(nodeModulesUri);

    // Count packages (excluding .bin, .cache, etc.)
    const packageCount = entries.filter(
      ([name, type]) =>
        type === vscode.FileType.Directory && !name.startsWith(".")
    ).length;

    // Format last modified time
    const now = Date.now();
    const diff = now - stat.mtime;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    let lastModified: string;
    if (days > 0) {
      lastModified = `${days}d ago`;
    } else if (hours > 0) {
      lastModified = `${hours}h ago`;
    } else {
      lastModified = "just now";
    }

    return { count: packageCount, lastModified };
  } catch (error) {
    return null;
  }
}

async function getLockFileInfo(lockFileName: string): Promise<string> {
  if (!currentWorkspaceContext || !lockFileName) {
    return "";
  }

  const lockFileUri = vscode.Uri.file(
    path.join(currentWorkspaceContext, lockFileName)
  );

  try {
    const stat = await vscode.workspace.fs.stat(lockFileUri);
    const now = Date.now();
    const diff = now - stat.mtime;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ago`;
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else {
      return "just now";
    }
  } catch (error) {
    return "";
  }
}

// Monorepo detection and workspace management
async function detectMonorepo(workspaceRoot: string): Promise<boolean> {
  const packageJsonData = await getPackageJsonDataForPath(workspaceRoot);

  if (!packageJsonData) {
    return false;
  }

  // Check for workspace indicators
  if (packageJsonData.workspaces) {
    return true;
  }

  // Check for pnpm-workspace.yaml
  try {
    const pnpmWorkspaceUri = vscode.Uri.file(
      path.join(workspaceRoot, "pnpm-workspace.yaml")
    );
    await vscode.workspace.fs.stat(pnpmWorkspaceUri);
    return true;
  } catch {}

  // Check for lerna.json
  try {
    const lernaUri = vscode.Uri.file(path.join(workspaceRoot, "lerna.json"));
    await vscode.workspace.fs.stat(lernaUri);
    return true;
  } catch {}

  // Check for turbo.json
  try {
    const turboUri = vscode.Uri.file(path.join(workspaceRoot, "turbo.json"));
    await vscode.workspace.fs.stat(turboUri);
    return true;
  } catch {}

  return false;
}

async function discoverWorkspacePackages(
  workspaceRoot: string
): Promise<string[]> {
  const packages: string[] = [workspaceRoot]; // Always include root
  const packageJsonData = await getPackageJsonDataForPath(workspaceRoot);

  if (!packageJsonData) {
    return packages;
  }

  // Parse workspace patterns
  let workspacePatterns: string[] = [];

  if (Array.isArray(packageJsonData.workspaces)) {
    workspacePatterns = packageJsonData.workspaces;
  } else if (packageJsonData.workspaces?.packages) {
    workspacePatterns = packageJsonData.workspaces.packages;
  }

  // Find all package.json files in workspace patterns
  for (const pattern of workspacePatterns) {
    try {
      const globPattern = new vscode.RelativePattern(
        workspaceRoot,
        `${pattern}/package.json`
      );
      const files = await vscode.workspace.findFiles(
        globPattern,
        "**/node_modules/**"
      );

      for (const file of files) {
        const packageDir = path.dirname(file.fsPath);
        if (!packages.includes(packageDir)) {
          packages.push(packageDir);
        }
      }
    } catch (error) {
      console.error(`Error finding packages for pattern ${pattern}:`, error);
    }
  }

  return packages;
}

async function getPackageJsonDataForPath(
  packagePath: string
): Promise<PackageJsonData | null> {
  try {
    const packageJsonUri = vscode.Uri.file(
      path.join(packagePath, "package.json")
    );
    const content = await vscode.workspace.fs.readFile(packageJsonUri);
    const data = JSON.parse(content.toString());
    return data;
  } catch (error) {
    return null;
  }
}

async function findClosestPackageJson(
  filePath: string
): Promise<string | undefined> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    return undefined;
  }

  const workspaceRoot = workspaceFolders[0].uri.fsPath;
  let currentDir = path.dirname(filePath);

  // Walk up the directory tree until we find a package.json or reach workspace root
  while (currentDir.startsWith(workspaceRoot)) {
    try {
      const packageJsonUri = vscode.Uri.file(
        path.join(currentDir, "package.json")
      );
      await vscode.workspace.fs.stat(packageJsonUri);
      return currentDir;
    } catch {
      // package.json not found, go up one level
      const parentDir = path.dirname(currentDir);
      if (parentDir === currentDir) {
        break; // Reached filesystem root
      }
      currentDir = parentDir;
    }
  }

  return workspaceRoot; // Fallback to workspace root
}

function getWorkspaceDisplayName(
  packagePath: string,
  workspaceRoot: string
): string {
  if (packagePath === workspaceRoot) {
    return "Root";
  }

  const relativePath = path.relative(workspaceRoot, packagePath);
  return relativePath || "Root";
}

async function updateWorkspaceContext(filePath?: string) {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    return;
  }

  const workspaceRoot = workspaceFolders[0].uri.fsPath;

  // Detect monorepo and discover packages
  isMonorepo = await detectMonorepo(workspaceRoot);
  if (isMonorepo) {
    workspacePackages = await discoverWorkspacePackages(workspaceRoot);
  } else {
    workspacePackages = [workspaceRoot];
  }

  // Determine context: pinned > active file context > root
  if (pinnedWorkspace) {
    currentWorkspaceContext = pinnedWorkspace;
  } else if (filePath) {
    currentWorkspaceContext = await findClosestPackageJson(filePath);
  } else {
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
      currentWorkspaceContext = await findClosestPackageJson(
        activeEditor.document.uri.fsPath
      );
    } else {
      currentWorkspaceContext = workspaceRoot;
    }
  }

  await updatePackageManager();
}

export function deactivate() {
  if (statusBarItem) {
    statusBarItem.dispose();
  }
}
