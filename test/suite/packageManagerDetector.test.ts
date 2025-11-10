import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { PackageManagerDetector, PackageManager } from '../../src/packageManagerDetector';

suite('PackageManagerDetector Test Suite', () => {
  let testWorkspaceRoot: string;
  let workspaceFolder: vscode.WorkspaceFolder;

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

    const result = await PackageManagerDetector.detect(workspaceFolder);

    assert.strictEqual(result.type, PackageManager.NPM);
    assert.strictEqual(result.lockFile, 'package-lock.json');
    assert.strictEqual(result.installCommand, 'npm install');
    assert.strictEqual(result.runCommand, 'npm run');
  });

  test('Should detect yarn from yarn.lock', async () => {
    // Create yarn.lock
    const lockFilePath = path.join(testWorkspaceRoot, 'yarn.lock');
    fs.writeFileSync(lockFilePath, '# yarn lockfile v1');

    const result = await PackageManagerDetector.detect(workspaceFolder);

    assert.strictEqual(result.type, PackageManager.YARN);
    assert.strictEqual(result.lockFile, 'yarn.lock');
    assert.strictEqual(result.installCommand, 'yarn install');
    assert.strictEqual(result.runCommand, 'yarn');
  });

  test('Should detect pnpm from pnpm-lock.yaml', async () => {
    // Create pnpm-lock.yaml
    const lockFilePath = path.join(testWorkspaceRoot, 'pnpm-lock.yaml');
    fs.writeFileSync(lockFilePath, 'lockfileVersion: 5.4');

    const result = await PackageManagerDetector.detect(workspaceFolder);

    assert.strictEqual(result.type, PackageManager.PNPM);
    assert.strictEqual(result.lockFile, 'pnpm-lock.yaml');
    assert.strictEqual(result.installCommand, 'pnpm install');
    assert.strictEqual(result.runCommand, 'pnpm');
  });

  test('Should detect bun from bun.lockb', async () => {
    // Create bun.lockb
    const lockFilePath = path.join(testWorkspaceRoot, 'bun.lockb');
    fs.writeFileSync(lockFilePath, Buffer.from([0x42, 0x55, 0x4e])); // Binary file

    const result = await PackageManagerDetector.detect(workspaceFolder);

    assert.strictEqual(result.type, PackageManager.BUN);
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

    const result = await PackageManagerDetector.detect(workspaceFolder);

    assert.strictEqual(result.type, PackageManager.BUN);
  });

  test('Should prioritize pnpm over yarn and npm', async () => {
    // Create multiple lock files (but not bun)
    fs.writeFileSync(path.join(testWorkspaceRoot, 'package-lock.json'), '{}');
    fs.writeFileSync(path.join(testWorkspaceRoot, 'yarn.lock'), '');
    fs.writeFileSync(path.join(testWorkspaceRoot, 'pnpm-lock.yaml'), '');

    const result = await PackageManagerDetector.detect(workspaceFolder);

    assert.strictEqual(result.type, PackageManager.PNPM);
  });

  test('Should prioritize yarn over npm', async () => {
    // Create multiple lock files (but not bun or pnpm)
    fs.writeFileSync(path.join(testWorkspaceRoot, 'package-lock.json'), '{}');
    fs.writeFileSync(path.join(testWorkspaceRoot, 'yarn.lock'), '');

    const result = await PackageManagerDetector.detect(workspaceFolder);

    assert.strictEqual(result.type, PackageManager.YARN);
  });

  test('Should detect from packageManager field in package.json when no lock file exists', async () => {
    // Create package.json with packageManager field
    const packageJson = {
      name: 'test-project',
      packageManager: 'pnpm@8.6.0'
    };
    fs.writeFileSync(
      path.join(testWorkspaceRoot, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    const result = await PackageManagerDetector.detect(workspaceFolder);

    assert.strictEqual(result.type, PackageManager.PNPM);
    assert.strictEqual(result.lockFile, undefined);
  });

  test('Should detect yarn from packageManager field', async () => {
    const packageJson = {
      name: 'test-project',
      packageManager: 'yarn@3.6.4'
    };
    fs.writeFileSync(
      path.join(testWorkspaceRoot, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    const result = await PackageManagerDetector.detect(workspaceFolder);

    assert.strictEqual(result.type, PackageManager.YARN);
  });

  test('Should detect npm from packageManager field', async () => {
    const packageJson = {
      name: 'test-project',
      packageManager: 'npm@9.6.7'
    };
    fs.writeFileSync(
      path.join(testWorkspaceRoot, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    const result = await PackageManagerDetector.detect(workspaceFolder);

    assert.strictEqual(result.type, PackageManager.NPM);
  });

  test('Should detect bun from packageManager field', async () => {
    const packageJson = {
      name: 'test-project',
      packageManager: 'bun@1.0.0'
    };
    fs.writeFileSync(
      path.join(testWorkspaceRoot, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    const result = await PackageManagerDetector.detect(workspaceFolder);

    assert.strictEqual(result.type, PackageManager.BUN);
  });

  test('Should return UNKNOWN when no lock file or packageManager field exists', async () => {
    // Create package.json without packageManager field
    const packageJson = {
      name: 'test-project'
    };
    fs.writeFileSync(
      path.join(testWorkspaceRoot, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    const result = await PackageManagerDetector.detect(workspaceFolder);

    assert.strictEqual(result.type, PackageManager.UNKNOWN);
    assert.strictEqual(result.lockFile, undefined);
    assert.strictEqual(result.installCommand, 'unknown');
    assert.strictEqual(result.runCommand, 'unknown');
  });

  test('Should return UNKNOWN when no package.json exists', async () => {
    // Empty workspace
    const result = await PackageManagerDetector.detect(workspaceFolder);

    assert.strictEqual(result.type, PackageManager.UNKNOWN);
  });

  test('Should handle malformed package.json gracefully', async () => {
    // Create invalid JSON
    fs.writeFileSync(
      path.join(testWorkspaceRoot, 'package.json'),
      '{ invalid json content'
    );

    const result = await PackageManagerDetector.detect(workspaceFolder);

    assert.strictEqual(result.type, PackageManager.UNKNOWN);
  });

  test('Should prioritize lock file over packageManager field', async () => {
    // Create yarn.lock
    fs.writeFileSync(path.join(testWorkspaceRoot, 'yarn.lock'), '');
    
    // Create package.json with different packageManager
    const packageJson = {
      name: 'test-project',
      packageManager: 'npm@9.0.0'
    };
    fs.writeFileSync(
      path.join(testWorkspaceRoot, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    const result = await PackageManagerDetector.detect(workspaceFolder);

    // Lock file should take precedence
    assert.strictEqual(result.type, PackageManager.YARN);
    assert.strictEqual(result.lockFile, 'yarn.lock');
  });

  test('Should handle packageManager field with complex version specifier', async () => {
    const packageJson = {
      name: 'test-project',
      packageManager: 'yarn@3.6.4+sha512.e70835d4d6d62c07be76b3c1529cb640c7443f0fe434ef4b6478a5a399218cbaf1511b396b3c56eb03bc86424cff2320f6167ad2fde273aa0df6e60b7754029f'
    };
    fs.writeFileSync(
      path.join(testWorkspaceRoot, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    const result = await PackageManagerDetector.detect(workspaceFolder);

    assert.strictEqual(result.type, PackageManager.YARN);
  });
});

