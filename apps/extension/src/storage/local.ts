import { ExtensionStorage } from './generic';
import { AllSlices } from '../state';

export type LocalStorageState = Pick<AllSlices, 'bears'>;

const defaults: LocalStorageState = {
  bears: 0,
};

export type LocalStorageValue = LocalStorageState[keyof LocalStorageState];

export const isLocalKey = (key: string): key is keyof LocalStorageState => {
  return key in defaults;
};

export const localExtStorage = new ExtensionStorage<LocalStorageState>(
  chrome.storage.local,
  defaults,
);
