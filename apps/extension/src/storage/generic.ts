export class ExtensionStorage<T> {
  constructor(
    private storage: chrome.storage.StorageArea,
    private defaults: T,
  ) {}

  async get<K extends keyof T>(key: K): Promise<T[K]> {
    const result = (await this.storage.get({ [key]: this.defaults[key] })) as Record<K, T[K]>;
    return result[key];
  }

  async set<K extends keyof T>(key: K, value: T[K]): Promise<void> {
    await this.storage.set({
      [key]: value,
    });
  }
}
