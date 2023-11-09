import { stdClient } from '../clients/std.ts';

const TEST_EXTENSION_ID = 'mmdkjobdffegdlbcjgmhlhbmogaicmid';
const PROD_EXTENSION_ID = 'lkpmkhpnhknhmibgnmmhdhgdilepfghe';

// Attempts to load a file the extension exposes for detection purposes
// @ts-expect-error temporarily ignored
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

// Can be deleted when new extension version is deployed and detection file is exposes via new manifest
const tempIsExtensionInstalled = async () => {
  const timeout = new Promise<boolean>(resolve => {
    const id = setTimeout(() => {
      clearTimeout(id);
      resolve(false);
    }, 3000);
  });

  const ping = new Promise<boolean>(resolve => {
    stdClient
      .ping('detecting')
      .then(response => {
        if (response.includes('Acknowledged message')) {
          resolve(true);
        } else {
          resolve(false);
        }
      })
      .catch(() => resolve(false));
  });

  return Promise.race([ping, timeout]);
};

export const throwIfExtNotInstalled = async (): Promise<void> => {
  // const installed = await isExtensionInstalled();
  const installed = await tempIsExtensionInstalled();
  if (!installed) {
    throw new Error(INSTALLATION_ERROR);
  }
};
