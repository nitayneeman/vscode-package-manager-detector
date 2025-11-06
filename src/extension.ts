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
      "packageManagerDetector.openPackageJson",
      async () => {
        if (!currentWorkspaceContext) {
          vscode.window.showWarningMessage("No package.json found in context");
          return;
        }

        const packageJsonPath = path.join(
          currentWorkspaceContext,
          "package.json"
        );
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
      if (editor) {
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

    // Format package manager name as Word Case
    const pmName =
      currentPackageManager.type.charAt(0).toUpperCase() +
      currentPackageManager.type.slice(1).toLowerCase();

    let tooltipText = `${
      pmIcons[currentPackageManager.type]
    } ${pmName}${version}\n`;
    tooltipText += `${"━".repeat(30)}\n`;

    // Show workspace context for monorepos
    if (isMonorepo && currentWorkspaceContext) {
      const workspaceRoot = workspaceFolders[0].uri.fsPath;
      const contextName = getWorkspaceDisplayName(
        currentWorkspaceContext,
        workspaceRoot
      );
      tooltipText += `📍 ${contextName}\n`;
      tooltipText += `🏗️  Monorepo: ${workspacePackages.length} workspace${
        workspacePackages.length !== 1 ? "s" : ""
      }\n`;
      tooltipText += `${"━".repeat(30)}\n`;
    }

    // Security and Updates info (fetch in background)
    const securityInfo = await getSecurityInfo(currentPackageManager.type);
    const outdatedInfo = await getOutdatedInfo(currentPackageManager.type);

    // Show security issues if any
    if (securityInfo && securityInfo.hasIssues) {
      const parts = [];
      if (securityInfo.vulnerabilities.critical > 0) {
        parts.push(
          `${securityInfo.vulnerabilities.critical} critical`
        );
      }
      if (securityInfo.vulnerabilities.high > 0) {
        parts.push(`${securityInfo.vulnerabilities.high} high`);
      }
      if (securityInfo.vulnerabilities.moderate > 0) {
        parts.push(`${securityInfo.vulnerabilities.moderate} moderate`);
      }
      if (securityInfo.vulnerabilities.low > 0) {
        parts.push(`${securityInfo.vulnerabilities.low} low`);
      }
      tooltipText += `\n⚠️  ${parts.join(", ")} vulnerabilit${
        securityInfo.vulnerabilities.total === 1 ? "y" : "ies"
      }\n`;
      tooltipText += `   💡 Run: ${currentPackageManager.installCommand.replace(
        " install",
        " audit fix"
      )}\n`;
    } else if (securityInfo && !securityInfo.hasIssues) {
      tooltipText += `\n✅ No vulnerabilities\n`;
    }

    // Show updates if any
    if (outdatedInfo && outdatedInfo.hasUpdates) {
      const parts = [];
      if (outdatedInfo.packages.major > 0) {
        parts.push(`${outdatedInfo.packages.major} major`);
      }
      if (outdatedInfo.packages.minor > 0) {
        parts.push(`${outdatedInfo.packages.minor} minor`);
      }
      if (outdatedInfo.packages.patch > 0) {
        parts.push(`${outdatedInfo.packages.patch} patch`);
      }
      tooltipText += `\n📦 ${parts.join(", ")} update${
        outdatedInfo.packages.total === 1 ? "" : "s"
      } available\n`;
      const updateCommand =
        currentPackageManager.type === PackageManager.YARN
          ? "yarn upgrade-interactive"
          : currentPackageManager.type === PackageManager.PNPM
          ? "pnpm update"
          : "npm update";
      tooltipText += `   💡 Run: ${updateCommand}\n`;
    } else if (outdatedInfo && !outdatedInfo.hasUpdates) {
      tooltipText += `\n✅ All packages up to date\n`;
    }

    // Dependencies count (simple total)
    const totalDeps =
      (packageData?.dependencies ? Object.keys(packageData.dependencies).length : 0) +
      (packageData?.devDependencies ? Object.keys(packageData.devDependencies).length : 0);

    if (totalDeps > 0) {
      tooltipText += `\n📊 ${totalDeps} dependenc${totalDeps === 1 ? "y" : "ies"}\n`;
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
        "statusBarItem.errorForeground"
      ),
    };

    statusBarItem.color = colorMap[currentPackageManager.type];
  }

  // Set command based on monorepo detection
  statusBarItem.command = "packageManagerDetector.openPackageJson";

  statusBarItem.show();
}

interface PackageJsonData {
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  packageManager?: string;
  workspaces?: string[] | { packages?: string[] };
}

interface SecurityInfo {
  vulnerabilities: {
    critical: number;
    high: number;
    moderate: number;
    low: number;
    total: number;
  };
  hasIssues: boolean;
}

interface OutdatedInfo {
  packages: {
    major: number;
    minor: number;
    patch: number;
    total: number;
  };
  hasUpdates: boolean;
}

// Cache for security and outdated checks (to avoid running too frequently)
let securityCache: { timestamp: number; data: SecurityInfo | null } = {
  timestamp: 0,
  data: null,
};
let outdatedCache: { timestamp: number; data: OutdatedInfo | null } = {
  timestamp: 0,
  data: null,
};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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

