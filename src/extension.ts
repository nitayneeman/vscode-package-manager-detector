import * as vscode from "vscode";
import * as path from "path";
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

  // Initial detection
  updatePackageManager();
}

async function updatePackageManager() {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (!workspaceFolders || workspaceFolders.length === 0) {
    statusBarItem.hide();
    return;
  }

  workspaceRoot = workspaceFolders[0].uri.fsPath;

  // Detect package manager
  currentPackageManager = await PackageManagerDetector.detect(
    workspaceFolders[0]
  );

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

  // Dependencies count
  const totalDeps =
    (packageData?.dependencies
      ? Object.keys(packageData.dependencies).length
      : 0) +
    (packageData?.devDependencies
      ? Object.keys(packageData.devDependencies).length
      : 0);

  if (totalDeps > 0) {
    tooltipText += `\n📊 ${totalDeps} dependenc${
      totalDeps === 1 ? "y" : "ies"
    }\n`;
  }

  // Available scripts with commands
  if (packageData?.scripts) {
    const scripts = Object.entries(packageData.scripts);
    if (scripts.length > 0) {
      tooltipText += `\n📜 Scripts (${scripts.length}):\n`;
      scripts.forEach(([name, command]) => {
        // Truncate long commands
        const truncatedCommand =
          command.length > 40 ? command.substring(0, 37) + "..." : command;
        tooltipText += `   • ${name} → ${truncatedCommand}\n`;
      });
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
