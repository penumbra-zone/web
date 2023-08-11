import { ExtensionStorage } from './generic';
import { AllSlices } from '../state';
import { STORAGE_VERSION } from '../config/constants';

export type LocalStorageState = Pick<AllSlices, 'password'>;

const defaults: LocalStorageState = {
  password: undefined,
};

export type LocalStorageValue = LocalStorageState[keyof LocalStorageState];

export const isLocalKey = (key: string): key is keyof LocalStorageState => {
  return key in defaults;
};

export const localExtStorage = new ExtensionStorage<LocalStorageState>(
  chrome.storage.local,
  defaults,
  STORAGE_VERSION,
);
