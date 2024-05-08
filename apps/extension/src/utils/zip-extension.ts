import * as fs from 'fs';
import * as path from 'path';
import child_process from 'child_process';
import Manifest from '../../public/manifest.json';

const basePath = path.resolve(__dirname, '../../');

const updateManifestToBeta = (): void => {
  const manifestPath = path.join(basePath, 'public/manifest.json');

  Manifest.name = 'Prax wallet BETA';
  Manifest.description = 'THIS EXTENSION IS FOR BETA TESTING';
  Manifest.key = 'beta_key_abc';
  Manifest.icons['16'] = 'favicon/beta/icon16.png';
  Manifest.icons['32'] = 'favicon/beta/icon32.png';
  Manifest.icons['48'] = 'favicon/beta/icon48.png';
  Manifest.icons['128'] = 'favicon/beta/icon128.png';

  fs.writeFileSync(manifestPath, JSON.stringify(Manifest, null, 2));
};

const main = () => {
  const distPath = path.join(basePath, 'dist');
  child_process.execSync(`zip -r prod.zip ${distPath}`);

  updateManifestToBeta();
  child_process.execSync(`zip -r beta.zip ${distPath}`);
};

main();
