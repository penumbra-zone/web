import { EmptyObject } from '../types/utility';
import { isEmptyObj } from '../utils/assertions';

export interface IStorage {
  get(key: string): Promise<Record<string, unknown>>;
  set(items: Record<string, unknown>): Promise<void>;
  remove(key: string): Promise<void>;
}

export enum StorageVersion {
  V1 = 'V1',
}

interface StorageItem<T> {
  version: StorageVersion;
  value: T;
}

export class ExtensionStorage<T> {
  constructor(
    private storage: IStorage,
    private defaults: T,
    private version: StorageVersion,
  ) {}

  async get<K extends keyof T>(key: K): Promise<T[K]> {
    const result = (await this.storage.get(String(key))) as
      | Record<string, StorageItem<T[K]>>
      | EmptyObject;

    if (isEmptyObj(result)) {
      return this.defaults[key];
    } else {
      return result[String(key)]!.value;
    }
  }

  async set<K extends keyof T>(key: K, value: T[K]): Promise<void> {
    await this.storage.set({
      [String(key)]: {
        version: this.version,
        value,
      },
    });
  }

  async remove<K extends keyof T>(key: K): Promise<void> {
    await this.storage.remove(String(key));
  }
}
