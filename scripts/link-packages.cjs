const fs = require('fs');
const path = require('path');

// Base directory for packages in the monorepo
const packagesDir = path.join(__dirname, '..', 'packages');

// Get the command-line argument to determine action
const action = process.argv[2];
const enableLinking = action === 'enable';
const disableLinking = action === 'disable';

// Helper function to enable linked exports
function enableLinkedExports(packageJsonPath) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  // Check if we have publishConfig.exports to copy over
  if (packageJson.publishConfig && packageJson.publishConfig.exports) {
    // Store the current exports in cachedTurboExports if not already stored
    if (!packageJson.cachedTurboExports) {
      packageJson.cachedTurboExports = packageJson.exports;
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

  // Check if cachedTurboExports exists to restore
  if (packageJson.cachedTurboExports) {
    // Restore exports to cachedTurboExports and remove cachedTurboExports
    packageJson.exports = packageJson.cachedTurboExports;
    delete packageJson.cachedTurboExports;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8');
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
