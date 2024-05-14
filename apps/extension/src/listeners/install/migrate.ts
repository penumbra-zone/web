export const migrate = async (previousVersion?: string) => {
  console.log(
    'extension updated from version',
    previousVersion,
    'to',
    chrome.runtime.getManifest().version,
  );
  const { storageVersion = 0 } = await chrome.storage.local.get('storageVersion');
  if (storageVersion === STORAGE_VERSION) return;
  else if (typeof storageVersion !== 'number' || storageVersion < 0)
    throw new TypeError('Invalid storage version');

  console.log('Migrating storage from version', storageVersion, 'to', STORAGE_VERSION);
  for (const importMigration of migrations.slice(Number(storageVersion))) {
    const { migrate } = await importMigration();
    await migrate();
  }
};

/**
 * @see ../../storage/local/migrations/README.md
 */
const migrations = [
  () => import('../../storage/local/migrations/0_1'),
  () => import('../../storage/local/migrations/1_2'),
];
