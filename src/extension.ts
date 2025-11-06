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
        vscode.window.showInformationMessage(
          `Package Manager: ${currentPackageManager?.type || "unknown"}`
        );
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
    statusBarItem.tooltip =
      `Package Manager: ${currentPackageManager.type}\n` +
      `Install: ${currentPackageManager.installCommand}\n` +
      `Run: ${currentPackageManager.runCommand}\n` +
      (currentPackageManager.lockFile
        ? `Lock file: ${currentPackageManager.lockFile}`
        : "") +
      "\n\nClick to refresh";
    
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

async function getAvailableScripts(): Promise<string[]> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    return [];
  }

  const packageJsonUri = vscode.Uri.joinPath(
    workspaceFolders[0].uri,
    "package.json"
  );

  try {
    const content = await vscode.workspace.fs.readFile(packageJsonUri);
    const packageJson = JSON.parse(content.toString());

    if (packageJson.scripts) {
      return Object.keys(packageJson.scripts);
    }
  } catch (error) {
    console.error("Error reading package.json:", error);
  }

  return [];
}

export function deactivate() {
  if (statusBarItem) {
    statusBarItem.dispose();
  }
}
