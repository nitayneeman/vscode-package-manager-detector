import * as path from 'path';
import { runTests } from '@vscode/test-electron';

async function main() {
  try {
    // The folder containing the Extension Manifest package.json
    const extensionDevelopmentPath = path.resolve(__dirname, '../../..');

    // The path to the extension test script  
    const extensionTestsPath = path.resolve(__dirname, './suite/index');

    // Download VS Code, unzip it and run the integration test
    // Cache the download in .vscode-test to avoid re-downloading
    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
      // Cache VS Code downloads in .vscode-test directory
      version: 'stable',
      // Run tests headless
      launchArgs: [
        '--disable-extensions',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--no-sandbox',
      ],
    });
  } catch (err) {
    console.error('Failed to run tests');
    process.exit(1);
  }
}

main();

