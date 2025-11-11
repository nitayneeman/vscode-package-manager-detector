import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import {
  PackageManagerDetector,
  PackageManagerInfo,
  PackageManager,
} from "./packageManagerDetector";

let statusBarItem: vscode.StatusBarItem;
let currentPackageManager: PackageManagerInfo | undefined;
let workspaceRoot: string | undefined;

export function activate(context: vscode.ExtensionContext) {
  console.log("Package Manager Detector is now active");

  // Create status bar item
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  statusBarItem.command = "packageManagerDetector.openPackageJson";
  context.subscriptions.push(statusBarItem);

  // Register command to open package.json
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "packageManagerDetector.openPackageJson",
      async () => {
        if (!workspaceRoot) {
          vscode.window.showWarningMessage("No package.json found");
          return;
        }

        const packageJsonPath = path.join(workspaceRoot, "package.json");
        const packageJsonUri = vscode.Uri.file(packageJsonPath);

        try {
          const document = await vscode.workspace.openTextDocument(
            packageJsonUri
          );
          await vscode.window.showTextDocument(document);
        } catch (error) {
          vscode.window.showErrorMessage(
            `Could not open package.json: ${error}`
          );
        }
      }
    )
  );

  // Watch for workspace changes
  const fileWatcher = vscode.workspace.createFileSystemWatcher(
    "**/{package-lock.json,yarn.lock,pnpm-lock.yaml,bun.lockb,package.json}"
  );
  fileWatcher.onDidCreate(() => updatePackageManager());
  fileWatcher.onDidDelete(() => updatePackageManager());
  fileWatcher.onDidChange(() => updatePackageManager());
  context.subscriptions.push(fileWatcher);

  // Watch for active editor changes (for monorepo support)
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(() => updatePackageManager())
  );

  // Initial detection
  updatePackageManager();
}

/**
 * Find the nearest package.json directory from the given file path
 * by walking up the directory tree
 */
function findNearestPackageJson(filePath: string, workspaceFolderPath: string): string | undefined {
  let currentDir = path.dirname(filePath);
  
  // Walk up the directory tree until we hit the workspace root
  while (currentDir.startsWith(workspaceFolderPath)) {
    const packageJsonPath = path.join(currentDir, "package.json");
    if (fs.existsSync(packageJsonPath)) {
      return currentDir;
    }
    
    const parentDir = path.dirname(currentDir);
    // Prevent infinite loop if we can't go up anymore
    if (parentDir === currentDir) {
      break;
    }
    currentDir = parentDir;
  }
  
  return undefined;
}

async function updatePackageManager() {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (!workspaceFolders || workspaceFolders.length === 0) {
    statusBarItem.hide();
    return;
  }

  const workspaceFolder = workspaceFolders[0];
  
  // For monorepo support: find nearest package.json based on active editor
  const activeEditor = vscode.window.activeTextEditor;
  if (activeEditor) {
    const activeFilePath = activeEditor.document.uri.fsPath;
    const nearestPackageDir = findNearestPackageJson(activeFilePath, workspaceFolder.uri.fsPath);
    
    if (nearestPackageDir) {
      workspaceRoot = nearestPackageDir;
      
      // Create a temporary workspace folder for detection
      const nearestWorkspaceFolder: vscode.WorkspaceFolder = {
        uri: vscode.Uri.file(nearestPackageDir),
        name: path.basename(nearestPackageDir),
        index: 0
      };
      
      currentPackageManager = await PackageManagerDetector.detect(nearestWorkspaceFolder);
    } else {
      // Fall back to workspace root if no package.json found
      workspaceRoot = workspaceFolder.uri.fsPath;
      currentPackageManager = await PackageManagerDetector.detect(workspaceFolder);
    }
  } else {
    // No active editor, use workspace root
    workspaceRoot = workspaceFolder.uri.fsPath;
    currentPackageManager = await PackageManagerDetector.detect(workspaceFolder);
  }

  // Update status bar - default to npm if unknown
  const pmType = currentPackageManager.type === PackageManager.UNKNOWN 
    ? PackageManager.NPM 
    : currentPackageManager.type;

  // Format package manager name - always lowercase
  const pmName = pmType.toLowerCase();
  statusBarItem.text = pmName;

  // Build simplified tooltip
  const packageData = await getPackageJsonData();

  // Extract version from packageManager field if available
  let version = "";
  if (packageData?.packageManager) {
    const match = packageData.packageManager.match(/@(.+?)(?:[+@]|$)/);
    if (match) {
      version = ` v${match[1]}`;
    }
  }

  let tooltipText = `${pmName}${version}\n`;
  tooltipText += `${"━".repeat(30)}\n`;

  // Available scripts with commands (limit to first 8 to ensure tooltip fits)
  if (packageData?.scripts) {
    const scripts = Object.entries(packageData.scripts);
    if (scripts.length > 0) {
      const maxScripts = 8;
      const scriptsToShow = scripts.slice(0, maxScripts);
      const remaining = scripts.length - scriptsToShow.length;
      
      tooltipText += `\n📜 Scripts:\n`;
      scriptsToShow.forEach(([name, command]) => {
        // Truncate long commands
        const truncatedCommand =
          command.length > 40 ? command.substring(0, 37) + "..." : command;
        tooltipText += `   • ${name} → ${truncatedCommand}\n`;
      });
      
      if (remaining > 0) {
        tooltipText += `   … and ${remaining} more\n`;
      }
    }
  } else {
    tooltipText += `\n⚠️  No scripts defined\n`;
  }

  tooltipText += `\n💡 Click to open package.json`;

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
      "packageManagerDetector.npm"
    ),
  };

  statusBarItem.color = colorMap[pmType];

  statusBarItem.show();
}

interface PackageJsonData {
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  packageManager?: string;
}

async function getPackageJsonData(): Promise<PackageJsonData | null> {
  if (!workspaceRoot) {
    return null;
  }

  try {
    const packageJsonUri = vscode.Uri.file(
      path.join(workspaceRoot, "package.json")
    );
    const content = await vscode.workspace.fs.readFile(packageJsonUri);
    const data = JSON.parse(content.toString());
    return data;
  } catch (error) {
    return null;
  }
}

export function deactivate() {
  if (statusBarItem) {
    statusBarItem.dispose();
  }
}
