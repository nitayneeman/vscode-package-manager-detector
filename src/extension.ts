import * as vscode from "vscode";
import {
  PackageManagerDetector,
  PackageManagerInfo,
  PackageManager,
} from "./packageManagerDetector";
import { PackageManagerFileDecorationProvider } from "./fileDecorationProvider";

let statusBarItem: vscode.StatusBarItem;
let currentPackageManager: PackageManagerInfo | undefined;
let fileDecorationProvider: PackageManagerFileDecorationProvider;

export function activate(context: vscode.ExtensionContext) {
  console.log("Package Manager Detector is now active");

  // Create status bar item
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  statusBarItem.command = "packageManagerDetector.refresh";
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
        await updatePackageManager();
        // Notification removed - just refresh silently
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
  fileWatcher.onDidCreate(() => updatePackageManager());
  fileWatcher.onDidDelete(() => updatePackageManager());
  fileWatcher.onDidChange(() => updatePackageManager());
  context.subscriptions.push(fileWatcher);

  // Initial detection
  updatePackageManager();
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

    statusBarItem.text = `$(${iconMap[currentPackageManager.type]}) ${currentPackageManager.type}`;
    
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
    
    let tooltipText = `${pmIcons[currentPackageManager.type]} ${currentPackageManager.type.toUpperCase()}${version}\n`;
    tooltipText += `${"━".repeat(30)}\n`;
    
    // Dependencies statistics
    const prodDeps = packageData?.dependencies ? Object.keys(packageData.dependencies).length : 0;
    const devDeps = packageData?.devDependencies ? Object.keys(packageData.devDependencies).length : 0;
    const totalDeps = prodDeps + devDeps;
    
    if (totalDeps > 0) {
      tooltipText += `📊 Dependencies:\n`;
      if (prodDeps > 0) {
        tooltipText += `   Production: ${prodDeps} package${prodDeps !== 1 ? 's' : ''}\n`;
      }
      if (devDeps > 0) {
        tooltipText += `   Development: ${devDeps} package${devDeps !== 1 ? 's' : ''}\n`;
      }
      tooltipText += `   Total: ${totalDeps} package${totalDeps !== 1 ? 's' : ''}\n`;
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
          const truncatedCommand = command.length > 40 
            ? command.substring(0, 37) + "..." 
            : command;
          tooltipText += `   • ${name} → ${truncatedCommand}\n`;
        });
      }
    } else {
      tooltipText += `\n⚠️  No scripts defined in package.json\n`;
    }
    
    tooltipText += `\n💡 Click to refresh detection`;
    
    statusBarItem.tooltip = tooltipText;
    
    // Set text color based on package manager
    const colorMap: Record<PackageManager, vscode.ThemeColor> = {
      [PackageManager.NPM]: new vscode.ThemeColor("packageManagerDetector.npm"),
      [PackageManager.YARN]: new vscode.ThemeColor("packageManagerDetector.yarn"),
      [PackageManager.PNPM]: new vscode.ThemeColor("packageManagerDetector.pnpm"),
      [PackageManager.BUN]: new vscode.ThemeColor("packageManagerDetector.bun"),
      [PackageManager.UNKNOWN]: new vscode.ThemeColor("statusBarItem.errorForeground"),
    };
    
    statusBarItem.color = colorMap[currentPackageManager.type];
  }

  statusBarItem.show();
}

interface PackageJsonData {
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  packageManager?: string;
}

async function getPackageJsonData(): Promise<PackageJsonData | null> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    return null;
  }

  const packageJsonUri = vscode.Uri.joinPath(
    workspaceFolders[0].uri,
    "package.json"
  );

  try {
    const content = await vscode.workspace.fs.readFile(packageJsonUri);
    return JSON.parse(content.toString());
  } catch (error) {
    console.error("Error reading package.json:", error);
    return null;
  }
}

async function getAvailableScripts(): Promise<string[]> {
  const data = await getPackageJsonData();
  return data?.scripts ? Object.keys(data.scripts) : [];
}

async function getNodeModulesStats(): Promise<{ count: number; lastModified: string } | null> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    return null;
  }

  const nodeModulesUri = vscode.Uri.joinPath(
    workspaceFolders[0].uri,
    "node_modules"
  );

  try {
    const stat = await vscode.workspace.fs.stat(nodeModulesUri);
    const entries = await vscode.workspace.fs.readDirectory(nodeModulesUri);
    
    // Count packages (excluding .bin, .cache, etc.)
    const packageCount = entries.filter(([name, type]) => 
      type === vscode.FileType.Directory && !name.startsWith('.')
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
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || !lockFileName) {
    return "";
  }

  const lockFileUri = vscode.Uri.joinPath(
    workspaceFolders[0].uri,
    lockFileName
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

export function deactivate() {
  if (statusBarItem) {
    statusBarItem.dispose();
  }
}
