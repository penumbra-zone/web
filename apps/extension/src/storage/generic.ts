import { EmptyObject } from '../utils/types';
import { objIsEmpty } from '../utils/assertions';

export interface IStorage {
  get(key: string): Promise<Record<string, unknown>>;
  set(items: Record<string, unknown>): Promise<void>;
  remove(key: string): Promise<void>;
}

export class ExtensionStorage<T> {
  constructor(
    private storage: IStorage,
    private defaults: T,
    private version: string,
  ) {}

  async get<K extends keyof T>(key: K): Promise<T[K]> {
    const versionedKey = this.versionKey(key);
    const result = (await this.storage.get(versionedKey)) as Record<string, T[K]> | EmptyObject;

    if (objIsEmpty(result)) {
      return this.defaults[key];
    } else {
      return result[versionedKey]!;
    }
  }

  async set<K extends keyof T>(key: K, value: T[K]): Promise<void> {
    await this.storage.set({
      [this.versionKey(key)]: value,
    });
  }

  async remove<K>(key: K): Promise<void> {
    await this.storage.remove(this.versionKey(key));
  }

  versionKey<K>(key: K): string {
    return `${this.version}-${String(key)}`;
  }
}
