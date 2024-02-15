import { ExtensionNotInstalledError } from './extension-not-installed-error';

export const isExtensionInstalled = (): boolean => Symbol.for('penumbra') in window;

export const throwIfExtNotInstalled = () => {
  if (!isExtensionInstalled()) throw new ExtensionNotInstalledError();
};
