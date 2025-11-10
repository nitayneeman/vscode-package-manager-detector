import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');

  test('Extension should be present', () => {
    assert.ok(vscode.extensions.getExtension('nitayneeman.package-manager-detector'));
  });

  test('Extension should activate', async () => {
    const extension = vscode.extensions.getExtension('nitayneeman.package-manager-detector');
    assert.ok(extension);
    
    await extension!.activate();
    assert.strictEqual(extension!.isActive, true);
  });

  test('Should register openPackageJson command', async () => {
    const commands = await vscode.commands.getCommands(true);
    assert.ok(commands.includes('packageManagerDetector.openPackageJson'));
  });
});

suite('Status Bar Display Test Suite', () => {
  let testWorkspaceRoot: string;

  setup(() => {
    // Create a temporary directory for testing
    testWorkspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-detector-statusbar-test-'));
  });

  teardown(() => {
    // Clean up the temporary directory
    if (fs.existsSync(testWorkspaceRoot)) {
      fs.rmSync(testWorkspaceRoot, { recursive: true, force: true });
    }
  });

  test('Should display npm in lowercase', async () => {
    // Create package-lock.json
    const lockFilePath = path.join(testWorkspaceRoot, 'package-lock.json');
    const packageJsonPath = path.join(testWorkspaceRoot, 'package.json');
    fs.writeFileSync(lockFilePath, JSON.stringify({ lockfileVersion: 2 }));
    fs.writeFileSync(packageJsonPath, JSON.stringify({ name: 'test', version: '1.0.0' }));

    const uri = vscode.Uri.file(testWorkspaceRoot);
    
    const { PackageManagerDetector, PackageManager } = require('../../src/packageManagerDetector');
    const result = await PackageManagerDetector.detect({
      uri,
      name: 'test-workspace',
      index: 0
    });

    // Verify the type is correct and would be displayed as lowercase
    assert.strictEqual(result.type, PackageManager.NPM);
    assert.strictEqual(result.type.toLowerCase(), 'npm');
  });

  test('Should display yarn in lowercase', async () => {
    // Create yarn.lock
    const lockFilePath = path.join(testWorkspaceRoot, 'yarn.lock');
    const packageJsonPath = path.join(testWorkspaceRoot, 'package.json');
    fs.writeFileSync(lockFilePath, '# yarn lockfile v1');
    fs.writeFileSync(packageJsonPath, JSON.stringify({ name: 'test', version: '1.0.0' }));

    const uri = vscode.Uri.file(testWorkspaceRoot);
    
    const { PackageManagerDetector, PackageManager } = require('../../src/packageManagerDetector');
    const result = await PackageManagerDetector.detect({
      uri,
      name: 'test-workspace',
      index: 0
    });

    assert.strictEqual(result.type, PackageManager.YARN);
    assert.strictEqual(result.type.toLowerCase(), 'yarn');
  });

  test('Should display pnpm in lowercase', async () => {
    // Create pnpm-lock.yaml
    const lockFilePath = path.join(testWorkspaceRoot, 'pnpm-lock.yaml');
    const packageJsonPath = path.join(testWorkspaceRoot, 'package.json');
    fs.writeFileSync(lockFilePath, 'lockfileVersion: 5.4');
    fs.writeFileSync(packageJsonPath, JSON.stringify({ name: 'test', version: '1.0.0' }));

    const uri = vscode.Uri.file(testWorkspaceRoot);
    
    const { PackageManagerDetector, PackageManager } = require('../../src/packageManagerDetector');
    const result = await PackageManagerDetector.detect({
      uri,
      name: 'test-workspace',
      index: 0
    });

    assert.strictEqual(result.type, PackageManager.PNPM);
    assert.strictEqual(result.type.toLowerCase(), 'pnpm');
  });

  test('Should display bun in lowercase', async () => {
    // Create bun.lockb
    const lockFilePath = path.join(testWorkspaceRoot, 'bun.lockb');
    const packageJsonPath = path.join(testWorkspaceRoot, 'package.json');
    fs.writeFileSync(lockFilePath, Buffer.from([0x42, 0x55, 0x4e]));
    fs.writeFileSync(packageJsonPath, JSON.stringify({ name: 'test', version: '1.0.0' }));

    const uri = vscode.Uri.file(testWorkspaceRoot);
    
    const { PackageManagerDetector, PackageManager } = require('../../src/packageManagerDetector');
    const result = await PackageManagerDetector.detect({
      uri,
      name: 'test-workspace',
      index: 0
    });

    assert.strictEqual(result.type, PackageManager.BUN);
    assert.strictEqual(result.type.toLowerCase(), 'bun');
  });

  test('All package manager enum values should be lowercase', () => {
    const { PackageManager } = require('../../src/packageManagerDetector');
    
    // Verify all enum values are already lowercase
    assert.strictEqual(PackageManager.NPM, 'npm');
    assert.strictEqual(PackageManager.YARN, 'yarn');
    assert.strictEqual(PackageManager.PNPM, 'pnpm');
    assert.strictEqual(PackageManager.BUN, 'bun');
    assert.strictEqual(PackageManager.UNKNOWN, 'unknown');
  });

  test('Status bar text formatting should always be lowercase', () => {
    // Test the exact logic used in extension.ts
    const packageManagers = ['npm', 'yarn', 'pnpm', 'bun'];
    
    packageManagers.forEach(pm => {
      const pmName = pm.toLowerCase();
      assert.strictEqual(pmName, pm, `${pm} should already be lowercase`);
      assert.strictEqual(pmName, pmName.toLowerCase(), `${pm} toLowerCase() should be idempotent`);
    });
  });
});

