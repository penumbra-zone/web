import path from 'path';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

const TARGETS = ['nodejs', 'bundler']; // can also compile to "web" (not used currently)

TARGETS.forEach(target => {
  // Run wasm-pack for each target
  execSync(
    `wasm-pack build ./crate --release --target ${target} --out-name index --out-dir ./dist/${target}`,
    {
      stdio: 'inherit',
    },
  );

  // Rename package to target-specific names
  const packageJsonPath = path.join(process.cwd(), `crate/dist/${target}/package.json`);
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as { name: string };
  packageJson.name = `@penumbra-zone/wasm-${target}`;
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8');
});
