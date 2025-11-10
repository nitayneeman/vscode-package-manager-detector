import * as assert from 'assert';
import * as vscode from 'vscode';

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

