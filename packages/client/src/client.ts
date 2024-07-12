import { createPromiseClient, PromiseClient, Transport } from '@connectrpc/connect';
import { jsonOptions, PenumbraService } from '@penumbra-zone/protobuf';
import { createChannelTransport } from '@penumbra-zone/transport-dom/create';
import { assertProviderManifest, assertProviderRecord } from './assert.js';
import { PenumbraProviderNotConnectedError } from './error.js';
import {
  getAllPenumbraManifests,
  getPenumbraGlobal,
  getPenumbraManifest,
  getPenumbraUnsafe,
} from './get.js';
import { PenumbraManifest } from './manifest.js';
import { PenumbraProvider } from './provider.js';
import { PenumbraState } from './state.js';

interface IPenumbraClientStatic {
  // all-provider static methods
  providers(): string[] | undefined;
  providerManifests(): Record<string, Promise<PenumbraManifest>>;

  // provider-specific static methods
  providerManifest(providerOrigin: string): Promise<PenumbraManifest>;
  providerIsConnected(providerOrigin: string): boolean;
  providerState(providerOrigin: string): PenumbraState | undefined;

  /** Initiates connection and returns a connected client instance. */
  providerConnect<C extends string>(providerOrigin: C): Promise<IPenumbraClientInstance<C>>;

  /** Constructs a client instance. */
  new <N extends string>(providerOrigin: N): IPenumbraClientInstance<N>;
}

type IPenumbraClientInstance<O extends string> = Pick<
  PenumbraProvider,
  'disconnect' | 'isConnected' | 'state' | 'addEventListener' | 'removeEventListener'
> & {
  readonly origin: O;

  // populated when client is in appropriate state.
  readonly transport?: Transport;
  readonly port?: MessagePort;

  /** Initiates connection request and then connection. A channel transport is
   * constructed, maintained internally and also returned to the caller. */
  readonly connect: () => Promise<Transport>;

  /** Fetches manifest for the provider of this instance */
  readonly manifest: () => Promise<PenumbraManifest>;

  /** Returns a new or re-used `PromiseClient<T>` for a specific
   * `PenumbraService` using this client's transport. */
  service: <T extends PenumbraService>(service: T) => PromiseClient<T>;
};

export const PenumbraClient: IPenumbraClientStatic = class PenumbraClient<O extends string>
  implements IPenumbraClientInstance<O>
{
  // IPenumbraClientStatic features

  public static providers() {
    return Object.keys(getPenumbraGlobal());
  }

  public static providerManifests() {
    return getAllPenumbraManifests();
  }
  public static providerManifest(providerOrigin: string) {
    return getPenumbraManifest(providerOrigin);
  }
  public static providerIsConnected(providerOrigin: string) {
    return Boolean(getPenumbraUnsafe(providerOrigin)?.isConnected());
  }
  public static providerState(providerOrigin: string) {
    return getPenumbraUnsafe(providerOrigin)?.state();
  }

  public static async providerConnect<N extends string>(
    providerOrigin: N,
  ): Promise<IPenumbraClientInstance<N>> {
    await assertProviderManifest(providerOrigin);
    const client = new PenumbraClient(providerOrigin);
    await client.connect();
    return client;
  }

  // IPenumbraClientInstance features

  private readonly provider: PenumbraProvider;
  private readonly serviceClients: Map<string, PromiseClient<PenumbraService>>;

  /** Construct an instance representing connection to a specific provider,
   * identified by the origin parameter, but take to specific action. */
  constructor(public readonly origin: O) {
    this.provider = assertProviderRecord(this.origin);
    this.serviceClients = new Map();
  }

  private connection?: {
    port: MessagePort;
    transport: Transport;
  };

  get port() {
    return this.connection?.port;
  }

  get transport() {
    return this.connection?.transport;
  }

  private assertConnection() {
    if (!this.isConnected() || !this.connection) {
      this.connection?.port.close();
      this.serviceClients.clear();
      throw new PenumbraProviderNotConnectedError();
    }
    return this.connection;
  }

  public manifest = () => getPenumbraManifest(this.origin);

  public disconnect() {
    const request = this.provider.disconnect();
    this.serviceClients.clear();
    this.connection?.port.close();
    this.connection = undefined;
    return request;
  }

  public async connect() {
    if (this.connection) {
      if (this.isConnected()) {
        return this.connection.transport;
      } else {
        this.connection = undefined;
      }
    }

    await assertProviderManifest(this.provider.manifest);
    const request = this.provider.connect();
    this.connection = {
      transport: createChannelTransport({
        getPort: () => request,
        jsonOptions,
      }),
      port: await request,
    };

    return this.connection.transport;
  }

  public service<T extends PenumbraService>(service: T) {
    const existingClient = this.serviceClients.get(service.typeName);

    if (existingClient) {
      // TODO: avoid type cast
      return existingClient as PromiseClient<T>;
    } else {
      const createdClient = createPromiseClient(service, this.assertConnection().transport);
      this.serviceClients.set(service.typeName, createdClient);
      return createdClient;
    }
  }

  get isConnected() {
    return this.provider.isConnected.bind(this.provider);
  }
  get state() {
    return this.provider.state.bind(this.provider);
  }

  get addEventListener(): PenumbraProvider['addEventListener'] {
    return this.provider.addEventListener.bind(this.provider);
  }
  get removeEventListener(): PenumbraProvider['removeEventListener'] {
    return this.provider.removeEventListener.bind(this.provider);
  }
};
