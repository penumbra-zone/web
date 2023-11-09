const TEST_EXTENSION_ID = 'mmdkjobdffegdlbcjgmhlhbmogaicmid';
const PROD_EXTENSION_ID = 'lkpmkhpnhknhmibgnmmhdhgdilepfghe';

const isExtensionInstalled = async (): Promise<boolean> => {
  const extId = import.meta.env.DEV ? TEST_EXTENSION_ID : PROD_EXTENSION_ID;
  const url = `chrome-extension://${extId}/install-detector.txt`;

  return new Promise<boolean>(resolve => {
    fetch(url)
      .then(response => {
        if (response.status === 200) {
          resolve(true);
        } else {
          resolve(false);
        }
      })
      .catch(() => resolve(false));
  });
};

const INSTALLATION_ERROR = 'Penumbra extension is not installed';

export const isExtInstallError = (e: unknown): boolean => {
  return String(e).includes(INSTALLATION_ERROR);
};

export const throwIfExtNotInstalled = async (): Promise<void> => {
  const installed = await isExtensionInstalled();
  if (!installed) {
    throw new Error(INSTALLATION_ERROR);
  }
};
