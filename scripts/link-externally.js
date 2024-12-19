import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * This script is used to link dependencies from this monorepo to other repos.
 *
 * @usage:
 *   node scripts/link-externally.js enable
 *   node scripts/link-externally.js disable
 *
 *   // when enabled, you can link the package to another repo like this:
 *   cd other/repo && pnpm link ../penumbra-zone/web/packages/ui
 *
 *   // watch inside packages
 *   cd packages/ui && pnpm dev:pack
 *   cd packages/types && pnpm dev:pack
 */

// Base directory for packages in the monorepo
const __filename = fileURLToPath(import.meta.url);
const packagesDir = path.join(path.dirname(__filename), '..', 'packages');

// Get the command-line argument to determine action
const action = process.argv[2];
const enableLinking = action === 'enable';
const disableLinking = action === 'disable';

// Helper function to enable linked exports
function enableLinkedExports(packageJsonPath) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  // Check if we have publishConfig.exports to copy over
  if (packageJson.publishConfig && packageJson.publishConfig.exports) {
    // Store the current exports in __prev_exports if not already stored
    if (!packageJson.__prev_exports) {
      packageJson.__prev_exports = packageJson.exports;
    }

    // Replace exports with publishConfig.exports
    packageJson.exports = packageJson.publishConfig.exports;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8');
    console.log(`Enabled linked exports for ${path.basename(path.dirname(packageJsonPath))}`);
  }
}

// Helper function to disable linked exports
function disableLinkedExports(packageJsonPath) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  // Check if __prev_exports exists to restore
  if (packageJson.__prev_exports) {
    // Restore exports to __prev_exports and remove __prev_exports
    packageJson.exports = packageJson.__prev_exports;
    delete packageJson.__prev_exports;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf-8');
    console.log(`Disabled linked exports for ${path.basename(path.dirname(packageJsonPath))}`);
  }
}

// Main function to process each package.json
function processPackages() {
  const packages = fs.readdirSync(packagesDir).filter(pkg => {
    return fs.statSync(path.join(packagesDir, pkg)).isDirectory();
  });

  packages.forEach(pkg => {
    const packageJsonPath = path.join(packagesDir, pkg, 'package.json');

    if (fs.existsSync(packageJsonPath)) {
      if (enableLinking) {
        enableLinkedExports(packageJsonPath);
      } else if (disableLinking) {
        disableLinkedExports(packageJsonPath);
      }
    }
  });
}

// Check if the correct action is specified
if (enableLinking || disableLinking) {
  processPackages();
} else {
  console.log('Please specify either "enable" or "disable" as an argument.');
}
