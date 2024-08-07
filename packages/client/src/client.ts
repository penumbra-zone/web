import { ServiceType } from '@bufbuild/protobuf';
import { createPromiseClient, PromiseClient, Transport } from '@connectrpc/connect';
import { jsonOptions } from '@penumbra-zone/protobuf';
import {
  ChannelTransportOptions,
  createChannelTransport,
} from '@penumbra-zone/transport-dom/create';
import { assertProviderManifest, assertProviderRecord } from './assert.js';
import { PenumbraProviderNotConnectedError } from './error.js';
import { isPenumbraStateEvent, PenumbraStateEventDetail } from './event.js';
import {
  getAllPenumbraManifests,
  getPenumbraGlobal,
  getPenumbraManifest,
  getPenumbraUnsafe,
} from './get.js';
import { PenumbraManifest } from './manifest.js';
import { PenumbraProvider } from './provider.js';
import { PenumbraState } from './state.js';

export class PenumbraClient<O extends string = string> {
  // static features

  /** Return a list of all present provider origins available in the page, or
   * `undefined` if no object is present at `window[Symbol.for('penumbra')]`
   * (indicating no providers installed). */
  public static providers(): string[] | undefined {
    return Object.keys(getPenumbraGlobal());
  }

  /** Return a record of all present providers with pending fetches of their
   * manifests. */
  public static providerManifests(): Record<string, Promise<PenumbraManifest>> {
    return getAllPenumbraManifests();
  }

  /* Fetch manifest of a specific provider. */
  public static providerManifest(providerOrigin: string): Promise<PenumbraManifest> {
    return getPenumbraManifest(providerOrigin);
  }

  /* Return boolean connection state of a specific provider. */
  public static providerIsConnected(providerOrigin: string): boolean {
    return Boolean(getPenumbraUnsafe(providerOrigin)?.isConnected());
  }

  /* Return connection state enum of a specific provider. */
  public static providerState(providerOrigin: string): PenumbraState | undefined {
    return getPenumbraUnsafe(providerOrigin)?.state();
  }

  /* Make a connection attempt to a specific provider, and return a client bound
   * to that provider if successful. May reject with an enumerated
   * `PenumbraRequestFailure`. */
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
  private readonly serviceClients: Map<string, PromiseClient<ServiceType>>;
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
    /** The provider origin provided during client construction. */
    public readonly origin: O,
    /** Custom options for the created `Transport`. */
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
    port: Promise<MessagePort>;
    transport: Transport;
    transportOptions?: Omit<ChannelTransportOptions, 'getPort'>;
  };

  /** The promised `MessagePort` used by this connection. */
  get port(): Promise<MessagePort> | undefined {
    return this.connection?.port;
  }

  /** The ConnectRPC `Transport` created by this connection. */
  get transport(): Transport | undefined {
    return this.connection?.transport;
  }

  get connected(): boolean {
    return this.provider.isConnected() && Boolean(this.port);
  }

  private destroyConnection() {
    void this.connection?.port.then(port => port.close());
    this.connection = undefined;
    this.serviceClients.clear();
  }

  /** Return the `PenumbraManifest` associated with this provider, fetched at
   * time of client creation. Fetch is an async operation so this may be
   * undefined until it completes. If you hold an active connection to this
   * provider, this should be present. */
  public manifestSync(): PenumbraManifest | undefined {
    return this.parsedManifest;
  }

  /** Return a promised `PenumbraManifest` associated with this provider. If you
   * hold an active connection to this provider, this promise should be
   * successfully resolved. */
  public manifest(): Promise<PenumbraManifest> {
    return this.requestManifest;
  }

  private createConnection() {
    const request = this.requestManifest.then(() => this.provider.connect());
    return {
      transport: createChannelTransport({
        jsonOptions,
        ...this.transportOptions,
        getPort: () => request,
      }),
      port: request,
    };
  }

  /** Return the `Transport` representing the present connection, or create it if
   * necessary by calling `connect` to obtain a `MessagePort` from the
   * associated provider. */
  public async connect(): Promise<Transport> {
    await this.requestManifest;
    await this.provider.connect();
    this.connection ??= this.createConnection();
    return this.connection.transport;
  }

  /** Call `disconnect` on the associated provider to release connection
   * approval, and destroy any present connection. */
  public disconnect(): Promise<void> {
    const request = this.provider.disconnect();
    this.destroyConnection();
    return request;
  }

  /** Return a `PromiseClient<T>` for some `T extends ServiceType`, using
   * transport created internally. You should call this method *after*
   * connection is resolved, or it will fail. You can check for the presence of
   * a `transport` on this instance. */
  public service<T extends ServiceType>(service: T): PromiseClient<T> {
    if (!this.provider.isConnected()) {
      this.destroyConnection();
      throw new PenumbraProviderNotConnectedError();
    }

    const existingClient = this.serviceClients.get(service.typeName);
    if (existingClient) {
      // TODO: avoid type cast
      return existingClient as PromiseClient<T>;
    } else {
      this.connection ??= this.createConnection();
      const createdClient = createPromiseClient(service, this.connection.transport);
      this.serviceClients.set(service.typeName, createdClient);
      return createdClient;
    }
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

  /** Simplified callback interface to the `EventTarget` interface of the
   * associated provider. */
  public onConnectionStateChange(
    listener: (detail: PenumbraStateEventDetail) => void,
    removeListener?: AbortSignal,
  ) {
    if (removeListener?.aborted) {
      this.stateListeners.delete(listener);
    } else {
      removeListener?.addEventListener('abort', () => this.stateListeners.delete(listener));
      this.stateListeners.add(listener);
    }
  }
}
