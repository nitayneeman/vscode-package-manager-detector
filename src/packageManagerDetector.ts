import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export enum PackageManager {
  NPM = 'npm',
  YARN = 'yarn',
  PNPM = 'pnpm',
  BUN = 'bun',
  UNKNOWN = 'unknown'
}

export interface PackageManagerInfo {
  type: PackageManager;
  lockFile?: string;
  icon: string;
  installCommand: string;
  runCommand: string;
}

export class PackageManagerDetector {
  private static readonly LOCK_FILES = [
    { file: 'bun.lockb', manager: PackageManager.BUN },
    { file: 'pnpm-lock.yaml', manager: PackageManager.PNPM },
    { file: 'yarn.lock', manager: PackageManager.YARN },
    { file: 'package-lock.json', manager: PackageManager.NPM }
  ];

  public static async detect(workspaceFolder: vscode.WorkspaceFolder): Promise<PackageManagerInfo> {
    const rootPath = workspaceFolder.uri.fsPath;

    // Check for lock files in order of priority
    for (const { file, manager } of this.LOCK_FILES) {
      const lockFilePath = path.join(rootPath, file);
      if (fs.existsSync(lockFilePath)) {
        return this.getPackageManagerInfo(manager, file);
      }
    }

    // Check if package.json exists but no lock file
    const packageJsonPath = path.join(rootPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      // Check packageManager field in package.json
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        if (packageJson.packageManager) {
          const pmType = this.parsePackageManagerField(packageJson.packageManager);
          if (pmType !== PackageManager.UNKNOWN) {
            return this.getPackageManagerInfo(pmType);
          }
        }
      } catch (error) {
        console.error('Error reading package.json:', error);
      }
    }

    return this.getPackageManagerInfo(PackageManager.UNKNOWN);
  }

  private static parsePackageManagerField(packageManager: string): PackageManager {
    const pmName = packageManager.split('@')[0];
    switch (pmName) {
      case 'npm':
        return PackageManager.NPM;
      case 'yarn':
        return PackageManager.YARN;
      case 'pnpm':
        return PackageManager.PNPM;
      case 'bun':
        return PackageManager.BUN;
      default:
        return PackageManager.UNKNOWN;
    }
  }

  private static getPackageManagerInfo(
    type: PackageManager,
    lockFile?: string
  ): PackageManagerInfo {
    const configs: Record<PackageManager, Omit<PackageManagerInfo, 'type' | 'lockFile'>> = {
      [PackageManager.NPM]: {
        icon: '📦',
        installCommand: 'npm install',
        runCommand: 'npm run'
      },
      [PackageManager.YARN]: {
        icon: '🧶',
        installCommand: 'yarn install',
        runCommand: 'yarn'
      },
      [PackageManager.PNPM]: {
        icon: '📦',
        installCommand: 'pnpm install',
        runCommand: 'pnpm'
      },
      [PackageManager.BUN]: {
        icon: '🥟',
        installCommand: 'bun install',
        runCommand: 'bun run'
      },
      [PackageManager.UNKNOWN]: {
        icon: '❓',
        installCommand: 'unknown',
        runCommand: 'unknown'
      }
    };

    return {
      type,
      lockFile,
      ...configs[type]
    };
  }
}

