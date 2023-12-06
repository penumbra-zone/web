const CHROME_EXTENSION_ID = 'lkpmkhpnhknhmibgnmmhdhgdilepfghe';
const INSTALLATION_ERROR = `Penumbra extension is not installed. Please visit: https://chrome.google.com/webstore/detail/penumbra-wallet/${CHROME_EXTENSION_ID}`;

export const isExtensionInstalled = (): boolean => Symbol.for('penumbra') in window;

export const throwIfExtNotInstalled = () => {
  if (!isExtensionInstalled()) throw Error(INSTALLATION_ERROR);
  return Promise.resolve();
};
