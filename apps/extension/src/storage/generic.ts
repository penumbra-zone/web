export class ExtensionStorage<T> {
  constructor(
    private storage: chrome.storage.StorageArea,
    private defaults: T,
    private version: string,
  ) {}

  async get<K extends keyof T>(key: K): Promise<T[K]> {
    const versionedKey = this.versionKey(key);
    const result = (await this.storage.get({
      [versionedKey]: this.defaults[key],
    })) as Record<string, T[K]>;

    return result[versionedKey]!;
  }

  async set<K extends keyof T>(key: K, value: T[K]): Promise<void> {
    await this.storage.set({
      [this.versionKey(key)]: value,
    });
  }

  versionKey<K>(key: K): string {
    return `${this.version}-${String(key)}`;
  }
}
