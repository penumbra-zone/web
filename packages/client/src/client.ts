import { createPromiseClient, PromiseClient, Transport } from '@connectrpc/connect';
import { jsonOptions, PenumbraService } from '@penumbra-zone/protobuf';
import {
  ChannelTransportOptions,
  createChannelTransport,
} from '@penumbra-zone/transport-dom/create';
import { assertProviderManifest, assertProviderRecord } from './assert.js';
import { PenumbraProviderNotConnectedError } from './error.js';
import {
  getAllPenumbraManifests,
  getPenumbraGlobal,
  getPenumbraManifest,
  getPenumbraUnsafe,
} from './get.js';
import { PenumbraProvider } from './provider.js';
import { isPenumbraStateEvent, PenumbraStateEventDetail } from './event.js';
import { PenumbraManifest } from './manifest.js';
import { PenumbraState } from './state.js';

export class PenumbraClient<O extends string> {
  // static features

  public static providers(): string[] | undefined {
    return Object.keys(getPenumbraGlobal());
  }

  public static providerManifests(): Record<string, Promise<PenumbraManifest>> {
    return getAllPenumbraManifests();
  }
  public static providerManifest(providerOrigin: string): Promise<PenumbraManifest> {
    return getPenumbraManifest(providerOrigin);
  }
  public static providerIsConnected(providerOrigin: string): boolean {
    return Boolean(getPenumbraUnsafe(providerOrigin)?.isConnected());
  }
  public static providerState(providerOrigin: string): PenumbraState | undefined {
    return getPenumbraUnsafe(providerOrigin)?.state();
  }

  public static async providerConnect<N extends string>(
    providerOrigin: N,
  ): Promise<PenumbraClient<N>> {
    await assertProviderManifest(providerOrigin);
    const client = new PenumbraClient(providerOrigin);
    await client.connect();
    return client;
  }

  // instance features

  private readonly provider: PenumbraProvider;
  private readonly serviceClients: Map<string, PromiseClient<PenumbraService>>;
  private readonly stateListeners: Set<(detail: PenumbraStateEventDetail) => void>;
  private readonly requestManifest: Promise<PenumbraManifest>;
  private parsedManifest?: PenumbraManifest;
  private readonly eventListener = (evt: Event) => {
    if (isPenumbraStateEvent(evt) && evt.detail.origin === this.origin) {
      this.stateListeners.forEach(listener => listener(evt.detail));
    }
  };

  /** Construct an instance representing connection to a specific provider,
   * identified by the origin parameter, but take to specific action. */
  constructor(
    public readonly origin: O,
    private readonly transportOptions?: Omit<ChannelTransportOptions, 'getPort'>,
  ) {
    this.provider = assertProviderRecord(this.origin);
    this.requestManifest = getPenumbraManifest(this.origin);
    void this.requestManifest.then(manifest => {
      this.parsedManifest = manifest;
    });
    this.serviceClients = new Map();
    this.stateListeners = new Set();
    this.provider.addEventListener('penumbrastate', this.eventListener);
  }

  private connection?: {
    port: MessagePort;
    transport: Transport;
    transportOptions?: Omit<ChannelTransportOptions, 'getPort'>;
  };

  get port(): MessagePort | undefined {
    return this.connection?.port;
  }

  get transport(): Transport | undefined {
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

  public manifestSync(): PenumbraManifest | undefined {
    return this.parsedManifest;
  }

  public manifest(): Promise<PenumbraManifest> {
    return this.requestManifest;
  }

  public disconnect(): Promise<void> {
    const request = this.provider.disconnect();
    this.serviceClients.clear();
    this.connection?.port.close();
    this.connection = undefined;
    return request;
  }

  public async connect(): Promise<Transport> {
    if (this.connection) {
      if (this.isConnected()) {
        return this.connection.transport;
      } else {
        this.connection = undefined;
      }
    }

    await assertProviderManifest(this.origin);
    const request = this.provider.connect();
    this.connection = {
      transport: createChannelTransport({
        jsonOptions,
        ...this.transportOptions,
        getPort: () => request,
      }),
      port: await request,
    };

    return this.connection.transport;
  }

  public service<T extends PenumbraService>(service: T): PromiseClient<T> {
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

  public onConnectionStateChange(
    listener: (detail: PenumbraStateEventDetail) => void,
    removeListener?: AbortSignal,
  ) {
    removeListener?.addEventListener('abort', () => this.stateListeners.delete(listener));
    this.stateListeners.add(listener);
  }
}
