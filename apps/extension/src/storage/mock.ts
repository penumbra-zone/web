import { STORAGE_VERSION } from '../config/constants';
import { ExtensionStorage, IStorage } from './generic';
import { localDefaults, LocalStorageState } from './local';
import { sessionDefaults, SessionStorageState } from './session';

export class MockStorageArea implements IStorage {
  private store = new Map<string, unknown>();

  async get(key: string): Promise<Record<string, unknown>> {
    return new Promise((resolve) => {
      const value = this.store.get(key);
      if (value !== undefined) {
        resolve({ [key]: value });
      } else {
        resolve({});
      }
    });
  }

  async remove(key: string): Promise<void> {
    return new Promise((resolve) => {
      this.store.delete(key);
      resolve();
    });
  }

  async set(items: Record<string, unknown>): Promise<void> {
    return new Promise((resolve) => {
      for (const key in items) {
        this.store.set(key, items[key]);
      }
      resolve();
    });
  }
}

export const mockSessionExtStorage = new ExtensionStorage<SessionStorageState>(
  new MockStorageArea(),
  sessionDefaults,
  STORAGE_VERSION,
);

export const mockLocalExtStorage = new ExtensionStorage<LocalStorageState>(
  new MockStorageArea(),
  localDefaults,
  STORAGE_VERSION,
);
