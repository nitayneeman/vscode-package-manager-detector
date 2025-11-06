import * as vscode from "vscode";
import { PackageManager } from "./packageManagerDetector";

export class PackageManagerFileDecorationProvider
  implements vscode.FileDecorationProvider
{
  private _onDidChangeFileDecorations = new vscode.EventEmitter<
    vscode.Uri | vscode.Uri[] | undefined
  >();
  readonly onDidChangeFileDecorations = this._onDidChangeFileDecorations.event;

  private currentPackageManager: PackageManager = PackageManager.UNKNOWN;
  private workspaceRoot: string | undefined;

  constructor() {}

  updatePackageManager(
    packageManager: PackageManager,
    workspaceRoot: string | undefined
  ) {
    this.currentPackageManager = packageManager;
    this.workspaceRoot = workspaceRoot;
    this._onDidChangeFileDecorations.fire(undefined);
  }

  provideFileDecoration(uri: vscode.Uri): vscode.FileDecoration | undefined {
    // Check if decorations are enabled
    const config = vscode.workspace.getConfiguration("packageManagerDetector");
    if (!config.get<boolean>("fileDecorations.enabled", true)) {
      return undefined;
    }

    if (this.currentPackageManager === PackageManager.UNKNOWN) {
      return undefined;
    }

    const fileName = uri.path.split("/").pop() || "";
    const isInWorkspace =
      this.workspaceRoot && uri.fsPath.startsWith(this.workspaceRoot);

    if (!isInWorkspace) {
      return undefined;
    }

    // Only decorate package.json with the colored symbol badge
    if (fileName === "package.json") {
      return this.getDecorationForPackageManager();
    }

    return undefined;
  }

  private getDecorationForPackageManager(): vscode.FileDecoration | undefined {
    // Using distinctive Unicode symbols that look like logos
    const decorations: Record<
      PackageManager,
      { badge: string; color: vscode.ThemeColor; tooltip: string }
    > = {
      [PackageManager.NPM]: {
        badge: "◆", // Diamond for npm
        color: new vscode.ThemeColor("packageManagerDetector.npm"),
        tooltip: "npm package manager",
      },
      [PackageManager.YARN]: {
        badge: "◉", // Circled dot for yarn
        color: new vscode.ThemeColor("packageManagerDetector.yarn"),
        tooltip: "yarn package manager",
      },
      [PackageManager.PNPM]: {
        badge: "▣", // Squared box for pnpm (represents grid)
        color: new vscode.ThemeColor("packageManagerDetector.pnpm"),
        tooltip: "pnpm package manager",
      },
      [PackageManager.BUN]: {
        badge: "●", // Circle for bun
        color: new vscode.ThemeColor("packageManagerDetector.bun"),
        tooltip: "bun package manager",
      },
      [PackageManager.UNKNOWN]: {
        badge: "?",
        color: new vscode.ThemeColor("descriptionForeground"),
        tooltip: "Unknown package manager",
      },
    };

    return decorations[this.currentPackageManager];
  }

  dispose() {
    this._onDidChangeFileDecorations.dispose();
  }
}
