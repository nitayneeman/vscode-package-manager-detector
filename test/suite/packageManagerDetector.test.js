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
const assert = __importStar(require("assert"));
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const packageManagerDetector_1 = require("../../src/packageManagerDetector");
suite('PackageManagerDetector Test Suite', () => {
    let testWorkspaceRoot;
    let workspaceFolder;
    setup(() => {
        // Create a temporary directory for testing
        testWorkspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-detector-test-'));
        workspaceFolder = {
            uri: vscode.Uri.file(testWorkspaceRoot),
            name: 'test-workspace',
            index: 0
        };
    });
    teardown(() => {
        // Clean up the temporary directory
        if (fs.existsSync(testWorkspaceRoot)) {
            fs.rmSync(testWorkspaceRoot, { recursive: true, force: true });
        }
    });
    test('Should detect npm from package-lock.json', async () => {
        // Create package-lock.json
        const lockFilePath = path.join(testWorkspaceRoot, 'package-lock.json');
        fs.writeFileSync(lockFilePath, JSON.stringify({ lockfileVersion: 2 }));
        const result = await packageManagerDetector_1.PackageManagerDetector.detect(workspaceFolder);
        assert.strictEqual(result.type, packageManagerDetector_1.PackageManager.NPM);
        assert.strictEqual(result.lockFile, 'package-lock.json');
        assert.strictEqual(result.installCommand, 'npm install');
        assert.strictEqual(result.runCommand, 'npm run');
    });
    test('Should detect yarn from yarn.lock', async () => {
        // Create yarn.lock
        const lockFilePath = path.join(testWorkspaceRoot, 'yarn.lock');
        fs.writeFileSync(lockFilePath, '# yarn lockfile v1');
        const result = await packageManagerDetector_1.PackageManagerDetector.detect(workspaceFolder);
        assert.strictEqual(result.type, packageManagerDetector_1.PackageManager.YARN);
        assert.strictEqual(result.lockFile, 'yarn.lock');
        assert.strictEqual(result.installCommand, 'yarn install');
        assert.strictEqual(result.runCommand, 'yarn');
    });
    test('Should detect pnpm from pnpm-lock.yaml', async () => {
        // Create pnpm-lock.yaml
        const lockFilePath = path.join(testWorkspaceRoot, 'pnpm-lock.yaml');
        fs.writeFileSync(lockFilePath, 'lockfileVersion: 5.4');
        const result = await packageManagerDetector_1.PackageManagerDetector.detect(workspaceFolder);
        assert.strictEqual(result.type, packageManagerDetector_1.PackageManager.PNPM);
        assert.strictEqual(result.lockFile, 'pnpm-lock.yaml');
        assert.strictEqual(result.installCommand, 'pnpm install');
        assert.strictEqual(result.runCommand, 'pnpm');
    });
    test('Should detect bun from bun.lockb', async () => {
        // Create bun.lockb
        const lockFilePath = path.join(testWorkspaceRoot, 'bun.lockb');
        fs.writeFileSync(lockFilePath, Buffer.from([0x42, 0x55, 0x4e])); // Binary file
        const result = await packageManagerDetector_1.PackageManagerDetector.detect(workspaceFolder);
        assert.strictEqual(result.type, packageManagerDetector_1.PackageManager.BUN);
        assert.strictEqual(result.lockFile, 'bun.lockb');
        assert.strictEqual(result.installCommand, 'bun install');
        assert.strictEqual(result.runCommand, 'bun run');
    });
    test('Should prioritize bun over other lock files', async () => {
        // Create multiple lock files
        fs.writeFileSync(path.join(testWorkspaceRoot, 'package-lock.json'), '{}');
        fs.writeFileSync(path.join(testWorkspaceRoot, 'yarn.lock'), '');
        fs.writeFileSync(path.join(testWorkspaceRoot, 'pnpm-lock.yaml'), '');
        fs.writeFileSync(path.join(testWorkspaceRoot, 'bun.lockb'), '');
        const result = await packageManagerDetector_1.PackageManagerDetector.detect(workspaceFolder);
        assert.strictEqual(result.type, packageManagerDetector_1.PackageManager.BUN);
    });
    test('Should prioritize pnpm over yarn and npm', async () => {
        // Create multiple lock files (but not bun)
        fs.writeFileSync(path.join(testWorkspaceRoot, 'package-lock.json'), '{}');
        fs.writeFileSync(path.join(testWorkspaceRoot, 'yarn.lock'), '');
        fs.writeFileSync(path.join(testWorkspaceRoot, 'pnpm-lock.yaml'), '');
        const result = await packageManagerDetector_1.PackageManagerDetector.detect(workspaceFolder);
        assert.strictEqual(result.type, packageManagerDetector_1.PackageManager.PNPM);
    });
    test('Should prioritize yarn over npm', async () => {
        // Create multiple lock files (but not bun or pnpm)
        fs.writeFileSync(path.join(testWorkspaceRoot, 'package-lock.json'), '{}');
        fs.writeFileSync(path.join(testWorkspaceRoot, 'yarn.lock'), '');
        const result = await packageManagerDetector_1.PackageManagerDetector.detect(workspaceFolder);
        assert.strictEqual(result.type, packageManagerDetector_1.PackageManager.YARN);
    });
    test('Should detect from packageManager field in package.json when no lock file exists', async () => {
        // Create package.json with packageManager field
        const packageJson = {
            name: 'test-project',
            packageManager: 'pnpm@8.6.0'
        };
        fs.writeFileSync(path.join(testWorkspaceRoot, 'package.json'), JSON.stringify(packageJson, null, 2));
        const result = await packageManagerDetector_1.PackageManagerDetector.detect(workspaceFolder);
        assert.strictEqual(result.type, packageManagerDetector_1.PackageManager.PNPM);
        assert.strictEqual(result.lockFile, undefined);
    });
    test('Should detect yarn from packageManager field', async () => {
        const packageJson = {
            name: 'test-project',
            packageManager: 'yarn@3.6.4'
        };
        fs.writeFileSync(path.join(testWorkspaceRoot, 'package.json'), JSON.stringify(packageJson, null, 2));
        const result = await packageManagerDetector_1.PackageManagerDetector.detect(workspaceFolder);
        assert.strictEqual(result.type, packageManagerDetector_1.PackageManager.YARN);
    });
    test('Should detect npm from packageManager field', async () => {
        const packageJson = {
            name: 'test-project',
            packageManager: 'npm@9.6.7'
        };
        fs.writeFileSync(path.join(testWorkspaceRoot, 'package.json'), JSON.stringify(packageJson, null, 2));
        const result = await packageManagerDetector_1.PackageManagerDetector.detect(workspaceFolder);
        assert.strictEqual(result.type, packageManagerDetector_1.PackageManager.NPM);
    });
    test('Should detect bun from packageManager field', async () => {
        const packageJson = {
            name: 'test-project',
            packageManager: 'bun@1.0.0'
        };
        fs.writeFileSync(path.join(testWorkspaceRoot, 'package.json'), JSON.stringify(packageJson, null, 2));
        const result = await packageManagerDetector_1.PackageManagerDetector.detect(workspaceFolder);
        assert.strictEqual(result.type, packageManagerDetector_1.PackageManager.BUN);
    });
    test('Should return UNKNOWN when no lock file or packageManager field exists', async () => {
        // Create package.json without packageManager field
        const packageJson = {
            name: 'test-project'
        };
        fs.writeFileSync(path.join(testWorkspaceRoot, 'package.json'), JSON.stringify(packageJson, null, 2));
        const result = await packageManagerDetector_1.PackageManagerDetector.detect(workspaceFolder);
        assert.strictEqual(result.type, packageManagerDetector_1.PackageManager.UNKNOWN);
        assert.strictEqual(result.lockFile, undefined);
        assert.strictEqual(result.installCommand, 'unknown');
        assert.strictEqual(result.runCommand, 'unknown');
    });
    test('Should return UNKNOWN when no package.json exists', async () => {
        // Empty workspace
        const result = await packageManagerDetector_1.PackageManagerDetector.detect(workspaceFolder);
        assert.strictEqual(result.type, packageManagerDetector_1.PackageManager.UNKNOWN);
    });
    test('Should handle malformed package.json gracefully', async () => {
        // Create invalid JSON
        fs.writeFileSync(path.join(testWorkspaceRoot, 'package.json'), '{ invalid json content');
        const result = await packageManagerDetector_1.PackageManagerDetector.detect(workspaceFolder);
        assert.strictEqual(result.type, packageManagerDetector_1.PackageManager.UNKNOWN);
    });
    test('Should prioritize lock file over packageManager field', async () => {
        // Create yarn.lock
        fs.writeFileSync(path.join(testWorkspaceRoot, 'yarn.lock'), '');
        // Create package.json with different packageManager
        const packageJson = {
            name: 'test-project',
            packageManager: 'npm@9.0.0'
        };
        fs.writeFileSync(path.join(testWorkspaceRoot, 'package.json'), JSON.stringify(packageJson, null, 2));
        const result = await packageManagerDetector_1.PackageManagerDetector.detect(workspaceFolder);
        // Lock file should take precedence
        assert.strictEqual(result.type, packageManagerDetector_1.PackageManager.YARN);
        assert.strictEqual(result.lockFile, 'yarn.lock');
    });
    test('Should handle packageManager field with complex version specifier', async () => {
        const packageJson = {
            name: 'test-project',
            packageManager: 'yarn@3.6.4+sha512.e70835d4d6d62c07be76b3c1529cb640c7443f0fe434ef4b6478a5a399218cbaf1511b396b3c56eb03bc86424cff2320f6167ad2fde273aa0df6e60b7754029f'
        };
        fs.writeFileSync(path.join(testWorkspaceRoot, 'package.json'), JSON.stringify(packageJson, null, 2));
        const result = await packageManagerDetector_1.PackageManagerDetector.detect(workspaceFolder);
        assert.strictEqual(result.type, packageManagerDetector_1.PackageManager.YARN);
    });
});
//# sourceMappingURL=packageManagerDetector.test.js.map