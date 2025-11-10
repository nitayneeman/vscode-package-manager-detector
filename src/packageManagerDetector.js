"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageManagerDetector = exports.PackageManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
var PackageManager;
(function (PackageManager) {
    PackageManager["NPM"] = "npm";
    PackageManager["YARN"] = "yarn";
    PackageManager["PNPM"] = "pnpm";
    PackageManager["BUN"] = "bun";
    PackageManager["UNKNOWN"] = "unknown";
})(PackageManager || (exports.PackageManager = PackageManager = {}));
class PackageManagerDetector {
    static async detect(workspaceFolder) {
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
            }
            catch (error) {
                console.error('Error reading package.json:', error);
            }
        }
        return this.getPackageManagerInfo(PackageManager.UNKNOWN);
    }
    static parsePackageManagerField(packageManager) {
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
    static getPackageManagerInfo(type, lockFile) {
        const configs = {
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
exports.PackageManagerDetector = PackageManagerDetector;
PackageManagerDetector.LOCK_FILES = [
    { file: 'bun.lockb', manager: PackageManager.BUN },
    { file: 'pnpm-lock.yaml', manager: PackageManager.PNPM },
    { file: 'yarn.lock', manager: PackageManager.YARN },
    { file: 'package-lock.json', manager: PackageManager.NPM }
];
//# sourceMappingURL=packageManagerDetector.js.map