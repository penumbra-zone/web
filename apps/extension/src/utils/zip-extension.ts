import * as fs from 'fs';
import * as path from 'path';
import child_process from 'child_process';
import Manifest from '../../public/manifest.json';

const WORKING_DIR = process.cwd(); // Should be run at root dir of repo
const MANIFEST_PATH = path.join(WORKING_DIR, 'apps/extension/public/manifest.json');
const DIST_PATH = path.join(WORKING_DIR, 'apps/extension/dist');
const PROD_ZIP_PATH = path.join(WORKING_DIR, 'prod.zip');
const BETA_ZIP_PATH = path.join(WORKING_DIR, 'prod.zip');

const updateManifestToBeta = (): void => {
  Manifest.name = 'Prax wallet BETA';
  Manifest.description = 'THIS EXTENSION IS FOR BETA TESTING';
  Manifest.key =
    'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAhxDXNrlRB72kw+MeeofiBvJuuSkcMI+ZshYS9jve+Zhm0YlYUF/3mriz1D7jdK/U11EjKYMYCTQQEDLmSdQ8Q52ur3ei4u4gjyEpl/+QnjciR7msoziKH48Bia1U+wd53eW3TWNP/vpSJiBsAfOisEPox6w4lC5a03aCXV3xtkzfW0rebZrOLf1xhZD8mc4N9LU289E3cYRlBmfI4qxkBM1r7t9N4KsXle3VWXSn18joKzgzAWK+VhZtZu3xrwMQGpUqn+KyYFvawSGmYdDsnT6y0KS96V3CPp6rQHNfjItB/F4d1JQv1tskc959jiK9CuGbU57D9JHJ+1C9aOb0BwIDAQAB';
  Manifest.icons['16'] = 'favicon/beta/icon16.png';
  Manifest.icons['32'] = 'favicon/beta/icon32.png';
  Manifest.icons['48'] = 'favicon/beta/icon48.png';
  Manifest.icons['128'] = 'favicon/beta/icon128.png';

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(Manifest, null, 2));
};

const main = () => {
  child_process.execSync(`zip -r ${PROD_ZIP_PATH} .`, { cwd: DIST_PATH });

  updateManifestToBeta();
  child_process.execSync(`zip -r ${BETA_ZIP_PATH} .`, { cwd: DIST_PATH });
};

main();
