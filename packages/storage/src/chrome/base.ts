import { EmptyObject, isEmptyObj } from '@penumbra-zone/types/utility';

type ChromeStorageChangedListener = (changes: Record<string, chrome.storage.StorageChange>) => void;

// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
export type StorageListener<T> = (
  changes: Partial<{ [K in keyof T]: { newValue?: StorageItem<T[K]>; oldValue?: unknown } }>,
) => void;

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

export class ExtensionStorage<T, D extends keyof T> {
  constructor(
    private storage: chrome.storage.StorageArea,
    private defaults: Pick<T, D>,
    private version: Version,
    private migrations: Partial<Record<keyof T, Migration>>,
  ) {}

  async get<K extends keyof T>(key: K): Promise<Partial<T>[K]> {
    console.log('GET', key);
    const result = (await this.storage.get(String(key))) as
      | Record<K, StorageItem<T[K]>>
      | EmptyObject;

    // no value in storage
    if (isEmptyObj(result)) {
      if (key in this.defaults) return this.defaults[key as K & D];
      else return (result as Partial<T>)[key as Exclude<K, D>];
    }

    // old version in storage
    if (result[key].version !== this.version) return await this.migrate(key, result[key]);

    // normal case
    return result[key].value;
  }

  async set<K extends keyof T>(key: K, value: T[K]): Promise<void> {
    console.log('SET', key, value);
    await this.storage.set({
      [String(key)]: {
        version: this.version,
        value,
      },
    });
  }

  async remove<K extends keyof T & string>(key: K): Promise<void> {
    await this.storage.remove(key);
  }

  addListener(listener: ChromeStorageChangedListener & StorageListener<T>): void {
    this.storage.onChanged.addListener(listener);
  }

  removeListener(remove: ChromeStorageChangedListener): void {
    this.storage.onChanged.removeListener(remove);
  }

  public async waitFor<K extends keyof T>(key: K): Promise<NonNullable<T[K]>> {
    const existing = await this.get(key);
    if (existing != null) return existing;
    const { promise, resolve, reject } = Promise.withResolvers<NonNullable<T[K]>>();
    const listener: ChromeStorageChangedListener & StorageListener<T> = changes => {
      if (key in changes && changes[key]?.newValue != null) {
        const newValue = changes[key]?.newValue as StorageItem<T[K]>;
        if (typeof newValue === 'object' && 'value' in newValue) {
          if (newValue.value != null) resolve(newValue.value);
          else reject(new Error('Storage item removed'));
        } else reject(new TypeError('Invalid structure in storage update'));
      }
    };
    void promise.finally(() => this.removeListener(listener));
    this.addListener(listener);
    return promise;
  }

  private async migrate<K extends keyof T>(key: K, stored: StorageItem<T[K]>): Promise<T[K]> {
    const migrateFrom = this.migrations[key]?.[stored.version];
    if (!migrateFrom) {
      // No migration, set to bump version
      await this.set(key, stored.value);
      return stored.value;
    } else {
      // Run migration, save and bump version
      const migratedValue = migrateFrom(stored.value) as T[K];
      await this.set(key, migratedValue);
      return migratedValue;
    }
  }
}
