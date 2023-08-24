import { EmptyObject, isEmptyObj } from '../types/utility';

export interface IStorage {
  get(key: string): Promise<Record<string, unknown>>;
  set(items: Record<string, unknown>): Promise<void>;
  remove(key: string): Promise<void>;
}

export interface StorageItem<T> {
  version: string;
  value: T;
}

type Version = string;
// It is quite difficult writing a generic that covers all migration function kinds.
// Therefore, the writer of the migration should ensure it is typesafe when they define it.
// See `migration.test.ts` for an example.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Migration = Record<Version, (a: any) => any>;
type Migrations<K extends string | number | symbol> = Partial<Record<K, Migration>>;

export class ExtensionStorage<T> {
  constructor(
    private storage: IStorage,
    private defaults: T,
    private version: Version,
    private migrations: Migrations<keyof T>,
  ) {}

  async get<K extends keyof T>(key: K): Promise<T[K]> {
    const result = (await this.storage.get(String(key))) as
      | Record<K, StorageItem<T[K]>>
      | EmptyObject;

    if (isEmptyObj(result)) {
      return this.defaults[key];
    } else {
      return await this.migrateIfNeeded(key, result[key]);
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

  private async migrateIfNeeded<K extends keyof T>(key: K, item: StorageItem<T[K]>): Promise<T[K]> {
    if (item.version !== this.version) {
      const migrationFn = this.migrations[key]?.[item.version];
      if (migrationFn) {
        // Update the value to latest schema
        const transformedVal = migrationFn(item.value) as T[K];
        await this.set(key, transformedVal);
        return transformedVal;
      } else {
        // Keep the value, but bump the version in storage
        await this.set(key, item.value);
        return item.value;
      }
    }
    return item.value;
  }
}