async function getSecurityInfo(
  packageManager: PackageManager
): Promise<SecurityInfo | null> {
  // Check cache first
  const now = Date.now();
  if (securityCache.data && now - securityCache.timestamp < CACHE_DURATION) {
    return securityCache.data;
  }

  if (!currentWorkspaceContext) {
    return null;
  }

  try {
    const { exec } = require("child_process");
    const { promisify } = require("util");
    const execPromise = promisify(exec);

    let command = "";
    switch (packageManager) {
      case PackageManager.NPM:
        command = "npm audit --json";
        break;
      case PackageManager.YARN:
        command = "yarn audit --json";
        break;
      case PackageManager.PNPM:
        command = "pnpm audit --json";
        break;
      case PackageManager.BUN:
        // Bun doesn't have audit yet, skip
        return null;
      default:
        return null;
    }

    const { stdout } = await execPromise(command, {
      cwd: currentWorkspaceContext,
      timeout: 10000, // 10 second timeout
    });

    const auditData = JSON.parse(stdout);

    let vulnerabilities = {
      critical: 0,
      high: 0,
      moderate: 0,
      low: 0,
      total: 0,
    };

    // Parse based on package manager
    if (
      packageManager === PackageManager.NPM ||
      packageManager === PackageManager.PNPM
    ) {
      if (auditData.metadata?.vulnerabilities) {
        vulnerabilities = {
          critical: auditData.metadata.vulnerabilities.critical || 0,
          high: auditData.metadata.vulnerabilities.high || 0,
          moderate: auditData.metadata.vulnerabilities.moderate || 0,
          low: auditData.metadata.vulnerabilities.low || 0,
          total: auditData.metadata.vulnerabilities.total || 0,
        };
      }
    } else if (packageManager === PackageManager.YARN) {
      // Yarn has different format
      const advisories = auditData.advisories || {};
      Object.values(advisories).forEach((advisory: any) => {
        const severity = advisory.severity;
        if (severity === "critical") {
          vulnerabilities.critical++;
        } else if (severity === "high") {
          vulnerabilities.high++;
        } else if (severity === "moderate") {
          vulnerabilities.moderate++;
        } else if (severity === "low") {
          vulnerabilities.low++;
        }
      });
      vulnerabilities.total =
        vulnerabilities.critical +
        vulnerabilities.high +
        vulnerabilities.moderate +
        vulnerabilities.low;
    }

    const securityInfo: SecurityInfo = {
      vulnerabilities,
      hasIssues: vulnerabilities.total > 0,
    };

    // Cache the result
    securityCache = {
      timestamp: now,
      data: securityInfo,
    };

    return securityInfo;
  } catch (error) {
    // Audit might fail if no node_modules or network issues, that's okay
    return null;
  }
}

async function getOutdatedInfo(
  packageManager: PackageManager
): Promise<OutdatedInfo | null> {
  // Check cache first
  const now = Date.now();
  if (outdatedCache.data && now - outdatedCache.timestamp < CACHE_DURATION) {
    return outdatedCache.data;
  }

  if (!currentWorkspaceContext) {
    return null;
  }

  try {
    const { exec } = require("child_process");
    const { promisify } = require("util");
    const execPromise = promisify(exec);

    let command = "";
    switch (packageManager) {
      case PackageManager.NPM:
        command = "npm outdated --json";
        break;
      case PackageManager.YARN:
        command = "yarn outdated --json";
        break;
      case PackageManager.PNPM:
        command = "pnpm outdated --json";
        break;
      case PackageManager.BUN:
        // Bun doesn't have outdated command yet
        return null;
      default:
        return null;
    }

    const { stdout } = await execPromise(command, {
      cwd: currentWorkspaceContext,
      timeout: 15000, // 15 second timeout
    });

    if (!stdout || stdout.trim() === "") {
      // No outdated packages
      const outdatedInfo: OutdatedInfo = {
        packages: { major: 0, minor: 0, patch: 0, total: 0 },
        hasUpdates: false,
      };
      outdatedCache = { timestamp: now, data: outdatedInfo };
      return outdatedInfo;
    }

    const outdatedData = JSON.parse(stdout);

    let major = 0;
    let minor = 0;
    let patch = 0;

    // Parse outdated packages
    for (const [pkgName, info] of Object.entries(outdatedData)) {
      const pkg = info as any;
      const current = pkg.current || "";
      const wanted = pkg.wanted || "";
      const latest = pkg.latest || "";

      // Determine update type
      if (current && latest) {
        const currentParts = current.replace(/[^0-9.]/g, "").split(".");
        const latestParts = latest.replace(/[^0-9.]/g, "").split(".");

        if (currentParts[0] !== latestParts[0]) {
          major++;
        } else if (currentParts[1] !== latestParts[1]) {
          minor++;
        } else if (currentParts[2] !== latestParts[2]) {
          patch++;
        }
      }
    }

    const total = major + minor + patch;
    const outdatedInfo: OutdatedInfo = {
      packages: { major, minor, patch, total },
      hasUpdates: total > 0,
    };

    // Cache the result
    outdatedCache = {
      timestamp: now,
      data: outdatedInfo,
    };

    return outdatedInfo;
  } catch (error) {
    // outdated command might fail, that's okay
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

  // Determine context: active file context > root
  if (filePath) {
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
