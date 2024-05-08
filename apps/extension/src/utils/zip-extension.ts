import * as fs from 'fs';
import * as path from 'path';
import child_process from 'child_process';
import type Manifest from '../../public/manifest.json';

const WORKING_DIR = process.cwd(); // Should be run at root dir of repo
const MANIFEST_PATH = path.join(WORKING_DIR, 'apps/extension/dist/manifest.json');
const DIST_PATH = path.join(WORKING_DIR, 'apps/extension/dist');
const PROD_ZIP_PATH = path.join(WORKING_DIR, 'prod.zip');
const BETA_ZIP_PATH = path.join(WORKING_DIR, 'beta.zip');

const updateManifestToBeta = (): void => {
  const manifestData = fs.readFileSync(MANIFEST_PATH, 'utf-8');
  const manifest = JSON.parse(manifestData) as typeof Manifest;

  manifest.name = 'Prax wallet BETA';
  manifest.description = 'THIS EXTENSION IS FOR BETA TESTING';
  manifest.key =
    'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAhxDXNrlRB72kw+MeeofiBvJuuSkcMI+ZshYS9jve+Zhm0YlYUF/3mriz1D7jdK/U11EjKYMYCTQQEDLmSdQ8Q52ur3ei4u4gjyEpl/+QnjciR7msoziKH48Bia1U+wd53eW3TWNP/vpSJiBsAfOisEPox6w4lC5a03aCXV3xtkzfW0rebZrOLf1xhZD8mc4N9LU289E3cYRlBmfI4qxkBM1r7t9N4KsXle3VWXSn18joKzgzAWK+VhZtZu3xrwMQGpUqn+KyYFvawSGmYdDsnT6y0KS96V3CPp6rQHNfjItB/F4d1JQv1tskc959jiK9CuGbU57D9JHJ+1C9aOb0BwIDAQAB';
  manifest.icons['16'] = 'favicon/beta/icon16.png';
  manifest.icons['32'] = 'favicon/beta/icon32.png';
  manifest.icons['48'] = 'favicon/beta/icon48.png';
  manifest.icons['128'] = 'favicon/beta/icon128.png';

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
};

const main = () => {
  child_process.execSync(`zip -r ${PROD_ZIP_PATH} .`, { cwd: DIST_PATH, stdio: 'inherit' });
  updateManifestToBeta();
  child_process.execSync(`zip -r ${BETA_ZIP_PATH} .`, { cwd: DIST_PATH, stdio: 'inherit' });
};

main();
