import { isCrxId, isCrxManifestUrl } from './crx';
import { penumbraZone } from './iframe';
import { PenumbraProvider } from './provider';

export const PenumbraSymbol = Symbol.for('penumbra');

class Penumbra implements ReadonlyMap<string, PenumbraProvider> {
  private static singleton?: Penumbra;
  public init = new Promise<void>(() => void 0);

  private providers = new Map<string, PenumbraProvider>();

  constructor() {
    if (Penumbra.singleton) return Penumbra.singleton;
    this.init = this.collectProviders();
  }

  private async collectProviders() {
    const providers = await penumbraZone();
    for (const [id, manifestUrl] of Object.entries(providers))
      if (isCrxId(id) && isCrxManifestUrl(manifestUrl, id))
        this.providers.set(id, new PenumbraProvider(id, manifestUrl));
  }

  // ReadonlyMap
  public [Symbol.iterator] = this.providers[Symbol.iterator].bind(this.providers);
  public entries = this.providers.entries.bind(this.providers);
  public forEach = this.providers.forEach.bind(this.providers);
  //public get = <X extends string>(key: X) => this.providers.get(key)?.assertId(key);
  public get = this.providers.get.bind(this.providers);
  public has = this.providers.has.bind(this.providers);
  public keys = this.providers.keys.bind(this.providers);
  public values = this.providers.values.bind(this.providers);
  get size() {
    return this.providers.size;
  }
}

declare global {
  interface Window {
    readonly [PenumbraSymbol]?: Penumbra;
  }
}

export default Object.defineProperty(window, PenumbraSymbol, {
  value: new Penumbra(),
  writable: false,
})[PenumbraSymbol]!;
