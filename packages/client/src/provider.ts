import { CRSessionClient } from '@penumbra-zone/transport-chrome/session-client';
import { CrxId, CrxResourceUrl, isCrxId } from './crx';
import { ManifestData, isPenumbraManifest } from './manifest';
import { PenumbraAccessRequest, PenumbraAccessResponse } from './messages';

export class PenumbraProvider<X extends CrxId = CrxId> {
  private crxManifest: Promise<ManifestData>;

  private session?: CRSessionClient;

  private requested = Promise.withResolvers<void>();
  private connection = Promise.withResolvers<MessagePort>();

  constructor(
    private crx: X,
    private crxManifestUrl: CrxResourceUrl<X>,
  ) {
    if (!isCrxId(this.crx))
      throw new TypeError('Penumbra provider id must be a valid chrome extension id');
    if (new URL(crxManifestUrl).host !== this.crx)
      throw new TypeError('Penumbra provider manifest must be hosted by the provider');

    this.crxManifest = fetch(this.crxManifestUrl).then(async res => {
      const manifest = new Object(await res.json());
      if (!isPenumbraManifest(manifest)) throw new TypeError(`Invalid manifest data for ${crx}`);
      return manifest;
    });

    void this.requested.promise.catch((e: unknown) => this.connection.reject(e));
  }

  async request() {
    await this.crxManifest;
    const response = await chrome.runtime.sendMessage<
      PenumbraAccessRequest,
      PenumbraAccessResponse
    >(this.crx, PenumbraAccessRequest.Request);

    switch (response) {
      case PenumbraAccessResponse.Approved:
        this.requested.resolve();
        break;
      case PenumbraAccessResponse.Denied:
      case PenumbraAccessResponse.NeedsLogin:
        this.requested.reject(response);
        break;
      default:
        this.requested.reject(response);
        throw TypeError('Unknown response');
    }

    return this.requested.promise;
  }

  async connect() {
    await this.crxManifest;
    this.session ??= CRSessionClient.init(this.crx, true);
    this.connection.resolve(this.session.port);
    return this.connection.promise;
  }

  isConnected() {
    return this.session?.connected;
  }

  get id() {
    return this.crx;
  }

  get manifestUrl() {
    return this.crxManifestUrl;
  }

  get manifestData() {
    return this.crxManifest.then(manifest => {
      const { name, key, version, description, icons, short_name } = manifest;
      return { name, key, version, description, icons, short_name };
    });
  }

  public assertId = <A extends string>(id: A): PenumbraProvider<A> => {
    if (isProviderId(this, id)) return this satisfies PenumbraProvider<A>;
    else throw new TypeError('Incorrect chrome extension id');
  };
}

const isProviderId = <I extends string>(p: PenumbraProvider, id: I): p is PenumbraProvider<I> =>
  p.id === id;
